import { Field, ObjectType } from '@nestjs/graphql';
import { ObjectId, Types } from 'mongoose';
import { ViewGroup } from '../../enums/view.enum';

@ObjectType()
export class View {
	@Field(() => String)
	_id: ObjectId;

	@Field(() => ViewGroup)
	viewGroup: ViewGroup;

	@Field(() => String)
	memberId: Types.ObjectId;

	@Field(() => String)
	viewRefId: Types.ObjectId;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;
}
