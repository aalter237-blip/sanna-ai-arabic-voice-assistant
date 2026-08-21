package com.sanna.ai;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.os.IBinder;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import java.util.ArrayList;
import java.util.Locale;

public class VoiceForegroundService extends Service {
    public static boolean running = false;
    private SpeechRecognizer sr;
    private String[] wakes = new String[]{"سنا","سناء","تلفوني","مساعدي"};
    @Override public IBinder onBind(Intent i){ return null; }
    @Override public int onStartCommand(Intent intent, int flags, int id){
        startFg();
        running = true;
        startRec();
        return START_STICKY;
    }
    private void startFg(){
        String ch = "sanna_listen";
        NotificationManager nm = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        if (Build.VERSION.SDK_INT >= 26) nm.createNotificationChannel(new NotificationChannel(ch, "سنا تستمع", NotificationManager.IMPORTANCE_LOW));
        Intent open = new Intent(this, MainActivity.class);
        PendingIntent pi = PendingIntent.getActivity(this, 0, open, PendingIntent.FLAG_IMMUTABLE);
        Notification.Builder b = (Build.VERSION.SDK_INT >= 26) ? new Notification.Builder(this, ch) : new Notification.Builder(this);
        Notification n = b.setContentTitle("سنا").setContentText("الاستماع لكلمة الاستيقاظ نشط").setSmallIcon(android.R.drawable.ic_btn_speak_now).setContentIntent(pi).setOngoing(true).build();
        startForeground(21, n);
    }
    private void startRec(){
        if (!SpeechRecognizer.isRecognitionAvailable(this)) return;
        if (sr != null) { try { sr.destroy(); } catch (Exception e) {} }
        sr = SpeechRecognizer.createSpeechRecognizer(this);
        sr.setRecognitionListener(new RecognitionListener() {
            public void onReadyForSpeech(Bundle b) {}
            public void onBeginningOfSpeech() {}
            public void onRmsChanged(float v) {}
            public void onBufferReceived(byte[] b) {}
            public void onEndOfSpeech() {}
            public void onError(int e) { if (running) restart(); }
            public void onPartialResults(Bundle b) { check(b); }
            public void onEvent(int i, Bundle b) {}
            public void onResults(Bundle b) { check(b); if (running) restart(); }
        });
        restart();
    }
    private void restart(){
        try {
            Intent i = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
            i.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
            i.putExtra(RecognizerIntent.EXTRA_LANGUAGE, "ar-SA");
            i.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true);
            sr.startListening(i);
        } catch (Exception e) {}
    }
    private void check(Bundle b){
        ArrayList<String> list = b.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
        if (list == null) return;
        for (String s : list) {
            if (s == null) continue;
            String t = s.toLowerCase(Locale.ROOT);
            for (String w : wakes) {
                if (t.contains(w)) {
                    Intent open = new Intent(this, MainActivity.class);
                    open.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
                    open.putExtra("wake", true);
                    startActivity(open);
                    return;
                }
            }
        }
    }
    @Override public void onDestroy(){
        running = false;
        if (sr != null) try { sr.destroy(); } catch (Exception e) {}
        super.onDestroy();
    }
}
