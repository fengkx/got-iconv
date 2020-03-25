import {Options} from 'got';
export * from 'got';

export declare class EncodingNotDetectedError {
	readonly name: 'EncodingNotDetectedError';
	constructor();
}

export declare class EncodingNotSupportError {
	readonly name: 'EncodingNotSupportError';
	constructor();
}

export declare interface GotIConvOption extends Options {
	_throwEncodingNotDetected?: boolean;
	_throwEncodingNotSupported?: boolean;
}
