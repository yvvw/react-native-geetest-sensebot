declare namespace GeetestSensebot {
    enum Lang {
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
    enum BackgroundBlurEffectIOS {
        None = -1,
        ExtraLight = 0,
        Light = 1,
        Dark = 2,
        Regular = 3,
        Prominent = 4
    }
    interface Option {
        api1Result: API1Result;
        debug?: boolean;
        loadTimeout?: number;
        reqTimeout?: number;
        lang?: Lang;
        enableBackgroundCancel?: boolean;
        backgroundColorIOS?: any;
        backgroundBlurEffectIOS?: BackgroundBlurEffectIOS;
        onEvent?: (code: Event, data?: Array<number | string>) => void;
    }
    interface API1Result {
        success: 0 | 1;
        challenge: string;
        gt: string;
        new_captcha: boolean;
        [key: string]: any;
    }
    interface Result {
        geetest_challenge: string;
        geetest_seccode: string;
        geetest_validate: string;
        [key: string]: any;
    }
    enum Event {
        RESULT = 1,
        CLOSED = 2,
        FAILED = 3,
        ERROR = 0
    }
    enum Error {
        PARAMETER_PARSE_FAILED = -1,
        ANDROID_ACTIVITY_DESTROYED = -2
    }
    function start(option: Option): Promise<Result>;
    function stop(): void;
}
export default GeetestSensebot;
