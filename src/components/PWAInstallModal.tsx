import React, { useState, useEffect } from 'react';
import { Download, Smartphone, Monitor, CheckCircle, X, Sparkles, Zap, Shield, WifiOff } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);

  useEffect(() => {
    // Check if running in standalone mode (already installed)
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone);

    // Detect iOS devices
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isAppleDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border border-emerald-500/30 p-6 md:p-8 shadow-[0_0_50px_rgba(0,245,160,0.2)] overflow-hidden">
        {/* Futuristic glowing corner accents */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* App Logo & Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative w-16 h-16 rounded-2xl bg-slate-950 p-2 border border-emerald-500/40 shadow-inner flex items-center justify-center overflow-hidden">
            <img
              src="/pwa-192x192.png"
              alt="FoodLens App Icon"
              className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(0,245,160,0.6)]"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/foodlens-icon.svg';
              }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-heading font-extrabold text-white">FoodLens PWA</h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
                STANDALONE
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Official Progressive Web Application (v1.0)
            </p>
          </div>
        </div>

        {/* Status / Main Action */}
        {isInstalled ? (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 mb-6">
            <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-emerald-300">FoodLens is already installed!</p>
              <p className="text-xs text-emerald-400/80">You can launch it anytime directly from your Home Screen or Desktop apps menu.</p>
            </div>
          </div>
        ) : deferredPrompt ? (
          <div className="mb-6">
            <button
              onClick={handleInstallClick}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 text-slate-950 font-heading font-extrabold text-base tracking-wide flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(0,245,160,0.4)] hover:shadow-[0_0_40px_rgba(0,245,160,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Download className="w-5 h-5 animate-bounce" />
              <span>INSTALL FOODLENS APP</span>
            </button>
            <p className="text-center text-[11px] text-slate-400 font-mono mt-2">
              Instant 1-Click Install • No App Store Required • 2.5 MB
            </p>
          </div>
        ) : isIOS ? (
          <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 mb-6">
            <p className="text-xs font-bold text-cyan-300 mb-2 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-cyan-400" />
              Install on iOS (iPhone / iPad):
            </p>
            <ol className="text-xs text-slate-300 space-y-1.5 list-decimal list-inside font-sans">
              <li>Open this website in <strong className="text-white">Safari</strong>.</li>
              <li>Tap the <strong className="text-white">Share button</strong> (square with arrow pointing up) at the bottom.</li>
              <li>Scroll down and tap <strong className="text-emerald-400">Add to Home Screen</strong>.</li>
              <li>Tap <strong className="text-white">Add</strong> in the top-right corner!</li>
            </ol>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 mb-6">
            <p className="text-xs font-bold text-slate-200 mb-1 flex items-center gap-1.5">
              <Monitor className="w-4 h-4 text-emerald-400" />
              Install via Browser Menu:
            </p>
            <p className="text-xs text-slate-400">
              Click the <strong className="text-white">Install icon</strong> in your browser address bar (top right) or open your browser menu and choose <strong className="text-emerald-400">"Install FoodLens"</strong>.
            </p>
          </div>
        )}

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 flex items-start gap-2.5">
            <WifiOff className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-white">Offline Ready</p>
              <p className="text-[10px] text-slate-400">Scan barcodes and view datasets with zero internet.</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 flex items-start gap-2.5">
            <Zap className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-white">Full Screen Experience</p>
              <p className="text-[10px] text-slate-400">Runs as a dedicated native app without browser URL bars.</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-white">Zero Tracking</p>
              <p className="text-[10px] text-slate-400">Client-side encryption with minor privacy protections.</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-white">Ultra Lightweight</p>
              <p className="text-[10px] text-slate-400">Starts in under 1 second without occupying phone storage.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs text-slate-400">
          <span>PWA • iOS • Android • Desktop</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
