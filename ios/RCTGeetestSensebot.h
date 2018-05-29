#if __has_include(<React/RCTBridgeModule.h>)
#import <React/RCTBridgeModule.h>
#else
#import "RCTBridgeModule.h"
#endif
#if __has_include(<React/RCTEventEmitter.h>)
#import <React/RCTEventEmitter.h>
#else
#import "RCTEventEmitter.h"
#endif

#if __has_include(<GT3Captcha/GT3Captcha.h>)
#import <GT3Captcha/GT3Captcha.h>
#else
#import "GT3Captcha.h"
#endif

@interface RCTGeetestSensebot : RCTEventEmitter <RCTBridgeModule, GT3CaptchaManagerDelegate, GT3CaptchaManagerViewDelegate>

@end
