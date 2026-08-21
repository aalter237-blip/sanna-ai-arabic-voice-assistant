package com.sanna.ai;

import android.app.Notification;
import android.os.Bundle;
import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;
import java.util.ArrayList;
import java.util.List;

public class SannaNotificationListener extends NotificationListenerService {
    public static SannaNotificationListener instance;
    public static class Item { public String pkg, title, text, key; }
    @Override public void onListenerConnected(){ instance = this; }
    @Override public void onListenerDisconnected(){ instance = null; }
    public List<Item> snapshot(){
        List<Item> out = new ArrayList<>();
        try {
            StatusBarNotification[] all = getActiveNotifications();
            if (all == null) return out;
            for (StatusBarNotification s : all) {
                Notification n = s.getNotification();
                Bundle extras = n.extras;
                Item it = new Item();
                it.pkg = s.getPackageName();
                it.key = s.getKey();
                CharSequence t = extras.getCharSequence(Notification.EXTRA_TITLE);
                CharSequence x = extras.getCharSequence(Notification.EXTRA_TEXT);
                it.title = t == null ? "" : t.toString();
                it.text = x == null ? "" : x.toString();
                out.add(it);
            }
        } catch (Exception e) {}
        return out;
    }
}
