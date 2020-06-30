//
//  GT3AsyncTaskProtocol.h
//  GT3Captcha
//
//  Created by NikoXu on 2019/12/10.
//  Copyright © 2019 Geetest. All rights reserved.
//

#import "GT3Parameter.h"
#import "GT3Error.h"

NS_ASSUME_NONNULL_BEGIN

@protocol GT3AsyncTaskProtocol <NSObject>

/** 用于自定义验证注册的任务 */
- (void)executeRegisterTaskWithCompletion:(void(^)(GT3RegisterParameter * _Nullable params, GT3Error * _Nullable error))completion;

/** 用于自定义验证结果校验的任务 */
- (void)executeValidationTaskWithValidateParam:(GT3ValidationParam *)param completion:(void(^)(BOOL validationResult, GT3Error * _Nullable error))completion;

/** 用于取消所有自定义的任务 */
- (void)cancel;

@end

NS_ASSUME_NONNULL_END
