import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsOptional, Length } from 'class-validator';
import { MemberAuthType, MemberStatus, MemberType } from '../../enums/member.enum';
import { Types } from 'mongoose';

@InputType()
export class MemberUpdate {
	@IsNotEmpty()
	@Field(() => String)
	_id: Types.ObjectId;

	@IsOptional()
	@Field(() => MemberType, { nullable: true })
	memberType?: MemberType;

	@IsOptional()
	@Field(() => MemberStatus, { nullable: true })
	memberStatus?: MemberStatus;

	@IsOptional()
	@Field(() => String, { nullable: true })
	memberPhone?: string;

	@IsOptional()
	@IsEmail()
	@Field(() => String, { nullable: true })
	memberEmail?: string;

	@IsOptional()
	@Length(3, 12)
	@Field(() => String, { nullable: true })
	memberUserName?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	memberFullName?: string;

	@IsOptional()
	@Length(5, 20)
	@Field(() => String, { nullable: true })
	memberPassword?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	memberImage?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	memberExperience?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	memberApproach?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	memberAddress?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	memberDesc?: string;

	@IsOptional()
	@Field(() => Number, { nullable: true })
	memberServices?: number;

	@IsOptional()
	@Field(() => [String], { nullable: true })
	memberServiceTypes?: string[];

	@IsOptional()
	@Field(() => [String], { nullable: true })
	memberCertificates?: string[];

	@IsOptional()
	@Field(() => String, { nullable: true })
	memberLanguages?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	memberSpecialty?: string;

	@IsOptional()
	@Field(() => [String], { nullable: true })
	memberServiceArea?: string[];

	@IsOptional()
	@Field(() => String, { nullable: true })
	memberResponseTime?: string;

	deletedAt?: Date;
}
