import { EmitterSubscription, Platform } from "react-native";
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
    // API1
    api1Result: IAPI1Result;
    // debug
    debug?: boolean;
    // view 加载超时时间，默认10000
    loadTimeout?: number;
    // 第二步向极验服务器发送请求超时时间，默认10000
    reqTimeout?: number;
    // 语言
    lang?: RNGSModule.Lang;
    // 点击背景是否可以取消验证
    enableBackgroundCancel?: boolean;
    // 背景色 IOS Only
    backgroundColorIOS?: any;
    // 背景模糊类型 IOS Only
    backgroundBlurEffectIOS?: RNGSModule.BackgroundBlurEffectIOS;
    // 事件监听
    onEvent?: (code: Events, data?: Array<number | string>) => void;
}

export interface IResult {
    geetest_challenge: string;
    geetest_seccode: string;
    geetest_validate: string;
    [key: string]: any;
}

export enum Errors {
    // 参数解析错误
    PARAMETER_PARSE_FAILED = -1,
    // 安卓 activity 已经销毁
    ANDROID_ACTIVITY_DESTROYED = -2,
    // 重复运行
    DUPLICATE_START = -3,
}

export enum Events {
    // 验证结果
    RESULT = 1,
    // 验证窗口关闭
    CLOSED = 2,
    // 验证失败
    FAILED = 3,
    // 发生错误
    ERROR = 0,
}

enum InternalStatus {
    None = 0b0,
    // 认证中
    Running = 0b1,
    // 停止认证中
    Stoping = 0b1 >> 1,
}

let internalStatus = InternalStatus.None;
let eventListener: EmitterSubscription | null = null;

const DEFAULT_OPTION = {
    api1Result: "",
    debug: false,
    loadTimeout: 10000,
    reqTimeout: 10000,
    lang: RNGSModule.Lang.System,
    enableBackgroundCancel: false,
    backgroundColorIOS: 0, // processColor('transparent')
    backgroundBlurEffectIOS: RNGSModule.BackgroundBlurEffectIOS.None,
};

// 进行行为认证
export function start(option: IOption): Promise<IResult> {
    return new Promise((resolve, reject) => {
        if (internalStatus & InternalStatus.Running) {
            return reject(new GeetestError(
                Errors.DUPLICATE_START, "Duplicate start"));
        }
        internalStatus |= InternalStatus.Running;
        eventListener = RNGSModule.addListener(([code, ...data]) => {
            switch (code) {
                case Events.RESULT:
                    resolve(JSON.parse(data[0]));
                    stop();
                    break;
                case Events.FAILED:
                case Events.CLOSED:
                    stop();
                    break;
                case Events.ERROR:
                    reject(new GeetestError(data[0], data[1]));
                    stop();
                    break;
            }
            if (typeof option.onEvent === "function") {
                option.onEvent(code, data);
            }
        });
        RNGSModule.start(RNGSModule.parseOption(option, DEFAULT_OPTION));
    });
}

function stop() {
    if (internalStatus & InternalStatus.Stoping) { return; }
    internalStatus |= InternalStatus.Stoping;
    RNGSModule.stop(() => {
        internalStatus = InternalStatus.None;
        if (eventListener && typeof eventListener.remove === "function") {
            eventListener.remove();
            eventListener = null;
        }
    });
}

export class GeetestError extends Error {
    constructor(readonly code: number, readonly message: string) {
        super(message);

        // @ts-ignore
        if (Error.captureStackTrace) {
            // @ts-ignore
            Error.captureStackTrace(this, GeetestError);
        }
        this.name = "GeetestError";
    }
}
