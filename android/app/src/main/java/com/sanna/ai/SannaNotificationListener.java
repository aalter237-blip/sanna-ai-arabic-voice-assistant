package com.sanna.ai;

import android.app.Notification;
import android.app.PendingIntent;
import android.app.RemoteInput;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;
import android.util.Log;

import java.util.ArrayList;
import java.util.List;

public class SannaNotificationListener extends NotificationListenerService {
    private static final String TAG = "SannaNotification";
    public static SannaNotificationListener instance;
    public static String lastTitle = "";
    public static String lastText = "";
    public static String lastPkg = "";
    public static Notification.Action lastQuickReplyAction = null;

    public static class Item {
        public String pkg, title, text, key;
    }

    @Override
    public void onListenerConnected() {
        instance = this;
        Log.i(TAG, "Sanna Notification Listener Connected");
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

        // Search for quick reply action
        if (n.actions != null) {
            for (Notification.Action action : n.actions) {
                if (action != null && action.getRemoteInputs() != null && action.getRemoteInputs().length > 0) {
                    lastQuickReplyAction = action;
                    break;
                }
            }
        }
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

    public boolean replyLast(String replyText, Context context) {
        if (lastQuickReplyAction == null || replyText == null) return false;
        try {
            RemoteInput[] remoteInputs = lastQuickReplyAction.getRemoteInputs();
            if (remoteInputs == null || remoteInputs.length == 0) return false;

            Intent intent = new Intent();
            Bundle bundle = new Bundle();
            for (RemoteInput remoteInput : remoteInputs) {
                bundle.putCharSequence(remoteInput.getResultKey(), replyText);
            }
            RemoteInput.addResultsToIntent(remoteInputs, intent, bundle);
            lastQuickReplyAction.actionIntent.send(context, 0, intent);
            return true;
        } catch (PendingIntent.CanceledException e) {
            Log.e(TAG, "Reply failed: " + e.getMessage());
            return false;
        }
    }
}
