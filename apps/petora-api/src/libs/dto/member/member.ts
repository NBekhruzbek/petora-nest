import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Types } from 'mongoose';
import { MemberAuthType, MemberStatus, MemberType } from '../../enums/member.enum';

@ObjectType()
export class Member {
	@Field(() => String)
	_id: Types.ObjectId;

	@Field(() => MemberType)
	memberType: MemberType;

	@Field(() => MemberStatus)
	memberStatus: MemberStatus;

	@Field(() => MemberAuthType)
	memberAuthType: MemberAuthType;

	@Field(() => String)
	memberPhone: string;

	@Field(() => String)
	memberEmail: string;

	@Field(() => String)
	memberUserName: string;

	@Field(() => String, { nullable: true })
	memberFullName?: string;

	memberPassword?: string;

	@Field(() => String)
	memberImage: string;

	@Field(() => Int)
	memberExperience: number;

	@Field(() => String, { nullable: true })
	memberAddress?: string;

	@Field(() => String, { nullable: true })
	memberDesc?: string;

	@Field(() => Int)
	memberServices: number;

	@Field(() => [String])
	memberCertificates: string;

	@Field(() => String, { nullable: true })
	memberLanguages?: string;

	@Field(() => String, { nullable: true })
	memberSpecialty?: string;

	@Field(() => Int)
	memberArticles: number;

	@Field(() => Int)
	memberPoints: number;

	@Field(() => Int)
	memberLikes: number;

	@Field(() => Int)
	memberViews: number;

	@Field(() => Int)
	memberComments: number;

	@Field(() => Int)
	memberRank: number;

	@Field(() => Int)
	memberWarnings: number;

	@Field(() => Int)
	memberBlocks: number;

	@Field(() => Date, { nullable: true })
	deletedAt?: Date;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;
}
