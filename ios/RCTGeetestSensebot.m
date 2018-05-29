#import "RCTGeetestSensebot.h"
#import "GSColorHelper.h"

#define GSResolveEvent(event) [NSNumber numberWithInteger:event]
#define GSResolveBool(bool) [NSNumber numberWithBool:bool]

static NSString* RCTGSEventName = @"RNGeetestSensebotEvent";

typedef NS_ENUM(NSInteger, RCTGSEventType) {
    GS_CAPTCHA = 1,
    GS_ERROR = -1
};

@implementation RCTGeetestSensebot {
    GT3CaptchaManager *_captchaManager;
}

+ (BOOL)requiresMainQueueSetup
{
    return YES;
}

- (dispatch_queue_t)methodQueue
{
    return dispatch_get_main_queue();
}

RCT_EXPORT_MODULE()


#pragma export methods

RCT_REMAP_METHOD(initCaptchaMgr,
               maskColorNum:(nonnull NSNumber *)aMaskColorNum
                    isDebug:(BOOL)isDebug
                   resolver:(RCTPromiseResolveBlock)resolve
                   rejecter:(RCTPromiseRejectBlock)reject)
{
    // 初始化 captcha manager
    _captchaManager = [[GT3CaptchaManager alloc] initWithAPI1:nil API2:nil timeout:5.0];
    _captchaManager.delegate = self;

    UIColor *aMaskColor = [GSColorHelper parseColor:aMaskColorNum];
    _captchaManager.maskColor = aMaskColor;
    [_captchaManager enableDebugMode:isDebug];

    resolve(GSResolveBool(YES));
}

RCT_REMAP_METHOD(captcha,
     captchaWithSuccess:(nonnull NSNumber *)success
                     gt:(NSString *)gt
              challenge:(NSString *)challenge
                   api2:(NSString *)api2
               resolver:(RCTPromiseResolveBlock)resolve
               rejecter:(RCTPromiseRejectBlock)reject)
{
    if (!_captchaManager) {
        resolve(GSResolveBool(NO));
        return;
    }
    // 行为验证
    [_captchaManager configureGTest:gt challenge:challenge success:success withAPI2:api2];
    [_captchaManager startGTCaptchaWithAnimated:YES];

    resolve(GSResolveBool(YES));
}

RCT_REMAP_METHOD(stopCaptcha,
         stopCaptchaResolver:(RCTPromiseResolveBlock)resolve
                    rejecter:(RCTPromiseRejectBlock)reject)
{
    [self stopCaptchaAndClean];

    resolve(GSResolveBool(YES));
}


#pragma other methods

- (void)stopCaptchaAndClean
{
    if (_captchaManager) {
        [_captchaManager stopGTCaptcha];
        [_captchaManager closeGTViewIfIsOpen];
        _captchaManager = nil;
    }
}


#pragma gt3 delegate

// disable sdk request api1
- (BOOL)shouldUseDefaultRegisterAPI:(GT3CaptchaManager *)manager
{
    return NO;
}

// get captcha result
- (void)gtCaptcha:(GT3CaptchaManager *)manager didReceiveCaptchaCode:(NSString *)code result:(NSDictionary *)result message:(NSString *)message
{
    [self sendEvent:@{
                      @"type": GSResolveEvent(GS_CAPTCHA),
                      @"payload": @{
                              @"code": code,
                              @"message": message,
                              @"result": result
                              }
                      }];
}

// send user close view event to js
- (void)gtCaptchaUserDidCloseGTView:(GT3CaptchaManager *)manager
{
    [self sendEvent:@{
                      @"type": GSResolveEvent(GS_CAPTCHA),
                      @"errCode": @"close view",
                      @"errMsg": @"user close captcha view."
                      }];
}

// disable sdk request api2
- (BOOL)shouldUseDefaultSecondaryValidate:(GT3CaptchaManager *)manager
{
    return NO;
}

- (void)gtCaptcha:(GT3CaptchaManager *)manager didReceiveSecondaryCaptchaData:(NSData *)data response:(NSURLResponse *)response error:(GT3Error *)error decisionHandler:(void (^)(GT3SecondaryCaptchaPolicy))decisionHandler
{
    // no use
}

// manager error
- (void)gtCaptcha:(GT3CaptchaManager *)manager errorHandler:(GT3Error *)error
{
    [self sendEvent:@{
                      @"type": GSResolveEvent(GS_ERROR),
                      @"errCode": error.error_code,
                      @"errMsg": error.gtDescription
                      }];
}


#pragma event

- (NSArray<NSString *> *)supportedEvents
{
    return @[RCTGSEventName];
}

- (void)sendEvent:(id)body {
    [self sendEventWithName:RCTGSEventName body:body];
}

@end
