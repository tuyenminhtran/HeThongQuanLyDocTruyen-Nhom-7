import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  type NotificationItem,
} from "../api/notifications";

function formatRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Vừa xong";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
  return date.toLocaleDateString("vi-VN");
}

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => getNotifications(1, 15),
    refetchInterval: 20000, // Tự động làm mới mỗi 20s
  });

  const unreadCount = data?.unreadCount ?? 0;
  const notifications = data?.items ?? [];

  const markReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = (item: NotificationItem) => {
    if (!item.isRead) {
      markReadMutation.mutate(item.id);
    }
    setIsOpen(false);
    if (item.linkUrl) {
      navigate(item.linkUrl);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Nút Chuông */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-9 h-9 rounded-xl flex items-center justify-center text-ink-muted hover:text-white hover:bg-ink-card transition-all focus:outline-none"
        title="Thông báo"
        aria-label="Thông báo"
      >
        <i className="fa-regular fa-bell text-base" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown thông báo */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-ink-card border border-ink-border rounded-2xl shadow-2xl shadow-black/60 z-50 overflow-hidden flex flex-col max-h-[460px]">
          {/* Header */}
          <div className="p-3.5 border-b border-ink-border flex items-center justify-between bg-ink-card/95 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-sm text-white">Thông báo</span>
              {unreadCount > 0 && (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                  {unreadCount} mới
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllReadMutation.mutate()}
                disabled={markAllReadMutation.isPending}
                className="text-xs text-gold hover:text-gold-dim transition-colors flex items-center gap-1"
              >
                <i className="fa-solid fa-check-double text-[11px]" />
                Đọc tất cả
              </button>
            )}
          </div>

          {/* List items */}
          <div className="overflow-y-auto divide-y divide-ink-border/40 flex-1">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-ink-muted">
                <i className="fa-regular fa-bell-slash text-3xl mb-2 opacity-40 block" />
                <p className="text-xs">Chưa có thông báo nào</p>
              </div>
            ) : (
              notifications.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`w-full text-left p-3.5 hover:bg-ink-bg/60 transition-colors flex gap-3 items-start group ${
                    !item.isRead ? "bg-gold/5" : ""
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      !item.isRead ? "bg-gold ring-4 ring-gold/20" : "bg-transparent"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs text-white truncate ${!item.isRead ? "font-bold" : "font-medium"}`}>
                      {item.title}
                    </p>
                    <p className="text-xs text-ink-muted line-clamp-2 mt-0.5 leading-relaxed">
                      {item.message}
                    </p>
                    <span className="text-[10px] text-ink-muted/70 font-mono mt-1.5 block">
                      {formatRelativeTime(item.createdAt)}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
