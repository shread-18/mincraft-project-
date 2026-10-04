import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Maximize2, 
  ShieldAlert, 
  ArrowRight, 
  Info, 
  Volume2, 
  Zap,
  Sliders,
  ChevronRight,
  Flame,
  Droplets,
  Heart
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { recognize } from 'tesseract.js';
import { FoodItem, ParentalSettings } from '../types/food';
import { OFFICIAL_HACKATHON_DATASET } from '../data/foodDataset';
import { evaluateFoodNutrition } from '../services/nutritionAlgorithm';
import { recognizeFoodFromImage } from '../utils/imageRecognition';
import { sounds } from '../utils/notifications';
import { StatusBadge } from './ui/StatusBadge';
import { GlowButton } from './ui/GlowButton';
import { FuturisticCard } from './ui/FuturisticCard';

interface ARFoodScannerProps {
  onSelectFood: (food: FoodItem) => void;
  onFoodDetected?: (food: FoodItem) => void;
  parentalSettings: ParentalSettings;
  onOpenKidVisualizer: (food: FoodItem) => void;
}

interface OCRValue {
  value: number;
  unit: string;
}

function findOCRValue(text: string, labelPattern: RegExp, excludedPattern?: RegExp): OCRValue | undefined {
  for (const line of text.split(/\r?\n/)) {
    if (excludedPattern?.test(line)) continue;
    const labelMatch = labelPattern.exec(line);
    if (!labelMatch) continue;

    const remainder = line.slice(labelMatch.index + labelMatch[0].length).replace(/^\s*\([^)]*\)/, '');
    const valueMatch = remainder.match(/^\s*[:|=]?\s*(\d+(?:[.,]\d+)?)\s*(kcal|kj|g|mg)?\b/i);
    if (!valueMatch) continue;

    return {
      value: Number(valueMatch[1].replace(',', '.')),
      unit: (valueMatch[2] || '').toLowerCase(),
    };
  }

  return undefined;
}

function createFoodFromOCR(text: string): { food: FoodItem; missing: string[] } | null {
  const caloriesValue = findOCRValue(text, /\b(?:energy|calories?)\b/i);
  const sugarValue = findOCRValue(text, /\b(?:of\s+which\s+)?(?:total\s+)?sugars?\b/i);
  const fatValue = findOCRValue(text, /\b(?:total\s+fat|fat)\b/i, /saturated|trans/i);
  const saturatedFatValue = findOCRValue(text, /\b(?:saturated\s+fat|sat\.?\s*fat)\b/i);
  const proteinValue = findOCRValue(text, /\bprotein\b/i);
  const sodiumValue = findOCRValue(text, /\bsodium\b/i);

  if (!caloriesValue || !sugarValue || !fatValue || !proteinValue) return null;

  const calories = caloriesValue.unit === 'kj' ? caloriesValue.value / 4.184 : caloriesValue.value;
  const sodium = sodiumValue
    ? sodiumValue.value * (sodiumValue.unit === 'g' ? 1000 : 1)
    : undefined;
  const totalFats = fatValue.value;
  const sugar = sugarValue.value;
  const protein = proteinValue.value;
  const saturatedFat = saturatedFatValue?.value;
  const nutrition = evaluateFoodNutrition({ calories, sugar, totalFats, saturatedFat, protein, sodium });
  const missing = [
    !saturatedFatValue && 'saturated fat',
    !sodiumValue && 'sodium',
  ].filter((value): value is string => Boolean(value));
  const name = text
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .find((line) => line.length >= 3 && line.length <= 60 && /[a-z]/i.test(line) &&
      !/nutrition|ingredients|serving|calories|energy|protein|sugar|fat|sodium|per 100/i.test(line))
    || 'Scanned food label';
  const hazardLevel = missing.length && nutrition.kidHazardLevel === 'low'
    ? 'moderate'
    : nutrition.kidHazardLevel;

  return {
    food: {
      id: `OCR-${Date.now().toString(36)}`,
      name,
      brand: 'On-device label scan',
      category: 'Packaged Food',
      calories: Math.round(calories),
      sugar,
      totalFats,
      saturatedFat: saturatedFat ?? 0,
      protein,
      sodium: sodium ?? 0,
      allergens: [],
      recommendedAmount: 'Use the serving size printed on the package',
      recommendedTime: 'Any meal or snack',
      frequency: 'Check the complete label before regular use',
      positiveEffects: 'Nutrition values were read from the package label.',
      excessIntakeEffects: 'OCR results may be incomplete; verify the printed package.',
      healthScore: nutrition.finalScore,
      nutriGrade: nutrition.nutriGrade,
      consumptionSignal: missing.length && nutrition.signal === 'GOOD' ? 'OK' : nutrition.signal,
      kidSuitability: {
        isRecommendedForKids: missing.length === 0 && hazardLevel === 'low',
        minimumAge: 0,
        hazardLevel,
        kidWarningText: missing.length
          ? `OCR could not read ${missing.join(' and ')}. Verify the full package label before making a decision.`
          : 'OCR estimates can be imperfect. Verify the printed package label.',
        sugarSpoonsCount: Math.round((sugar / 4) * 10) / 10,
        visualHarmEffects: [],
      },
      healthierAlternatives: [],
      arFloatingTags: [
        { label: 'On-device OCR', type: 'neutral', x: 30, y: 35 },
        ...(missing.length ? [{ label: 'Partial label', type: 'warning' as const, x: 70, y: 45 }] : []),
      ],
    },
    missing,
  };
}

export const ARFoodScanner: React.FC<ARFoodScannerProps> = ({
  onSelectFood,
  onFoodDetected,
  parentalSettings,
  onOpenKidVisualizer,
}) => {
  const [selectedFood, setSelectedFood] = useState<FoodItem>(OFFICIAL_HACKATHON_DATASET[3]); // Maggi by default
  const [isScanning, setIsScanning] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isUsingOcr, setIsUsingOcr] = useState(false);
  const [showAROverlay, setShowAROverlay] = useState(true);
  const [activePortionGrams, setActivePortionGrams] = useState<number>(70);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Trigger celebration on healthy food scan
  const triggerCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#22c55e', '#10b981', '#34d399', '#f59e0b', '#38bdf8'],
    });
  };

  const handleSelectPreset = (food: FoodItem) => {
    // Parental check: if kid mode and blocking high sugar
    if (parentalSettings.kidModeActive && parentalSettings.blockHighSugarItems && food.sugar > parentalSettings.maxDailySugarGrams) {
      sounds.playAlertPing();
      alert(`Parental Lock Active: "${food.name}" contains ${food.sugar}g sugar, exceeding the ${parentalSettings.maxDailySugarGrams}g child limit set by parent.`);
      return;
    }

    sounds.playScanClick();
    setIsScanning(true);
    setTimeout(() => {
      setSelectedFood(food);
      setCustomImage(null);
      setIsScanning(false);
      if (food.consumptionSignal === 'GOOD') {
        sounds.playSuccessChime();
        triggerCelebration();
      } else {
        sounds.playAlertPing();
      }
    }, 600);
  };

  // Start real webcam stream
  const startCamera = async (facingMode = cameraFacingMode) => {
    try {
      setAnalysisError(null);
      setIsCameraReady(false);
      const dimensions = { width: { ideal: 1280 }, height: { ideal: 720 } };
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { ...dimensions, facingMode: { exact: facingMode } },
          audio: false,
        });
      } catch (cameraError) {
        const errorName = (cameraError as DOMException).name;
        if (!['OverconstrainedError', 'ConstraintNotSatisfiedError', 'NotFoundError'].includes(errorName)) {
          throw cameraError;
        }
        stream = await navigator.mediaDevices.getUserMedia({
          video: { ...dimensions, facingMode: { ideal: facingMode } },
          audio: false,
        });
      }

      const actualFacingMode = stream.getVideoTracks()[0]?.getSettings().facingMode;
      setCameraStream(stream);
      setCameraFacingMode(actualFacingMode === 'user' || actualFacingMode === 'environment' ? actualFacingMode : facingMode);
      setIsCameraActive(true);
      if (actualFacingMode && actualFacingMode !== facingMode) {
        setAnalysisError(`The ${facingMode === 'environment' ? 'back' : 'front'} camera is unavailable. Using the available ${actualFacingMode === 'user' ? 'front' : 'back'} camera.`);
      }
    } catch (err: any) {
      console.warn('Camera access unavailable:', err);
      setAnalysisError('Camera not accessible. Allow camera access, or upload a clear photo of the package label.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    setCameraStream(null);
    setIsCameraActive(false);
    setIsCameraReady(false);
  };

  const switchCamera = () => {
    const nextFacingMode = cameraFacingMode === 'environment' ? 'user' : 'environment';
    cameraStream?.getTracks().forEach((track) => track.stop());
    setCameraStream(null);
    setIsCameraReady(false);
    void startCamera(nextFacingMode);
  };

  // Capture frame from active camera
  const captureCameraFrame = () => {
    const video = videoRef.current;
    if (!video || !isCameraReady || video.videoWidth === 0) {
      setAnalysisError('Camera is still starting. Wait for the preview, then capture the label.');
      return;
    }
    sounds.playScanClick();
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCustomImage(dataUrl);
    stopCamera();
    analyzeWithGemini(dataUrl);
  };

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    sounds.playScanClick();
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setCustomImage(dataUrl);
      analyzeWithGemini(dataUrl, file.type || 'image/jpeg');
    };
    reader.readAsDataURL(file);
  };

  // Auto-start camera when scanner screen opens
  useEffect(() => {
    void startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  // Call Gemini 2.5 Flash API with Computer Vision & on-device text fallback
  const analyzeWithGemini = async (imageBase64: string, mimeType = 'image/jpeg') => {
    setAiAnalyzing(true);
    setAnalysisError(null);
    setIsScanning(true);

    // 1. Run real multimodal image recognition (Color Fingerprint + Geometry + Text OCR)
    const recognition = await recognizeFoodFromImage(imageBase64);

    try {
      const res = await fetch('/api/analyze-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          mimeType,
          queryText: recognition.extractedText 
            ? `Package label OCR: ${recognition.extractedText} (Candidate: ${recognition.matchedFood.name}, Color tone: ${recognition.colorName})`
            : `Packaging scan (Color tone: ${recognition.colorName}, Candidate: ${recognition.matchedFood.name})`,
          visualMatchId: recognition.matchedFood.id,
          confidence: recognition.confidence,
        }),
      });

      if (!res.ok) {
        throw new Error('AI analysis service error or key not set. Using smart algorithmic fallback.');
      }

      const json = await res.json();

      if (json.data && json.data.productName) {
        const item: FoodItem = {
          id: 'SCAN-' + Date.now().toString(36),
          name: json.data.productName,
          brand: json.data.brand || recognition.matchedFood.brand || 'Detected Pack',
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

        setSelectedFood(item);
        onFoodDetected?.(item);
        sounds.playSuccessChime();
        if (item.consumptionSignal === 'GOOD') {
          triggerCelebration();
        } else {
          sounds.playAlertPing();
        }
        setAnalysisError(`✓ Identified: ${recognition.summary}`);
        return;
      }

      // If backend returned without data, use local visual recognition result
      const item = recognition.matchedFood;
      setSelectedFood(item);
      onFoodDetected?.(item);
      sounds.playSuccessChime();
      if (item.consumptionSignal === 'GOOD') {
        triggerCelebration();
      } else {
        sounds.playAlertPing();
      }
      setAnalysisError(`✓ Identified: ${recognition.summary}`);
    } catch (err: any) {
      console.warn('Backend analysis fallback:', err);
      // Fallback to local image recognition result directly
      const item = recognition.matchedFood;
      setSelectedFood(item);
      onFoodDetected?.(item);
      sounds.playSuccessChime();
      if (item.consumptionSignal === 'GOOD') {
        triggerCelebration();
      } else {
        sounds.playAlertPing();
      }
      setAnalysisError(`✓ Identified: ${recognition.summary}`);
    } finally {
      setAiAnalyzing(false);
      setIsScanning(false);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!cameraStream || !video) return;

    video.srcObject = cameraStream;
    const markReady = () => setIsCameraReady(true);
    video.addEventListener('loadedmetadata', markReady);
    void video.play().then(markReady).catch((error) => {
      console.warn('Camera preview could not start:', error);
      setAnalysisError('Camera opened but the preview could not start. Try switching cameras or reload the page.');
    });

    return () => {
      video.removeEventListener('loadedmetadata', markReady);
      cameraStream.getTracks().forEach((track) => track.stop());
      video.srcObject = null;
    };
  }, [cameraStream]);

  const getSignalBadgeColor = (signal: string) => {
    switch (signal) {
      case 'GOOD':
        return 'bg-emerald-500 text-white border-emerald-400';
      case 'OK':
        return 'bg-amber-500 text-white border-amber-400';
      case 'BAD':
      default:
        return 'bg-rose-500 text-white border-rose-400';
    }
  };

  const getNutriGradeColor = (grade: string) => {
    switch (grade) {
      case 'A':
        return 'bg-emerald-600 text-white';
      case 'B':
        return 'bg-lime-500 text-white';
      case 'C':
        return 'bg-amber-400 text-slate-900';
      case 'D':
        return 'bg-orange-500 text-white';
      case 'E':
      default:
        return 'bg-rose-600 text-white';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* HUD Scanner Control Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-emerald-500/20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold font-display text-white">
                Live AR Food Package Scanner
              </h2>
              <StatusBadge status={isCameraActive ? 'online' : 'ready'} label={isCameraActive ? 'HUD SENSOR LIVE' : 'STANDBY'} />
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-tech">
              Real-time packaging detection, augmented telemetry tags & kid hazard alarms
            </p>
          </div>
        </div>

        {/* Viewfinder Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {!isCameraActive ? (
            <GlowButton
              size="sm"
              variant="primary"
              onClick={() => void startCamera()}
              icon={<Camera className="w-4 h-4 text-slate-950" />}
            >
              Open Camera Sensor
            </GlowButton>
          ) : (
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <GlowButton
                size="sm"
                variant="cyan"
                onClick={captureCameraFrame}
                disabled={!isCameraReady || aiAnalyzing}
                icon={<Camera className="w-4 h-4 text-slate-950" />}
              >
                {isCameraReady ? '📸 Capture & Analyze' : 'Starting sensor...'}
              </GlowButton>
              <button
                onClick={switchCamera}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-tech font-bold rounded-xl border border-slate-700 transition-colors cursor-pointer"
                title={`Switch to ${cameraFacingMode === 'environment' ? 'front' : 'back'} camera`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{cameraFacingMode === 'environment' ? 'Front' : 'Back'}</span>
              </button>
              <button
                onClick={stopCamera}
                className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-tech rounded-xl border border-slate-700 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          )}

          <GlowButton
            size="sm"
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
            icon={<Upload className="w-3.5 h-3.5 text-cyan-400" />}
          >
            Upload Photo
          </GlowButton>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
        </div>
      </div>

      {analysisError && (
        <div className="p-3 text-xs bg-amber-500/10 text-amber-300 rounded-xl border border-amber-500/30 flex items-center gap-2.5 font-tech">
          <Info className="w-4 h-4 shrink-0 text-amber-400" />
          <span>{analysisError}</span>
        </div>
      )}

      {/* Main AR Scanning Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* AR Viewport Frame */}
        <div className="lg:col-span-7 bg-slate-950 rounded-3xl overflow-hidden relative shadow-[0_0_35px_rgba(0,245,160,0.12)] border border-emerald-500/30 aspect-[4/3] sm:aspect-[16/10] flex items-center justify-center">
          {/* Cyber Targeting Corners */}
          <div className="corner-bracket-tl w-5 h-5 !border-t-2 !border-l-2 !border-emerald-400" />
          <div className="corner-bracket-tr w-5 h-5 !border-t-2 !border-r-2 !border-emerald-400" />
          <div className="corner-bracket-bl w-5 h-5 !border-b-2 !border-l-2 !border-emerald-400" />
          <div className="corner-bracket-br w-5 h-5 !border-b-2 !border-r-2 !border-emerald-400" />

          {/* Active Camera Video feed */}
          {isCameraActive ? (
            <div className="relative w-full h-full">
              <video
                ref={videoRef}
                playsInline
                autoPlay
                muted
                className="w-full h-full object-cover"
              />
              {/* Floating Camera Capture Shutter Bar */}
              <div className="absolute bottom-6 left-0 right-0 z-30 flex justify-center items-center gap-3 px-4">
                <button
                  type="button"
                  onClick={captureCameraFrame}
                  disabled={!isCameraReady || aiAnalyzing}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-slate-950 font-display font-black text-sm sm:text-base tracking-wide shadow-[0_0_35px_rgba(0,245,160,0.8)] hover:shadow-[0_0_50px_rgba(0,245,160,1)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Camera className="w-5 h-5 text-slate-950" />
                  <span>{isCameraReady ? '📸 SCAN PACKAGING NOW' : 'INITIALIZING SENSOR...'}</span>
                </button>
              </div>
            </div>
          ) : customImage ? (
            <div className="relative w-full h-full">
              <img
                src={customImage}
                alt="Scanned Food Packaging"
                className="w-full h-full object-contain bg-slate-950"
              />
              {/* Bottom Quick Action Overlay for Scanned Photo */}
              <div className="absolute bottom-5 left-0 right-0 z-30 flex flex-wrap justify-center items-center gap-3 px-4">
                <button
                  type="button"
                  onClick={() => {
                    setCustomImage(null);
                    void startCamera();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold tracking-wide shadow-xl backdrop-blur-md flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Scan Another Package</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSelectFood(selectedFood)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 text-xs font-mono font-black tracking-wide shadow-[0_0_25px_rgba(0,245,160,0.6)] flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
                >
                  <span>Open Full Scientific Report →</span>
                </button>
              </div>
            </div>
          ) : (
            /* Interactive Simulated Food Packaging */
            <div className="relative w-full h-full bg-slate-950 flex items-center justify-center p-6 select-none overflow-hidden">
              {/* Grid overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,245,160,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,245,160,0.04)_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none" />

              {/* Radial backdrop glow */}
              <div
                className={`absolute w-80 h-80 rounded-full blur-3xl opacity-25 ${
                  selectedFood.consumptionSignal === 'GOOD'
                    ? 'bg-emerald-500'
                    : selectedFood.consumptionSignal === 'OK'
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
              />

              {/* Graphic Mock of the Scanned Package */}
              <div className="relative z-10 w-72 h-84 bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-emerald-500/30 p-5 shadow-2xl flex flex-col justify-between text-white transition-all hover:scale-[1.02]">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase font-tech font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                      {selectedFood.category}
                    </span>
                    <h3 className="font-extrabold text-base mt-2 font-display text-white">
                      {selectedFood.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-tech">{selectedFood.brand}</p>
                  </div>
                  <span
                    className={`text-xs font-black px-2.5 py-1 rounded-md shadow-md ${getNutriGradeColor(
                      selectedFood.nutriGrade
                    )}`}
                  >
                    Grade {selectedFood.nutriGrade}
                  </span>
                </div>

                {/* Package Center Illustration */}
                <div className="my-auto text-center py-2">
                  <div className="inline-block p-4 rounded-2xl bg-slate-800/80 border border-emerald-500/20 shadow-[0_0_15px_rgba(0,245,160,0.15)] animate-float-slow">
                    <span className="text-5xl">
                      {selectedFood.category.includes('Chocolate')
                        ? '🍫'
                        : selectedFood.category.includes('Noodles')
                        ? '🍜'
                        : selectedFood.category.includes('Dairy')
                        ? '🧀'
                        : selectedFood.category.includes('Chips')
                        ? '🥨'
                        : selectedFood.category.includes('Fruit')
                        ? '🍏'
                        : selectedFood.category.includes('Honey')
                        ? '🍯'
                        : selectedFood.category.includes('Beverage')
                        ? '🥤'
                        : '📦'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-tech font-bold mt-2">
                    {selectedFood.calories} kcal · {selectedFood.sugar}g sugar
                  </p>
                  <button
                    type="button"
                    onClick={() => void startCamera()}
                    className="mt-3 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,245,160,0.5)] transition-all cursor-pointer mx-auto"
                  >
                    <Camera className="w-4 h-4" />
                    <span>START REAL CAMERA SCANNER</span>
                  </button>
                </div>

                {/* Barcode Mock */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between">
                  <div className="flex items-center space-x-0.5">
                    <div className="w-1 h-5 bg-white"></div>
                    <div className="w-0.5 h-5 bg-white"></div>
                    <div className="w-1.5 h-5 bg-white"></div>
                    <div className="w-0.5 h-5 bg-white"></div>
                    <div className="w-2 h-5 bg-white"></div>
                    <div className="w-1 h-5 bg-white"></div>
                  </div>
                  <span className="text-[10px] font-tech text-emerald-400">
                    {selectedFood.barcode || '8901058850048'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Central Target Reticle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 border border-emerald-500/30 rounded-2xl flex items-center justify-center pointer-events-none z-20">
            <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
            <div className="w-1.5 h-1.5 bg-emerald-300 rounded-full" />
            <div className="absolute -top-2 w-3 h-0.5 bg-emerald-400" />
            <div className="absolute -bottom-2 w-3 h-0.5 bg-emerald-400" />
            <div className="absolute -left-2 w-0.5 h-3 bg-emerald-400" />
            <div className="absolute -right-2 w-0.5 h-3 bg-emerald-400" />
          </div>

          {/* Laser Scanning Animation Line */}
          {(isScanning || aiAnalyzing) && (
            <div className="absolute left-2 right-2 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_20px_#00F5A0] animate-scan-line pointer-events-none z-30">
              <div className="absolute right-4 -top-6 text-[10px] font-tech text-emerald-300 bg-slate-950/90 px-2 py-0.5 rounded border border-emerald-500/40">
                {aiAnalyzing ? (isUsingOcr ? 'READING LABEL WITH OCR...' : 'ANALYZING MULTIMODAL VISION...') : 'EXTRACTING NUTRIENT PROFILE...'}
              </div>
            </div>
          )}

          {/* Floating AR Holographic Insight Overlays */}
          {showAROverlay && !isScanning && (
            <div className="absolute inset-0 pointer-events-auto p-4 sm:p-5 z-20 flex flex-col justify-between">
              {/* Top AR Status Bar */}
              <div className="flex items-center justify-between">
                <div
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-tech font-bold text-xs tracking-wider shadow-lg border backdrop-blur-md animate-float-slow ${getSignalBadgeColor(
                    selectedFood.consumptionSignal
                  )}`}
                >
                  <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                  SIGNAL: {selectedFood.consumptionSignal}
                </div>

                <div className="bg-slate-950/80 backdrop-blur-md border border-emerald-500/30 text-white px-3 py-1 rounded-full text-xs font-tech font-bold flex items-center gap-1.5 shadow-lg">
                  <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                  <span>Score: {selectedFood.healthScore}/100</span>
                </div>
              </div>

              {/* Dynamic AR Tags */}
              <div className="relative w-full h-full my-auto pointer-events-none">
                {selectedFood.arFloatingTags?.map((tag, idx) => (
                  <div
                    key={idx}
                    style={{ left: `${tag.x}%`, top: `${tag.y}%` }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 px-3 py-1 rounded-xl text-[11px] font-tech font-bold shadow-xl backdrop-blur-md pointer-events-auto cursor-default animate-float-slow transition-all border ${
                      tag.type === 'kid-alert'
                        ? 'bg-rose-950/90 text-rose-200 border-rose-500/80 shadow-[0_0_15px_rgba(255,77,109,0.3)]'
                        : tag.type === 'warning'
                        ? 'bg-amber-950/90 text-amber-200 border-amber-500/80 shadow-[0_0_15px_rgba(251,191,36,0.3)]'
                        : 'bg-emerald-950/90 text-emerald-200 border-emerald-500/80 shadow-[0_0_15px_rgba(0,245,160,0.3)]'
                    }`}
                  >
                    {tag.label}
                  </div>
                ))}
              </div>

              {/* Bottom AR Action Bar */}
              <div className="flex items-end justify-between gap-2">
                {!selectedFood.kidSuitability.isRecommendedForKids && (
                  <button
                    onClick={() => onOpenKidVisualizer(selectedFood)}
                    className="flex items-center gap-2 bg-rose-600/90 hover:bg-rose-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-lg backdrop-blur-md border border-rose-400 transition-all cursor-pointer group"
                  >
                    <ShieldAlert className="w-4 h-4 animate-bounce" />
                    <span>⚠️ Kid Warning: {selectedFood.kidSuitability.sugarSpoonsCount} Spoons Sugar!</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                )}

                <button
                  onClick={() => setShowAROverlay(!showAROverlay)}
                  className="ml-auto bg-slate-900/80 hover:bg-slate-800 text-slate-300 p-2 rounded-xl text-xs backdrop-blur-md border border-slate-700 transition-all cursor-pointer"
                  title="Toggle AR Overlays"
                >
                  <Sliders className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Real-time Nutritional Breakdown & Action Panel */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          <FuturisticCard variant="emerald" className="p-5 space-y-4">
            {/* Header info */}
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-tech font-bold text-emerald-400 uppercase tracking-widest">
                  {selectedFood.brand} · {selectedFood.category}
                </span>
                <h3 className="text-xl font-black text-white font-display mt-0.5">
                  {selectedFood.name}
                </h3>
              </div>
              <span
                className={`inline-block px-2.5 py-1 rounded-lg text-xs font-black shadow-md ${getNutriGradeColor(
                  selectedFood.nutriGrade
                )}`}
              >
                Nutri-Grade {selectedFood.nutriGrade}
              </span>
            </div>

            {/* Quick Macro Pills */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-tech block uppercase">Calories</span>
                <span className="text-sm font-black text-white font-display">
                  {selectedFood.calories}
                </span>
                <span className="text-[9px] text-slate-400 font-tech block">kcal</span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-tech block uppercase">Sugar</span>
                <span
                  className={`text-sm font-black font-display ${
                    selectedFood.sugar > 20 ? 'text-rose-400' : 'text-white'
                  }`}
                >
                  {selectedFood.sugar}g
                </span>
                <span className="text-[9px] text-slate-400 font-tech block">
                  ~{(selectedFood.sugar / 4).toFixed(1)} spoons
                </span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-tech block uppercase">Fats</span>
                <span className="text-sm font-black text-white font-display">
                  {selectedFood.totalFats}g
                </span>
                <span className="text-[9px] text-slate-400 font-tech block">total</span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-tech block uppercase">Protein</span>
                <span className="text-sm font-black text-emerald-400 font-display">
                  {selectedFood.protein}g
                </span>
                <span className="text-[9px] text-slate-400 font-tech block">builder</span>
              </div>
            </div>

            {/* Continuous Consumption Signal Alert Box */}
            <div
              className={`p-3.5 rounded-2xl border text-xs leading-relaxed ${
                selectedFood.consumptionSignal === 'GOOD'
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                  : selectedFood.consumptionSignal === 'OK'
                  ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                  : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
              }`}
            >
              <div className="flex items-center gap-2 font-bold mb-1 font-tech">
                {selectedFood.consumptionSignal === 'GOOD' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                )}
                <span>
                  CONTINUOUS SIGNAL:{' '}
                  <strong className="underline uppercase tracking-wide">
                    {selectedFood.consumptionSignal}
                  </strong>
                </span>
              </div>
              <p className="text-[11px] leading-relaxed">
                <strong>Recommended:</strong> {selectedFood.recommendedAmount} during{' '}
                {selectedFood.recommendedTime} ({selectedFood.frequency}).
              </p>
              <p className="mt-1 text-[11px] text-slate-300">
                <strong>Excess Warning:</strong> {selectedFood.excessIntakeEffects}.
              </p>
            </div>

            {/* Kid Specific Health Hazard Callout */}
            <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold font-fun text-slate-200 flex items-center gap-1.5">
                  🧒 Kid & Minor Suitability
                </span>
                <span
                  className={`text-[9px] font-tech font-bold uppercase px-2 py-0.5 rounded-full ${
                    selectedFood.kidSuitability.isRecommendedForKids
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {selectedFood.kidSuitability.isRecommendedForKids
                    ? 'Safe for Kids'
                    : 'Not Recommended'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {selectedFood.kidSuitability.kidWarningText}
              </p>

              <button
                onClick={() => onOpenKidVisualizer(selectedFood)}
                className="mt-3 w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 font-fun font-bold text-xs transition-all cursor-pointer"
              >
                <span>Explore Kids Negative Health Effect Visualizer</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Healthier Alternatives Preview */}
            {selectedFood.healthierAlternatives.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-tech font-bold text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    Recommended Healthier Alternatives
                  </span>
                  <span className="text-[10px] font-tech text-emerald-400">Smart Swaps</span>
                </div>

                {selectedFood.healthierAlternatives.slice(0, 2).map((alt, i) => (
                  <div
                    key={i}
                    className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-white">
                          {alt.name}
                        </span>
                        <span className="text-[9px] font-tech px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {alt.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {alt.benefitHighlight}
                      </p>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <span className="text-xs font-tech font-bold text-emerald-400 block">
                        {alt.calories} kcal
                      </span>
                      <span className="text-[10px] font-tech text-slate-400">{alt.sugar}g sugar</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* View Full Deep Nutritional Report Button */}
            <GlowButton
              size="md"
              variant="primary"
              onClick={() => onSelectFood(selectedFood)}
              className="w-full"
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
            >
              Inspect Full Ingredient & Scientific Report
            </GlowButton>
          </FuturisticCard>
        </div>
      </div>

      {/* Preset Test Packs Scroller */}
      <FuturisticCard variant="neutral" className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold font-display text-white flex items-center gap-2">
              <span>Instant Sample Packs to Test</span>
              <span className="text-[11px] font-tech font-normal text-slate-400">
                (Tap to simulate instant scan)
              </span>
            </h3>
          </div>
          <span className="text-xs font-tech font-bold text-emerald-400">
            {OFFICIAL_HACKATHON_DATASET.length} LAB SAMPLES
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {OFFICIAL_HACKATHON_DATASET.map((item) => {
            const isSelected = selectedFood.id === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectPreset(item)}
                className={`p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between group cursor-pointer ${
                  isSelected
                    ? 'border-emerald-400 bg-emerald-500/10 shadow-[0_0_15px_rgba(0,245,160,0.2)]'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-tech text-slate-400 font-bold">
                    {item.id}
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      item.consumptionSignal === 'GOOD'
                        ? 'bg-emerald-400 shadow-[0_0_6px_#00F5A0]'
                        : item.consumptionSignal === 'OK'
                        ? 'bg-amber-400 shadow-[0_0_6px_#FBBF24]'
                        : 'bg-rose-400 shadow-[0_0_6px_#FF4D6D]'
                    }`}
                  />
                </div>

                <div>
                  <h4 className="font-bold text-xs text-white group-hover:text-emerald-400 transition-colors line-clamp-1 font-display">
                    {item.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-tech">
                    {item.brand}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-tech">
                  <span className="font-bold text-slate-300">
                    {item.calories} kcal
                  </span>
                  <span
                    className={`font-black ${
                      item.sugar > 20 ? 'text-rose-400' : 'text-slate-400'
                    }`}
                  >
                    {item.sugar}g
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </FuturisticCard>
    </div>
  );
};
