package com.sanna.ai;

import android.accessibilityservice.AccessibilityService;
import android.accessibilityservice.GestureDescription;
import android.graphics.Path;
import android.graphics.Rect;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.view.accessibility.AccessibilityEvent;
import android.view.accessibility.AccessibilityNodeInfo;
import java.util.ArrayList;
import java.util.List;

public class SannaAccessibilityService extends AccessibilityService {
    private static final String TAG = "SannaAccessibility";
    public static SannaAccessibilityService instance;

    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {
        // Active event listening for window state changes
    }

    @Override
    public void onInterrupt() {
        Log.w(TAG, "Sanna Accessibility Service interrupted");
    }

    @Override
    protected void onServiceConnected() {
        super.onServiceConnected();
        instance = this;
        Log.i(TAG, "Sanna Accessibility Service connected successfully!");
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        instance = null;
        Log.i(TAG, "Sanna Accessibility Service destroyed");
    }

    /**
     * Dispatch programmatic tap at (x, y) coordinates
     */
    public boolean tap(float x, float y) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.N) return false;
        Path path = new Path();
        path.moveTo(x, y);
        GestureDescription.Builder builder = new GestureDescription.Builder();
        builder.addStroke(new GestureDescription.StrokeDescription(path, 0, 50));
        return dispatchGesture(builder.build(), null, null);
    }

    /**
     * Dispatch programmatic swipe from (x1, y1) to (x2, y2)
     */
    public boolean swipe(float x1, float y1, float x2, float y2, long duration) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.N) return false;
        Path path = new Path();
        path.moveTo(x1, y1);
        path.lineTo(x2, y2);
        GestureDescription.Builder builder = new GestureDescription.Builder();
        builder.addStroke(new GestureDescription.StrokeDescription(path, 0, Math.max(duration, 100)));
        return dispatchGesture(builder.build(), null, null);
    }

    /**
     * Long press gesture at (x, y)
     */
    public boolean longPress(float x, float y, long duration) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.N) return false;
        Path path = new Path();
        path.moveTo(x, y);
        GestureDescription.Builder builder = new GestureDescription.Builder();
        builder.addStroke(new GestureDescription.StrokeDescription(path, 0, duration > 0 ? duration : 800));
        return dispatchGesture(builder.build(), null, null);
    }

    /**
     * Search accessibility tree for element matching text and click it
     */
    public boolean clickByText(String text) {
        AccessibilityNodeInfo root = getRootInActiveWindow();
        if (root == null || text == null || text.trim().isEmpty()) return false;
        return findAndClickText(root, text.trim());
    }

    private boolean findAndClickText(AccessibilityNodeInfo node, String text) {
        if (node == null) return false;

        CharSequence nodeText = node.getText();
        CharSequence desc = node.getContentDescription();
        String query = text.toLowerCase();

        boolean match = false;
        if (nodeText != null && nodeText.toString().toLowerCase().contains(query)) match = true;
        if (desc != null && desc.toString().toLowerCase().contains(query)) match = true;

        if (match) {
            // Traverse up to find a clickable parent if current node is not clickable
            AccessibilityNodeInfo target = node;
            while (target != null && !target.isClickable()) {
                target = target.getParent();
            }
            if (target != null && target.isClickable()) {
                return target.performAction(AccessibilityNodeInfo.ACTION_CLICK);
            } else {
                return node.performAction(AccessibilityNodeInfo.ACTION_CLICK);
            }
        }

        for (int i = 0; i < node.getChildCount(); i++) {
            if (findAndClickText(node.getChild(i), text)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Search accessibility tree for element matching viewId and click it
     */
    public boolean clickById(String viewId) {
        AccessibilityNodeInfo root = getRootInActiveWindow();
        if (root == null || viewId == null || viewId.trim().isEmpty()) return false;

        List<AccessibilityNodeInfo> nodes = root.findAccessibilityNodeInfosByViewId(viewId.trim());
        if (nodes == null || nodes.isEmpty()) return false;

        for (AccessibilityNodeInfo node : nodes) {
            if (node != null) {
                AccessibilityNodeInfo target = node;
                while (target != null && !target.isClickable()) {
                    target = target.getParent();
                }
                if (target != null && target.isClickable()) {
                    return target.performAction(AccessibilityNodeInfo.ACTION_CLICK);
                }
                if (node.performAction(AccessibilityNodeInfo.ACTION_CLICK)) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Extract all visible texts from active foreground app window (Live OCR / Screen Reader)
     */
    public List<String> getScreenText() {
        List<String> results = new ArrayList<>();
        AccessibilityNodeInfo root = getRootInActiveWindow();
        if (root != null) {
            collectAllTexts(root, results);
        }
        return results;
    }

    private void collectAllTexts(AccessibilityNodeInfo node, List<String> out) {
        if (node == null) return;
        CharSequence text = node.getText();
        CharSequence desc = node.getContentDescription();

        if (text != null && text.length() > 0) {
            String s = text.toString().trim();
            if (!s.isEmpty() && !out.contains(s)) {
                out.add(s);
            }
        }
        if (desc != null && desc.length() > 0) {
            String s = desc.toString().trim();
            if (!s.isEmpty() && !out.contains(s)) {
                out.add(s);
            }
        }

        for (int i = 0; i < node.getChildCount(); i++) {
            collectAllTexts(node.getChild(i), out);
        }
    }

    /**
     * Type text into focused input field
     */
    public boolean inputText(String text) {
        AccessibilityNodeInfo root = getRootInActiveWindow();
        if (root == null || text == null) return false;

        AccessibilityNodeInfo focused = root.findFocus(AccessibilityNodeInfo.FOCUS_INPUT);
        if (focused == null) focused = root.findFocus(AccessibilityNodeInfo.FOCUS_ACCESSIBILITY);

        if (focused == null) {
            // Search for first editable EditText
            focused = findFirstEditable(root);
        }

        if (focused != null) {
            Bundle args = new Bundle();
            args.putCharSequence(AccessibilityNodeInfo.ACTION_ARGUMENT_SET_TEXT_CHARSEQUENCE, text);
            return focused.performAction(AccessibilityNodeInfo.ACTION_SET_TEXT, args);
        }
        return false;
    }

    private AccessibilityNodeInfo findFirstEditable(AccessibilityNodeInfo node) {
        if (node == null) return null;
        if (node.isEditable()) return node;
        for (int i = 0; i < node.getChildCount(); i++) {
            AccessibilityNodeInfo res = findFirstEditable(node.getChild(i));
            if (res != null) return res;
        }
        return null;
    }

    /**
     * Scroll forward / backward
     */
    public boolean scroll(boolean forward) {
        AccessibilityNodeInfo root = getRootInActiveWindow();
        if (root == null) return false;
        return root.performAction(forward ? AccessibilityNodeInfo.ACTION_SCROLL_FORWARD : AccessibilityNodeInfo.ACTION_SCROLL_BACKWARD);
    }

    /**
     * Perform global Android system action
     */
    public boolean performGlobal(String action) {
        if ("back".equalsIgnoreCase(action)) {
            return performGlobalAction(GLOBAL_ACTION_BACK);
        } else if ("home".equalsIgnoreCase(action)) {
            return performGlobalAction(GLOBAL_ACTION_HOME);
        } else if ("recents".equalsIgnoreCase(action)) {
            return performGlobalAction(GLOBAL_ACTION_RECENTS);
        } else if ("notifications".equalsIgnoreCase(action)) {
            return performGlobalAction(GLOBAL_ACTION_NOTIFICATIONS);
        } else if ("quick_settings".equalsIgnoreCase(action)) {
            return performGlobalAction(GLOBAL_ACTION_QUICK_SETTINGS);
        } else if ("lock_screen".equalsIgnoreCase(action)) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                return performGlobalAction(GLOBAL_ACTION_LOCK_SCREEN);
            }
        } else if ("screenshot".equalsIgnoreCase(action) || "take_screenshot".equalsIgnoreCase(action)) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                return performGlobalAction(GLOBAL_ACTION_TAKE_SCREENSHOT);
            }
        } else if ("power_dialog".equalsIgnoreCase(action)) {
            return performGlobalAction(GLOBAL_ACTION_POWER_DIALOG);
        }
        return false;
    }
}
