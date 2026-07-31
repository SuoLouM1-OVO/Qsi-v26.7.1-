import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MessageSquare, Send, Trash2, Check, Sparkles, User, Mail, FolderHeart, Radio, Lock, Unlock, KeyRound, ShieldAlert } from 'lucide-react';
import { Language, Project } from '../types';
import { GuestMessage, subscribeGuestMessages, postGuestMessage, deleteGuestMessage } from '../services/firebaseService';

interface GuestbookModalProps {
  isOpen: boolean;
  onClose: () => void;
  playClickSound: () => void;
  language?: Language;
  projects?: Project[];
  preselectedProjectId?: string;
}

export const GuestbookModal: React.FC<GuestbookModalProps> = ({
  isOpen,
  onClose,
  playClickSound,
  language = 'zh',
  projects = [],
  preselectedProjectId
}) => {
  const [messages, setMessages] = useState<GuestMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Password unlock & blur protection state
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  // Form State
  const [authorName, setAuthorName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedProjId, setSelectedProjId] = useState<string>(preselectedProjectId || '');
  const [content, setContent] = useState('');

  const handleUnlock = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (passwordInput.trim() === '269172') {
      playClickSound();
      setIsUnlocked(true);
      setPasswordError(false);
      setPasswordInput('');
    } else {
      playClickSound();
      setPasswordError(true);
    }
  };

  useEffect(() => {
    if (preselectedProjectId) {
      setSelectedProjId(preselectedProjectId);
    }
  }, [preselectedProjectId]);

  // Real-time Firestore subscription
  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    const unsubscribe = subscribeGuestMessages(
      (list) => {
        setMessages(list);
        setLoading(false);
      },
      (err) => {
        console.warn('Realtime messages sync fallback:', err);
        setLoading(false);
      }
    );

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [isOpen]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !authorName.trim()) {
      alert(language === 'zh' ? '请填写您的姓名与留言内容' : 'Please provide your name and message content');
      return;
    }

    playClickSound();
    setIsSubmitting(true);

    try {
      const selectedProjectObj = projects.find((p) => p.id === selectedProjId);
      await postGuestMessage({
        authorName: authorName.trim(),
        email: email.trim() || undefined,
        content: content.trim(),
        projectId: selectedProjId || undefined,
        projectTitle: selectedProjectObj ? selectedProjectObj.title : undefined
      });

      setContent('');
      showToast(language === 'zh' ? '留言发送成功！已云端实时同步' : 'Message posted & synced live!');
    } catch (err: any) {
      console.error('Failed to post message:', err);
      alert(language === 'zh' ? '留言失败，请检查网络设置' : 'Failed to post message');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(language === 'zh' ? '确定删除这条留言吗？' : 'Delete this message?')) {
      playClickSound();
      try {
        await deleteGuestMessage(id);
        showToast(language === 'zh' ? '已删除留言' : 'Message deleted');
      } catch (err) {
        console.error('Delete error:', err);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[140] flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-3xl max-h-[88vh] bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-black dark:text-white"
        >
          {/* Toast */}
          <AnimatePresence>
            {toastMessage && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-4 left-1/2 -translate-x-1/2 z-[160] px-4 py-2 bg-black text-white dark:bg-white dark:text-black text-xs font-mono rounded-full shadow-lg flex items-center gap-2 pointer-events-none"
              >
                <Check className="w-3.5 h-3.5 text-green-400 dark:text-green-600" />
                <span>{toastMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Modal Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-neutral-800 bg-gray-50/60 dark:bg-neutral-900/60">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-xl bg-black text-white dark:bg-white dark:text-black shadow-2xs">
                <MessageSquare className="w-4 h-4" />
              </span>
              <div>
                <h2 className="text-base sm:text-lg font-bold font-sans flex items-center gap-2">
                  <span>{language === 'zh' ? '云端在线留言板与改动建议' : 'Live Guestbook & Feedback'}</span>
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full font-medium">
                    <Radio className="w-3 h-3 animate-pulse" />
                    <span>{language === 'zh' ? 'Firebase 实时在线同步' : 'Firebase Cloud Live Sync'}</span>
                  </span>
                  <span className="text-xs font-mono text-gray-400">
                    ({messages.length} {language === 'zh' ? '条留言' : 'messages'})
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                playClickSound();
                onClose();
              }}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Section */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* Post Comment Input Box */}
            <form onSubmit={handleSubmit} className="p-4 sm:p-5 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50/80 dark:bg-neutral-800/40 space-y-3.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-gray-700 dark:text-neutral-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  {language === 'zh' ? '在线发布留言 / 提出网页修改建议' : 'Post Message / Suggest Edits'}
                </span>
                <span className="text-[10px] font-mono text-gray-400">
                  {language === 'zh' ? '所有人可见并实时更新' : 'Visible to all in real time'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Author Name */}
                <div className="relative">
                  <User className="w-3.5 h-3.5 absolute left-3 top-3 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder={language === 'zh' ? '您的称呼/姓名 *' : 'Your Name *'}
                    className="w-full pl-8 pr-3 py-2 text-xs bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-black dark:focus:border-white font-sans"
                  />
                </div>

                {/* Optional Email */}
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-3 top-3 text-gray-400 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={language === 'zh' ? '电子邮箱 (可选，仅作者可见)' : 'Email (Optional)'}
                    className="w-full pl-8 pr-3 py-2 text-xs bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-black dark:focus:border-white font-sans"
                  />
                </div>
              </div>

              {/* Related Project Selector */}
              {projects.length > 0 && (
                <div className="relative">
                  <FolderHeart className="w-3.5 h-3.5 absolute left-3 top-3 text-gray-400 pointer-events-none" />
                  <select
                    value={selectedProjId}
                    onChange={(e) => setSelectedProjId(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-black dark:focus:border-white font-sans"
                  >
                    <option value="">{language === 'zh' ? '关联特定作品 (可选)' : 'Link to specific project (Optional)'}</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} ({p.year})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Message Content Textarea */}
              <div>
                <textarea
                  required
                  rows={3}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={language === 'zh' ? '写下给齐思工作室的留言、建议或评价...' : 'Write your comment, feedback, or suggestion...'}
                  className="w-full p-3 text-xs bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-black dark:focus:border-white font-sans"
                />
              </div>

              <div className="flex items-center justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-opacity text-xs font-mono font-bold rounded-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? (language === 'zh' ? '发送中...' : 'Posting...') : (language === 'zh' ? '提交留言' : 'Post Message')}</span>
                </button>
              </div>
            </form>

            {/* Messages Stream (Password Protected & Blurred when locked) */}
            <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-neutral-800">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-mono font-bold text-gray-700 dark:text-neutral-300 uppercase tracking-wider">
                    {language === 'zh' ? '全部留言列表' : 'Messages Feed'}
                  </h3>
                  {!isUnlocked ? (
                    <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 rounded-md border border-amber-200 dark:border-amber-800">
                      <Lock className="w-3 h-3" />
                      <span>{language === 'zh' ? '已受密码保护' : 'LOCKED'}</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded-md border border-emerald-200 dark:border-emerald-800">
                      <Unlock className="w-3 h-3" />
                      <span>{language === 'zh' ? '已解锁' : 'UNLOCKED'}</span>
                    </span>
                  )}
                </div>

                {loading && (
                  <span className="text-[11px] font-mono text-gray-400 animate-pulse">
                    {language === 'zh' ? '云端加载中...' : 'Loading messages...'}
                  </span>
                )}
              </div>

              {/* PASSWORD AUTHENTICATION BAR / OVERLAY */}
              {!isUnlocked ? (
                <div className="p-4 bg-neutral-900 dark:bg-neutral-950 border border-neutral-800 text-white rounded-2xl space-y-3 shadow-lg">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-white">
                      <KeyRound className="w-4 h-4 text-gray-300 shrink-0" />
                      <h5 className="text-xs font-bold font-mono tracking-wider">
                        {language === 'zh' ? '管理者身份验证' : 'ADMIN AUTHENTICATION'}
                      </h5>
                    </div>
                    <span className="text-[10px] font-mono text-gray-400 bg-neutral-800 px-2 py-0.5 rounded-full">
                      {language === 'zh' ? '受密码保护' : 'PROTECTED'}
                    </span>
                  </div>

                  <p className="text-[11px] font-sans text-gray-400 leading-relaxed">
                    {language === 'zh'
                      ? '为保护留言数据安全，查看与管理留言记录需验证管理员密码。'
                      : 'Please enter the administrative passcode to view or manage stored messages.'}
                  </p>

                  <form onSubmit={handleUnlock} className="flex flex-col sm:flex-row items-stretch gap-2 pt-1">
                    <input
                      type="password"
                      autoComplete="current-password"
                      value={passwordInput}
                      onChange={(e) => {
                        setPasswordInput(e.target.value);
                        setPasswordError(false);
                      }}
                      placeholder={language === 'zh' ? '请输入密码解锁...' : 'Enter Passcode...'}
                      className="flex-1 px-3 py-2 bg-neutral-800 border border-neutral-700 focus:border-white rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none tracking-[0.25em] font-mono transition-colors"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-white text-black font-mono text-xs font-bold rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-1.5 shrink-0 active:scale-95 cursor-pointer"
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      <span>{language === 'zh' ? '解锁留言记录' : 'UNLOCK'}</span>
                    </button>
                  </form>

                  {passwordError && (
                    <p className="text-[11px] font-mono text-red-400 flex items-center gap-1.5 pt-0.5 animate-shake">
                      <ShieldAlert className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <span>{language === 'zh' ? '密码验证失败！请输入正确密码' : 'Incorrect passcode. Try again.'}</span>
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between p-2.5 bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-900 dark:text-emerald-200 font-bold">
                    <Unlock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{language === 'zh' ? '已通过密码验证 (可查看完整留言记录)' : 'UNLOCKED (FULL PERMISSIONS)'}</span>
                  </div>
                  <button
                    onClick={() => {
                      playClickSound();
                      setIsUnlocked(false);
                    }}
                    className="px-2.5 py-1 text-[10px] font-mono bg-white dark:bg-neutral-900 text-gray-700 dark:text-neutral-300 border border-gray-200 dark:border-neutral-800 rounded-lg hover:border-black dark:hover:border-white transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Lock className="w-3 h-3" />
                    <span>{language === 'zh' ? '重新锁定' : 'LOCK'}</span>
                  </button>
                </div>
              )}

              {/* MESSAGES LIST (BLURRED AND LOCKED UNLESS UNLOCKED) */}
              <div className={`transition-all duration-300 space-y-3 ${!isUnlocked ? 'filter blur-md select-none pointer-events-none opacity-40' : 'filter-none pointer-events-auto opacity-100'}`}>
                {messages.length === 0 && !loading ? (
                  <div className="py-12 text-center rounded-xl border border-dashed border-gray-200 dark:border-neutral-800 p-6">
                    <MessageSquare className="w-8 h-8 mx-auto text-gray-300 dark:text-neutral-700 mb-2" />
                    <p className="text-xs font-mono text-gray-500 dark:text-neutral-400">
                      {language === 'zh' ? '暂无留言，抢先发表第一条留言吧！' : 'No messages yet. Be the first to comment!'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className="p-4 rounded-xl border border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900/80 hover:border-gray-300 dark:hover:border-neutral-700 transition-all flex items-start justify-between gap-3 group shadow-2xs"
                      >
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-black dark:text-white font-sans">
                              {msg.authorName}
                            </span>
                            {msg.email && (
                              <span className="text-[10px] font-mono text-gray-400">
                                ({msg.email})
                              </span>
                            )}
                            {msg.projectTitle && (
                              <span className="text-[10px] font-mono bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300 px-2 py-0.5 rounded-full">
                                📌 {msg.projectTitle}
                              </span>
                            )}
                            <span className="text-[10px] font-mono text-gray-400 ml-auto">
                              {msg.createdAt?.toDate ? new Date(msg.createdAt.toDate()).toLocaleString('zh-CN', { hour12: false }) : (language === 'zh' ? '刚刚' : 'Just now')}
                            </span>
                          </div>

                          <p className="text-xs text-gray-700 dark:text-neutral-200 font-sans leading-relaxed whitespace-pre-wrap">
                            {msg.content}
                          </p>
                        </div>

                        {/* Delete button */}
                        {msg.id && (
                          <button
                            type="button"
                            onClick={() => handleDelete(msg.id!)}
                            className="p-1.5 text-gray-300 hover:text-red-500 dark:text-neutral-700 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors opacity-0 group-hover:opacity-100 shrink-0 cursor-pointer"
                            title={language === 'zh' ? '删除此留言' : 'Delete message'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
