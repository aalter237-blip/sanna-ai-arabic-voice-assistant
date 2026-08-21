package com.sanna.ai;

import android.accessibilityservice.AccessibilityService;
import android.view.accessibility.AccessibilityEvent;
import android.util.Log;

public class SannaAccessibilityService extends AccessibilityService {

    private static final String TAG = "SannaAccessibility";

    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {
        // هنا هنتقاط الأحداث ونتحكم في الشاشة
        Log.d(TAG, "Event: " + event.toString());
    }

    @Override
    public void onInterrupt() {
        Log.d(TAG, "Service interrupted");
    }

    @Override
    protected void onServiceConnected() {
        super.onServiceConnected();
        Log.d(TAG, "Sanna Accessibility Service Connected");
    }
}
