package com.sanna.ai;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(VoiceAgentPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
