package com.rnlib.geetest.sensebot;

public enum ReactGSEventType {
    GS_CAPTCHA(1),
    GS_ERROR(-1);

    private final int eventType;

    ReactGSEventType(int eventType) {
        this.eventType = eventType;
    }

    public int getValue() {
        return eventType;
    }
}
