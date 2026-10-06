import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, CheckCheck, Trash2, Info, CheckCircle2, AlertTriangle, AlertCircle, X
} from 'lucide-react';
import API from '../api/client';
import toast from 'react-hot-toast';

export default function NotificationPanel({ isOpen, onClose }) {
  const navigate = useNavigate();
  const panelRef = useRef(null);

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'unread'
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const [listRes, countRes] = await Promise.all([
        API.get('/notifications'),
        API.get('/notifications/unread-count')
      ]);
      setNotifications(listRes.data.notifications || []);
      setUnreadCount(countRes.data.unreadCount || 0);
    } catch (err) {
      // Ignore network errors silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // SSE Realtime Stream
    let eventSource = null;
    try {
      eventSource = new EventSource('/api/v1/notifications/stream', { withCredentials: true });
      eventSource.addEventListener('notification', (e) => {
        try {
          const newNotif = JSON.parse(e.data);
          setNotifications((prev) => [newNotif, ...prev]);
          setUnreadCount((count) => count + 1);
          toast(newNotif.title, { icon: '🔔' });
        } catch (err) {}
      });
    } catch (err) {}

    return () => {
      if (eventSource) eventSource.close();
    };
  }, []);

  // Sync browser document title when unread notifications exist
  useEffect(() => {
    if (unreadCount > 0) {
      document.title = `(${unreadCount}) RepoSense`;
    } else {
      document.title = 'RepoSense';
    }
  }, [unreadCount]);

  // Outside click & Esc handler
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleMarkAllRead = async () => {
    try {
      await API.post('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, readAt: new Date() })));
      setUnreadCount(0);
      toast.success('All marked as read');
    } catch (err) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Clear all notifications?')) return;
    try {
      await API.delete('/notifications');
      setNotifications([]);
      setUnreadCount(0);
      toast.success('Notifications cleared');
    } catch (err) {
      toast.error('Failed to clear notifications');
    }
  };

  const handleItemClick = async (notif) => {
    if (!notif.readAt) {
      try {
        await API.post(`/notifications/${notif._id}/read`);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, readAt: new Date() } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch (err) {}
    }

    if (notif.link) {
      onClose();
      navigate(notif.link);
    }
  };

  const handleDeleteItem = async (e, id) => {
    e.stopPropagation();
    try {
      await API.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      toast.success('Notification removed');
    } catch (err) {
      toast.error('Failed to remove notification');
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'unread') return !n.readAt;
    return true;
  });

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-[#2E8B57] shrink-0 mt-0.5" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-[#C93C3C] shrink-0 mt-0.5" />;
      default:
        return <Info className="w-4 h-4 text-[#2F6FDE] shrink-0 mt-0.5" />;
    }
  };

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Notifications Panel"
      className="absolute right-0 mt-2 w-[380px] max-h-[70vh] bg-[#FAFBFC] border border-[#D3D9E2] rounded-2xl shadow-xl z-50 flex flex-col overflow-hidden text-xs transition-all animate-in fade-in zoom-in-95"
    >
      {/* Panel Header */}
      <div className="p-4 border-b border-[#D3D9E2] flex items-center justify-between bg-[#F7F8FA]">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#2F6FDE]" />
          <span className="font-bold text-sm text-[#1F2A37]">Notifications</span>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-2xl bg-[#2F6FDE] text-[#FAFBFC] text-[10px] font-mono font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
        <button onClick={onClose} className="p-1 rounded-xl text-[#5B6778] hover:text-[#1F2A37] cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs & Bulk Actions */}
      <div className="px-4 py-2 border-b border-[#D3D9E2] flex items-center justify-between bg-[#EEF1F5]">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
              activeTab === 'all'
                ? 'bg-[#FAFBFC] text-[#2F6FDE] border border-[#D3D9E2]'
                : 'text-[#5B6778] hover:text-[#1F2A37]'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab('unread')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
              activeTab === 'unread'
                ? 'bg-[#FAFBFC] text-[#2F6FDE] border border-[#D3D9E2]'
                : 'text-[#5B6778] hover:text-[#1F2A37]'
            }`}
          >
            Unread
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllRead}
            title="Mark all as read"
            className="p-1.5 rounded-xl text-[#5B6778] hover:text-[#2F6FDE] hover:bg-[#E8ECF1] cursor-pointer transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
          </button>
          <button
            onClick={handleClearAll}
            title="Clear all notifications"
            className="p-1.5 rounded-xl text-[#5B6778] hover:text-[#C93C3C] hover:bg-[#FEF2F2] cursor-pointer transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* List Container */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {loading ? (
          <div className="p-6 text-center text-[#5B6778] animate-pulse">Loading notifications...</div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <Bell className="w-8 h-8 text-[#5B6778] mx-auto opacity-40" />
            <p className="font-semibold text-[#1F2A37] text-xs">You are all caught up</p>
            <p className="text-[11px] text-[#5B6778]">No new notifications at this time.</p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif._id}
              onClick={() => handleItemClick(notif)}
              className={`group p-3 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                !notif.readAt
                  ? 'bg-[#FAFBFC] border-[#2F6FDE]/40 shadow-xs'
                  : 'bg-[#E8ECF1]/50 border-[#D3D9E2] text-[#5B6778]'
              }`}
            >
              <div className="flex items-start gap-2.5 min-w-0 flex-1">
                {getSeverityIcon(notif.severity)}
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-[#1F2A37] text-xs truncate">{notif.title}</p>
                    {!notif.readAt && (
                      <span className="w-2 h-2 rounded-full bg-[#2F6FDE] shrink-0" />
                    )}
                  </div>
                  {notif.body && (
                    <p className="text-[11px] text-[#5B6778] line-clamp-2">{notif.body}</p>
                  )}
                  <p className="text-[10px] text-[#5B6778]/80 font-mono pt-1">
                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              <button
                onClick={(e) => handleDeleteItem(e, notif._id)}
                className="opacity-0 group-hover:opacity-100 p-1 rounded-xl text-[#5B6778] hover:text-[#C93C3C] hover:bg-[#FEF2F2] transition-all cursor-pointer"
                title="Delete notification"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
