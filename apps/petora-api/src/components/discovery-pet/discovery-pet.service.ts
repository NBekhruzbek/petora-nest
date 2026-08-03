import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DiscoveryPet, DiscoveryPets } from '../../libs/dto/discovery-pet/discovery-pet';
import { DiscoveryPetInput, DiscoveryPetsInquiry } from '../../libs/dto/discovery-pet/discovery-pet.input';
import { DiscoveryPetUpdate } from '../../libs/dto/discovery-pet/discovery-pet.update';
import { Direction, Message } from '../../libs/enums/common.enum';
import { lookupAuthMemberLiked, shapeIntoMongoObjectId } from '../../libs/config';
import { StatisticModifier, T } from '../../libs/types/common';
import { PetStatus } from '../../libs/enums/discoveryPet.enum';
import { ViewInput } from '../../libs/dto/view/view.input';
import { ViewGroup } from '../../libs/enums/view.enum';
import { ViewService } from '../view/view.service';
import { LikeInput } from '../../libs/dto/like/like.input';
import { LikeGroup } from '../../libs/enums/like.enum';
import { LikeService } from '../like/like.service';

@Injectable()
export class DiscoveryPetService {
	constructor(
		@InjectModel('DiscoveryPet') private readonly discoveryPetModel: Model<DiscoveryPet>,
		private viewService: ViewService,
		private likeService: LikeService,
	) {}

	public async createDiscoveryPet(memberId: Types.ObjectId, input: DiscoveryPetInput): Promise<DiscoveryPet> {
		input.memberId = memberId;

		try {
			const result: DiscoveryPet = await this.discoveryPetModel.create(input);
			if (!result) throw new InternalServerErrorException(Message.CREATE_FAILED);

			return result;
		} catch (err) {
			console.log('Error, DiscoveryPet.model:', err instanceof Error ? err.message : err);
			throw new InternalServerErrorException(Message.CREATE_FAILED);
		}
	}

	public async updateDiscoveryPetByAdmin(input: DiscoveryPetUpdate): Promise<DiscoveryPet> {
		try {
			input.petId = shapeIntoMongoObjectId(input.petId);
			const { petId, ...updateFields } = input;

			const result: DiscoveryPet = await this.discoveryPetModel
				.findOneAndUpdate({ _id: petId }, { $set: updateFields }, { new: true })
				.exec();
			if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

			return result;
		} catch (err) {
			console.log('Error, DiscoveryPet.model:', err instanceof Error ? err.message : err);
			throw new InternalServerErrorException(Message.UPDATE_FAILED);
		}
	}

	public async removeDiscoveryPetByAdmin(petId: Types.ObjectId): Promise<DiscoveryPet> {
		const search: T = { _id: petId, petStatus: PetStatus.DELETE };
		const result = await this.discoveryPetModel.findOneAndDelete(search).exec();
		if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);

		return result;
	}

	public async getDiscoveryPet(viewerId: Types.ObjectId, petId: Types.ObjectId): Promise<DiscoveryPet> {
		try {
			const search: T = { _id: petId, petStatus: PetStatus.ACTIVE };
			const targetPet: DiscoveryPet = await this.discoveryPetModel.findOne(search).lean().exec();
			if (!targetPet) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

			if (viewerId) {
				const viewInput: ViewInput = {
					memberId: viewerId,
					viewRefId: petId,
					viewGroup: ViewGroup.PET,
				};
				const newView = await this.viewService.recordView(viewInput);

				if (newView) {
					await this.discoveryPetModel.findOneAndUpdate(search, { $inc: { petViews: 1 } }, { new: true }).exec();
					targetPet.petViews++;
				}

				const likeInput = {
					memberId: viewerId,
					likeRefId: petId,
					likeGroup: LikeGroup.PET,
				};
				targetPet.meLiked = await this.likeService.checkLikeExistence(likeInput);
			}

			return targetPet;
		} catch (err) {
			console.log('Error, DiscoveryPet.model:', err instanceof Error ? err.message : err);
			throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		}
	}

	public async getAllDiscoveryPets(_id: string, input: DiscoveryPetsInquiry): Promise<DiscoveryPets> {
		const memberId = shapeIntoMongoObjectId(_id);
		const match: T = { petStatus: PetStatus.ACTIVE };
		const sort: T = { [input.sort ?? 'createdAt']: input.direction ?? Direction.DESC };

		this.shapeMatchQuery(match, input);

		const pipeline: any[] = [{ $match: match }];

		if (input.search.onlyLiked && _id) {
			pipeline.push(
				{
					$lookup: {
						from: 'likes',
						let: { localPetId: '$_id' },
						pipeline: [
							{
								$match: {
									$expr: {
										$and: [
											{ $eq: ['$likeRefId', '$$localPetId'] },
											{ $eq: ['$memberId', memberId] },
											{ $eq: ['$likeGroup', LikeGroup.PET] },
										],
									},
								},
							},
						],
						as: 'myLikes',
					},
				},
				{ $match: { myLikes: { $ne: [] } } },
			);
		}

		pipeline.push(
			{ $sort: sort },
			{
				$facet: {
					list: [
						{ $skip: (input.page - 1) * input.limit },
						{ $limit: input.limit },
						lookupAuthMemberLiked(memberId, '$_id'),
					],
					metaCounter: [{ $count: 'total' }],
				},
			},
		);

		const result = await this.discoveryPetModel.aggregate(pipeline).exec();
		if (!result[0].list.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return result[0];
	}

	public async likeTargetDiscoveryPet(memberId: Types.ObjectId, likeRefId: Types.ObjectId): Promise<DiscoveryPet> {
		const target: DiscoveryPet = await this.discoveryPetModel
			.findOne({ _id: likeRefId, petStatus: PetStatus.ACTIVE })
			.exec();
		if (!target) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		const input: LikeInput = {
			memberId: memberId,
			likeRefId: likeRefId,
			likeGroup: LikeGroup.PET,
		};

		const modifier: number = await this.likeService.toggleLike(input);
		const result = await this.discoveryPetStatsEditor({ _id: likeRefId, targetKey: 'petLikes', modifier: modifier });
		if (!result) throw new InternalServerErrorException(Message.SOMETHING_WENT_WRONG);

		return result;
	}

	private shapeMatchQuery(match: T, input: DiscoveryPetsInquiry): void {
		const { petCategory, petStatus, text } = input.search;
		if (petCategory && petCategory.length) match.petCategory = { $in: petCategory };
		if (text) match.petName = { $regex: new RegExp(text, 'i') };
		if (petStatus && petStatus.length) match.petStatus = { $in: petStatus };
	}

	public async discoveryPetStatsEditor(input: StatisticModifier): Promise<DiscoveryPet> {
		const { _id, targetKey, modifier } = input;
		return await this.discoveryPetModel
			.findByIdAndUpdate(_id, { $inc: { [targetKey]: modifier } }, { new: true })
			.exec();
	}
}
