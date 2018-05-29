//
//  GSColorHelper.h
//  RNGeetestSensebot
//
//  Created by dayu dong on 2018/5/24.
//

#ifndef GSColorHelper_h
#define GSColorHelper_h

#import <UIKit/UIKit.h>

#if __has_include(<React/RCTConvert.h>)
#import <React/RCTConvert.h>
#else
#import "RCTConvert.h"
#endif

@interface GSColorHelper : NSObject

+ (UIColor *)parseColor:(NSNumber *)aColorNumber;

@end

#endif /* GSColorHelper_h */
