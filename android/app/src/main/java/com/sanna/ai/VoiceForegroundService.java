package com.sanna.ai;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import android.util.Log;

import java.util.ArrayList;
import java.util.Locale;

public class VoiceForegroundService extends Service {
    private static final String TAG = "VoiceForegroundService";
    private static final String CHANNEL_ID = "sanna_voice_channel";
    public static boolean running = false;
    private SpeechRecognizer speechRecognizer;
    private final String[] wakeWords = new String[]{"سنا", "يا سنا", "سناء", "تلفوني", "مساعدي", "يا زول", "افتح يا سمسم"};
    private final Handler restartHandler = new Handler(Looper.getMainLooper());

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        startForegroundNotification();
        running = true;
        initSpeechRecognizer();
        return START_STICKY;
    }

    private void startForegroundNotification() {
        NotificationManager nm = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && nm != null) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "سنا - خدمة الاستماع الصوتي 24/7",
                    NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("استماع دائم لكلمة الاستيقاظ والتحكم بالهاتف عبر الصوت");
            nm.createNotificationChannel(channel);
        }

        Intent openIntent = new Intent(this, MainActivity.class);
        openIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent pi = PendingIntent.getActivity(
                this,
                0,
                openIntent,
                Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0
        );

        Notification.Builder builder = (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O)
                ? new Notification.Builder(this, CHANNEL_ID)
                : new Notification.Builder(this);

        Notification notification = builder
                .setContentTitle("سنا AI - الوكيل الصوتي")
                .setContentText("جاهز للاستماع لكلمة التنبيه: \"سنا\" أو \"يا زول\" أو \"تلفوني\"")
                .setSmallIcon(android.R.drawable.ic_btn_speak_now)
                .setContentIntent(pi)
                .setOngoing(true)
                .build();

        startForeground(101, notification);
    }

    private void initSpeechRecognizer() {
        if (!SpeechRecognizer.isRecognitionAvailable(this)) {
            Log.w(TAG, "SpeechRecognizer not available on device");
            return;
        }

        if (speechRecognizer != null) {
            try {
                speechRecognizer.destroy();
            } catch (Exception e) {
                // ignore
            }
        }

        speechRecognizer = SpeechRecognizer.createSpeechRecognizer(this);
        speechRecognizer.setRecognitionListener(new RecognitionListener() {
            @Override
            public void onReadyForSpeech(Bundle params) {}

            @Override
            public void onBeginningOfSpeech() {}

            @Override
            public void onRmsChanged(float rmsdB) {}

            @Override
            public void onBufferReceived(byte[] buffer) {}

            @Override
            public void onEndOfSpeech() {}

            @Override
            public void onError(int error) {
                if (running) {
                    restartListeningWithDelay();
                }
            }

            @Override
            public void onResults(Bundle results) {
                checkResults(results);
                if (running) {
                    restartListeningWithDelay();
                }
            }

            @Override
            public void onPartialResults(Bundle partialResults) {
                checkResults(partialResults);
            }

            @Override
            public void onEvent(int eventType, Bundle params) {}
        });

        startListening();
    }

    private void startListening() {
        try {
            Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
            intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
            intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, "ar-SA");
            intent.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true);
            intent.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 3);
            if (speechRecognizer != null) {
                speechRecognizer.startListening(intent);
            }
        } catch (Exception e) {
            Log.e(TAG, "Start listening error: " + e.getMessage());
        }
    }

    private void restartListeningWithDelay() {
        restartHandler.removeCallbacksAndMessages(null);
        restartHandler.postDelayed(new Runnable() {
            @Override
            public void run() {
                if (running) {
                    startListening();
                }
            }
        }, 500);
    }

    private void checkResults(Bundle bundle) {
        if (bundle == null) return;
        ArrayList<String> matches = bundle.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
        if (matches == null) return;

        for (String match : matches) {
            if (match == null) continue;
            String text = match.toLowerCase(Locale.ROOT).trim();
            for (String wake : wakeWords) {
                if (text.contains(wake)) {
                    Log.i(TAG, "Wake word detected: " + wake);
                    // Launch Main Activity with wake flag
                    Intent openIntent = new Intent(this, MainActivity.class);
                    openIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
                    openIntent.putExtra("wake", true);
                    openIntent.putExtra("command", text);
                    startActivity(openIntent);
                    return;
                }
            }
        }
    }

    @Override
    public void onDestroy() {
        running = false;
        restartHandler.removeCallbacksAndMessages(null);
        if (speechRecognizer != null) {
            try {
                speechRecognizer.destroy();
            } catch (Exception e) {
                // ignore
            }
            speechRecognizer = null;
        }
        super.onDestroy();
    }
}
