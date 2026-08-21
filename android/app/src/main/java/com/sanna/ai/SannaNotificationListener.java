package com.sanna.ai;

import android.app.Notification;
import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;
import java.util.ArrayList;
import java.util.List;

public class SannaNotificationListener extends NotificationListenerService {
    public static SannaNotificationListener instance;
    public static String lastTitle = "";
    public static String lastText = "";
    public static String lastPkg = "";

    public static class Item {
        public String pkg, title, text, key;
    }

    @Override
    public void onListenerConnected() {
        instance = this;
    }

    @Override
    public void onListenerDisconnected() {
        instance = null;
    }

    @Override
    public void onNotificationPosted(StatusBarNotification sbn) {
        if (sbn == null || sbn.getNotification() == null) return;
        Notification n = sbn.getNotification();
        CharSequence t = n.extras.getCharSequence(Notification.EXTRA_TITLE);
        CharSequence x = n.extras.getCharSequence(Notification.EXTRA_TEXT);
        lastPkg = sbn.getPackageName();
        lastTitle = t == null ? "" : t.toString();
        lastText = x == null ? "" : x.toString();
    }

    public List<Item> snapshot() {
        ArrayList<Item> out = new ArrayList<>();
        StatusBarNotification[] all = getActiveNotifications();
        if (all == null) return out;
        for (StatusBarNotification sbn : all) {
            Item it = new Item();
            it.pkg = sbn.getPackageName();
            it.key = sbn.getKey();
            Notification n = sbn.getNotification();
            CharSequence t = n.extras.getCharSequence(Notification.EXTRA_TITLE);
            CharSequence x = n.extras.getCharSequence(Notification.EXTRA_TEXT);
            it.title = t == null ? "" : t.toString();
            it.text = x == null ? "" : x.toString();
            out.add(it);
        }
        return out;
    }
}
