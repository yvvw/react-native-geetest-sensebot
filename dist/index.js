import { NativeModules, NativeEventEmitter, Platform, processColor } from 'react-native';
const Exception = Error;
var RNLGeetestSensebot;
(function (RNLGeetestSensebot_1) {
    // API
    const RNLGeetestSensebot = NativeModules.RNLGeetestSensebot;
    RNLGeetestSensebot_1.start = RNLGeetestSensebot.start;
    RNLGeetestSensebot_1.stop = RNLGeetestSensebot.stop;
    // Event
    const EventName = 'RNLGeetestSensebotEvent';
    const EventEmitter = new NativeEventEmitter(RNLGeetestSensebot);
    RNLGeetestSensebot_1.addListener = (listener) => EventEmitter.addListener(EventName, listener);
})(RNLGeetestSensebot || (RNLGeetestSensebot = {}));
var GeetestSensebot;
(function (GeetestSensebot) {
    let Lang;
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
    })(Lang = GeetestSensebot.Lang || (GeetestSensebot.Lang = {}));
    let BackgroundBlurEffectIOS;
    (function (BackgroundBlurEffectIOS) {
        BackgroundBlurEffectIOS[BackgroundBlurEffectIOS["None"] = -1] = "None";
        BackgroundBlurEffectIOS[BackgroundBlurEffectIOS["ExtraLight"] = 0] = "ExtraLight";
        BackgroundBlurEffectIOS[BackgroundBlurEffectIOS["Light"] = 1] = "Light";
        BackgroundBlurEffectIOS[BackgroundBlurEffectIOS["Dark"] = 2] = "Dark";
        BackgroundBlurEffectIOS[BackgroundBlurEffectIOS["Regular"] = 3] = "Regular";
        BackgroundBlurEffectIOS[BackgroundBlurEffectIOS["Prominent"] = 4] = "Prominent";
    })(BackgroundBlurEffectIOS = GeetestSensebot.BackgroundBlurEffectIOS || (GeetestSensebot.BackgroundBlurEffectIOS = {}));
    let Event;
    (function (Event) {
        // 验证结果
        Event[Event["RESULT"] = 1] = "RESULT";
        // 验证窗口关闭
        Event[Event["CLOSED"] = 2] = "CLOSED";
        // 验证失败
        Event[Event["FAILED"] = 3] = "FAILED";
        // 发生错误
        Event[Event["ERROR"] = 0] = "ERROR";
    })(Event = GeetestSensebot.Event || (GeetestSensebot.Event = {}));
    let Error;
    (function (Error) {
        // 参数解析错误
        Error[Error["PARAMETER_PARSE_FAILED"] = -1] = "PARAMETER_PARSE_FAILED";
        // 安卓 activity 已经销毁
        Error[Error["ANDROID_ACTIVITY_DESTROYED"] = -2] = "ANDROID_ACTIVITY_DESTROYED";
    })(Error = GeetestSensebot.Error || (GeetestSensebot.Error = {}));
    const defaultOption = {
        api1Result: '',
        debug: false,
        loadTimeout: 10000,
        reqTimeout: 10000,
        lang: Lang.System,
        enableBackgroundCancel: false,
        backgroundColorIOS: 0,
        backgroundBlurEffectIOS: BackgroundBlurEffectIOS.None,
    };
    function parseConfig(c) {
        const config = Object.assign({}, defaultOption);
        config.api1Result = JSON.stringify(c.api1Result);
        if (typeof c.debug === 'boolean') {
            config.debug = c.debug;
        }
        if (typeof c.loadTimeout === 'number') {
            config.loadTimeout = c.loadTimeout >> 0;
        }
        if (typeof c.reqTimeout === 'number') {
            config.reqTimeout = c.reqTimeout >> 0;
        }
        if (typeof c.lang === 'string') {
            config.lang = c.lang;
        }
        if (typeof c.enableBackgroundCancel === 'boolean') {
            config.enableBackgroundCancel = c.enableBackgroundCancel;
        }
        if (c.backgroundColorIOS !== undefined) {
            config.backgroundColorIOS = processColor(c.backgroundColorIOS);
        }
        if (typeof c.backgroundBlurEffectIOS === 'number') {
            config.backgroundBlurEffectIOS = c.backgroundBlurEffectIOS;
        }
        return config;
    }
    let eventListener;
    // 进行行为认证
    function start(option) {
        return new Promise((resolve, reject) => {
            eventListener = RNLGeetestSensebot.addListener(([code, ...data]) => {
                switch (code) {
                    case Event.RESULT:
                        stop();
                        resolve(JSON.parse(data[0]));
                        break;
                    case Event.FAILED:
                        // iOS 只要认证错误就会触发, android 多次认证错误最后自动关闭 view 时才会触发
                        if (Platform.OS === 'android') {
                            stop();
                        }
                        break;
                    case Event.ERROR:
                        stop();
                        const error = new Exception(data[1]);
                        Object.defineProperty(error, 'name', { value: 'RNGeetestError', writable: false });
                        Object.defineProperty(error, 'code', { value: data[0], writable: false });
                        reject(error);
                        break;
                }
                if (typeof option.onEvent === 'function') {
                    option.onEvent(code, data);
                }
            });
            RNLGeetestSensebot.start(parseConfig(option));
        });
    }
    GeetestSensebot.start = start;
    // 清理行为认证资源占用
    function stop() {
        if (eventListener && typeof eventListener.remove === 'function') {
            eventListener.remove();
        }
        RNLGeetestSensebot.stop();
    }
    GeetestSensebot.stop = stop;
})(GeetestSensebot || (GeetestSensebot = {}));
export default GeetestSensebot;
