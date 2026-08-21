package com.sanna.ai;

import android.accessibilityservice.AccessibilityService;
import android.accessibilityservice.GestureDescription;
import android.graphics.Path;
import android.util.Log;
import android.view.accessibility.AccessibilityEvent;
import android.view.accessibility.AccessibilityNodeInfo;

public class SannaAccessibilityService extends AccessibilityService {

    private static final String TAG = "SannaAgent";
    public static SannaAccessibilityService instance;

    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {
    }

    @Override
    public void onInterrupt() {
        Log.d(TAG, "Service interrupted");
    }

    @Override
    protected void onServiceConnected() {
        super.onServiceConnected();
        instance = this;
        Log.d(TAG, "Sanna Agent Connected and Ready");
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        instance = null;
    }

    public void tap(float x, float y) {
        Path path = new Path();
        path.moveTo(x, y);
        GestureDescription.Builder builder = new GestureDescription.Builder();
        builder.addStroke(new GestureDescription.StrokeDescription(path, 0, 50));
        dispatchGesture(builder.build(), null, null);
        Log.d(TAG, "Tap at " + x + "," + y);
    }

    public void swipe(float x1, float y1, float x2, float y2, long duration) {
        Path path = new Path();
        path.moveTo(x1, y1);
        path.lineTo(x2, y2);
        GestureDescription.Builder builder = new GestureDescription.Builder();
        builder.addStroke(new GestureDescription.StrokeDescription(path, 0, duration));
        dispatchGesture(builder.build(), null, null);
        Log.d(TAG, "Swipe performed");
    }

    public void longPress(float x, float y) {
        Path path = new Path();
        path.moveTo(x, y);
        GestureDescription.Builder builder = new GestureDescription.Builder();
        builder.addStroke(new GestureDescription.StrokeDescription(path, 0, 1000));
        dispatchGesture(builder.build(), null, null);
        Log.d(TAG, "Long press");
    }

    public boolean clickByText(String text) {
        AccessibilityNodeInfo root = getRootInActiveWindow();
        if (root == null) return false;
        return findAndClick(root, text);
    }

    private boolean findAndClick(AccessibilityNodeInfo node, String text) {
        if (node == null) return false;
        CharSequence nodeText = node.getText();
        CharSequence desc = node.getContentDescription();
        boolean matches = (nodeText != null && nodeText.toString().toLowerCase().contains(text.toLowerCase())) ||
                          (desc != null && desc.toString().toLowerCase().contains(text.toLowerCase()));
        if (matches && node.isClickable()) {
            node.performAction(AccessibilityNodeInfo.ACTION_CLICK);
            return true;
        }
        for (int i = 0; i < node.getChildCount(); i++) {
            if (findAndClick(node.getChild(i), text)) return true;
        }
        return false;
    }
}
