import React, { useState } from 'react';
import { Terminal, Trash2, CheckCircle2, AlertTriangle, Info, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { ExecutionLogItem } from '../types';

interface ExecutionLogsProps {
  logs: ExecutionLogItem[];
  onClearLogs: () => void;
  isArabicUI: boolean;
}

export const ExecutionLogs: React.FC<ExecutionLogsProps> = ({ logs, onClearLogs, isArabicUI }) => {
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyPayload = (id: string, payload: any) => {
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getPhaseBadge = (phase: ExecutionLogItem['phase']) => {
    switch (phase) {
      case 'WAKE_WORD':
        return <span className="bg-purple-950 text-purple-300 border border-purple-800/50 px-2 py-0.5 rounded text-[10px] font-mono font-bold">WAKE_WORD</span>;
      case 'STT_INPUT':
        return <span className="bg-cyan-950 text-cyan-300 border border-cyan-800/50 px-2 py-0.5 rounded text-[10px] font-mono font-bold">ARABIC_STT</span>;
      case 'LLM_INFERENCE':
        return <span className="bg-indigo-950 text-indigo-300 border border-indigo-800/50 px-2 py-0.5 rounded text-[10px] font-mono font-bold">LLM_REASONING</span>;
      case 'TOOL_PARSER':
        return <span className="bg-amber-950 text-amber-300 border border-amber-800/50 px-2 py-0.5 rounded text-[10px] font-mono font-bold">TOOL_LOOP</span>;
      case 'ACCESSIBILITY_BRIDGE':
        return <span className="bg-emerald-950 text-emerald-300 border border-emerald-800/50 px-2 py-0.5 rounded text-[10px] font-mono font-bold">ACCESSIBILITY_KOTLIN</span>;
      case 'TTS_OUTPUT':
        return <span className="bg-teal-950 text-teal-300 border border-teal-800/50 px-2 py-0.5 rounded text-[10px] font-mono font-bold">ARABIC_TTS</span>;
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800/40">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>{isArabicUI ? 'سجل العمليات والتحكم التلقائي الحقيقي' : 'Execution Pipeline & Telemetry Trace'}</span>
              <span className="text-xs font-mono text-cyan-400 bg-slate-800 px-2 py-0.5 rounded-full">
                {logs.length} {isArabicUI ? 'حدث' : 'events'}
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              {isArabicUI
                ? 'تتبع كامل من الصوت المنطوق إلى خدمة إمكانية الوصول والتنفيذ الفعلي'
                : 'Real-time trace: Voice -> STT -> Dialect Parser -> Accessibility Dispatch -> TTS'}
            </p>
          </div>
        </div>

        <button
          id="clear-logs-btn"
          onClick={onClearLogs}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>{isArabicUI ? 'مسح السجل' : 'Clear Logs'}</span>
        </button>
      </div>

      {/* Log Feed */}
      <div className="flex-1 overflow-y-auto space-y-2.5 py-4 pr-1">
        {logs.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-slate-500 text-sm">
            <Terminal className="w-8 h-8 mb-2 opacity-40" />
            <p>{isArabicUI ? 'لا توجد عمليات بعد. تحدث بالصوت أو أرسل أمراً لبدء التتبع.' : 'No execution logs yet. Speak or send a command to inspect.'}</p>
          </div>
        ) : (
          logs.map((log) => {
            const isExpanded = expandedLogId === log.id;

            return (
              <div
                key={log.id}
                className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-3.5 text-xs hover:border-slate-700 transition-all font-sans"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getPhaseBadge(log.phase)}
                    <span className="font-bold text-slate-200">{log.title}</span>
                  </div>

                  <span className="text-[10px] text-slate-500 font-mono shrink-0">
                    {log.timestamp}
                  </span>
                </div>

                <p className="text-slate-300 mt-1.5 leading-relaxed font-sans text-[12px]">
                  {log.details}
                </p>

                {log.payload && (
                  <div className="mt-2.5 pt-2 border-t border-slate-900 flex items-center justify-between">
                    <button
                      onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono font-medium"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-3 h-3" />
                          <span>{isArabicUI ? 'إخفاء الحمولة البرمجية' : 'Hide Payload'}</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3 h-3" />
                          <span>{isArabicUI ? 'عرض بيانات JSON' : 'View Payload JSON'}</span>
                        </>
                      )}
                    </button>

                    {isExpanded && (
                      <button
                        onClick={() => copyPayload(log.id, log.payload)}
                        className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 font-mono"
                      >
                        {copiedId === log.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy JSON</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}

                {isExpanded && log.payload && (
                  <pre className="mt-2 p-3 bg-slate-900 rounded-xl text-[11px] font-mono text-emerald-300 overflow-x-auto border border-slate-800 leading-normal">
                    {JSON.stringify(log.payload, null, 2)}
                  </pre>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
