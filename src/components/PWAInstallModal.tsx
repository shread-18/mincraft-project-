import React, { useState, useEffect } from 'react';
import { Download, Smartphone, Monitor, CheckCircle, X, Sparkles, Zap, Shield, WifiOff, AlertTriangle, Copy, ExternalLink, HelpCircle } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'android' | 'desktop' | 'ios'>('android');
  const [copied, setCopied] = useState<boolean>(false);
  const [showTroubleshoot, setShowTroubleshoot] = useState<boolean>(true);

  useEffect(() => {
    // Check if running in standalone mode (already installed)
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone);

    // Detect device
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setActiveTab('ios');
    } else if (/android/.test(userAgent)) {
      setActiveTab('android');
    } else {
      setActiveTab('desktop');
    }

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
      try {
        await deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult.outcome === 'accepted') {
          setIsInstalled(true);
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.warn('Install prompt error:', err);
        setShowTroubleshoot(true);
      }
    } else {
      setShowTroubleshoot(true);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg my-8 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/98 to-slate-950 border border-emerald-500/40 p-5 sm:p-7 shadow-[0_0_60px_rgba(0,245,160,0.25)] overflow-hidden">
        {/* Glowing corner accents */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* App Logo & Header */}
        <div className="flex items-center gap-4 mb-5">
          <div className="relative w-16 h-16 rounded-2xl bg-slate-950 p-2 border border-emerald-500/50 shadow-[0_0_20px_rgba(0,245,160,0.3)] flex items-center justify-center overflow-hidden">
            <img
              src="/pwa-192x192.png"
              alt="FoodLens App Icon"
              className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(0,245,160,0.7)]"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/foodlens-icon.svg';
              }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-display font-extrabold text-white">FoodLens PWA</h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono font-bold">
                STANDALONE APP
              </span>
            </div>
            <p className="text-xs text-slate-400 font-tech mt-0.5">
              Official Progressive Web Application (v2.0)
            </p>
          </div>
        </div>

        {/* Status / Main Install Action */}
        {isInstalled ? (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex items-center gap-3 mb-5">
            <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-emerald-300">FoodLens is Installed!</p>
              <p className="text-xs text-emerald-400/80">Launch it directly from your device home screen or apps drawer.</p>
            </div>
          </div>
        ) : (
          <div className="mb-5 space-y-2">
            <button
              onClick={handleInstallClick}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-slate-950 font-display font-black text-base tracking-wide flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(0,245,160,0.5)] hover:shadow-[0_0_40px_rgba(0,245,160,0.8)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Download className="w-5 h-5 animate-bounce text-slate-950" />
              <span>{deferredPrompt ? 'INSTALL FOODLENS APP (1-CLICK)' : 'ADD FOODLENS TO HOME SCREEN'}</span>
            </button>
            <p className="text-center text-[11px] text-slate-400 font-tech">
              Zero storage overhead • Offline cache ready • Instant launch
            </p>
          </div>
        )}

        {/* Platform Selection Tabs */}
        <div className="mb-4">
          <div className="flex border-b border-slate-800 text-xs font-tech font-bold">
            <button
              onClick={() => setActiveTab('android')}
              className={`flex-1 py-2 text-center transition-all cursor-pointer border-b-2 ${
                activeTab === 'android'
                  ? 'border-emerald-400 text-emerald-300 bg-emerald-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              📱 Android Chrome
            </button>
            <button
              onClick={() => setActiveTab('desktop')}
              className={`flex-1 py-2 text-center transition-all cursor-pointer border-b-2 ${
                activeTab === 'desktop'
                  ? 'border-emerald-400 text-emerald-300 bg-emerald-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              💻 Desktop (PC/Mac)
            </button>
            <button
              onClick={() => setActiveTab('ios')}
              className={`flex-1 py-2 text-center transition-all cursor-pointer border-b-2 ${
                activeTab === 'ios'
                  ? 'border-emerald-400 text-emerald-300 bg-emerald-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              🍏 iOS Safari
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-4 rounded-b-2xl bg-slate-950/60 border border-t-0 border-slate-800 text-xs text-slate-300 space-y-2 font-tech">
            {activeTab === 'android' && (
              <div>
                <p className="font-bold text-white mb-1.5 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  How to install on Android Chrome:
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-300">
                  <li>In Google Chrome, tap the <strong className="text-white">three dots menu (⋮)</strong> at top-right.</li>
                  <li>Tap <strong className="text-emerald-400">"Add to Home screen"</strong> or <strong className="text-emerald-400">"Install app"</strong>.</li>
                  <li>Tap <strong className="text-white">Install</strong> when prompted. The FoodLens icon will appear on your phone home screen!</li>
                </ol>
              </div>
            )}

            {activeTab === 'desktop' && (
              <div>
                <p className="font-bold text-white mb-1.5 flex items-center gap-1.5">
                  <Monitor className="w-4 h-4 text-emerald-400" />
                  How to install on Chrome or Edge (Desktop):
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-300">
                  <li>Look at the right side of the address bar at the top of the browser.</li>
                  <li>Click the <strong className="text-emerald-400">(⊕) Install FoodLens</strong> icon.</li>
                  <li>Or click the browser menu (⋮) → <strong className="text-white">"Save and share"</strong> → <strong className="text-emerald-400">"Install FoodLens"</strong>.</li>
                </ol>
              </div>
            )}

            {activeTab === 'ios' && (
              <div>
                <p className="font-bold text-white mb-1.5 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-cyan-400" />
                  How to install on iPhone & iPad:
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-300">
                  <li>Open this URL in <strong className="text-white">Safari</strong> (not inside another app).</li>
                  <li>Tap the <strong className="text-white">Share button (square with arrow ↑)</strong> at the bottom.</li>
                  <li>Scroll down and tap <strong className="text-emerald-400">"Add to Home Screen"</strong>.</li>
                  <li>Tap <strong className="text-white">Add</strong> at top-right.</li>
                </ol>
              </div>
            )}
          </div>
        </div>

        {/* Troubleshooting: If seeing "Could not install" */}
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 mb-4 text-xs font-tech">
          <div className="flex items-center gap-2 text-amber-300 font-bold mb-1">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>If you see "Could not install":</span>
          </div>
          <ul className="space-y-1 text-slate-300 list-disc list-inside">
            <li><strong>Use standard Chrome or Safari:</strong> If opened from WhatsApp or Instagram, tap the 3 dots → <em>"Open in Chrome / Safari"</em>.</li>
            <li><strong>Bypass via 3 Dots Menu:</strong> Tap browser menu (⋮) → <em>"Add to Home screen"</em> directly.</li>
            <li><strong>Normal Tab:</strong> Incognito/Private tabs block installation; open in a regular tab.</li>
          </ul>
          <button
            onClick={handleCopyLink}
            className="mt-2.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 text-[11px] font-bold transition-all cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copied ? '✓ Link Copied to Clipboard!' : 'Copy Website URL for Chrome'}</span>
          </button>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 flex items-start gap-2">
            <WifiOff className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-white">Offline Shell</p>
              <p className="text-[10px] text-slate-400">Works without constant connection.</p>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 flex items-start gap-2">
            <Zap className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-white">Native Feel</p>
              <p className="text-[10px] text-slate-400">Zero browser bars & full screen.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs text-slate-400 font-tech">
          <span>PWA 2.0 • Service Worker Active</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

