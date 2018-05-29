package com.rnlib.geetest.sensebot;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.geetest.sdk.Bind.GT3GeetestBindListener;
import com.geetest.sdk.Bind.GT3GeetestUtilsBind;

import org.json.JSONObject;

public class ReactGeetestSensebotModule extends ReactContextBaseJavaModule {
    private final ReactApplicationContext mReactContext;
    private static final String ReactGSEventName = "RNGeetestSensebotEvent";
    private static final String urlPlaceHolder = "";
    private GT3GeetestUtilsBind gt3GeetestUtils;

    public ReactGeetestSensebotModule(ReactApplicationContext reactContext) {
        super(reactContext);
        mReactContext = reactContext;
    }

    @Override
    public String getName() {
        return "GeetestSensebot";
    }

    @ReactMethod
    public void initCaptchaMgr(Integer maskColor, Boolean isDebug, Promise promise) {
        gt3GeetestUtils = new GT3GeetestUtilsBind(mReactContext.getCurrentActivity());
        gt3GeetestUtils.setTimeout(5000);
        gt3GeetestUtils.getISonto();
        gt3GeetestUtils.setDialogTouch(true);

        promise.resolve(true);
    }

    @ReactMethod
    public void captcha(final Integer success, final String gt, final String challenge, String api2, Promise promise) {
        if (gt3GeetestUtils == null) {
            promise.resolve(false);
            return;
        }

        // api1 result pass to captcha
        JSONObject captchaParams = new JSONObject();
        try {
            captchaParams.put("success", success.intValue());
            captchaParams.put("gt", gt);
            captchaParams.put("challenge", challenge);
        } catch (Exception ignored) {
        }
        gt3GeetestUtils.gtSetApi1Json(captchaParams);

        // start captcha
        mReactContext.runOnUiQueueThread(new Runnable() {
            @Override
            public void run() {
                gt3GeetestUtils.getGeetest(mReactContext.getCurrentActivity(), urlPlaceHolder, urlPlaceHolder, null, new GT3GeetestBindListener() {
                    // 行为验证结果
                    @Override
                    public void gt3GetDialogResult(boolean status, String resultString) {
                        if (status) {
                            JSONObject resultJson;
                            try {
                                resultJson = new JSONObject(resultString);
                            } catch (Exception e) {
                                resultJson = new JSONObject();
                            }
                            WritableMap eventBody = new WritableNativeMap();
                            eventBody.putInt("type", ReactGSEventType.GS_CAPTCHA.getValue());

                            WritableMap eventPayload = new WritableNativeMap();
                            eventPayload.putString("code", "1");
                            eventPayload.putString("message", "Success");

                            WritableMap eventResult = new WritableNativeMap();
                            try {
                                eventResult.putString("geetest_challenge", resultJson.getString("geetest_challenge"));
                                eventResult.putString("geetest_validate", resultJson.getString("geetest_validate"));
                                eventResult.putString("geetest_seccode", resultJson.getString("geetest_seccode"));
                            } catch (Exception ignored) {
                            }

                            eventPayload.putMap("result", eventResult);
                            eventBody.putMap("payload", eventPayload);

                            sendEvent(eventBody);

                            gt3GeetestUtils.gt3TestFinish();
                        }
                    }

                    // 没有进行行为验证就关闭了验证码
                    @Override
                    public void gt3CloseDialog(int i) {
                        WritableMap eventBody = new WritableNativeMap();
                        eventBody.putInt("type", ReactGSEventType.GS_CAPTCHA.getValue());
                        eventBody.putString("errCode", "close view");
                        eventBody.putString("errMsg", "user close captcha view.");

                        sendEvent(eventBody);
                    }

                    // 自定义 api2
                    @Override
                    public boolean gt3SetIsCustom() {
                        return true;
                    }

                    // 框架出错
                    @Override
                    public void gt3DialogOnError(String errCode) {
                        WritableMap eventBody = new WritableNativeMap();
                        eventBody.putInt("type", ReactGSEventType.GS_ERROR.getValue());
                        eventBody.putString("errCode", errCode);
                        eventBody.putString("errMsg", errCode);

                        sendEvent(eventBody);
                    }
                });
            }
        });

        promise.resolve(true);
    }

    @ReactMethod
    public void stopCaptcha(Promise promise) {
        if (gt3GeetestUtils != null) {
            mReactContext.runOnUiQueueThread(new Runnable() {
                @Override
                public void run() {
                    gt3GeetestUtils.cancelUtils();
                    gt3GeetestUtils.gt3TestClose();
                    gt3GeetestUtils = null;
                }
            });
        }

        promise.resolve(true);
    }

    private void sendEvent(WritableMap mBody) {
        mReactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(ReactGSEventName, mBody);
    }
}
