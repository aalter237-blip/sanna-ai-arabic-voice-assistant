package com.sanna.ai;

import android.accessibilityservice.AccessibilityService;
import android.accessibilityservice.GestureDescription;
import android.graphics.Path;
import android.os.Bundle;
import android.view.accessibility.AccessibilityEvent;
import android.view.accessibility.AccessibilityNodeInfo;
import java.util.ArrayList;
import java.util.List;

public class SannaAccessibilityService extends AccessibilityService {
    public static SannaAccessibilityService instance;
    @Override public void onAccessibilityEvent(AccessibilityEvent e) {}
    @Override public void onInterrupt() {}
    @Override protected void onServiceConnected() { super.onServiceConnected(); instance = this; }
    @Override public void onDestroy() { super.onDestroy(); instance = null; }
    public void tap(float x, float y) { Path p=new Path(); p.moveTo(x,y); dispatchGesture(new GestureDescription.Builder().addStroke(new GestureDescription.StrokeDescription(p,0,50)).build(),null,null); }
    public void swipe(float x1,float y1,float x2,float y2,long d){ Path p=new Path(); p.moveTo(x1,y1); p.lineTo(x2,y2); dispatchGesture(new GestureDescription.Builder().addStroke(new GestureDescription.StrokeDescription(p,0,d)).build(),null,null); }
    public boolean clickByText(String text){ AccessibilityNodeInfo r=getRootInActiveWindow(); return r!=null && findAndClick(r,text); }
    public boolean clickById(String id){ AccessibilityNodeInfo r=getRootInActiveWindow(); if(r==null)return false; List<AccessibilityNodeInfo> n=r.findAccessibilityNodeInfosByViewId(id); if(n==null)return false; for(AccessibilityNodeInfo x:n){ if(x!=null&&x.isClickable()){ x.performAction(AccessibilityNodeInfo.ACTION_CLICK); return true; } } return false; }
    public List<String> getScreenText(){ List<String> o=new ArrayList<>(); collect(getRootInActiveWindow(),o); return o; }
    public boolean inputText(String text){ AccessibilityNodeInfo r=getRootInActiveWindow(); if(r==null)return false; AccessibilityNodeInfo f=r.findFocus(AccessibilityNodeInfo.FOCUS_INPUT); if(f==null)f=r.findFocus(AccessibilityNodeInfo.FOCUS_ACCESSIBILITY); if(f==null)return false; Bundle b=new Bundle(); b.putCharSequence(AccessibilityNodeInfo.ACTION_ARGUMENT_SET_TEXT_CHARSEQUENCE,text); return f.performAction(AccessibilityNodeInfo.ACTION_SET_TEXT,b); }
    public boolean global(String a){ if("back".equals(a))return performGlobalAction(GLOBAL_ACTION_BACK); if("home".equals(a))return performGlobalAction(GLOBAL_ACTION_HOME); if("recents".equals(a))return performGlobalAction(GLOBAL_ACTION_RECENTS); if("notifications".equals(a))return performGlobalAction(GLOBAL_ACTION_NOTIFICATIONS); if("quick_settings".equals(a))return performGlobalAction(GLOBAL_ACTION_QUICK_SETTINGS); return false; }
    private void collect(AccessibilityNodeInfo n,List<String> o){ if(n==null)return; CharSequence t=n.getText(); CharSequence d=n.getContentDescription(); if(t!=null&&t.length()>0)o.add(t.toString()); else if(d!=null&&d.length()>0)o.add(d.toString()); for(int i=0;i<n.getChildCount();i++)collect(n.getChild(i),o); }
    private boolean findAndClick(AccessibilityNodeInfo n,String text){ if(n==null)return false; CharSequence t=n.getText(); CharSequence d=n.getContentDescription(); boolean m=(t!=null&&t.toString().toLowerCase().contains(text.toLowerCase()))||(d!=null&&d.toString().toLowerCase().contains(text.toLowerCase())); if(m&&n.isClickable()){ n.performAction(AccessibilityNodeInfo.ACTION_CLICK); return true; } for(int i=0;i<n.getChildCount();i++){ if(findAndClick(n.getChild(i),text))return true; } return false; }
}
