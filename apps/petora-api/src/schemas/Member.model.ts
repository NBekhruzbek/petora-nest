import { Schema } from 'mongoose';
import { MemberAuthType, MemberStatus, MemberType } from '../libs/enums/member.enum';

const MemberSchema = new Schema(
	{
		memberType: {
			type: String,
			enum: MemberType,
			default: MemberType.USER,
		},

		memberStatus: {
			type: String,
			enum: MemberStatus,
			default: MemberStatus.ACTIVE,
		},

		memberAuthType: {
			type: String,
			enum: MemberAuthType,
			default: MemberAuthType.PHONE,
		},

		memberPhone: {
			type: String,
			index: { unique: true, sparse: true },
			required: true,
		},

		memberEmail: {
			type: String,
			index: { unique: true, sparse: true },
		},

		memberUserName: {
			type: String,
			index: { unique: true, sparse: true },
			required: true,
		},

		memberFullName: {
			type: String,
			required: true,
		},

		memberPassword: {
			type: String,
			select: false,
			required: true,
		},

		memberImage: {
			type: String,
			default: '',
		},

		memberExperience: {
			type: Number,
			default: 0,
		},

		memberAddress: {
			type: String,
			default: '',
		},

		memberDesc: {
			type: String,
			default: '',
		},

		memberServices: {
			type: Number,
			default: 0,
		},

		memberCertificates: {
			type: [String],
			default: [],
		},

		memberLanguages: {
			type: String,
			default: '',
		},

		memberSpecialty: {
			type: String,
			default: '',
		},

		memberArticles: {
			type: Number,
			default: 0,
		},

		memberPoints: {
			type: Number,
			default: 0,
		},

		memberLikes: {
			type: Number,
			default: 0,
		},

		memberViews: {
			type: Number,
			default: 0,
		},

		memberComments: {
			type: Number,
			default: 0,
		},

		memberRank: {
			type: Number,
			default: 0,
		},

		memberWarnings: {
			type: Number,
			default: 0,
		},

		memberBlocks: {
			type: Number,
			default: 0,
		},
	},
	{ timestamps: true, collection: 'members' },
);

export default MemberSchema;
