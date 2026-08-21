import React, { useState } from 'react';
import {
  Code2,
  Folder,
  FileCode,
  Copy,
  Check,
  Download,
  Search,
  FileJson,
  Layers,
  Sparkles,
  Smartphone,
} from 'lucide-react';
import JSZip from 'jszip';
import { CODEBASE_FILES } from '../data/codebase-files';
import { CodeFile } from '../types';

interface CodeExplorerProps {
  isArabicUI: boolean;
}

export const CodeExplorer: React.FC<CodeExplorerProps> = ({ isArabicUI }) => {
  const [selectedFile, setSelectedFile] = useState<CodeFile>(CODEBASE_FILES[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);

  const filteredFiles = CODEBASE_FILES.filter(
    (file) =>
      file.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const copyCurrentFile = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopiedPath(selectedFile.path);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  const downloadProjectZip = async () => {
    setIsDownloadingZip(true);
    try {
      const zip = new JSZip();
      const rootFolder = zip.folder('android-voice-agent');

      CODEBASE_FILES.forEach((file) => {
        rootFolder?.file(file.path, file.content);
      });

      // Add README.md for immediate setup instructions
      const readmeContent = `# Arabic AI Voice Assistant & Android Accessibility Automation Agent

Production-grade AI Voice Assistant and Android Device Control Agent supporting Arabic (MSA & Dialects), Hybrid Online/Offline execution, and Accessibility Automation.

## Quick Start
1. \`npm install\`
2. Copy \`local.config.example.ts\` to \`local.config.ts\` and fill your API keys.
3. Start Android development build:
   \`\`\`bash
   npm run android
   \`\`\`

## Architecture Modules
- **src/audio/**: Arabic Speech-To-Text (\`stt-service.ts\`), TTS (\`tts-service.ts\`), and Wake Word (\`wake-word-service.ts\`).
- **src/agent/**: Master Pipeline (\`conversation-pipeline.ts\`), Arabic System Prompt (\`system-prompt.ts\`), Hybrid Provider (\`hybrid-provider.ts\`), and Tool Loop (\`tool-loop.ts\`).
- **src/tools/**: Accessibility Bridge caller (\`accessibility-tool.ts\`), WhatsApp automate (\`whatsapp-tool.ts\`), and System Control (\`system-control-tool.ts\`).
- **android/native/**: Kotlin Accessibility Service (\`AndroidAccessibilityService.kt\`) and React Native Bridge (\`AndroidAccessibilityBridge.kt\`).
`;
      rootFolder?.file('README.md', readmeContent);

      const content = await zip.generateAsync({ type: 'blob' });
      const url = window.URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'android-voice-agent-codebase.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate ZIP archive:', err);
    } finally {
      setIsDownloadingZip(false);
    }
  };

  const getFileIcon = (lang: string) => {
    switch (lang) {
      case 'json':
        return <FileJson className="w-4 h-4 text-amber-400" />;
      case 'kotlin':
        return <Smartphone className="w-4 h-4 text-purple-400" />;
      case 'xml':
        return <Layers className="w-4 h-4 text-rose-400" />;
      default:
        return <FileCode className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col h-full">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800/40">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>{isArabicUI ? 'مستودع الكود المصدري الكامل للمشروع' : 'Production Codebase'}</span>
              <span className="text-xs font-mono text-cyan-300 bg-slate-800 px-2 py-0.5 rounded">
                100% Native & Complete
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              {isArabicUI
                ? 'جميع الملفات جاهزة للنسخ والتشغيل المباشر في React Native و Android Studio'
                : 'All files ready for copy-paste into React Native, TypeScript & Kotlin projects'}
            </p>
          </div>
        </div>

        {/* Download Zip CTA */}
        <button
          id="download-zip-btn"
          onClick={downloadProjectZip}
          disabled={isDownloadingZip}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>
            {isDownloadingZip
              ? isArabicUI
                ? 'جاري تجهيز الأرشيف...'
                : 'Zipping...'
              : isArabicUI
              ? 'تحميل المشروع بالكامل (ZIP)'
              : 'Download Codebase (.ZIP)'}
          </span>
        </button>
      </div>

      {/* Main Two-Column Explorer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4 flex-1 min-h-[500px]">
        {/* Left Column: File Tree Navigation */}
        <div className="lg:col-span-4 bg-slate-950/80 border border-slate-800 rounded-2xl p-3 flex flex-col">
          {/* File Search */}
          <div className="relative mb-3">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="file-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isArabicUI ? 'بحث في ملفات المشروع...' : 'Search files...'}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Files List */}
          <div className="flex-1 overflow-y-auto space-y-1 pr-1">
            {filteredFiles.map((file) => {
              const isSelected = selectedFile.path === file.path;

              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between gap-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-950/60 border border-cyan-500/60 text-cyan-300 shadow-sm font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {getFileIcon(file.language)}
                    <span className="truncate font-mono text-[11px]">{file.path}</span>
                  </div>

                  <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 shrink-0">
                    {file.language}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Code Viewer with Syntax & Copy */}
        <div className="lg:col-span-8 bg-slate-950/90 border border-slate-800 rounded-2xl flex flex-col overflow-hidden">
          {/* File Header Bar */}
          <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-white">{selectedFile.path}</span>
                <span className="text-[10px] text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/40">
                  {selectedFile.language}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 font-sans">{selectedFile.description}</p>
            </div>

            <button
              id="copy-code-btn"
              onClick={copyCurrentFile}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors cursor-pointer shrink-0"
            >
              {copiedPath === selectedFile.path ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">{isArabicUI ? 'تم النسخ' : 'Copied'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>{isArabicUI ? 'نسخ الكود' : 'Copy Code'}</span>
                </>
              )}
            </button>
          </div>

          {/* Code Viewer Body */}
          <div className="flex-1 overflow-auto p-4 bg-[#0a0f1d] text-slate-200 font-mono text-xs leading-relaxed">
            <pre className="whitespace-pre">
              <code>
                {selectedFile.content.split('\n').map((line, index) => (
                  <div key={index} className="flex hover:bg-slate-900/40 py-0.5">
                    <span className="w-10 text-slate-600 select-none text-right pr-4 shrink-0 text-[11px]">
                      {index + 1}
                    </span>
                    <span className="flex-1 text-slate-300 font-mono">{line}</span>
                  </div>
                ))}
              </code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
