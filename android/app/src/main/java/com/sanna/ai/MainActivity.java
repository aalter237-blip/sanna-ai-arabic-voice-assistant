package com.sanna.ai;

import android.Manifest;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(VoiceAgentPlugin.class);
        super.onCreate(savedInstanceState);
        if (Build.VERSION.SDK_INT >= 23) {
            requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO, Manifest.permission.POST_NOTIFICATIONS}, 1001);
        }
        handleWake(getIntent());
    }
    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleWake(intent);
    }
    private void handleWake(Intent intent) {
        if (intent == null || !intent.getBooleanExtra("wake", false)) return;
        new Handler(Looper.getMainLooper()).postDelayed(() -> {
            if (getBridge() != null && getBridge().getWebView() != null) {
                getBridge().getWebView().evaluateJavascript("window.dispatchEvent(new CustomEvent(sanna-wake))", null);
            }
        }, 900);
    }
}
