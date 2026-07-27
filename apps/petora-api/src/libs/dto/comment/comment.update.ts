import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { CommentStatus } from '../../enums/comment.enum';
import { Types } from 'mongoose';

@InputType()
export class CommentUpdate {
	@IsNotEmpty()
	@Field(() => String)
	_id: Types.ObjectId;

	@IsOptional()
	@Field(() => CommentStatus, { nullable: true })
	commentStatus?: CommentStatus;

	// Kept in step with CommentInput — an edit must not be stricter than the
	// original write.
	@IsOptional()
	@Field(() => String, { nullable: true })
	commentContent?: string;
}
