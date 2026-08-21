import React, { useState } from 'react';
import { Layers, Search, MousePointer, ShieldCheck, Box, ChevronRight, CheckCircle2 } from 'lucide-react';
import { AppScreen } from '../types';

interface AccessibilityNodeViewerProps {
  currentScreen: AppScreen;
  highlightedElement: string | null;
  onSimulateClick: (nodeId: string, nodeText: string) => void;
  isArabicUI: boolean;
}

interface NodeData {
  id: string;
  viewId: string;
  className: string;
  text?: string;
  clickable: boolean;
  bounds: string;
  description: string;
}

export const AccessibilityNodeViewer: React.FC<AccessibilityNodeViewerProps> = ({
  currentScreen,
  highlightedElement,
  onSimulateClick,
  isArabicUI,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Dynamic node hierarchy for current screen
  const getNodeHierarchy = (): NodeData[] => {
    switch (currentScreen) {
      case 'home':
        return [
          {
            id: 'node-home-root',
            viewId: 'com.android.launcher:id/workspace',
            className: 'android.widget.FrameLayout',
            clickable: false,
            bounds: '[0,0][1080,2400]',
            description: 'WorkSpace Root Container',
          },
          {
            id: 'node-whatsapp-icon',
            viewId: 'com.whatsapp',
            className: 'android.widget.TextView',
            text: 'واتساب',
            clickable: true,
            bounds: '[60,420][280,640]',
            description: 'WhatsApp Application Shortcut',
          },
          {
            id: 'node-settings-icon',
            viewId: 'com.android.settings',
            className: 'android.widget.TextView',
            text: 'الإعدادات',
            clickable: true,
            bounds: '[320,420][540,640]',
            description: 'System Settings Shortcut',
          },
          {
            id: 'node-clock-icon',
            viewId: 'com.google.android.deskclock',
            className: 'android.widget.TextView',
            text: 'الساعة',
            clickable: true,
            bounds: '[580,420][800,640]',
            description: 'Clock / Alarm Manager Shortcut',
          },
          {
            id: 'node-reader-icon',
            viewId: 'com.sannabotapp:id/screen_reader',
            className: 'android.widget.TextView',
            text: 'قارئ الشاشة',
            clickable: true,
            bounds: '[840,420][1020,640]',
            description: 'Sanna Accessibility Inspector',
          },
        ];

      case 'whatsapp':
      case 'whatsapp_chat':
        return [
          {
            id: 'node-wa-root',
            viewId: 'com.whatsapp:id/main_content',
            className: 'android.view.ViewGroup',
            clickable: false,
            bounds: '[0,0][1080,2400]',
            description: 'WhatsApp Main Conversation Container',
          },
          {
            id: 'node-wa-header-name',
            viewId: 'com.whatsapp:id/conversation_contact_name',
            className: 'android.widget.TextView',
            text: 'أمي',
            clickable: true,
            bounds: '[120,80][600,160]',
            description: 'Active Contact Name Bar',
          },
          {
            id: 'node-wa-entry',
            viewId: 'com.whatsapp:id/entry',
            className: 'android.widget.EditText',
            text: 'اكتب رسالة...',
            clickable: true,
            bounds: '[40,2150][880,2270]',
            description: 'Message Input EditText',
          },
          {
            id: 'node-wa-send-btn',
            viewId: 'com.whatsapp:id/send',
            className: 'android.widget.ImageButton',
            text: 'إرسال',
            clickable: true,
            bounds: '[920,2150][1040,2270]',
            description: 'Send Message Action Trigger',
          },
        ];

      case 'settings':
        return [
          {
            id: 'node-set-root',
            viewId: 'com.android.settings:id/settings_homepage_container',
            className: 'android.widget.ScrollView',
            clickable: false,
            bounds: '[0,0][1080,2400]',
            description: 'Settings Scrollable List',
          },
          {
            id: 'node-set-wifi',
            viewId: 'com.android.settings:id/wifi_switch',
            className: 'android.widget.Switch',
            text: 'الواي فاي (Wi-Fi)',
            clickable: true,
            bounds: '[40,300][1040,440]',
            description: 'Wi-Fi Adapter Toggle Switch',
          },
          {
            id: 'node-set-volume',
            viewId: 'com.android.settings:id/volume_slider',
            className: 'android.widget.SeekBar',
            text: 'صوت الوسائط (Media Volume)',
            clickable: true,
            bounds: '[40,480][1040,620]',
            description: 'Audio Volume SeekBar Slider',
          },
        ];

      default:
        return [
          {
            id: 'node-default-root',
            viewId: 'android:id/content',
            className: 'android.widget.FrameLayout',
            clickable: false,
            bounds: '[0,0][1080,2400]',
            description: 'Standard Android Window Content Root',
          },
        ];
    }
  };

  const nodes = getNodeHierarchy().filter(
    (n) =>
      n.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.viewId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (n.text && n.text.toLowerCase().includes(searchTerm.toLowerCase())) ||
      n.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800/40">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>{isArabicUI ? 'فاحص شجرة AccessibilityNodeInfo' : 'Android Accessibility Inspector'}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                Window: {currentScreen}
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              {isArabicUI
                ? 'العقد البرمجية الحية التي يراها ويتحكم بها كود SannaAccessibilityService.kt'
                : 'Live view hierarchy inspected and automated by Kotlin Native Service'}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-60">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="node-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={isArabicUI ? 'بحث في العقد (id, text, class)...' : 'Filter nodes...'}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Hierarchy Node Cards */}
      <div className="flex-1 overflow-y-auto space-y-3 py-4 pr-1">
        {nodes.map((node) => {
          const isHighlighted =
            highlightedElement === node.viewId ||
            (node.text && highlightedElement === node.text);

          return (
            <div
              key={node.id}
              className={`p-4 rounded-2xl border transition-all ${
                isHighlighted
                  ? 'bg-cyan-950/40 border-cyan-500/80 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-400'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-cyan-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    {node.className}
                  </span>
                  <span className="text-[11px] font-mono text-indigo-300">
                    id: {node.viewId}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {node.clickable && (
                    <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-700/50 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                      <MousePointer className="w-2.5 h-2.5" />
                      Clickable
                    </span>
                  )}
                  <span className="text-[10px] font-mono bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded">
                    {node.bounds}
                  </span>
                </div>
              </div>

              {node.text && (
                <div className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
                  <span className="text-slate-400 text-xs font-normal">Visible Text:</span>
                  <span className="text-emerald-300 bg-slate-900/90 px-2 py-0.5 rounded font-sans">
                    &quot;{node.text}&quot;
                  </span>
                </div>
              )}

              <p className="text-xs text-slate-400 leading-normal mb-3">{node.description}</p>

              {/* Action Trigger Button */}
              {node.clickable && (
                <button
                  id={`simulate-click-${node.id}`}
                  onClick={() => onSimulateClick(node.viewId, node.text || '')}
                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 border border-slate-700 transition-all font-medium cursor-pointer"
                >
                  <MousePointer className="w-3.5 h-3.5" />
                  <span>
                    {isArabicUI
                      ? `محاكاة النقر: findAndClick("${node.text || node.viewId}")`
                      : `Simulate findAndClick("${node.text || node.viewId}")`}
                  </span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Kotlin Accessibility Service Integration Note */}
      <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-3 text-xs text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>
            {isArabicUI
              ? 'يتم تنفيذ الأوامر عبر Kotlin BIND_ACCESSIBILITY_SERVICE بدون الحاجة لـ Root'
              : 'Executed via Kotlin BIND_ACCESSIBILITY_SERVICE without root permissions'}
          </span>
        </div>
        <span className="text-emerald-400 font-mono text-[11px] font-bold">API 34 Ready</span>
      </div>
    </div>
  );
};
