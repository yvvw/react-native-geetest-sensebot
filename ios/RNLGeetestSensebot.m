#import <GT3Captcha/GT3Captcha.h>
#import <React/RCTConvert.h>
#import <React/RCTUtils.h>

#import "RNLGeetestSensebot.h"

typedef NS_ENUM(NSUInteger, RNLGSEvent) {
    RNLGSResultEvent = 1,
    RNLGSClosedEvent = 2,
    RNLGSFailedEvent = 3,
    RNLGSErrorEvent = 0,
};

static NSNumber* RNLGSGetEventCode(RNLGSEvent event) {
    return [NSNumber numberWithUnsignedInteger:event];
}

typedef NS_ENUM(NSInteger, RNLGSError) {
    RNLGSParameterParseError = -1,
};

static NSNumber* RNLGSGetErrorCode(RNLGSError event) {
    return [NSNumber numberWithInteger:event];
}

@interface RNLGeetestSensebot () <GT3CaptchaManagerDelegate, GT3CaptchaManagerViewDelegate>
@end

@implementation RNLGeetestSensebot {
    GT3CaptchaManager *_manager;
}

RCT_EXPORT_METHOD(start:(NSDictionary *)option)
{
    if (_manager == nil) {
        _manager = [GT3CaptchaManager alloc];
        _manager.delegate = self;
        _manager.viewDelegate = self;
    }
    @try {
        // view load timeout
        NSTimeInterval timeout = [RCTConvert NSTimeInterval:option[@"loadTimeout"]];
        // init manager
        _manager = [_manager initWithAPI1:nil API2:nil timeout:timeout];
        // debug
        BOOL enableDebugMode = [RCTConvert BOOL:option[@"debug"]];
        [_manager enableDebugMode: enableDebugMode];
        // request timeout
        NSTimeInterval gtViewTimeout = [RCTConvert NSTimeInterval:option[@"reqTimeout"]];
        [_manager useGTViewWithTimeout:gtViewTimeout];
        // lang
        GT3LanguageType lang = [RNLGeetestSensebot parseLanguag:
                                [RCTConvert NSString:option[@"lang"]]];
        [_manager useLanguage:lang];
        // enable background cancel
        BOOL disableBackgroundUserInteraction = ![RCTConvert BOOL:option[@"enableBackgroundCancel"]];
        [_manager disableBackgroundUserInteraction:disableBackgroundUserInteraction];
        // background color
        UIColor *maskColor = [RCTConvert UIColor:option[@"backgroundColorIOS"]];
        if (maskColor != nil) {
            _manager.maskColor = maskColor;
        }
        // background blur effect
        NSInteger blurEffectStyle = [RCTConvert NSInteger:option[@"backgroundBlurEffectIOS"]];
        if (blurEffectStyle >= UIBlurEffectStyleExtraLight && blurEffectStyle <= UIBlurEffectStyleProminent) {
            // enum bound
            [_manager useVisualViewWithEffect:
             [UIBlurEffect effectWithStyle:(UIBlurEffectStyle)blurEffectStyle]];
        }
        // api1 json result
        NSDictionary *api1JSON = RCTJSONParse([RCTConvert NSString:option[@"api1Result"]], nil);
        [_manager configureGTest:[api1JSON objectForKey:@"gt"]
                       challenge:[api1JSON objectForKey:@"challenge"]
                         success:[api1JSON objectForKey:@"success"]
                        withAPI2:nil];
    } @catch (NSException *e) {
        NSMutableString *errorMessage = [NSMutableString new];
        [errorMessage appendString:[e name]];
        if ([e reason] != nil) {
            [errorMessage appendFormat:@", %@", [e reason]];
        }
        if ([e userInfo] != nil) {
            [errorMessage appendFormat:@", %@", [e userInfo]];
        }
        [self sendEvent:@[
                          RNLGSGetEventCode(RNLGSErrorEvent),
                          RNLGSGetErrorCode(RNLGSParameterParseError),
                          errorMessage]];
        return;
    }
    // registe and start validate
    [_manager registerCaptcha:nil];
    dispatch_async(dispatch_get_main_queue(), ^{
        [_manager startGTCaptchaWithAnimated:YES];
    });
}

RCT_EXPORT_METHOD(stop:(RCTResponseSenderBlock)callback)
{
    if (_manager != nil) {
        [_manager stopGTCaptcha];
        callback(nil);
    }
}

+(GT3LanguageType)parseLanguag:(NSString *)lang
{
    if ([lang isEqualToString:@"system"]) {
        return GT3LANGTYPE_AUTO;
    } else if ([lang isEqualToString:@"zh"]) {
        return GT3LANGTYPE_ZH_CN;
    } else if ([lang isEqualToString:@"zh-tw"]) {
        return GT3LANGTYPE_ZH_TW;
    } else if ([lang isEqualToString:@"zh-hk"]) {
        return GT3LANGTYPE_ZH_HK;
    } else if ([lang isEqualToString:@"en"]) {
        return GT3LANGTYPE_EN;
    } else if ([lang isEqualToString:@"id"]) {
        return GT3LANGTYPE_ID;
    } else if ([lang isEqualToString:@"ja"]) {
        return GT3LANGTYPE_JA_JP;
    } else if ([lang isEqualToString:@"ko"]) {
        return GT3LANGTYPE_KO_KR;
    } else if ([lang isEqualToString:@"ru"]) {
        return GT3LANGTYPE_RU;
    } else if ([lang isEqualToString:@"ar"]) {
        return GT3LANGTYPE_AR;
    } else if ([lang isEqualToString:@"es"]) {
        return GT3LANGTYPE_ES;
    } else if ([lang isEqualToString:@"pt-pt"]) {
        return GT3LANGTYPE_PT_PT;
    } else if ([lang isEqualToString:@"fr"]) {
        return GT3LANGTYPE_FR;
    } else if ([lang isEqualToString:@"de"]) {
        return GT3LANGTYPE_DE;
    }
    return GT3LANGTYPE_AUTO;
}

#pragma GT3 Delegate

- (void)gtCaptcha:(GT3CaptchaManager *)manager errorHandler:(GT3Error *)error
{
    NSMutableString *errorMessage = [NSMutableString new];
    [errorMessage appendString:[error error_code]];
    [errorMessage appendFormat:@", %@", [error gtDescription]];

    [self sendEvent:@[RNLGSGetEventCode(RNLGSFailedEvent),
                      errorMessage]];
}

- (void)gtCaptcha:(GT3CaptchaManager *)manager didReceiveCaptchaCode:(NSString *)code result:(NSDictionary *)result message:(NSString *)message
{
    if ([code isEqualToString:@"1"]) {
        [self sendEvent:@[RNLGSGetEventCode(RNLGSResultEvent),
                          RCTJSONStringify(result, nil)]];
    } else if ([code isEqualToString:@"0"] && [result count] > 1) {
        // code == 0 代表失败, 用户滑动不准确时也会触发这个条件, 过滤 dict 里面字段数量为 1 时的信息
        [self sendEvent:@[RNLGSGetEventCode(RNLGSFailedEvent),
                          RCTJSONStringify(result, nil)]];
    }
}

- (void)gtCaptcha:(GT3CaptchaManager *)manager didReceiveSecondaryCaptchaData:(NSData *)data response:(NSURLResponse *)response error:(GT3Error *)error decisionHandler:(void (^)(GT3SecondaryCaptchaPolicy))decisionHandler
{
}

- (void)gtCaptchaUserDidCloseGTView:(GT3CaptchaManager *)manager
{
    [self sendEvent:@[RNLGSGetEventCode(RNLGSClosedEvent)]];
}

- (BOOL)shouldUseDefaultRegisterAPI:(GT3CaptchaManager *)manager
{
    return NO;
}

- (BOOL)shouldUseDefaultSecondaryValidate:(GT3CaptchaManager *)manager
{
    return NO;
}

#pragma react native bridge

RCT_EXPORT_MODULE(RNLGeetestSensebot)

+ (BOOL)requiresMainQueueSetup
{
    return NO;
}

static NSString* EventName = @"RNLGeetestSensebotEvent";

- (NSArray<NSString *> *)supportedEvents
{
    return @[EventName];
}

- (void)sendEvent:(id)body
{
    [self sendEventWithName:EventName body:body];
}

@end
