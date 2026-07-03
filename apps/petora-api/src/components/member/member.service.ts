import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Member, MemberBillingInfos, Members } from '../../libs/dto/member/member';
import { AgentsInquiry, LoginInput, MemberInput, MembersInquiry } from '../../libs/dto/member/member.input';
import { MemberStatus, MemberType } from '../../libs/enums/member.enum';
import { Direction, Message } from '../../libs/enums/common.enum';
import { AuthService } from '../auth/auth.service';
import { MemberBillingUpdate, MemberUpdate } from '../../libs/dto/member/member.update';
import { StatisticModifier, T } from '../../libs/types/common';
import { ViewService } from '../view/view.service';
import { ViewInput } from '../../libs/dto/view/view.input';
import { ViewGroup } from '../../libs/enums/view.enum';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { LikeInput } from '../../libs/dto/like/like.input';
import { LikeGroup } from '../../libs/enums/like.enum';
import { LikeService } from '../like/like.service';

@Injectable()
export class MemberService {
	constructor(
		@InjectModel('Member') private readonly memberModel: Model<Member>,
		@InjectModel('Billing') private readonly billingModel: Model<MemberBillingInfos>,
		private authService: AuthService,
		private viewService: ViewService,
		private likeService: LikeService,
	) {}

	public async signup(input: MemberInput): Promise<Member> {
		input.memberPassword = await this.authService.hashPassword(input.memberPassword);
		input.memberUserName = input.memberUserName.trim().toLowerCase();

		try {
			const result = await this.memberModel.create(input);
			result.accessToken = await this.authService.createToken(result);
			return result;
		} catch (err) {
			console.log('ERROR, Service.model: ', err instanceof Error ? err.message : err);
			throw new BadRequestException(Message.USED_MEMBER_NICK_OR_PHONE_OR_EMAIL);
		}
	}

	public async login(input: LoginInput): Promise<Member> {
		const { memberPassword } = input;
		input.memberUserName = input.memberUserName.trim().toLowerCase();

		const response: Member = await this.memberModel
			.findOne({ memberUserName: input.memberUserName })
			.select('+memberPassword')
			.exec();

		if (!response || response.memberStatus === MemberStatus.DELETE) {
			throw new InternalServerErrorException(Message.NO_USER_NAME);
		} else if (response.memberStatus === MemberStatus.BLOCK) {
			throw new InternalServerErrorException(Message.BLOCKED_USER);
		}

		const isMatch = await this.authService.comparePasswords(memberPassword, response.memberPassword);
		if (!isMatch) throw new InternalServerErrorException(Message.WRONG_PASSWORD);

		response.accessToken = await this.authService.createToken(response);

		return response;
	}

	public async checkUserName(memberUserName: string): Promise<boolean> {
		memberUserName = memberUserName.trim().toLowerCase();
		const result = await this.memberModel.findOne({ memberUserName: memberUserName }).exec();
		return !result;
	}

	public async updateMember(memberId: Types.ObjectId, input: MemberUpdate): Promise<Member> {
		const result: Member = await this.memberModel
			.findOneAndUpdate(
				{
					_id: memberId,
					memberStatus: MemberStatus.ACTIVE,
				},
				input,
				{ new: true },
			)
			.exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

		result.accessToken = await this.authService.createToken(result);
		return result;
	}

	public async updateMemberBillingInfos(
		memberId: Types.ObjectId,
		input: MemberBillingUpdate,
	): Promise<MemberBillingInfos> {
		const result: MemberBillingInfos = await this.billingModel
			.findOneAndUpdate(
				{ memberId: memberId },
				{ $set: input, $setOnInsert: { memberId } },
				{ upsert: true, new: true },
			)
			.exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);
		return result;
	}

	public async getMember(viewerId: Types.ObjectId, targetId: Types.ObjectId): Promise<Member> {
		const search: T = {
			_id: targetId,
			memberStatus: {
				$in: [MemberStatus.ACTIVE, MemberStatus.BLOCK],
			},
		};
		const targetMember: Member = await this.memberModel.findOne(search).lean().exec();
		if (!targetMember) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		if (viewerId) {
			const viewInput: ViewInput = {
				memberId: viewerId,
				viewRefId: targetId,
				viewGroup: ViewGroup.AGENT,
			};
			const newView = await this.viewService.recordView(viewInput);

			if (newView) {
				await this.memberModel.findOneAndUpdate(search, { $inc: { memberViews: 1 } }, { new: true }).exec();
				targetMember.memberViews++;
			}

			// meLiked?
			const likeInput = {
				memberId: viewerId,
				likeRefId: targetId,
				likeGroup: LikeGroup.AGENT,
			};
			targetMember.meLiked = await this.likeService.checkLikeExistence(likeInput);
		}

		return targetMember;
	}

	public async getMemberBillingInfos(memberId: Types.ObjectId): Promise<MemberBillingInfos | null> {
		return await this.billingModel.findOne({ memberId: memberId }).exec();
	}

	public async getAgents(memberId: Types.ObjectId, input: AgentsInquiry): Promise<Members> {
		const match: T = { memberType: MemberType.AGENT, memberStatus: MemberStatus.ACTIVE };
		const sort: T = { [input.sort ?? 'createdAt']: input.direction ?? Direction.DESC };

		this.shapeMatchQuery(match, input);

		const result = await this.memberModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [{ $skip: (input.page - 1) * input.limit }, { $limit: input.limit }],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();
		if (!result[0].list.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return result[0];
	}

	public async likeTargetMember(memberid: Types.ObjectId, likeRefId: Types.ObjectId): Promise<Member> {
		const target: Member = await this.memberModel.findOne({ _id: likeRefId, memberStatus: MemberStatus.ACTIVE }).exec();
		if (!target) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		const input: LikeInput = {
			memberId: memberid,
			likeRefId: likeRefId,
			likeGroup: LikeGroup.AGENT,
		};

		// LIKE TOGGLE
		const modifier: number = await this.likeService.toggleLike(input);
		const result = await this.memberStatsEditor({ _id: likeRefId, targetKey: 'memberLikes', modifier: modifier });
		if (!result) throw new InternalServerErrorException(Message.SOMETHING_WENT_WRONG);

		return result;
	}

	private shapeMatchQuery(match: T, input: AgentsInquiry): void {
		const { memberId, memberServiceTypes, memberServiceArea, text } = input.search;

		if (memberId) match._id = shapeIntoMongoObjectId(memberId);

		if (memberServiceTypes && memberServiceTypes.length) match.memberServiceTypes = { $in: memberServiceTypes };
		if (memberServiceArea && memberServiceArea.length) match.memberServiceArea = { $in: memberServiceArea };

		if (text) match.memberUserName = { $regex: new RegExp(text, 'i') };
	}

	public async getAllAgentsByAdmin(input: MembersInquiry): Promise<Members> {
		const { memberStatus, text } = input.search;
		const match: T = { memberType: MemberType.AGENT };
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

		if (memberStatus) match.memberStatus = memberStatus;
		if (text) match.memberUserName = { $regex: new RegExp(text, 'i') };
		console.log('match', match);

		const result = await this.memberModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [{ $skip: (input.page - 1) * input.limit }, { $limit: input.limit }],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		if (!result[0].list.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		return result[0];
	}

	public async getAllUsersByAdmin(input: MembersInquiry): Promise<Members> {
		const { memberStatus, text } = input.search;
		const match: T = { memberType: MemberType.USER };
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

		if (memberStatus) match.memberStatus = memberStatus;
		if (text) match.memberUserName = { $regex: new RegExp(text, 'i') };
		console.log('match', match);

		const result = await this.memberModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [{ $skip: (input.page - 1) * input.limit }, { $limit: input.limit }],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		if (!result[0].list.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		return result[0];
	}

	public async updateMemberByAdmin(input: MemberUpdate): Promise<Member> {
		const result = await this.memberModel.findOneAndUpdate({ _id: input._id }, input, { new: true }).exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);
		return result;
	}

	public async updateMemberPoint(memberId: Types.ObjectId, point: number): Promise<boolean> {
		const result = await this.memberModel
			.findByIdAndUpdate(
				{
					_id: memberId,
					memberStatus: MemberStatus.ACTIVE,
				},
				{ $inc: { memberPoints: point } },
				{ new: true },
			)
			.exec();

		if (!result) return false;
		return true;
	}

	public async updateAgentServices(memberId: Types.ObjectId, number: number): Promise<boolean> {
		if (number > 1 || number < -1) return false;

		const result = await this.memberModel
			.findByIdAndUpdate(
				{
					_id: memberId,
					memberStatus: MemberStatus.ACTIVE,
				},
				{ $inc: { memberServices: number } },
				{ new: true },
			)
			.exec();

		if (!result) return false;
		return true;
	}

	public async memberStatsEditor(input: StatisticModifier): Promise<Member> {
		console.log('memberStatsEditor: Executed');
		const { _id, targetKey, modifier } = input;
		return await this.memberModel.findByIdAndUpdate(_id, { $inc: { [targetKey]: modifier } }, { new: true }).exec();
	}
}
