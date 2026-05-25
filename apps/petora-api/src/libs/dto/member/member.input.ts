import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsOptional, Length } from 'class-validator';
import { MemberAuthType, MemberType } from '../../enums/member.enum';

@InputType()
export class MemberInput {
	@IsNotEmpty()
	@Field(() => String)
	memberFullName: string;

	@IsNotEmpty()
	@Length(3, 12)
	@Field(() => String)
	memberUserName: string;

	@IsNotEmpty()
	@IsEmail()
	@Field(() => String)
	memberEmail: string;

	@IsNotEmpty()
	@Field(() => String)
	memberPhone: string;

	@IsNotEmpty()
	@Length(5, 20)
	@Field(() => String)
	memberPassword: string;

	@IsOptional()
	@Field(() => MemberType, { nullable: true })
	memberType?: MemberType;

	@IsOptional()
	@Field(() => MemberAuthType, { nullable: true })
	memberAuthType?: MemberAuthType;
}

@InputType()
export class LoginInput {
	@IsNotEmpty()
	@Length(3, 12)
	@Field(() => String)
	memberUserName: string;

	@IsNotEmpty()
	@Length(5, 20)
	@Field(() => String)
	memberPassword: string;
}
