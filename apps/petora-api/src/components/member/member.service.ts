import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Member, Members } from '../../libs/dto/member/member';
import { AgentsInquiry, LoginInput, MemberInput } from '../../libs/dto/member/member.input';
import { MemberStatus, MemberType } from '../../libs/enums/member.enum';
import { Direction, Message } from '../../libs/enums/common.enum';
import { AuthService } from '../auth/auth.service';
import { MemberUpdate } from '../../libs/dto/member/member.update';
import { T } from '../../libs/types/common';
import { ViewService } from '../view/view.service';
import { ViewInput } from '../../libs/dto/view/view.input';
import { ViewGroup } from '../../libs/enums/view.enum';
import { shapeIntoMongoObjectId } from '../../libs/config';

@Injectable()
export class MemberService {
	constructor(
		@InjectModel('Member') private readonly memberModel: Model<Member>,
		private authService: AuthService,
		private viewService: ViewService,
	) {}

	public async signup(input: MemberInput): Promise<Member> {
		input.memberPassword = await this.authService.hashPassword(input.memberPassword);

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
		const { memberUserName, memberPassword } = input;
		const response: Member = await this.memberModel
			.findOne({ memberUserName: memberUserName })
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
		}

		// meLiked?

		return targetMember;
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

	private shapeMatchQuery(match: T, input: AgentsInquiry): void {
		const { memberId, memberServiceTypes, memberServiceArea, text } = input.search;

		if (memberId) match._id = shapeIntoMongoObjectId(memberId);

		if (memberServiceTypes && memberServiceTypes.length) match.memberServiceTypes = { $in: memberServiceTypes };
		if (memberServiceArea && memberServiceArea.length) match.memberServiceArea = { $in: memberServiceArea };

		if (text) match.memberUserName = { $regex: new RegExp(text, 'i') };
	}

	public async getAllMembersByAdmin(): Promise<string> {
		return 'getAllMembersByAdmin executed';
	}

	public async updateMemberByAdmin(): Promise<string> {
		return 'updateMemberByAdmin executed';
	}
}
