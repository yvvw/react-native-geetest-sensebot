import * as RNGSModule from "./module";
export { BackgroundBlurEffectIOS, Lang } from "./module";
export interface IAPI1Result {
    success: 0 | 1;
    challenge: string;
    gt: string;
    new_captcha: boolean;
    [key: string]: any;
}
export interface IOption {
    api1Result: IAPI1Result;
    debug?: boolean;
    loadTimeout?: number;
    reqTimeout?: number;
    lang?: RNGSModule.Lang;
    enableBackgroundCancel?: boolean;
    backgroundColorIOS?: any;
    backgroundBlurEffectIOS?: RNGSModule.BackgroundBlurEffectIOS;
    onEvent?: (code: Events, data?: Array<number | string>) => void;
}
export interface IResult {
    geetest_challenge: string;
    geetest_seccode: string;
    geetest_validate: string;
    [key: string]: any;
}
export declare enum Errors {
    PARAMETER_PARSE_FAILED = -1,
    ANDROID_ACTIVITY_DESTROYED = -2,
    DUPLICATE_START = -3
}
export declare enum Events {
    RESULT = 1,
    CLOSED = 2,
    FAILED = 3,
    ERROR = 0
}
export declare function start(option: IOption): Promise<IResult>;
export declare class GeetestError extends Error {
    readonly code: number;
    readonly message: string;
    constructor(code: number, message: string);
}
