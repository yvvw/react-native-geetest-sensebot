import {
    NativeModules,
    NativeEventEmitter,
    EmitterSubscription,
    Platform,
    processColor
} from 'react-native'

const Exception = Error

namespace RNLGeetestSensebot {
    export type Option = Pick<GeetestSensebot.Option,
        'debug' | 'loadTimeout' | 'reqTimeout' | 'enableBackgroundCancel'> & {
        api1Result: string;
        lang?: string;
        backgroundColorIOS?: number;
        backgroundBlurEffectIOS?: number;
    }

    // API
    const RNLGeetestSensebot = NativeModules.RNLGeetestSensebot

    export const start: (obj: Option) => void = RNLGeetestSensebot.start

    export const stop: () => void = RNLGeetestSensebot.stop

    // Event
    const EventName = 'RNLGeetestSensebotEvent'

    const EventEmitter = new NativeEventEmitter(RNLGeetestSensebot)

    export const addListener = (listener: (data: any) => void) =>
        EventEmitter.addListener(EventName, listener)
}

namespace GeetestSensebot {
    export enum Lang {
        System = 'system', // 跟随系统
        ZH = 'zh', // 简体中文
        ZH_TW = 'zh-tw', // 繁体中文
        ZH_HK = 'zh-hk', // 繁体中文
        EN = 'en', // 英语
        ID = 'id', // 印尼语
        JA = 'ja', // 日语
        KO = 'ko', // 韩语
        RU = 'ru', // 俄语
        AR = 'ar', // 阿拉伯语
        ES = 'es', // 西班牙语
        PT_PT = 'pt-pt', // 葡萄牙语
        FR = 'fr', // 法语
        DE = 'de', // 德语
    }

    export enum BackgroundBlurEffectIOS {
        None = -1,
        ExtraLight = 0,
        Light,
        Dark,
        Regular, // NS_ENUM_AVAILABLE_IOS(10_0)
        Prominent, // NS_ENUM_AVAILABLE_IOS(10_0)
    }

    export interface Option {
        // API1
        api1Result: API1Result;
        // debug
        debug?: boolean;
        // view 加载超时时间，默认10000
        loadTimeout?: number;
        // 第二步向极验服务器发送请求超时时间，默认10000
        reqTimeout?: number;
        // 语言，如果为null则使用系统默认语言
        lang?: Lang;
        // 点击背景是否可以取消验证
        enableBackgroundCancel?: boolean;
        // 背景色 IOS Only
        backgroundColorIOS?: any;
        // 背景模糊类型 IOS Only
        backgroundBlurEffectIOS?: BackgroundBlurEffectIOS;
        // 事件监听
        onEvent?: (code: Event, data?: Array<number | string>) => void;
    }

    export interface API1Result {
        success: 0 | 1;
        challenge: string;
        gt: string;
        new_captcha: boolean;
        [key: string]: any;
    }

    export interface Result {
        geetest_challenge: string;
        geetest_seccode: string;
        geetest_validate: string;
        [key: string]: any;
    }

    export enum Event {
        // 验证结果
        RESULT = 1,
        // 验证窗口关闭
        CLOSED = 2,
        // 验证失败
        FAILED = 3,
        // 发生错误
        ERROR = 0,
    }

    export enum Error {
        // 参数解析错误
        PARAMETER_PARSE_FAILED = -1,
        // 安卓 activity 已经销毁
        ANDROID_ACTIVITY_DESTROYED = -2,
    }

    const defaultOption: RNLGeetestSensebot.Option = {
        api1Result: '',
        debug: false,
        loadTimeout: 10000,
        reqTimeout: 10000,
        lang: Lang.System,
        enableBackgroundCancel: false,
        backgroundColorIOS: 0, // processColor('transparent')
        backgroundBlurEffectIOS: BackgroundBlurEffectIOS.None,
    }

    function parseConfig(c: Option): RNLGeetestSensebot.Option {
        const config = Object.assign({}, defaultOption)

        config.api1Result = JSON.stringify(c.api1Result)
        if (typeof c.debug === 'boolean') {
            config.debug = c.debug
        }
        if (typeof c.loadTimeout === 'number') {
            config.loadTimeout = c.loadTimeout >> 0
        }
        if (typeof c.reqTimeout === 'number') {
            config.reqTimeout = c.reqTimeout >> 0
        }
        if (typeof c.lang === 'string') {
            config.lang = c.lang
        }
        if (typeof c.enableBackgroundCancel === 'boolean') {
            config.enableBackgroundCancel = c.enableBackgroundCancel
        }
        if (c.backgroundColorIOS !== undefined) {
            config.backgroundColorIOS = processColor(c.backgroundColorIOS)
        }
        if (typeof c.backgroundBlurEffectIOS === 'number') {
            config.backgroundBlurEffectIOS = c.backgroundBlurEffectIOS
        }

        return config
    }

    let eventListener: EmitterSubscription

    // 进行行为认证
    export function start(option: Option): Promise<Result> {
        return new Promise((resolve, reject) => {
            eventListener = RNLGeetestSensebot.addListener(([code, ...data]) => {
                switch (code) {
                    case Event.RESULT:
                        stop()
                        resolve(JSON.parse(data[0]))
                        break
                    case Event.FAILED:
                        // iOS 只要认证错误就会触发, android 多次认证错误最后自动关闭 view 时才会触发
                        if (Platform.OS === 'android') {
                            stop()
                        }
                        break
                    case Event.ERROR:
                        stop()
                        const error = new Exception(data[1])
                        Object.defineProperty(error, 'name',
                            { value: 'RNGeetestError', writable: false })
                        Object.defineProperty(error, 'code',
                            { value: data[0], writable: false })
                        reject(error)
                        break
                }
                if (typeof option.onEvent === 'function') {
                    option.onEvent(code, data)
                }
            })
            RNLGeetestSensebot.start(parseConfig(option))
        })
    }

    // 清理行为认证资源占用
    export function stop () {
        if (eventListener && typeof eventListener.remove === 'function') {
            eventListener.remove()
        }
        RNLGeetestSensebot.stop()
    }
}

export default GeetestSensebot
