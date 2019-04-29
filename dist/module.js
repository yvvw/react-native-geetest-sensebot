import { NativeEventEmitter, NativeModules, processColor } from "react-native";
const RNGSModule = NativeModules.RNLGeetestSensebot;
const RNGSEventEmitter = new NativeEventEmitter(RNGSModule);
const EventName = "RNLGeetestSensebotEvent";
export var Lang;
(function (Lang) {
    Lang["System"] = "system";
    Lang["ZH"] = "zh";
    Lang["ZH_TW"] = "zh-tw";
    Lang["ZH_HK"] = "zh-hk";
    Lang["EN"] = "en";
    Lang["ID"] = "id";
    Lang["JA"] = "ja";
    Lang["KO"] = "ko";
    Lang["RU"] = "ru";
    Lang["AR"] = "ar";
    Lang["ES"] = "es";
    Lang["PT_PT"] = "pt-pt";
    Lang["FR"] = "fr";
    Lang["DE"] = "de";
})(Lang || (Lang = {}));
export var BackgroundBlurEffectIOS;
(function (BackgroundBlurEffectIOS) {
    BackgroundBlurEffectIOS[BackgroundBlurEffectIOS["None"] = -1] = "None";
    BackgroundBlurEffectIOS[BackgroundBlurEffectIOS["ExtraLight"] = 0] = "ExtraLight";
    BackgroundBlurEffectIOS[BackgroundBlurEffectIOS["Light"] = 1] = "Light";
    BackgroundBlurEffectIOS[BackgroundBlurEffectIOS["Dark"] = 2] = "Dark";
    BackgroundBlurEffectIOS[BackgroundBlurEffectIOS["Regular"] = 3] = "Regular";
    BackgroundBlurEffectIOS[BackgroundBlurEffectIOS["Prominent"] = 4] = "Prominent";
})(BackgroundBlurEffectIOS || (BackgroundBlurEffectIOS = {}));
export const start = RNGSModule.start;
export const stop = RNGSModule.stop;
export const addListener = (listener) => RNGSEventEmitter.addListener(EventName, listener);
export function parseOption(o, defaultOption) {
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
