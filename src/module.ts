import { NativeEventEmitter, NativeModules, processColor } from "react-native";

const RNGSModule = NativeModules.RNLGeetestSensebot;
const RNGSEventEmitter = new NativeEventEmitter(RNGSModule);
const EventName = "RNLGeetestSensebotEvent";

export enum Lang {
    System = "system", // 跟随系统
    ZH = "zh", // 简体中文
    ZH_TW = "zh-tw", // 繁体中文
    ZH_HK = "zh-hk", // 繁体中文
    EN = "en", // 英语
    ID = "id", // 印尼语
    JA = "ja", // 日语
    KO = "ko", // 韩语
    RU = "ru", // 俄语
    AR = "ar", // 阿拉伯语
    ES = "es", // 西班牙语
    PT_PT = "pt-pt", // 葡萄牙语
    FR = "fr", // 法语
    DE = "de", // 德语
}

export enum BackgroundBlurEffectIOS {
    None = -1,
    ExtraLight = 0,
    Light,
    Dark,
    Regular, // NS_ENUM_AVAILABLE_IOS(10_0)
    Prominent, // NS_ENUM_AVAILABLE_IOS(10_0)
}

type Callback = (_: any) => void;

export const start: (option: IGSOption) => void = RNGSModule.start;

export const stop: (callback: Callback) => void = RNGSModule.stop;

export const addListener = (listener: Callback) =>
    RNGSEventEmitter.addListener(EventName, listener);

interface IGSOption {
    api1Result: string;
    debug: boolean;
    loadTimeout: number;
    reqTimeout: number;
    lang: Lang;
    enableBackgroundCancel: boolean;
    backgroundColorIOS: number;
    backgroundBlurEffectIOS: BackgroundBlurEffectIOS;
}

export function parseOption(o: any, defaultOption: IGSOption): IGSOption {
    const option = Object.assign({}, defaultOption);

    option.api1Result = JSON.stringify(o.api1Result);
    if (typeof o.debug === "boolean") {
        option.debug = o.debug;
    }
    if (typeof o.loadTimeout === "number") {
        option.loadTimeout = o.loadTimeout >> 0;
    }
    if (typeof o.reqTimeout === "number") {
        option.reqTimeout = o.reqTimeout >> 0;
    }
    if (typeof o.lang === "string") {
        option.lang = o.lang;
    }
    if (typeof o.enableBackgroundCancel === "boolean") {
        option.enableBackgroundCancel = o.enableBackgroundCancel;
    }
    if (o.backgroundColorIOS !== undefined) {
        option.backgroundColorIOS = processColor(o.backgroundColorIOS);
    }
    if (typeof o.backgroundBlurEffectIOS === "number") {
        option.backgroundBlurEffectIOS = o.backgroundBlurEffectIOS;
    }

    return option;
}
