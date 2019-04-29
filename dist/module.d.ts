export declare enum Lang {
    System = "system",
    ZH = "zh",
    ZH_TW = "zh-tw",
    ZH_HK = "zh-hk",
    EN = "en",
    ID = "id",
    JA = "ja",
    KO = "ko",
    RU = "ru",
    AR = "ar",
    ES = "es",
    PT_PT = "pt-pt",
    FR = "fr",
    DE = "de"
}
export declare enum BackgroundBlurEffectIOS {
    None = -1,
    ExtraLight = 0,
    Light = 1,
    Dark = 2,
    Regular = 3,
    Prominent = 4
}
declare type Callback = (_: any) => void;
export declare const start: (option: IGSOption) => void;
export declare const stop: (callback: Callback) => void;
export declare const addListener: (listener: Callback) => import("react-native").EmitterSubscription;
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
export declare function parseOption(o: any, defaultOption: IGSOption): IGSOption;
export {};
