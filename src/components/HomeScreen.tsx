import React, { useRef, useState } from 'react';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  ArrowRight,
  Flame,
  Search,
  Scan,
  Swords,
  Cpu,
  Eye,
  CheckCircle2,
  RefreshCw,
  HeartPulse,
  Layers,
  Activity,
  Download
} from 'lucide-react';
import { FoodItem } from '../types/food';
import { OFFICIAL_HACKATHON_DATASET } from '../data/foodDataset';
import { sounds } from '../utils/notifications';
import { StatusBadge } from './ui/StatusBadge';
import { GlowButton } from './ui/GlowButton';
import { FuturisticCard } from './ui/FuturisticCard';
import { SectionHeader } from './ui/SectionHeader';

interface HomeScreenProps {
  onScanProduct: () => void;
  onUploadImage: (file: File) => void;
  onSelectQuickProduct: (food: FoodItem) => void;
  onOpenKidsMode: () => void;
  onOpenPWAModal?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onScanProduct,
  onUploadImage,
  onSelectQuickProduct,
  onOpenKidsMode,
  onOpenPWAModal,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [heroProductIndex, setHeroProductIndex] = useState<number>(1); // Defaults to Fresh Malai Paneer (score 84)

  const heroItem = OFFICIAL_HACKATHON_DATASET[heroProductIndex] || OFFICIAL_HACKATHON_DATASET[1];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      sounds.playScanClick();
      onUploadImage(file);
    }
  };

  return (
    <div className="space-y-12 md:space-y-16 max-w-6xl mx-auto pb-16">
      {/* 1. HERO SECTION: INTERACTIVE SCANNER LAB */}
      <section className="relative pt-4 sm:pt-6">
        {/* Ambient background glows */}
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-20 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Vision Statement & Action CTAs */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="flex flex-wrap items-center gap-2.5">
              <StatusBadge status="online" label="AI FOOD INTELLIGENCE" sublabel="SYS.v2.6" />
              <span className="text-[11px] font-tech text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 rounded-full">
                VISION ENGINE READY
              </span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white font-display leading-[1.15]">
                See What's Really{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 text-glow-green">
                  Inside Your Food.
                </span>
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
                AI-powered food intelligence that turns packaging into clear, actionable nutrition insights, Nutri-Grades, and kid safety alerts.
              </p>
            </div>

            {/* Main Action CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <GlowButton
                size="lg"
                variant="primary"
                onClick={onScanProduct}
                icon={<Camera className="w-5 h-5 text-slate-950" />}
              >
                SCAN FOOD
              </GlowButton>

              <GlowButton
                size="lg"
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                icon={<Upload className="w-5 h-5 text-cyan-400" />}
              >
                UPLOAD PACKAGE
              </GlowButton>

              <button
                onClick={onOpenKidsMode}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-amber-300 font-fun font-bold text-xs sm:text-sm shadow-sm transition-all hover:scale-[1.02] cursor-pointer"
              >
                <Swords className="w-4 h-4 text-amber-400" />
                <span>Play Kids Tummy Bug Battle! 🐛⚡</span>
              </button>

              {onOpenPWAModal && (
                <button
                  onClick={onOpenPWAModal}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/15 to-cyan-500/15 hover:from-emerald-500/25 hover:to-cyan-500/25 border border-emerald-400/40 text-emerald-300 font-mono font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(0,245,160,0.15)] transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Download App 📲</span>
                </button>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          {/* Right Column: Holographic AR Food Scanner Simulation */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md">
              {/* Outer Holo Frame */}
              <FuturisticCard
                variant="emerald"
                cornerBrackets={true}
                className="overflow-hidden border border-emerald-500/30 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
              >
                {/* Subtle Scanline laser */}
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#00F5A0] animate-scan-line z-20 pointer-events-none" />

                {/* Header HUD */}
                <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3 mb-4 text-[10px] font-tech text-emerald-400">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>HUD TARGET LOCKED</span>
                  </div>
                  <span className="text-slate-400">DEMO ITEM #{heroProductIndex + 1}</span>
                </div>

                {/* Holographic Food Showcase Card */}
                <div className="relative py-2 flex flex-col items-center">
                  <div className="text-6xl mb-3 animate-float-slow filter drop-shadow-[0_10px_20px_rgba(0,245,160,0.3)]">
                    {heroItem.category.includes('Dairy') ? '🧀' : heroItem.category.includes('Protein') ? '🍫' : heroItem.category.includes('Noodles') ? '🍜' : '🍎'}
                  </div>

                  <h3 className="text-lg font-black text-white font-display tracking-tight text-center">
                    {heroItem.name}
                  </h3>
                  <p className="text-xs text-slate-400 font-tech">{heroItem.brand} · {heroItem.category}</p>

                  {/* Floating AR Data Chips */}
                  <div className="grid grid-cols-2 gap-2.5 w-full mt-4">
                    <div className="bg-slate-900/90 border border-emerald-500/30 rounded-xl p-2.5 flex items-center justify-between">
                      <span className="text-[10px] font-tech text-slate-400 uppercase">HEALTH SCORE</span>
                      <span className="text-sm font-black text-emerald-400 font-display">{heroItem.healthScore}/100</span>
                    </div>

                    <div className="bg-slate-900/90 border border-cyan-500/30 rounded-xl p-2.5 flex items-center justify-between">
                      <span className="text-[10px] font-tech text-slate-400 uppercase">NUTRI-GRADE</span>
                      <span className="text-sm font-black text-cyan-400 font-display">GRADE {heroItem.nutriGrade}</span>
                    </div>

                    <div className="bg-slate-900/90 border border-slate-700 rounded-xl p-2.5 flex items-center justify-between">
                      <span className="text-[10px] font-tech text-slate-400 uppercase">SUGAR</span>
                      <span className="text-xs font-bold text-slate-200 font-tech">{heroItem.sugar}g</span>
                    </div>

                    <div className="bg-slate-900/90 border border-slate-700 rounded-xl p-2.5 flex items-center justify-between">
                      <span className="text-[10px] font-tech text-slate-400 uppercase">PROTEIN</span>
                      <span className="text-xs font-bold text-emerald-300 font-tech">{heroItem.protein}g</span>
                    </div>
                  </div>

                  {/* Switch Demo Preview Controls */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 w-full flex items-center justify-between">
                    <button
                      onClick={() => setHeroProductIndex((prev) => (prev + 1) % 4)}
                      className="text-[11px] font-tech text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3 animate-spin-slow" />
                      <span>CYCLE DEMO TARGET</span>
                    </button>

                    <button
                      onClick={() => onSelectQuickProduct(heroItem)}
                      className="text-[11px] font-tech font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>INSPECT DATA</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </FuturisticCard>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HERO STATUS SYSTEM ROW */}
      <section className="border-y border-slate-800/80 bg-slate-950/40 backdrop-blur-md py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 px-4 border-r border-slate-800/60">
            <Cpu className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="text-[10px] font-tech uppercase text-slate-400">AI ENGINE</div>
              <div className="text-xs font-bold font-tech text-emerald-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ONLINE (GEMINI 2.5)
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 px-4 border-r border-slate-800/60">
            <Scan className="w-5 h-5 text-cyan-400 shrink-0" />
            <div>
              <div className="text-[10px] font-tech uppercase text-slate-400">VISION SCANNER</div>
              <div className="text-xs font-bold font-tech text-cyan-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                READY (AR HUD)
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 px-4 border-r border-slate-800/60">
            <Layers className="w-5 h-5 text-indigo-400 shrink-0" />
            <div>
              <div className="text-[10px] font-tech uppercase text-slate-400">OCR RECOGNITION</div>
              <div className="text-xs font-bold font-tech text-indigo-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                ACTIVE (TESSERACT v7)
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 px-4">
            <ShieldCheck className="w-5 h-5 text-teal-400 shrink-0" />
            <div>
              <div className="text-[10px] font-tech uppercase text-slate-400">CORE DATABASE</div>
              <div className="text-xs font-bold font-tech text-teal-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                12 LAB-VERIFIED ITEMS
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SCANNING OPTIONS MODULES */}
      <section className="space-y-6">
        <SectionHeader
          badge="INGESTION MODES"
          title="How Do You Want to Scan?"
          subtitle="Choose between real-time camera augmented reality or high-resolution gallery photo analysis."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Live AR Scanner */}
          <FuturisticCard
            variant="emerald"
            cornerBrackets={true}
            interactive={true}
            onClick={() => {
              sounds.playScanClick();
              onScanProduct();
            }}
            className="group flex flex-col justify-between p-8"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-[0_0_15px_rgba(0,245,160,0.2)] group-hover:scale-110 transition-transform">
                  <Camera className="w-7 h-7" />
                </div>
                <StatusBadge status="online" label="LIVE SENSOR" />
              </div>

              <h3 className="text-xl font-bold font-display text-white group-hover:text-emerald-400 transition-colors">
                Live AR Scanner
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                Activate device camera to lock onto any packaged food label or barcode. Renders real-time holographic AR nutrition overlay tags directly on screen.
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-tech font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
              <span>START LIVE SCAN →</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </FuturisticCard>

          {/* Card 2: AI Photo Analyzer */}
          <FuturisticCard
            variant="cyan"
            cornerBrackets={true}
            interactive={true}
            onClick={() => {
              sounds.playScanClick();
              fileInputRef.current?.click();
            }}
            className="group flex flex-col justify-between p-8"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-[0_0_15px_rgba(0,217,255,0.2)] group-hover:scale-110 transition-transform">
                  <Upload className="w-7 h-7" />
                </div>
                <StatusBadge status="ready" label="IMAGE PIPELINE" />
              </div>

              <h3 className="text-xl font-bold font-display text-white group-hover:text-cyan-400 transition-colors">
                AI Photo Analyzer
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                Upload front or back packaging photos from your device library. Deep multi-modal analysis extracts macro tables, allergens, and harmful additives.
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-tech font-bold text-cyan-400 group-hover:translate-x-1 transition-transform">
              <span>UPLOAD PACKAGE PHOTO →</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </FuturisticCard>
        </div>
      </section>

      {/* 4. QUICK PRODUCT EXPLORER */}
      <section className="space-y-6">
        <SectionHeader
          badge="BENCHMARK DATASET"
          title="Try FoodLens with a Sample"
          subtitle="Instant testing without physical packaging. Select any lab-benchmarked food item to inspect nutritional signals and kid safety."
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {OFFICIAL_HACKATHON_DATASET.slice(0, 6).map((item) => (
            <FuturisticCard
              key={item.id}
              variant={item.consumptionSignal === 'GOOD' ? 'emerald' : item.consumptionSignal === 'OK' ? 'amber' : 'neutral'}
              interactive={true}
              onClick={() => {
                sounds.playScanClick();
                onSelectQuickProduct(item);
              }}
              className="p-4 flex flex-col justify-between text-left group"
            >
              <div>
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                  {item.category.includes('Protein') ? '🍫' : item.category.includes('Dairy') ? '🧀' : item.category.includes('Noodles') ? '🍜' : item.category.includes('Chips') ? '🥨' : item.category.includes('Sweet') || item.name.includes('Kinder') ? '🥚' : '🍯'}
                </div>
                <h4 className="font-bold text-xs text-white truncate font-display group-hover:text-emerald-400 transition-colors">
                  {item.name}
                </h4>
                <span className="text-[10px] font-tech text-slate-400 block">{item.brand}</span>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-tech">
                <span className="text-slate-300 font-bold">{item.healthScore}/100</span>
                <span
                  className={`font-black uppercase px-1.5 py-0.5 rounded text-[9px] ${
                    item.consumptionSignal === 'GOOD'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : item.consumptionSignal === 'OK'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {item.consumptionSignal}
                </span>
              </div>
            </FuturisticCard>
          ))}
        </div>
      </section>

      {/* 5. HOW FOODLENS WORKS (AI PIPELINE) */}
      <section className="space-y-6">
        <SectionHeader
          badge="ARCHITECTURE"
          title="FoodLens AI Insight Engine"
          subtitle="How raw packaging visual data transforms into actionable family health intelligence."
        />

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {[
            { step: '01', title: 'SCAN', desc: 'Packet sensor detection & orientation', icon: <Camera className="w-4 h-4" /> },
            { step: '02', title: 'READ LABEL', desc: 'On-device neural OCR digitizes label text', icon: <Eye className="w-4 h-4" /> },
            { step: '03', title: 'ANALYZE', desc: 'Multimodal vision extracts macros & additives', icon: <Cpu className="w-4 h-4" /> },
            { step: '04', title: 'SCORE', desc: 'Non-linear Nutri-Grade algorithm penalty scoring', icon: <Activity className="w-4 h-4" /> },
            { step: '05', title: 'RECOMMEND', desc: 'Kid safety limits & healthier smart swaps', icon: <Sparkles className="w-4 h-4" /> },
          ].map((item, idx) => (
            <div
              key={item.step}
              className="relative p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-colors flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3 text-emerald-400">
                <span className="text-[10px] font-tech font-bold text-slate-500">{item.step}</span>
                {item.icon}
              </div>
              <div>
                <h4 className="font-tech font-bold text-xs text-white uppercase tracking-wider">
                  {item.title}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. FEATURES GRID */}
      <section className="space-y-6">
        <SectionHeader
          badge="CORE CAPABILITIES"
          title="Futuristic Health Intelligence Tools"
          subtitle="Everything families need to decode ingredients and safeguard kids' daily intake."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-emerald-500/30 transition-all">
            <Cpu className="w-6 h-6 text-emerald-400 mb-3" />
            <h4 className="font-display font-bold text-sm text-white">AI Vision Multimodal</h4>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Analyzes nutrient density, saturated fats, hidden sugars, and E-numbered chemicals with automated intelligence.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-cyan-500/30 transition-all">
            <Scan className="w-6 h-6 text-cyan-400 mb-3" />
            <h4 className="font-display font-bold text-sm text-white">Real-Time AR HUD</h4>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Live augmented reality overlay projects calorie chips, Nutri-Grade badges, and warning tags directly over camera frames.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-amber-500/30 transition-all">
            <Swords className="w-6 h-6 text-amber-400 mb-3" />
            <h4 className="font-display font-bold text-sm text-white">Kids Tummy Bug Battle</h4>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Gamified superhero battle teaches children how real nutrition powers up the body to defeat sugar bugs and grease slime.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-teal-500/30 transition-all">
            <HeartPulse className="w-6 h-6 text-teal-400 mb-3" />
            <h4 className="font-display font-bold text-sm text-white">Smart Nutrition Signals</h4>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Simplifies complex back-of-pack tables into clear GOOD, OK, and BAD consumption frequency recommendations.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-blue-500/30 transition-all">
            <Flame className="w-6 h-6 text-blue-400 mb-3" />
            <h4 className="font-display font-bold text-sm text-white">Daily Health Goals & Intake</h4>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Real-time daily tracking for calories, hydration reservoir, protein balance, and WHO-recommended child sugar caps.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-indigo-500/30 transition-all">
            <ShieldCheck className="w-6 h-6 text-indigo-400 mb-3" />
            <h4 className="font-display font-bold text-sm text-white">Zero-Knowledge E2EE Vault</h4>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              AES-256-GCM browser-side encryption ensures family dietary history and parental locks remain 100% private.
            </p>
          </div>
        </div>
      </section>

      {/* 7. FINAL CALL TO ACTION */}
      <section className="relative overflow-hidden rounded-3xl p-8 sm:p-10 border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 via-slate-950 to-cyan-950/40 text-center">
        <div className="corner-bracket-tl" />
        <div className="corner-bracket-tr" />
        <div className="corner-bracket-bl" />
        <div className="corner-bracket-br" />

        <div className="relative z-10 max-w-2xl mx-auto space-y-4">
          <StatusBadge status="ready" label="SENSOR READY FOR INGESTION" />
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            Ready to Inspect Your Next Food Pack?
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Open the scanner now or upload any food packaging label to get instant clarity on what you and your family are eating.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <GlowButton size="lg" variant="primary" onClick={onScanProduct} icon={<Camera className="w-5 h-5 text-slate-950" />}>
              START AR SCANNER
            </GlowButton>
            <GlowButton size="lg" variant="secondary" onClick={() => fileInputRef.current?.click()} icon={<Upload className="w-5 h-5 text-cyan-400" />}>
              CHOOSE PHOTO
            </GlowButton>
          </div>
        </div>
      </section>
    </div>
  );
};
