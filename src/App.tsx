/**
 * FoodLens — Ultra-Futuristic AI Food Intelligence Platform
 * Team Nexora · 2026 Production Build
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HomeScreen } from './components/HomeScreen';
import { ARFoodScanner } from './components/ARFoodScanner';
import { NutritionalDataView } from './components/NutritionalDataView';
import { KidsBugBattleAnimation } from './components/KidsBugBattleAnimation';
import { DailyGoalsIntake } from './components/DailyGoalsIntake';
import { DatasetExplorer } from './components/DatasetExplorer';
import { ParentalControlModal } from './components/ParentalControlModal';
import { EncryptedBackupModal } from './components/EncryptedBackupModal';
import { AlgorithmTransparencyModal } from './components/AlgorithmTransparencyModal';
import { PWAInstallModal } from './components/PWAInstallModal';
import { FoodItem, ScanHistoryItem, DailySummary, ParentalSettings } from './types/food';
import { OFFICIAL_HACKATHON_DATASET } from './data/foodDataset';
import { sounds, requestNotificationPermission, sendLocalNotification } from './utils/notifications';
import { recognizeFoodFromImage } from './utils/imageRecognition';
import { StatusBadge } from './components/ui/StatusBadge';
import { ShieldCheck, Cpu, KeyRound, Sparkles, Activity, Database, Download } from 'lucide-react';

const DEFAULT_PARENTAL_SETTINGS: ParentalSettings = {
  isPinLocked: false,
  pin: '1234',
  kidModeActive: true,
  maxDailySugarGrams: 24, // WHO guideline for children
  blockHighSugarItems: false,
  blockCaffeineItems: true,
  privateIncognitoMode: false,
  minorPrivacyConsent: true,
};

const DEFAULT_SUMMARY: DailySummary = {
  date: new Date().toISOString().split('T')[0],
  totalCalories: 384,
  totalSugar: 18,
  totalFats: 14,
  totalProtein: 16,
  totalCaffeine: 0,
  waterIntakeMl: 1250,
  targetWaterMl: 2000,
  goodCount: 2,
  okCount: 1,
  badCount: 1,
};

export default function App() {
  // Theme state (Futuristic Dark is the primary identity)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('foodlens_theme');
      if (saved) return saved === 'dark';
      return true; // Default to dark for ultra-futuristic look
    }
    return true;
  });

  // App Navigation: 'home' | 'scanner' | 'analysis' | 'kids-battle' | 'goals' | 'catalog'
  const [activeTab, setActiveTab] = useState<'home' | 'scanner' | 'analysis' | 'kids-battle' | 'goals' | 'catalog'>('home');

  // Currently Scanned / Active Food Item (defaults to Maggi 2-Min Noodles or Yoga Bar)
  const [activeFood, setActiveFood] = useState<FoodItem>(OFFICIAL_HACKATHON_DATASET[0]);

  // Parental controls
  const [parentalSettings, setParentalSettings] = useState<ParentalSettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('foodlens_parental');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return DEFAULT_PARENTAL_SETTINGS;
  });

  // Daily Summary metrics
  const [dailySummary, setDailySummary] = useState<DailySummary>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('foodlens_summary');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return DEFAULT_SUMMARY;
  });

  // Scan History
  const [history, setHistory] = useState<ScanHistoryItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('foodlens_history');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return [];
  });

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isParentalModalOpen, setIsParentalModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isTransparencyModalOpen, setIsTransparencyModalOpen] = useState(false);
  const [isPWAModalOpen, setIsPWAModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dark mode effect - ensure dark class is active for futuristic cyber background
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('foodlens_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('foodlens_theme', 'light');
    }
  }, [isDarkMode]);

  // Save settings
  useEffect(() => {
    localStorage.setItem('foodlens_parental', JSON.stringify(parentalSettings));
  }, [parentalSettings]);

  // Save summary
  useEffect(() => {
    localStorage.setItem('foodlens_summary', JSON.stringify(dailySummary));
  }, [dailySummary]);

  // Save history (unless private incognito mode)
  useEffect(() => {
    if (parentalSettings.privateIncognitoMode) {
      localStorage.removeItem('foodlens_history');
    } else {
      localStorage.setItem('foodlens_history', JSON.stringify(history));
    }
  }, [history, parentalSettings.privateIncognitoMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const handleToggleNotifications = async () => {
    if (!notificationsEnabled) {
      const granted = await requestNotificationPermission();
      if (granted) {
        setNotificationsEnabled(true);
        sounds.playSuccessChime();
        sendLocalNotification(
          '🔔 FoodLens AI Online',
          'Intelligent hydration signals and nutrient alerts active.'
        );
      } else {
        alert('Please allow notification permissions in your browser settings.');
      }
    } else {
      setNotificationsEnabled(false);
    }
  };

  const handleToggleKidMode = () => {
    sounds.playScanClick();
    setParentalSettings((prev) => ({
      ...prev,
      kidModeActive: !prev.kidModeActive,
    }));
  };

  // Option 1: Scan Product
  const handleOpenScanner = () => {
    sounds.playScanClick();
    setActiveTab('scanner');
  };

  // Option 2: Upload Image with Full Multimodal Vision Recognition
  const handleUploadImage = async (file: File) => {
    sounds.playScanClick();
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      try {
        // Run on-device computer vision (color signature + OCR label reading)
        const recognition = await recognizeFoodFromImage(base64, file.name);

        const queryHint = recognition.extractedText 
          ? `Package OCR: ${recognition.extractedText}`
          : file.name ? file.name.replace(/[-_.]/g, ' ') : '';

        const res = await fetch('/api/analyze-food', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64,
            mimeType: file.type || 'image/jpeg',
            queryText: `${queryHint} (Detected packaging: ${recognition.matchedFood.name}, Color tone: ${recognition.colorName})`,
            visualMatchId: recognition.matchedFood.id,
            confidence: recognition.confidence,
          }),
        });

        const json = await res.json();
        if (json.data && json.data.productName) {
          const parsedFood: FoodItem = {
            id: 'IMG-' + Date.now().toString(36),
            name: json.data.productName,
            brand: json.data.brand || recognition.matchedFood.brand || 'Scanned Pack',
            category: json.data.category || recognition.matchedFood.category || 'Packaged Food',
            calories: json.data.calories || recognition.matchedFood.calories,
            sugar: json.data.sugar !== undefined ? json.data.sugar : recognition.matchedFood.sugar,
            totalFats: json.data.totalFats !== undefined ? json.data.totalFats : recognition.matchedFood.totalFats,
            saturatedFat: json.data.saturatedFat !== undefined ? json.data.saturatedFat : recognition.matchedFood.saturatedFat,
            protein: json.data.protein !== undefined ? json.data.protein : recognition.matchedFood.protein,
            sodium: json.data.sodium !== undefined ? json.data.sodium : recognition.matchedFood.sodium,
            allergens: json.data.allergens || recognition.matchedFood.allergens,
            recommendedAmount: json.data.recommendedAmount || recognition.matchedFood.recommendedAmount,
            recommendedTime: json.data.recommendedTime || recognition.matchedFood.recommendedTime,
            frequency: json.data.recommendedFrequency || recognition.matchedFood.frequency,
            positiveEffects: json.data.positiveEffects || recognition.matchedFood.positiveEffects,
            excessIntakeEffects: json.data.excessIntakeEffects || recognition.matchedFood.excessIntakeEffects,
            healthScore: json.data.healthScore || recognition.matchedFood.healthScore,
            nutriGrade: json.data.nutriGrade || recognition.matchedFood.nutriGrade,
            consumptionSignal: json.data.consumptionSignal || recognition.matchedFood.consumptionSignal,
            kidSuitability: json.data.kidSuitability || recognition.matchedFood.kidSuitability,
            healthierAlternatives: json.data.healthierAlternatives || recognition.matchedFood.healthierAlternatives,
            arFloatingTags: json.data.arFloatingTags || recognition.matchedFood.arFloatingTags,
          };

          setActiveFood(parsedFood);
          setActiveTab('analysis');
          sounds.playSuccessChime();
          setToastMessage(`✓ Identified: ${recognition.summary}`);
          return;
        }

        // If backend returned no data, use local visual recognition result
        setActiveFood(recognition.matchedFood);
        setActiveTab('analysis');
        sounds.playSuccessChime();
        setToastMessage(`✓ Identified: ${recognition.summary}`);
      } catch (err) {
        console.warn('Image recognition fallback:', err);
        // On-device fallback
        const recognition = await recognizeFoodFromImage(base64, file.name);
        setActiveFood(recognition.matchedFood);
        setActiveTab('analysis');
        sounds.playAlertPing();
        setToastMessage(`✓ Identified: ${recognition.summary}`);
      }
    };
    reader.readAsDataURL(file);
  };

  // Quick Select from Front
  const handleSelectQuickProduct = (food: FoodItem) => {
    sounds.playScanClick();
    setActiveFood(food);
    setActiveTab('analysis');
  };

  // Log food to daily goals
  const handleLogFood = (food: FoodItem, grams: number) => {
    const ratio = grams / 100;
    const addedCalories = Math.round(food.calories * ratio);
    const addedSugar = Math.round(food.sugar * ratio * 10) / 10;
    const addedFats = Math.round(food.totalFats * ratio * 10) / 10;
    const addedProtein = Math.round(food.protein * ratio * 10) / 10;

    setDailySummary((prev) => ({
      ...prev,
      totalCalories: prev.totalCalories + addedCalories,
      totalSugar: Math.round((prev.totalSugar + addedSugar) * 10) / 10,
      totalFats: Math.round((prev.totalFats + addedFats) * 10) / 10,
      totalProtein: Math.round((prev.totalProtein + addedProtein) * 10) / 10,
      goodCount: prev.goodCount + (food.consumptionSignal === 'GOOD' ? 1 : 0),
      okCount: prev.okCount + (food.consumptionSignal === 'OK' ? 1 : 0),
      badCount: prev.badCount + (food.consumptionSignal === 'BAD' ? 1 : 0),
    }));

    sounds.playSuccessChime();
    setToastMessage(`✓ Logged ${food.name} (${addedCalories} kcal, ${addedSugar}g sugar) to Daily Goals!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Add custom intake
  const handleAddCustomIntake = (name: string, cal: number, sug: number, pro: number) => {
    setDailySummary((prev) => ({
      ...prev,
      totalCalories: prev.totalCalories + cal,
      totalSugar: Math.round((prev.totalSugar + sug) * 10) / 10,
      totalProtein: Math.round((prev.totalProtein + pro) * 10) / 10,
      goodCount: prev.goodCount + (sug < 10 ? 1 : 0),
      badCount: prev.badCount + (sug >= 25 ? 1 : 0),
    }));
  };

  // Refresh Goals & reset back to 0
  const handleResetGoals = () => {
    setDailySummary({
      date: new Date().toISOString().split('T')[0],
      totalCalories: 0,
      totalSugar: 0,
      totalFats: 0,
      totalProtein: 0,
      totalCaffeine: 0,
      waterIntakeMl: 0,
      targetWaterMl: 2000,
      goodCount: 0,
      okCount: 0,
      badCount: 0,
    });
    sounds.playSuccessChime();
  };

  const handleUpdateWater = (ml: number) => {
    setDailySummary((prev) => ({
      ...prev,
      waterIntakeMl: prev.waterIntakeMl + ml,
    }));
  };

  const handleSwapAlternative = (altName: string) => {
    const match = OFFICIAL_HACKATHON_DATASET.find((f) =>
      f.name.toLowerCase().includes(altName.toLowerCase())
    ) || OFFICIAL_HACKATHON_DATASET[11]; // fresh apple

    setActiveFood(match);
    handleLogFood(match, 100);
  };

  return (
    <div className="cyber-bg min-h-screen flex flex-col text-slate-100 transition-colors font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Top Application Header */}
      <Header
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        parentalSettings={parentalSettings}
        onOpenParentalModal={() => setIsParentalModalOpen(true)}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
        onOpenPWAModal={() => setIsPWAModalOpen(true)}
        onToggleKidMode={handleToggleKidMode}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onToggleNotifications={handleToggleNotifications}
        notificationsEnabled={notificationsEnabled}
      />

      {/* Floating Cyber Toast Notification */}
      {toastMessage && (
        <div className="sticky top-16 z-40 px-4 py-2 bg-slate-900/90 border-b border-emerald-500/40 backdrop-blur-md text-center text-xs font-mono text-emerald-300 flex items-center justify-center gap-3 shadow-[0_4px_20px_rgba(0,245,160,0.15)] animate-fadeIn">
          <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white font-bold ml-2 cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 1. FRONT OPENING SCREEN WITH THE 2 MAIN OPTIONS */}
        {activeTab === 'home' && (
          <HomeScreen
            onScanProduct={handleOpenScanner}
            onUploadImage={handleUploadImage}
            onSelectQuickProduct={handleSelectQuickProduct}
            onOpenKidsMode={() => setActiveTab('kids-battle')}
            onOpenPWAModal={() => setIsPWAModalOpen(true)}
          />
        )}

        {/* 2. PRODUCT CATALOG & DATASET EXPLORER */}
        {activeTab === 'catalog' && (
          <DatasetExplorer
            onSelectFood={(food) => {
              setActiveFood(food);
              setActiveTab('analysis');
            }}
            onOpenKidVisualizer={(food) => {
              setActiveFood(food);
              setActiveTab('kids-battle');
            }}
          />
        )}

        {/* 3. LIVE AR SCANNER */}
        {activeTab === 'scanner' && (
          <div className="space-y-4">
            <button
              onClick={() => setActiveTab('home')}
              className="text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors group"
            >
              <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
              <span>RETURN TO PLATFORM OVERVIEW</span>
            </button>
            <ARFoodScanner
              onSelectFood={(food) => {
                setActiveFood(food);
                setActiveTab('analysis');
              }}
              onFoodDetected={(food) => {
                setActiveFood(food);
              }}
              parentalSettings={parentalSettings}
              onOpenKidVisualizer={(food) => {
                setActiveFood(food);
                setActiveTab('kids-battle');
              }}
            />
          </div>
        )}

        {/* 4. NUTRITIONAL DATA VIEW (Opens after scan/upload/catalog inspection) */}
        {activeTab === 'analysis' && (
          <NutritionalDataView
            food={activeFood}
            onOpenKidsBugBattle={() => setActiveTab('kids-battle')}
            onLogToDailyGoals={handleLogFood}
            onRescan={() => setActiveTab('home')}
            onSwapAlternative={handleSwapAlternative}
          />
        )}

        {/* 5. KIDS MODE: ANIMATED BOY/GIRL BUG BATTLE */}
        {activeTab === 'kids-battle' && (
          <KidsBugBattleAnimation
            currentFood={activeFood}
            onSelectHealthyAlternative={handleSwapAlternative}
          />
        )}

        {/* 6. DAILY INTAKE & GOALS */}
        {activeTab === 'goals' && (
          <DailyGoalsIntake
            summary={dailySummary}
            onUpdateWater={handleUpdateWater}
            onResetGoals={handleResetGoals}
            onAddCustomIntake={handleAddCustomIntake}
            isKidMode={parentalSettings.kidModeActive}
          />
        )}
      </main>

      {/* Futuristic Cyber Footer */}
      <footer className="border-t border-cyan-500/20 bg-slate-950/80 backdrop-blur-md py-6 text-xs text-slate-400 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_12px_rgba(0,245,160,0.2)]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-extrabold text-white tracking-wider">
                  FoodLens
                </span>
                <span className="text-[10px] font-mono text-cyan-400">· Smart Food Pack Scanner & Health Guide</span>
              </div>
              <p className="text-[11px] font-mono text-slate-500">
                AI-powered food intelligence · Continuous Health Signals · Pediatric Safety
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono">
            <button
              onClick={() => setActiveTab('catalog')}
              className="flex items-center gap-1.5 text-slate-400 hover:text-cyan-400 transition-colors"
            >
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span>Data Product Catalog</span>
            </button>
            <span className="text-slate-700">|</span>
            <button
              onClick={() => setIsPWAModalOpen(true)}
              className="flex items-center gap-1.5 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Download PWA App</span>
            </button>
            <span className="text-slate-700">|</span>
            <button
              onClick={() => setIsTransparencyModalOpen(true)}
              className="flex items-center gap-1.5 text-slate-400 hover:text-emerald-400 transition-colors"
            >
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span>Algorithm Engine</span>
            </button>
            <span className="text-slate-700">|</span>
            <button
              onClick={() => setIsBackupModalOpen(true)}
              className="flex items-center gap-1.5 text-slate-400 hover:text-cyan-400 transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
              <span>Zero-Knowledge Vault</span>
            </button>
            <span className="text-slate-700">|</span>
            <button
              onClick={() => setIsParentalModalOpen(true)}
              className="flex items-center gap-1.5 text-slate-400 hover:text-amber-400 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>COPPA Controls</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Futuristic Modals */}
      <ParentalControlModal
        isOpen={isParentalModalOpen}
        onClose={() => setIsParentalModalOpen(false)}
        settings={parentalSettings}
        onUpdateSettings={setParentalSettings}
        onClearAllHistory={() => {
          setHistory([]);
          localStorage.removeItem('foodlens_history');
        }}
      />

      <EncryptedBackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        history={history}
        dailySummary={dailySummary}
        onRestoreData={(resHistory, resSummary) => {
          setHistory(resHistory);
          setDailySummary(resSummary);
        }}
      />

      <AlgorithmTransparencyModal
        isOpen={isTransparencyModalOpen}
        onClose={() => setIsTransparencyModalOpen(false)}
      />

      <PWAInstallModal
        isOpen={isPWAModalOpen}
        onClose={() => setIsPWAModalOpen(false)}
      />
    </div>
  );
}
