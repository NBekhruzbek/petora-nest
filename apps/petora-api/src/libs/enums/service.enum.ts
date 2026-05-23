import { registerEnumType } from '@nestjs/graphql';

export enum ServiceType {
	DAY_CARE = 'DAY_CARE',
	WALKING = 'WALKING',
	GROOMING = 'GROOMING',
	BOARDING = 'BOARDING',
	TRAINING = 'TRAINING',
	VETERINARY = 'VETERINARY',
}
registerEnumType(ServiceType, { name: 'ServiceType' });

export enum ServiceStatus {
	ACTIVE = 'ACTIVE',
	PAUSE = 'PAUSE',
	DELETE = 'DELETE',
}
registerEnumType(ServiceStatus, { name: 'ServiceStatus' });

export enum ServiceLocation {
	SEOUL = 'SEOUL',
	BUSAN = 'BUSAN',
	INCHEON = 'INCHEON',
	DAEGU = 'DAEGU',
	SUWON = 'SUWON',
	GYEONGJU = 'GYEONGJU',
	GWANGJU = 'GWANGJU',
	CHONJU = 'CHONJU',
	DAEDJON = 'DAEDJON',
	JEJU = 'JEJU',
}
registerEnumType(ServiceLocation, { name: 'ServiceLocation' });
