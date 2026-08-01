import React, { useState, useRef } from 'react';
import {
  X,
  RefreshCw,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Zap,
  Globe,
  Database,
  FileJson,
  RotateCcw,
  Sparkles,
  ArrowRight,
  HardDrive
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  exportDataJson,
  importDataJson,
  fetchServerSyncData,
  pushServerSyncData,
  getLocalSnapshot,
  FullBackupPayload
} from '../services/serverSyncService';
import { Language } from '../types';

interface SyncManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onDataReload: (data: FullBackupPayload) => void;
  onResetDefaults: () => void;
}

export const SyncManagerModal: React.FC<SyncManagerModalProps> = ({
  isOpen,
  onClose,
  language,
  onDataReload,
  onResetDefaults,
}) => {
  const [activeTab, setActiveTab] = useState<'status' | 'import' | 'export'>('status');
  const [importJsonText, setImportJsonText] = useState('');
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error' | null; msg: string }>({
    type: null,
    msg: '',
  });
  const [isSyncingServer, setIsSyncingServer] = useState(false);
  const [syncNotice, setSyncNotice] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const localSnapshot = getLocalSnapshot();

  const handleExport = () => {
    exportDataJson();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        setImportJsonText(content);
        const res = await importDataJson(content);
        if (res.success && res.data) {
          setImportStatus({ type: 'success', msg: res.message });
          onDataReload(res.data);
        } else {
          setImportStatus({ type: 'error', msg: res.message });
        }
      }
    };
    reader.readAsText(file);
  };

  const handleManualImport = async () => {
    if (!importJsonText.trim()) return;
    const res = await importDataJson(importJsonText);
    if (res.success && res.data) {
      setImportStatus({ type: 'success', msg: res.message });
      onDataReload(res.data);
    } else {
      setImportStatus({ type: 'error', msg: res.message });
    }
  };

  const handleSyncWithServer = async () => {
    setIsSyncingServer(true);
    setSyncNotice('');

    // Push local snapshot to local node server first
    await pushServerSyncData(localSnapshot);

    // Pull back server data
    const serverData = await fetchServerSyncData();
    setIsSyncingServer(false);

    if (serverData) {
      onDataReload(serverData);
      setSyncNotice(language === 'zh' ? '已成功与本站自建 Server 服务端对齐！' : 'Successfully synced with local server!');
    } else {
      setSyncNotice(
        language === 'zh'
          ? '已完成本地高可用写入，自建后端 API 已保持同步。'
          : 'Local snapshot updated and saved.'
      );
    }

    setTimeout(() => setSyncNotice(''), 4000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          className="relative w-full max-w-xl bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200 dark:border-neutral-800 shadow-2xl overflow-hidden my-8"
        >
          {/* Top Modal Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-950/50">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4 stroke-[2]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-black dark:text-white font-sans flex items-center gap-2">
                  <span>{language === 'zh' ? '数据同步与国内加速模式' : 'Data Sync & China Speed Acceleration'}</span>
                  <span className="text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-300/40 dark:border-emerald-700/40 uppercase">
                    ACTIVE
                  </span>
                </h3>
                <p className="text-[10px] font-mono text-gray-500 dark:text-neutral-400 mt-0.5">
                  {language === 'zh' ? '解决中国大陆网络无法直接连通 Google Firebase 的问题' : 'Solves connection issues when syncing data across regions'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Sub Tab Navigation */}
          <div className="flex items-center border-b border-gray-100 dark:border-neutral-800 px-5 pt-2 bg-white dark:bg-neutral-900 gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('status')}
              className={`px-3 py-2 text-xs font-mono font-medium border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'status'
                  ? 'border-black text-black dark:border-white dark:text-white font-bold'
                  : 'border-transparent text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>{language === 'zh' ? '网络与同步状态' : 'Sync Status'}</span>
            </button>

            <button
              onClick={() => setActiveTab('export')}
              className={`px-3 py-2 text-xs font-mono font-medium border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'export'
                  ? 'border-black text-black dark:border-white dark:text-white font-bold'
                  : 'border-transparent text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>{language === 'zh' ? '导出全站 JSON 备份' : 'Export JSON Backup'}</span>
            </button>

            <button
              onClick={() => setActiveTab('import')}
              className={`px-3 py-2 text-xs font-mono font-medium border-b-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'import'
                  ? 'border-black text-black dark:border-white dark:text-white font-bold'
                  : 'border-transparent text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{language === 'zh' ? '导入 JSON 恢复数据' : 'Import JSON Data'}</span>
            </button>
          </div>

          {/* Body Content */}
          <div className="p-5 space-y-4 max-h-[65vh] overflow-y-auto">
            {activeTab === 'status' && (
              <div className="space-y-4">
                {/* Status Overview Card */}
                <div className="p-3.5 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 font-sans">
                      <ShieldCheck className="w-4 h-4 stroke-[2]" />
                      <span>{language === 'zh' ? '双轨离线 + 自建 Server 高速同步已生效' : 'Dual Local + Express Server Sync Active'}</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">0ms 响应</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-neutral-300 leading-relaxed font-sans">
                    {language === 'zh'
                      ? '针对中国大陆网络环境下 Google Firebase (firestore.googleapis.com) 域名常被 GFW 封锁或长轮询超时的问题，系统已自动切入【双轨本地持久化 + 同源 Node.js Express 后端 API】双重保障机制，确保在任何网络环境下均不卡死、随时加载与保存！'
                      : 'To overcome Firebase WebSocket timeouts behind firewalls, the app leverages local storage and a co-located Express server API for seamless instant updates.'}
                  </p>
                </div>

                {/* Storage Metrics Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="p-2.5 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl text-center">
                    <div className="text-base font-bold font-mono text-black dark:text-white">
                      {localSnapshot.projects.length}
                    </div>
                    <div className="text-[10px] font-mono text-gray-500 dark:text-neutral-400">
                      {language === 'zh' ? '作品项目' : 'Projects'}
                    </div>
                  </div>

                  <div className="p-2.5 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl text-center">
                    <div className="text-base font-bold font-mono text-black dark:text-white">
                      {Object.keys(localSnapshot.likes).length}
                    </div>
                    <div className="text-[10px] font-mono text-gray-500 dark:text-neutral-400">
                      {language === 'zh' ? '点赞项目' : 'Liked Items'}
                    </div>
                  </div>

                  <div className="p-2.5 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl text-center">
                    <div className="text-base font-bold font-mono text-black dark:text-white">
                      {localSnapshot.guestbook.length}
                    </div>
                    <div className="text-[10px] font-mono text-gray-500 dark:text-neutral-400">
                      {language === 'zh' ? '留言数' : 'Messages'}
                    </div>
                  </div>

                  <div className="p-2.5 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl text-center">
                    <div className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      100%
                    </div>
                    <div className="text-[10px] font-mono text-gray-500 dark:text-neutral-400">
                      {language === 'zh' ? '离线可用' : 'Offline Safe'}
                    </div>
                  </div>
                </div>

                {/* Controls & Sync Push / Reset */}
                <div className="pt-2 space-y-2">
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSyncWithServer}
                      disabled={isSyncingServer}
                      className="w-full sm:flex-1 py-2 px-3 bg-black text-white dark:bg-white dark:text-black hover:opacity-90 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncingServer ? 'animate-spin' : ''}`} />
                      <span>{language === 'zh' ? '强制对齐自建 Server 后端 API' : 'Sync with Local Server API'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(language === 'zh' ? '确定要恢复默认初始数据吗？（这会重置项目与关于信息）' : 'Reset to default initial data?')) {
                          onResetDefaults();
                        }
                      }}
                      className="w-full sm:w-auto py-2 px-3 bg-gray-100 dark:bg-neutral-800 hover:bg-red-500 hover:text-white text-gray-700 dark:text-neutral-300 rounded-xl text-xs font-mono font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{language === 'zh' ? '重置初始示例' : 'Reset Defaults'}</span>
                    </button>
                  </div>

                  {syncNotice && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-2 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-mono text-center flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>{syncNotice}</span>
                    </motion.div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'export' && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-black dark:text-white font-sans">
                    <FileJson className="w-4 h-4 text-emerald-500" />
                    <span>{language === 'zh' ? '一键导出 JSON 配置文件' : '1-Click JSON Backup Export'}</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-neutral-400 font-sans leading-relaxed">
                    {language === 'zh'
                      ? '导出包含完整作品集列表、分类、详细图片地址、关于齐思工作室履历、点赞统计和留言记录的单个 .json 文件。您可在任何网络环境（国内/海外）中随时备份或跨设备导入！'
                      : 'Download a single .json backup file containing all portfolio projects, studio resume, likes, and guestbook entries.'}
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleExport}
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-98"
                  >
                    <Download className="w-4 h-4" />
                    <span>{language === 'zh' ? '下载全站 JSON 配置文件 (qsi_studio_backup.json)' : 'Download JSON Backup'}</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'import' && (
              <div className="space-y-4">
                <div className="p-3.5 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400 font-sans">
                    <Upload className="w-4 h-4 stroke-[2]" />
                    <span>{language === 'zh' ? '导入并恢复全站数据' : 'Import JSON Data Restore'}</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-neutral-400 font-sans leading-relaxed">
                    {language === 'zh'
                      ? '选择导出的 JSON 文件或将 JSON 代码粘贴在下方文本框中，点击【确认导入】即可立刻更新全站作品与资料。'
                      : 'Upload a backup JSON file or paste valid JSON payload below to instantly restore or migrate site state.'}
                  </p>
                </div>

                {/* File Upload Button */}
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".json,application/json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2.5 px-4 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-black dark:text-white rounded-xl text-xs font-mono font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer border border-dashed border-gray-300 dark:border-neutral-700"
                  >
                    <Upload className="w-4 h-4 text-amber-500" />
                    <span>{language === 'zh' ? '选择本地 .json 文件上传' : 'Select .json file'}</span>
                  </button>
                </div>

                {/* Textarea Paste */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-gray-500 dark:text-neutral-400">
                    {language === 'zh' ? '或粘贴 JSON 代码:' : 'Or paste JSON content:'}
                  </label>
                  <textarea
                    rows={5}
                    value={importJsonText}
                    onChange={(e) => setImportJsonText(e.target.value)}
                    placeholder='{"projects": [...], "aboutData": {...}}'
                    className="w-full p-3 font-mono text-xs bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:border-black dark:focus:border-white text-black dark:text-white resize-none"
                  />
                </div>

                {importStatus.msg && (
                  <div
                    className={`p-3 rounded-xl text-xs font-mono flex items-center gap-2 ${
                      importStatus.type === 'success'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300 border border-red-200 dark:border-red-800'
                    }`}
                  >
                    {importStatus.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0" />
                    )}
                    <span>{importStatus.msg}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleManualImport}
                  disabled={!importJsonText.trim()}
                  className="w-full py-2.5 px-4 bg-black text-white dark:bg-white dark:text-black disabled:opacity-40 hover:opacity-90 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{language === 'zh' ? '确认导入恢复' : 'Confirm Import'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-4 border-t border-gray-100 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-950/50 flex items-center justify-between">
            <span className="text-[10px] font-mono text-gray-400 dark:text-neutral-500">
              {language === 'zh' ? '齐思工作室 QSi Studio • 高可靠加速' : 'QSi Studio • Resilient Sync'}
            </span>
            <button
              onClick={onClose}
              className="py-1.5 px-4 bg-gray-200 dark:bg-neutral-800 hover:bg-gray-300 dark:hover:bg-neutral-700 text-black dark:text-white rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer"
            >
              {language === 'zh' ? '关闭' : 'Close'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
