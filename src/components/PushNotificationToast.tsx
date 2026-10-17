import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle2, Flame, ChefHat, Sparkles } from 'lucide-react';
import { InAppNotification } from '../types';

interface PushNotificationToastProps {
  notifications: InAppNotification[];
  onDismiss: (id: string) => void;
  isOpenList: boolean;
  onCloseList: () => void;
  onClearAll: () => void;
}

export const PushNotificationToast: React.FC<PushNotificationToastProps> = ({
  notifications,
  onDismiss,
  isOpenList,
  onCloseList,
  onClearAll,
}) => {
  // Grab latest unread notification for floating toast popup
  const latestUnread = notifications.find((n) => !n.read);
  const [visibleToast, setVisibleToast] = useState<InAppNotification | null>(null);

  useEffect(() => {
    if (latestUnread && latestUnread.id !== visibleToast?.id) {
      setVisibleToast(latestUnread);
      const timer = setTimeout(() => {
        setVisibleToast(null);
      }, 5500);
      return () => clearTimeout(timer);
    }
  }, [latestUnread]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'em_preparo':
        return <Flame className="w-4 h-4 text-amber-400" />;
      case 'pronto':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'cozinha_recebido':
        return <ChefHat className="w-4 h-4 text-sky-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <>
      {/* 1. Floating In-App Push Notification Toast */}
      {visibleToast && (
        <div className="fixed bottom-20 right-4 z-50 max-w-sm w-full animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="bg-slate-900 border border-amber-500/50 shadow-2xl rounded-2xl p-4 flex items-start gap-3 ring-1 ring-amber-500/30">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
              {getStatusIcon(visibleToast.status)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-white truncate">
                  {visibleToast.title}
                </span>
                <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                  {new Date(visibleToast.timestamp).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-snug">
                {visibleToast.message}
              </p>
            </div>

            <button
              onClick={() => {
                onDismiss(visibleToast.id);
                setVisibleToast(null);
              }}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 2. Notification History Drawer Modal */}
      {isOpenList && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Notificações em Tempo Real</h3>
              </div>
              <div className="flex items-center gap-2">
                {notifications.length > 0 && (
                  <button
                    onClick={onClearAll}
                    className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors"
                  >
                    Limpar
                  </button>
                )}
                <button
                  onClick={onCloseList}
                  className="p-1 text-slate-400 hover:text-white rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-2 overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  Nenhuma notificação recente.
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 rounded-xl border text-xs space-y-1 transition-colors ${
                      n.read
                        ? 'bg-slate-950/40 border-slate-800 text-slate-300'
                        : 'bg-amber-500/10 border-amber-500/30 text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold flex items-center gap-1.5">
                        {getStatusIcon(n.status)}
                        {n.title}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(n.timestamp).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-snug">{n.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
