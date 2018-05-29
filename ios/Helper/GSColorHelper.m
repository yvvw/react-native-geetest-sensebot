//
//  GSColorHelper.m
//  RNGeetestSensebot
//
//  Created by dayu dong on 2018/5/24.
//

#import "GSColorHelper.h"

@implementation GSColorHelper

+ (UIColor *)parseColor:(NSNumber *)aColorNumber
{
    return [RCTConvert UIColor:aColorNumber];
}

@end
