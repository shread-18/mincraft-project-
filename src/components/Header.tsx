import React from 'react';
import { 
  Moon, 
  Sun, 
  Bell, 
  Sparkles, 
  Lock, 
  KeyRound,
  EyeOff,
  Camera,
  FileText,
  Swords,
  Target,
  Database,
  Download
} from 'lucide-react';
import { ParentalSettings } from '../types/food';

interface HeaderProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  parentalSettings: ParentalSettings;
  onOpenParentalModal: () => void;
  onOpenBackupModal: () => void;
  onOpenPWAModal?: () => void;
  onToggleKidMode: () => void;
  activeTab: 'home' | 'scanner' | 'analysis' | 'kids-battle' | 'goals' | 'catalog';
  onSelectTab: (tab: 'home' | 'scanner' | 'analysis' | 'kids-battle' | 'goals' | 'catalog') => void;
  onToggleNotifications: () => void;
  notificationsEnabled: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  isDarkMode,
  onToggleDarkMode,
  parentalSettings,
  onOpenParentalModal,
  onOpenBackupModal,
  onOpenPWAModal,
  onToggleKidMode,
  activeTab,
  onSelectTab,
  onToggleNotifications,
  notificationsEnabled,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#030712]/85 backdrop-blur-xl border-b border-emerald-500/20 shadow-[0_4px_30px_rgba(0,0,0,0.6)] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Brand Logo & Telemetry */}
          <div
            className="flex items-center gap-3.5 cursor-pointer group"
            onClick={() => onSelectTab('home')}
          >
            <div className="relative">
              {/* Outer glowing halo */}
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 opacity-40 blur-sm group-hover:opacity-80 transition duration-300"></div>
              <div className="relative w-10 h-10 rounded-2xl bg-slate-900 p-1 border border-emerald-400/40 shadow-inner flex items-center justify-center overflow-hidden">
                <img
                  src="/foodlens-logo.png"
                  alt="FoodLens"
                  className="w-full h-full object-contain filter drop-shadow-[0_0_6px_rgba(0,245,160,0.5)]"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/foodlens-icon.svg';
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-extrabold text-lg sm:text-xl tracking-tight text-white flex items-center">
                  Food<span className="text-emerald-400 text-glow-green">Lens</span>
                </span>
                
                {/* Live AI Status pill */}
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono font-bold text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  FOOD AI ONLINE
                </span>

                {parentalSettings.kidModeActive && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-black font-fun px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/50 shadow-[0_0_10px_rgba(251,191,36,0.3)]">
                    ⚡ Kid Mode
                  </span>
                )}
                {parentalSettings.privateIncognitoMode && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                    <EyeOff className="w-3 h-3 text-emerald-400" />
                    Private
                  </span>
                )}
              </div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 hidden sm:block">
                AI Food Intelligence Platform
              </p>
            </div>
          </div>

          {/* Futuristic Desktop Navigation Dock */}
          <nav className="hidden md:flex items-center p-1 rounded-2xl bg-slate-900/60 border border-white/5 backdrop-blur-md">
            <button
              onClick={() => onSelectTab('home')}
              className={`relative px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'home' || activeTab === 'scanner'
                  ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_15px_rgba(0,245,160,0.15)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Camera className="w-3.5 h-3.5 text-emerald-400" />
              <span>Scan / AR</span>
              {(activeTab === 'home' || activeTab === 'scanner') && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-emerald-400 rounded-full shadow-[0_0_8px_#00F5A0]" />
              )}
            </button>

            <button
              onClick={() => onSelectTab('catalog')}
              className={`relative px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'catalog'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,217,255,0.15)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span>Product Catalog</span>
              {activeTab === 'catalog' && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-cyan-400 rounded-full shadow-[0_0_8px_#00D9FF]" />
              )}
            </button>

            <button
              onClick={() => onSelectTab('analysis')}
              className={`relative px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'analysis'
                  ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_15px_rgba(0,245,160,0.15)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>Nutritional Data</span>
              {activeTab === 'analysis' && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-cyan-400 rounded-full shadow-[0_0_8px_#00D9FF]" />
              )}
            </button>

            <button
              onClick={() => onSelectTab('kids-battle')}
              className={`relative px-3 py-1.5 rounded-xl text-xs font-bold font-fun transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'kids-battle'
                  ? 'bg-gradient-to-r from-amber-500/25 to-rose-500/25 text-amber-300 border border-amber-500/50 shadow-[0_0_15px_rgba(251,191,36,0.25)]'
                  : 'text-amber-400/80 hover:text-amber-300 hover:bg-amber-500/10'
              }`}
            >
              <Swords className="w-3.5 h-3.5 text-amber-400" />
              <span>Kids Battle 🐛⚡</span>
              {activeTab === 'kids-battle' && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-amber-400 rounded-full shadow-[0_0_8px_#FBBF24]" />
              )}
            </button>

            <button
              onClick={() => onSelectTab('goals')}
              className={`relative px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'goals'
                  ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_15px_rgba(0,245,160,0.15)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Target className="w-3.5 h-3.5 text-emerald-400" />
              <span>Daily Goals</span>
              {activeTab === 'goals' && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-emerald-400 rounded-full shadow-[0_0_8px_#00F5A0]" />
              )}
            </button>
          </nav>

          {/* Quick Utility Tools */}
          <div className="flex items-center gap-2">
            {/* PWA Download / Install Button */}
            {onOpenPWAModal && (
              <button
                onClick={onOpenPWAModal}
                title="Download / Install FoodLens Native App"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 text-emerald-300 border border-emerald-500/40 hover:border-emerald-400 hover:text-white transition-all cursor-pointer shadow-[0_0_15px_rgba(0,245,160,0.15)] text-xs font-mono font-bold group"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400 group-hover:animate-bounce" />
                <span className="hidden sm:inline">Download App</span>
              </button>
            )}

            {/* Kid Mode Switch */}
            <button
              onClick={onToggleKidMode}
              title={parentalSettings.kidModeActive ? 'Exit Kid Mode' : 'Activate Kid Mode'}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                parentalSettings.kidModeActive
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black shadow-[0_0_15px_rgba(251,191,36,0.5)] border border-amber-300'
                  : 'bg-slate-900/80 text-slate-300 border border-slate-800 hover:border-amber-400/50 hover:text-amber-300'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline font-fun">Kid Mode</span>
            </button>

            {/* E2EE Cloud Vault */}
            <button
              onClick={onOpenBackupModal}
              title="End-to-End Encrypted Cloud Vault"
              className="p-2 rounded-xl bg-slate-900/80 text-slate-300 border border-slate-800 hover:border-indigo-500/50 hover:text-indigo-400 transition-all cursor-pointer shadow-sm"
            >
              <KeyRound className="w-4 h-4 text-indigo-400" />
            </button>

            {/* Hydration / Push Notifications Toggle */}
            <button
              onClick={onToggleNotifications}
              title={notificationsEnabled ? 'Hydration & Goal Alerts On' : 'Turn on Hydration Alerts'}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                notificationsEnabled
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-[0_0_12px_rgba(0,245,160,0.3)]'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Bell className="w-4 h-4" />
            </button>

            {/* Parental Control Lock */}
            <button
              onClick={onOpenParentalModal}
              title="Parental Control Dashboard"
              className="p-2 rounded-xl bg-slate-900/80 text-slate-300 border border-slate-800 hover:border-slate-600 hover:text-white transition-all cursor-pointer"
            >
              <Lock className="w-4 h-4 text-slate-400" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={onToggleDarkMode}
              title="Toggle Theme"
              className="p-2 rounded-xl bg-slate-900/80 text-slate-300 border border-slate-800 hover:border-slate-600 hover:text-white transition-all cursor-pointer"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-400" />}
            </button>
          </div>
        </div>

        {/* Mobile Bottom Navigation Bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-800/80 text-xs">
          <button
            onClick={() => onSelectTab('home')}
            className={`px-2 py-1 rounded-xl font-bold flex flex-col items-center gap-0.5 cursor-pointer ${
              activeTab === 'home' || activeTab === 'scanner' ? 'text-emerald-400' : 'text-slate-400'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span className="text-[9px]">Scan</span>
          </button>

          <button
            onClick={() => onSelectTab('catalog')}
            className={`px-2 py-1 rounded-xl font-bold flex flex-col items-center gap-0.5 cursor-pointer ${
              activeTab === 'catalog' ? 'text-cyan-400' : 'text-slate-400'
            }`}
          >
            <Database className="w-4 h-4" />
            <span className="text-[9px]">Catalog</span>
          </button>

          <button
            onClick={() => onSelectTab('analysis')}
            className={`px-2 py-1 rounded-xl font-bold flex flex-col items-center gap-0.5 cursor-pointer ${
              activeTab === 'analysis' ? 'text-emerald-400' : 'text-slate-400'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span className="text-[9px]">Data</span>
          </button>

          <button
            onClick={() => onSelectTab('kids-battle')}
            className={`px-2 py-1 rounded-xl font-bold font-fun flex flex-col items-center gap-0.5 cursor-pointer ${
              activeTab === 'kids-battle' ? 'text-amber-400' : 'text-slate-400'
            }`}
          >
            <Swords className="w-4 h-4" />
            <span className="text-[9px]">Battle</span>
          </button>

          <button
            onClick={() => onSelectTab('goals')}
            className={`px-2 py-1 rounded-xl font-bold flex flex-col items-center gap-0.5 cursor-pointer ${
              activeTab === 'goals' ? 'text-emerald-400' : 'text-slate-400'
            }`}
          >
            <Target className="w-4 h-4" />
            <span className="text-[9px]">Goals</span>
          </button>
        </div>
      </div>
    </header>
  );
};
