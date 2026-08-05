import { registerEnumType } from '@nestjs/graphql';

export enum Message {
	SOMETHING_WENT_WRONG = 'Something went wrong!',
	NO_DATA_FOUND = 'No data found!',
	CREATE_FAILED = 'Create failed!',
	UPDATE_FAILED = 'Update failed!',
	REMOVE_FAILED = 'Remove failed!',
	UPLOAD_FAILED = 'Upload failed!',
	BOOKING_FAILED = 'Booking failed!',
	BAD_REQUEST = 'Bad Request',

	USED_MEMBER_NICK_OR_PHONE_OR_EMAIL = 'Already used member nick or phone or email!',
	NO_USER_NAME = 'No member with that Username',
	BLOCKED_USER = 'You have been blocked!',
	WRONG_PASSWORD = 'Wrong password, please try again!',
	NOT_AUTHENTICATED = 'You are not authenticated, Please login first!',
	TOKEN_NOT_EXIST = 'Bearer Token is not provided!',
	INVALID_GOOGLE_TOKEN = 'Invalid or expired Google token!',
	ONLY_SPECIFIC_ROLES_ALLOWED = 'Allowed only for members with specific roles!',
	NOT_ALLOWED_REQUEST = 'Not Allowed Request!',
	PROVIDE_ALLOWED_FORMAT = 'Please provide jpg, jpeg or png images!',
	NOT_USER_ADDRESS_OR_PHONE = 'Please check You entered deliveryAddress or your phone number in MyPage -> MyProfile -> PersonalInfo!',
	BOOKING_TIME_NOT_AVAILABLE = 'Please choose other time, this booking time is not available!',
	NOT_ALLOWED_BOOKING_CANCEL = 'You can not cancel the booking!',
	ALREADY_REVIEWED = 'You have already reviewed this item!',
}

export enum Direction {
	ASC = 1,
	DESC = -1,
}
registerEnumType(Direction, { name: 'Direction' });
