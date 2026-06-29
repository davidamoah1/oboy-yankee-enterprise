import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, X } from 'lucide-react';
import { toast } from 'sonner';

export function PWAUpdatePrompt() {
  const [showPrompt, setShowPrompt] = useState(false);

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(url) {
      console.log('[PWA] Service worker registered:', url);
    },
    onRegisterError(error) {
      console.error('[PWA] Service worker registration failed:', error);
    },
  });

  useEffect(() => {
    if (needRefresh) {
      setShowPrompt(true);
    }
  }, [needRefresh]);

  if (!showPrompt) return null;

  const handleUpdate = () => {
    updateServiceWorker(true);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    toast.info('Update available — refresh later to get the latest version.');
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-slate-900 px-4 py-3 shadow-2xl shadow-emerald-500/10">
        <RefreshCw className="h-5 w-5 text-emerald-500" />
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-white">Update Available</span>
          <span className="text-xs text-slate-400">A new version of the app is ready.</span>
        </div>
        <button
          onClick={handleUpdate}
          className="ml-2 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-600"
        >
          Update Now
        </button>
        <button
          onClick={handleDismiss}
          className="rounded-lg p-1 text-slate-400 transition hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
