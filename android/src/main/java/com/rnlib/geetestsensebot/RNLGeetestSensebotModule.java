package com.rnlib.geetestsensebot;

import android.app.Activity;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.UiThreadUtil;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.geetest.sdk.GT3ConfigBean;
import com.geetest.sdk.GT3ErrorBean;
import com.geetest.sdk.GT3GeetestUtils;
import com.geetest.sdk.GT3Listener;

import org.json.JSONObject;

import javax.annotation.Nonnull;
import javax.annotation.Nullable;

public class RNLGeetestSensebotModule extends ReactContextBaseJavaModule implements LifecycleEventListener {
    private static final String ModuleName = "RNLGeetestSensebot";
    private static final String EventName = "RNLGeetestSensebotEvent";

    private final ReactApplicationContext mReactContext;
    private GT3GeetestUtils mGT3GeetestUtils;
    private GT3ConfigBean mGT3ConfigBean;

    RNLGeetestSensebotModule(ReactApplicationContext reactContext) {
        super(reactContext);
        mReactContext = reactContext;
        mReactContext.addLifecycleEventListener(this);
    }

    @Nonnull
    @Override
    public String getName() {
        return ModuleName;
    }

    @ReactMethod
    public void start(final ReadableMap option) {
        GT3ConfigBean gt3ConfigBean = getSharedGT3ConfigBean();
        try {
            // debug
            boolean debug = option.getBoolean("debug");
            gt3ConfigBean.setDebug(debug);
            // view load timeout
            int timeout = option.getInt("loadTimeout");
            gt3ConfigBean.setTimeout(timeout);
            // request timeout
            int webviewTimeout = option.getInt("reqTimeout");
            gt3ConfigBean.setWebviewTimeout(webviewTimeout);
            // lang
            String lang = option.getString("lang");
            if (lang != null && !lang.equals("system")) {
                gt3ConfigBean.setLang(lang);
            }
            // enable background cancel
            boolean canceledOnTouchOutside = option.getBoolean("enableBackgroundCancel");
            gt3ConfigBean.setCanceledOnTouchOutside(canceledOnTouchOutside);
            // api1 json result
            gt3ConfigBean.setApi1Json(new JSONObject(
                    option.getString("api1Result")));
        } catch (Exception e) {
            sendEvent(Event.Error.getCode(),
                    Error.ParameterParseFailed.getCode(), e.getMessage());
            return;
        }

        Activity activity = mReactContext.getCurrentActivity();
        if (activity == null) {
            sendEvent(Event.Error.getCode(),
                    Error.AndroidActivityDestroyed.getCode(), "Activity has been destroyed.");
            return;
        }
        mGT3GeetestUtils = new GT3GeetestUtils(activity);
        mGT3GeetestUtils.init(gt3ConfigBean);

        UiThreadUtil.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                mGT3GeetestUtils.startCustomFlow();
                mGT3GeetestUtils.getGeetest();
            }
        });
    }

    @ReactMethod
    public void stop(final Callback callback) {
        UiThreadUtil.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                mGT3GeetestUtils.destory();
                callback.invoke();
            }
        });
        mReactContext.removeLifecycleEventListener(this);
    }

    private GT3ConfigBean getSharedGT3ConfigBean() {
        if (mGT3ConfigBean == null) {
            mGT3ConfigBean = new GT3ConfigBean();
            mGT3ConfigBean.setPattern(1); // 1 -> bind 自定义按钮

            mGT3ConfigBean.setListener(new GT3Listener() {
                @Override
                public void onDialogResult(String s) {
                    super.onDialogResult(s);
                    sendEvent(Event.Result.getCode(), s);
                }

                @Override
                public void onClosed(int i) {
                    sendEvent(Event.Closed.getCode());
                }

                @Override
                public void onFailed(GT3ErrorBean gt3ErrorBean) {
                    WritableMap result = Arguments.createMap();
                    result.putString("errorCode", gt3ErrorBean.errorCode);
                    result.putString("errorDesc", gt3ErrorBean.errorDesc);
                    result.putDouble("duration", gt3ErrorBean.duration);
                    result.putString("challenge", gt3ErrorBean.challenge);
                    result.putString("type", gt3ErrorBean.type);
                    result.putString("sdkVersion", gt3ErrorBean.sdkVersion);
                    JSONObject json = new JSONObject(result.toHashMap());
                    sendEvent(Event.Failed.getCode(), json.toString());
                }

                @Override
                public void onButtonClick() {

                }

                @Override
                public void onSuccess(String s) {

                }

                @Override
                public void onStatistics(String s) {

                }
            });
        }
        return mGT3ConfigBean;
    }

    @Override
    public void onHostResume() {

    }

    @Override
    public void onHostPause() {

    }

    @Override
    public void onHostDestroy() {
        if (mGT3GeetestUtils != null) {
            UiThreadUtil.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    if (mGT3GeetestUtils != null) {
                        mGT3GeetestUtils.destory();
                    }
                }
            });
        }
    }

    private void sendEvent(int code, @Nullable Object... data) {
        WritableArray event = Arguments.createArray();
        event.pushInt(code);
        if (data != null) {
            for (Object i : data) {
                if (i == null) {
                    event.pushNull();
                } else if (i instanceof Boolean) {
                    event.pushBoolean((boolean) i);
                } else if (i instanceof Double) {
                    event.pushDouble((double) i);
                } else if (i instanceof Integer) {
                    event.pushInt((int) i);
                } else if (i instanceof String) {
                    event.pushString((String) i);
                } else if (i instanceof WritableArray) {
                    event.pushArray((WritableArray) i);
                } else if (i instanceof WritableMap) {
                    event.pushMap((WritableMap) i);
                }
            }
        }
        mReactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(EventName, event);
    }

    private enum Event {
        Result(1),
        Closed(2),
        Failed(3),
        Error(0);

        private final int code;

        Event(int code) {
            this.code = code;
        }

        public int getCode() {
            return this.code;
        }
    }

    private enum Error {
        ParameterParseFailed(-1),
        AndroidActivityDestroyed(-2);

        private final int code;

        Error(int code) {
            this.code = code;
        }

        public int getCode() {
            return this.code;
        }
    }
}
