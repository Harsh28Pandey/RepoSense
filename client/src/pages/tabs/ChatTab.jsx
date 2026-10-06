import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import {
  MessageSquare, Send, Sparkles, Plus, ArrowRight, RefreshCw,
  Search, ArrowDown, Paperclip, X, FileText, GitPullRequest, Activity,
  Pin, Copy, Trash2, Edit3, RotateCcw, File, CheckCircle2, AlertCircle, Square
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import Avatar from '../../components/ui/Avatar';
import Logo from '../../components/Logo';
import API from '../../api/client';
import toast from 'react-hot-toast';

// In-memory draft store per user & session
const draftStore = new Map();

const ALLOWED_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.webp', '.gif',
  '.pdf', '.txt', '.md', '.csv', '.json', '.yaml', '.yml', '.xml',
  '.html', '.css', '.js', '.jsx', '.ts', '.tsx', '.py', '.java',
  '.go', '.rs', '.c', '.cpp', '.rb', '.php', '.sh', '.sql', '.log'
]);

export default function ChatTab() {
  const { user, selectedRepo } = useStore();
  const userId = user?.id || user?._id || 'anon';
  const navigate = useNavigate();
  const { sessionId: urlSessionId } = useParams();

  const messageListRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(urlSessionId || null);
  const [sessionSearch, setSessionSearch] = useState('');

  const [preferredAi, setPreferredAi] = useState('auto');
  const [inputMsg, setInputMsg] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState([]);
  const [showJumpToBottom, setShowJumpToBottom] = useState(false);
  const [editingTitleId, setEditingTitleId] = useState(null);
  const [editTitleText, setEditTitleText] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const draftKey = `${userId}:${activeSessionId || 'new'}`;

  const fetchSessions = async () => {
    try {
      const res = await API.get('/chat/sessions');
      const list = res.data?.data || [];
      setSessions(list);
      if (list.length > 0 && !activeSessionId) {
        const firstId = list[0]._id || list[0].id;
        setActiveSessionId(firstId);
        navigate(`/app/chat/${firstId}`, { replace: true });
      }
    } catch (err) {
      setSessions([]);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (urlSessionId && urlSessionId !== activeSessionId) {
      // Save draft of previous session
      if (inputMsg.trim()) draftStore.set(draftKey, inputMsg);
      setActiveSessionId(urlSessionId);
    }
  }, [urlSessionId]);

  // Restore draft when active session changes
  useEffect(() => {
    const savedDraft = draftStore.get(draftKey) || '';
    setInputMsg(savedDraft);
    if (textareaRef.current) {
      textareaRef.current.style.height = '36px';
    }
  }, [activeSessionId]);

  useEffect(() => {
    if (!activeSessionId) {
      setMessages([]);
      return;
    }
    API.get(`/chat/sessions/${activeSessionId}/messages`)
      .then((res) => {
        setMessages(res.data?.data || []);
        setTimeout(scrollToBottom, 100);
      })
      .catch(() => setMessages([]));
  }, [activeSessionId]);

  const scrollToBottom = () => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
      setShowJumpToBottom(false);
    }
  };

  const handleScroll = () => {
    if (!messageListRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messageListRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    setShowJumpToBottom(distanceFromBottom > 80);
  };

  useEffect(() => {
    if (!showJumpToBottom) {
      scrollToBottom();
    }
  }, [messages]);

  // Single autosize handler (scrollHeight based, max 6 lines ~144px)
  const handleTextareaChange = (e) => {
    const val = e.target.value;
    setInputMsg(val);
    draftStore.set(draftKey, val);

    if (textareaRef.current) {
      textareaRef.current.style.height = '36px'; // collapse first to get true scrollHeight
      const newHeight = Math.min(textareaRef.current.scrollHeight, 144);
      textareaRef.current.style.height = `${Math.max(newHeight, 36)}px`;
    }
  };

  // Requirement M3: Enter key inserts newline, Ctrl/Cmd+Enter sends message
  const handleKeyDown = (e) => {
    if (e.isComposing || e.keyCode === 229) return; // Ignore IME composition

    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  // Requirement M4: File processing and upload
  const processAndUploadFiles = async (filesList) => {
    if (!filesList || filesList.length === 0) return;

    if (attachments.length + filesList.length > 5) {
      toast.error('Maximum 5 files allowed per message');
      return;
    }

    const formData = new FormData();
    const newChips = [];

    Array.from(filesList).forEach((file, idx) => {
      const ext = (file.name.substring(file.name.lastIndexOf('.')) || '').toLowerCase();
      if (!ALLOWED_EXTENSIONS.has(ext)) {
        toast.error(`File type "${ext}" is not supported`);
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`"${file.name}" exceeds 10MB limit`);
        return;
      }

      formData.append('files', file);
      newChips.push({
        id: `temp_${Date.now()}_${idx}_${file.size}`,
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        status: 'uploading'
      });
    });

    if (newChips.length === 0) return;

    setAttachments((prev) => [...prev, ...newChips]);
    setUploading(true);

    try {
      const res = await API.post('/chat/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const uploadedFiles = res.data?.data || [];
      setAttachments((prev) =>
        prev.map((att) => {
          const matched = uploadedFiles.find((u) => u.name === att.name);
          if (matched) {
            return { ...att, ...matched, status: 'uploaded' };
          }
          return att.status === 'uploading' ? { ...att, status: 'uploaded' } : att;
        })
      );
      toast.success('Files uploaded successfully');
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'File upload failed');
      setAttachments((prev) => prev.map((att) => (att.status === 'uploading' ? { ...att, status: 'failed' } : att)));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileSelect = (e) => {
    processAndUploadFiles(e.target.files);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processAndUploadFiles(e.dataTransfer.files);
    }
  };

  const handlePaste = (e) => {
    if (e.clipboardData.files && e.clipboardData.files.length > 0) {
      processAndUploadFiles(e.clipboardData.files);
    }
  };

  const handleSendMessage = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!inputMsg.trim() && attachments.length === 0) return;
    if (uploading) return;

    let currentSessionId = activeSessionId;
    if (!currentSessionId) {
      try {
        const createRes = await API.post('/chat/sessions', {
          title: 'New Chat Session',
          repoId: selectedRepo?.id || selectedRepo?._id
        });
        const newS = createRes.data?.data;
        if (newS) {
          currentSessionId = newS._id || newS.id;
          setSessions((prev) => [newS, ...prev]);
          setActiveSessionId(currentSessionId);
          navigate(`/app/chat/${currentSessionId}`, { replace: true });
        }
      } catch (err) {
        toast.error('Failed to create chat session');
        return;
      }
    }

    const userText = inputMsg;
    const sentAttachments = [...attachments];

    setInputMsg('');
    draftStore.delete(draftKey);
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = '36px';
    }

    const userMessageObj = {
      _id: 'msg_user_' + Date.now(),
      sender: 'user',
      content: userText,
      attachments: sentAttachments
    };

    setMessages((prev) => [...prev, userMessageObj]);
    setSending(true);

    try {
      const res = await API.post(`/chat/sessions/${currentSessionId}/messages`, {
        content: userText,
        repoId: selectedRepo?.id || selectedRepo?._id,
        preferredAi,
        attachmentIds: sentAttachments.map((a) => a.id)
      });

      const assistantMsg = res.data?.data;
      if (assistantMsg) {
        setMessages((prev) => [...prev, assistantMsg]);
      }
      fetchSessions();
    } catch (err) {
      toast.error('Failed to get AI response');
    } finally {
      setSending(false);
      setTimeout(scrollToBottom, 50);
    }
  };

  const handleCreateSession = async () => {
    try {
      const res = await API.post('/chat/sessions', {
        title: 'New Chat Session',
        repoId: selectedRepo?.id || selectedRepo?._id
      });
      const newS = res.data?.data;
      if (newS) {
        const id = newS._id || newS.id;
        setSessions((prev) => [newS, ...prev]);
        setActiveSessionId(id);
        setMessages([]);
        navigate(`/app/chat/${id}`);
      }
    } catch (err) {
      toast.error('Failed to create new session');
    }
  };

  const handleRenameSession = async (id, newTitle) => {
    if (!newTitle.trim()) return;
    try {
      await API.patch(`/chat/sessions/${id}`, { title: newTitle.trim() });
      setSessions((prev) => prev.map((s) => ((s._id || s.id) === id ? { ...s, title: newTitle.trim() } : s)));
      setEditingTitleId(null);
      toast.success('Session renamed');
    } catch (err) {
      toast.error('Failed to rename session');
    }
  };

  const handlePinSession = async (s) => {
    const id = s._id || s.id;
    try {
      await API.patch(`/chat/sessions/${id}`, { isPinned: !s.isPinned });
      fetchSessions();
      toast.success(s.isPinned ? 'Session unpinned' : 'Session pinned');
    } catch (err) {
      toast.error('Failed to pin session');
    }
  };

  const handleDuplicateSession = async (id) => {
    try {
      const res = await API.post(`/chat/sessions/${id}/duplicate`);
      const dup = res.data?.data;
      if (dup) {
        const newId = dup._id || dup.id;
        fetchSessions();
        setActiveSessionId(newId);
        navigate(`/app/chat/${newId}`);
        toast.success('Session duplicated');
      }
    } catch (err) {
      toast.error('Failed to duplicate session');
    }
  };

  const handleClearMessages = async (id) => {
    if (!window.confirm('Clear all messages in this conversation?')) return;
    try {
      await API.post(`/chat/sessions/${id}/clear`);
      setMessages([]);
      toast.success('Conversation cleared');
    } catch (err) {
      toast.error('Failed to clear conversation');
    }
  };

  const handleDeleteSession = async (id) => {
    setSessions((prev) => prev.filter((s) => (s._id || s.id) !== id));

    if (activeSessionId === id) {
      const remaining = sessions.filter((s) => (s._id || s.id) !== id);
      if (remaining.length > 0) {
        const nextId = remaining[0]._id || remaining[0].id;
        setActiveSessionId(nextId);
        navigate(`/app/chat/${nextId}`);
      } else {
        setActiveSessionId(null);
        navigate('/app/chat');
      }
    }

    toast((t) => (
      <div className="flex items-center gap-3">
        <span>Session deleted</span>
        <button
          onClick={async () => {
            toast.dismiss(t.id);
            fetchSessions();
          }}
          className="px-2 py-1 rounded-lg bg-[#2F6FDE] text-[#FAFBFC] text-xs font-bold cursor-pointer"
        >
          Undo
        </button>
      </div>
    ), { duration: 8000 });

    try {
      await API.delete(`/chat/sessions/${id}`);
    } catch (err) {
      fetchSessions();
    }
  };

  const filteredSessions = sessions.filter((s) =>
    (s.title || '').toLowerCase().includes(sessionSearch.toLowerCase())
  );

  const activeSession = sessions.find((s) => (s._id || s.id) === activeSessionId);
  const isSendDisabled = (!inputMsg.trim() && attachments.length === 0) || uploading;

  return (
    <div className="h-full w-full min-h-0 flex flex-col overflow-hidden text-[#1F2A37]">

      {/* Main Flex Row */}
      <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-4 overflow-hidden">
        
        {/* Left Sessions Sidebar */}
        <div className="w-full md:w-[260px] shrink-0 h-full min-h-0 flex flex-col p-4 rounded-2xl bg-[#F7F8FA] border border-[#D3D9E2] overflow-hidden space-y-3">
          {/* Pinned Top: New Chat & Search */}
          <div className="space-y-2 shrink-0">
            <button
              onClick={handleCreateSession}
              className="w-full py-2.5 rounded-2xl bg-[#2F6FDE] hover:bg-[#2459B8] text-[#F7F8FA] font-semibold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" /> New Chat Session
            </button>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#5B6778]" />
              <input
                type="text"
                value={sessionSearch}
                onChange={(e) => setSessionSearch(e.target.value)}
                placeholder="Search sessions..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#FAFBFC] border border-[#D3D9E2] text-xs text-[#1F2A37] focus:outline-none focus:border-[#2F6FDE]"
              />
            </div>
          </div>

          {/* Sessions List Scroll Area */}
          <div className="flex-1 min-h-0 overflow-y-auto space-y-1 pr-1">
            <span className="text-[10px] font-mono text-[#5B6778] uppercase tracking-wider block px-1 mb-1 font-bold">Saved Sessions</span>
            {filteredSessions.length === 0 ? (
              <p className="text-[11px] text-[#5B6778] px-2 py-2">No chat sessions found</p>
            ) : (
              filteredSessions.map((s) => {
                const id = s._id || s.id;
                const isActive = activeSessionId === id;
                return (
                  <div key={id} className="relative group">
                    {editingTitleId === id ? (
                      <input
                        type="text"
                        autoFocus
                        value={editTitleText}
                        onChange={(e) => setEditTitleText(e.target.value)}
                        onBlur={() => handleRenameSession(id, editTitleText)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRenameSession(id, editTitleText);
                          if (e.key === 'Escape') setEditingTitleId(null);
                        }}
                        className="w-full px-3 py-1.5 rounded-xl bg-[#FAFBFC] border border-[#2F6FDE] text-xs text-[#1F2A37] focus:outline-none"
                      />
                    ) : (
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          setActiveSessionId(id);
                          navigate(`/app/chat/${id}`);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            setActiveSessionId(id);
                            navigate(`/app/chat/${id}`);
                          }
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold truncate transition-colors cursor-pointer flex items-center justify-between ${
                          isActive
                            ? 'bg-[#EFF6FF] text-[#2F6FDE] border border-[#2F6FDE]/30'
                            : 'text-[#5B6778] hover:text-[#1F2A37] hover:bg-[#E8ECF1]'
                        }`}
                      >
                        <span className="truncate flex-1 flex items-center gap-1.5">
                          {s.isPinned && <Pin className="w-3 h-3 text-[#2F6FDE] shrink-0" />}
                          {s.title}
                        </span>

                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingTitleId(id);
                              setEditTitleText(s.title);
                            }}
                            className="p-1 text-[#5B6778] hover:text-[#1F2A37]"
                            title="Rename"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSession(id);
                            }}
                            className="p-1 text-[#5B6778] hover:text-[#C93C3C]"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Pinned Bottom: LLM Selector */}
          <div className="space-y-1.5 pt-3 border-t border-[#D3D9E2] text-xs shrink-0">
            <label className="text-[10px] text-[#5B6778] font-bold block uppercase tracking-wider">AI Model Provider</label>
            <select
              value={preferredAi}
              onChange={(e) => setPreferredAi(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl bg-[#FAFBFC] border border-[#D3D9E2] text-[#1F2A37] text-xs focus:outline-none"
            >
              <option value="auto">Auto (Smart Router)</option>
              <option value="groq">Groq (Fast Chat)</option>
              <option value="gemini">Gemini (Multimodal)</option>
              <option value="openai">OpenAI (Deep Reasoning)</option>
            </select>
          </div>
        </div>

        {/* Right Chat Main Area */}
        <div className="flex-1 min-h-0 h-full flex flex-col p-4 sm:p-5 rounded-2xl bg-[#F7F8FA] border border-[#D3D9E2] overflow-hidden relative shadow-xs">
          
          {/* Compact Header (Fixed Height) */}
          <div className="h-10 shrink-0 border-b border-[#D3D9E2] flex items-center justify-between pb-3">
            <div className="flex items-center gap-2 min-w-0">
              <MessageSquare className="w-4 h-4 text-[#2F6FDE] shrink-0" />
              <h2 className="font-bold text-xs text-[#1F2A37] truncate">
                {activeSession?.title || 'Ask RepoSense — AI Assistant'}
              </h2>
            </div>
            
            <div className="flex items-center gap-2 font-mono text-[10px]">
              {activeSessionId && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handlePinSession(activeSession)}
                    className="p-1 rounded-lg text-[#5B6778] hover:text-[#2F6FDE] hover:bg-[#E8ECF1]"
                    title="Pin Session"
                  >
                    <Pin className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDuplicateSession(activeSessionId)}
                    className="p-1 rounded-lg text-[#5B6778] hover:text-[#2F6FDE] hover:bg-[#E8ECF1]"
                    title="Duplicate Session"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleClearMessages(activeSessionId)}
                    className="p-1 rounded-lg text-[#5B6778] hover:text-[#D97706] hover:bg-[#FEF3C7]"
                    title="Clear Messages"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteSession(activeSessionId)}
                    className="p-1 rounded-lg text-[#5B6778] hover:text-[#C93C3C] hover:bg-[#FEF2F2]"
                    title="Delete Session"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <span className="px-2 py-0.5 rounded-xl bg-[#EFF6FF] text-[#2F6FDE] border border-[#2F6FDE]/20 font-bold uppercase">
                {preferredAi} Provider
              </span>
            </div>
          </div>

          {/* Message List Container (Internal Scroll Only!) */}
          <div
            ref={messageListRef}
            onScroll={handleScroll}
            style={{ overscrollBehavior: 'contain' }}
            className="flex-1 min-h-0 overflow-y-auto py-4 space-y-6 pr-2"
          >
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] border border-[#2F6FDE]/20 flex items-center justify-center text-[#2F6FDE] mx-auto">
                  <Logo variant="mark" size={24} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-[#1F2A37]">What would you like to solve in your codebase today?</h3>
                  <p className="text-xs text-[#5B6778] max-w-sm">
                    Select a suggested real action or ask any question about repository architecture.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg pt-2">
                  <button
                    onClick={() => navigate('/app/scan')}
                    className="p-3 rounded-2xl bg-[#FAFBFC] border border-[#D3D9E2] hover:border-[#2F6FDE] text-left space-y-1 transition-all cursor-pointer"
                  >
                    <Activity className="w-4 h-4 text-[#2F6FDE]" />
                    <p className="font-bold text-xs text-[#1F2A37]">Scan Repository</p>
                    <p className="text-[10px] text-[#5B6778]">Run deep health evaluation</p>
                  </button>

                  <button
                    onClick={() => navigate('/app/readme')}
                    className="p-3 rounded-2xl bg-[#FAFBFC] border border-[#D3D9E2] hover:border-[#2F6FDE] text-left space-y-1 transition-all cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-[#2F6FDE]" />
                    <p className="font-bold text-xs text-[#1F2A37]">Generate README</p>
                    <p className="text-[10px] text-[#5B6778]">Build markdown docs with AI</p>
                  </button>

                  <button
                    onClick={() => navigate('/app/review')}
                    className="p-3 rounded-2xl bg-[#FAFBFC] border border-[#D3D9E2] hover:border-[#2F6FDE] text-left space-y-1 transition-all cursor-pointer"
                  >
                    <GitPullRequest className="w-4 h-4 text-[#2F6FDE]" />
                    <p className="font-bold text-xs text-[#1F2A37]">Review Pull Request</p>
                    <p className="text-[10px] text-[#5B6778]">Line-by-line diff review</p>
                  </button>
                </div>
              </div>
            ) : (
              messages.map((m) => (
                <div
                  key={m._id}
                  className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.sender === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-[#2F6FDE] flex items-center justify-center shrink-0 text-[#FAFBFC] shadow-xs">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`max-w-2xl p-4 rounded-2xl space-y-3 text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-[#2F6FDE] text-[#FAFBFC] shadow-xs'
                      : 'bg-[#FAFBFC] border border-[#D3D9E2] text-[#1F2A37]'
                  }`}>
                    {/* Display message attachments if any */}
                    {m.attachments && m.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 pb-2 border-b border-current/20">
                        {m.attachments.map((att, i) => (
                          <a
                            key={i}
                            href={att.url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/10 text-[11px] hover:underline"
                          >
                            <File className="w-3.5 h-3.5" />
                            <span>{att.name}</span>
                          </a>
                        ))}
                      </div>
                    )}

                    {m.sender === 'assistant' && m.problemDescription && m.problemDescription !== 'Insight generated based on your query.' ? (
                      <div className="space-y-4">
                        <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#C93C3C]/20 text-[#C93C3C] space-y-1">
                          <span className="font-mono text-[10px] font-bold uppercase text-[#C93C3C]">Problem Detected</span>
                          <p>{m.problemDescription}</p>
                        </div>

                        <div className="p-3 rounded-xl bg-[#F0FDF4] border border-[#2E8B57]/20 text-[#1F2A37] space-y-1">
                          <span className="font-mono text-[10px] font-bold uppercase text-[#2E8B57]">Recommended Solution</span>
                          <p>{m.solutionText || m.content}</p>
                        </div>

                        {m.actionButton && (
                          <button
                            onClick={() => navigate(m.actionButton.tabTarget || '/app/readme')}
                            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-[#2F6FDE] hover:bg-[#2459B8] text-[#FAFBFC] font-semibold text-xs shadow-xs cursor-pointer"
                          >
                            {m.actionButton.label} <ArrowRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="prose max-w-none text-xs leading-relaxed overflow-x-auto">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                          {m.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>

                  {m.sender === 'user' && (
                    <Avatar user={user} size={32} />
                  )}
                </div>
              ))
            )}

            {sending && (
              <div className="flex items-center gap-2 text-xs text-[#2F6FDE] font-mono">
                <RefreshCw className="w-4 h-4 animate-spin" /> RepoSense AI is processing codebase context...
              </div>
            )}
          </div>

          {/* Floating Jump to Latest Button */}
          {showJumpToBottom && (
            <button
              onClick={scrollToBottom}
              className="absolute bottom-24 right-8 px-3 py-1.5 rounded-2xl bg-[#2F6FDE] text-[#FAFBFC] font-semibold text-xs shadow-md flex items-center gap-1.5 cursor-pointer z-10 hover:bg-[#2459B8] transition-colors"
            >
              Jump to latest <ArrowDown className="w-3.5 h-3.5" />
            </button>
          )}

          {/* COMPOSER (Requirement M2: Single clean container with focus-within ring, M3: Enter for newline, M4: Drag & Drop, Native Picker) */}
          <div className="shrink-0 pt-2">
            <input
              type="file"
              multiple
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="sr-only"
              accept=".png,.jpg,.jpeg,.webp,.gif,.pdf,.txt,.md,.csv,.json,.yaml,.yml,.xml,.html,.css,.js,.jsx,.ts,.tsx,.py,.java,.go,.rs,.c,.cpp,.rb,.php,.sh,.sql,.log"
            />

            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`rounded-2xl bg-[#FAFBFC] border transition-all p-3 space-y-2.5 ${
                isDragging
                  ? 'border-[#2F6FDE] bg-[#EFF6FF]'
                  : 'border-[#D3D9E2]'
              }`}
            >
              {/* Attachment Chips Container */}
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 pb-1.5 border-b border-[#D3D9E2]">
                  {attachments.map((att) => (
                    <span
                      key={att.id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#E8ECF1] border border-[#D3D9E2] text-[11px] text-[#1F2A37]"
                    >
                      <Paperclip className="w-3 h-3 text-[#2F6FDE]" />
                      <span className="truncate max-w-[140px]" title={att.name}>{att.name}</span>
                      {att.status === 'uploading' && <RefreshCw className="w-3 h-3 text-[#2F6FDE] animate-spin" />}
                      {att.status === 'uploaded' && <CheckCircle2 className="w-3 h-3 text-[#2E8B57]" />}
                      {att.status === 'failed' && <AlertCircle className="w-3 h-3 text-[#C93C3C]" />}
                      <button
                        type="button"
                        onClick={() => setAttachments(attachments.filter((a) => a.id !== att.id))}
                        className="text-[#5B6778] hover:text-[#C93C3C] cursor-pointer ml-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Textarea Row */}
              <div className="flex items-end gap-2">
                {/* Paperclip Native File Picker Trigger (type="button") */}
                <button
                  type="button"
                  title="Attach file from computer"
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  className="p-2 rounded-xl text-[#5B6778] hover:text-[#1F2A37] hover:bg-[#E8ECF1] cursor-pointer transition-colors shrink-0"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                {/* Clean borderless, ringless, shadowless textarea */}
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={inputMsg}
                  onChange={handleTextareaChange}
                  onKeyDown={handleKeyDown}
                  onPaste={handlePaste}
                  placeholder="Message RepoSense..."
                  className="flex-1 py-1 px-2 text-xs text-[#1F2A37] bg-transparent focus:outline-none focus:ring-0 focus:border-0 border-0 outline-none resize-none max-h-36 leading-relaxed overflow-y-auto"
                  style={{ minHeight: '36px', boxShadow: 'none' }}
                />

                {/* Send / Stop Streaming Button */}
                <button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={isSendDisabled}
                  className={`p-2.5 rounded-xl text-[#FAFBFC] transition-colors shrink-0 ${
                    sending
                      ? 'bg-[#C93C3C] hover:bg-[#B92C2C] cursor-pointer'
                      : isSendDisabled
                      ? 'bg-[#D3D9E2] text-[#5B6778] cursor-not-allowed'
                      : 'bg-[#2F6FDE] hover:bg-[#2459B8] cursor-pointer shadow-xs'
                  }`}
                  title={sending ? 'Stop Generation' : 'Send Message (Ctrl/Cmd+Enter)'}
                >
                  {sending ? <Square className="w-4 h-4 fill-current" /> : <Send className="w-4 h-4" />}
                </button>
              </div>

              {/* Keyboard Hint */}
              <div className="flex justify-end px-1 pt-0.5">
                <span className="text-[10px] text-[#5B6778] font-mono">
                  Enter for new line, Ctrl/Cmd+Enter to send
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
