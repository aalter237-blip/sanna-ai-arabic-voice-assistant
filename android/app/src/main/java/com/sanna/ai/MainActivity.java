package com.sanna.ai;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.BridgeActivity;

import java.util.ArrayList;
import java.util.List;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "MainActivity";
    private static final int PERMISSION_REQUEST_CODE = 1001;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(VoiceAgentPlugin.class);
        super.onCreate(savedInstanceState);

        requestAllRuntimePermissions();
        handleWakeIntent(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleWakeIntent(intent);
    }

    private void handleWakeIntent(Intent intent) {
        if (intent == null || !intent.getBooleanExtra("wake", false)) return;
        final String command = intent.getStringExtra("command");

        new Handler(Looper.getMainLooper()).postDelayed(new Runnable() {
            @Override
            public void run() {
                if (getBridge() != null && getBridge().getWebView() != null) {
                    String js = command != null && !command.isEmpty()
                            ? "window.dispatchEvent(new CustomEvent('sanna-wake', { detail: { command: '" + command.replace("'", "\\'") + "' } }))"
                            : "window.dispatchEvent(new CustomEvent('sanna-wake'))";
                    getBridge().getWebView().evaluateJavascript(js, null);
                }
            }
        }, 800);
    }

    private void requestAllRuntimePermissions() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) return;

        List<String> permissions = new ArrayList<>();
        permissions.add(Manifest.permission.RECORD_AUDIO);
        permissions.add(Manifest.permission.CALL_PHONE);
        permissions.add(Manifest.permission.SEND_SMS);
        permissions.add(Manifest.permission.READ_CONTACTS);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            permissions.add(Manifest.permission.POST_NOTIFICATIONS);
        }

        List<String> permissionsToRequest = new ArrayList<>();
        for (String perm : permissions) {
            if (ContextCompat.checkSelfPermission(this, perm) != PackageManager.PERMISSION_GRANTED) {
                permissionsToRequest.add(perm);
            }
        }

        if (!permissionsToRequest.isEmpty()) {
            ActivityCompat.requestPermissions(
                    this,
                    permissionsToRequest.toArray(new String[0]),
                    PERMISSION_REQUEST_CODE
            );
        }
    }
}
