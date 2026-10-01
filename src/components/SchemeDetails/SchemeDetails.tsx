import {
  AlertCircle,
  Award,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  FileText,
  HelpCircle,
  MapPin,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import React, { useState } from 'react';
import { Scheme } from '../../data/schemes';
import { GuidanceStep, HighlightTargetId } from '../../services/schemes/validator';
import { ApplicationSubmissionGuide } from '../ApplicationGuide/ApplicationSubmissionGuide';

interface SchemeDetailsProps {
  scheme: Scheme;
  currentGuidanceStep?: GuidanceStep;
  activeHighlightTarget?: HighlightTargetId;
  onHighlightTargetClick: (targetId: HighlightTargetId) => void;
  onOpenOfficialUrl: (url: string) => void;
  onAskAiToExplain?: (prompt: string) => void;
}

const GUIDED_STEPS: { id: GuidanceStep; targetId: HighlightTargetId; label: string }[] = [
  { id: 'OVERVIEW', targetId: 'scheme-overview', label: '1. உதவி விளக்கம்' },
  { id: 'WHO_IS_IT_FOR', targetId: 'scheme-who-is-it-for', label: '2. யாருக்கு?' },
  { id: 'BENEFITS', targetId: 'scheme-benefits', label: '3. நன்மைகள்' },
  { id: 'ELIGIBILITY', targetId: 'scheme-eligibility', label: '4. தகுதிகள்' },
  { id: 'DOCUMENTS', targetId: 'scheme-documents', label: '5. ஆவணங்கள்' },
  { id: 'APPLICATION', targetId: 'scheme-application', label: '6. விண்ணப்பிப்பது எப்படி?' },
  { id: 'OFFICIAL_SOURCE', targetId: 'scheme-official-source', label: '7. அரசு தளம்' },
];

export const SchemeDetails: React.FC<SchemeDetailsProps> = ({
  scheme,
  currentGuidanceStep = 'OVERVIEW',
  activeHighlightTarget,
  onHighlightTargetClick,
  onOpenOfficialUrl,
  onAskAiToExplain,
}) => {
  const [showExitWarningModal, setShowExitWarningModal] = useState(false);

  const isTargetActive = (targetId: HighlightTargetId) => activeHighlightTarget === targetId;

  return (
    <div className="w-full space-y-6">
      {/* Guidance Step Progress Bar */}
      <div className="bg-white border border-stone-200 rounded-2xl p-3 shadow-xs">
        <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1 text-xs">
          {GUIDED_STEPS.map((step) => {
            const isCurrent =
              currentGuidanceStep === step.id || activeHighlightTarget === step.targetId;
            return (
              <button
                key={step.id}
                onClick={() => onHighlightTargetClick(step.targetId)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap cursor-pointer transition-all ${
                  isCurrent
                    ? 'bg-amber-600 text-white shadow-xs ring-2 ring-amber-300'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                {step.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Prominent Application Guide Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white p-5 rounded-2xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-2xl shadow-inner">
            ✍️
          </div>
          <div>
            <div className="font-extrabold text-base sm:text-lg">
              விண்ணப்பிக்க தயாரா? (Ready to Apply?)
            </div>
            <p className="text-amber-100 text-xs sm:text-sm">
              ஆவணங்களை சரிபார்த்து, விண்ணப்பத்தை சமர்ப்பிக்க AI வழிகாட்டுகிறது.
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            onHighlightTargetClick('scheme-application');
            onAskAiToExplain?.(
              `நான் ${scheme.name} திட்டத்திற்கு விண்ணப்பிக்க விரும்புகிறேன். படி 1 முதல் தேவையான ஆவணங்கள் மற்றும் சமர்ப்பிக்கும் வழியை எனக்கு எளிய தமிழில் வழிகாட்டுங்கள்.`
            );
          }}
          className="px-5 py-3 bg-white hover:bg-amber-50 text-amber-900 font-extrabold text-sm rounded-xl shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all self-stretch sm:self-auto"
        >
          <span>விண்ணப்பிக்க வழிகாட்டு (Guide Me to Apply)</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Scheme Title Header */}
      <div className="bg-gradient-to-r from-amber-700 to-orange-700 text-white rounded-2xl p-6 shadow-md">
        <div className="flex items-center gap-2 text-amber-200 text-xs font-semibold uppercase tracking-wider mb-2">
          <span>{scheme.sectorLabel}</span>
          <span>•</span>
          <span>சரிபார்க்கப்பட்ட அரசு திட்டம்</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight">{scheme.name}</h2>
        <p className="mt-2 text-amber-100 text-sm sm:text-base leading-relaxed">{scheme.summary}</p>
      </div>

      {/* Section 1: What is this help? */}
      <div
        id="scheme-overview"
        onClick={() => onHighlightTargetClick('scheme-overview')}
        className={`bg-white rounded-2xl p-5 sm:p-6 border-2 transition-all cursor-pointer ${
          isTargetActive('scheme-overview')
            ? 'border-amber-500 ring-4 ring-amber-300 bg-amber-50/40 shadow-md'
            : 'border-stone-200 hover:border-amber-300 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-base sm:text-lg">
            <HelpCircle className="w-5 h-5 text-amber-700" />
            <span>1. இது என்ன உதவி? (What is this help?)</span>
          </div>
          {isTargetActive('scheme-overview') && (
            <span className="px-2.5 py-0.5 bg-amber-600 text-white text-[11px] font-bold rounded-full animate-pulse flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>AI விளக்குகிறது</span>
            </span>
          )}
        </div>
        <p className="text-stone-800 text-sm sm:text-base leading-relaxed bg-stone-50 p-4 rounded-xl border border-stone-200">
          {scheme.simpleExplanation}
        </p>
      </div>

      {/* Section 2: Who is it for? */}
      <div
        id="scheme-who-is-it-for"
        onClick={() => onHighlightTargetClick('scheme-who-is-it-for')}
        className={`bg-white rounded-2xl p-5 sm:p-6 border-2 transition-all cursor-pointer ${
          isTargetActive('scheme-who-is-it-for')
            ? 'border-amber-500 ring-4 ring-amber-300 bg-amber-50/40 shadow-md'
            : 'border-stone-200 hover:border-amber-300 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-base sm:text-lg">
            <Users className="w-5 h-5 text-amber-700" />
            <span>2. யாருக்கு இந்த உதவி கிடைக்கும்? (Who is it for?)</span>
          </div>
          {isTargetActive('scheme-who-is-it-for') && (
            <span className="px-2.5 py-0.5 bg-amber-600 text-white text-[11px] font-bold rounded-full animate-pulse flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>AI விளக்குகிறது</span>
            </span>
          )}
        </div>
        <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-2">
          <p className="text-stone-800 text-sm sm:text-base leading-relaxed font-medium">
            {scheme.whyRelevant}
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {scheme.targetAudience.map((aud, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 bg-amber-100 text-amber-900 rounded-lg text-xs font-semibold"
              >
                {aud}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Section 3: What are the benefits? */}
      <div
        id="scheme-benefits"
        onClick={() => onHighlightTargetClick('scheme-benefits')}
        className={`bg-white rounded-2xl p-5 sm:p-6 border-2 transition-all cursor-pointer ${
          isTargetActive('scheme-benefits')
            ? 'border-amber-500 ring-4 ring-amber-300 bg-amber-50/40 shadow-md'
            : 'border-stone-200 hover:border-amber-300 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-base sm:text-lg">
            <Award className="w-5 h-5 text-amber-700" />
            <span>3. என்ன நன்மைகள் கிடைக்கும்? (What are the benefits?)</span>
          </div>
          {isTargetActive('scheme-benefits') && (
            <span className="px-2.5 py-0.5 bg-amber-600 text-white text-[11px] font-bold rounded-full animate-pulse flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>AI விளக்குகிறது</span>
            </span>
          )}
        </div>
        <ul className="space-y-2">
          {scheme.benefits.map((benefit, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-800 leading-snug bg-amber-50/40 p-3 rounded-xl border border-amber-200"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Section 4: Eligibility criteria */}
      <div
        id="scheme-eligibility"
        onClick={() => onHighlightTargetClick('scheme-eligibility')}
        className={`bg-white rounded-2xl p-5 sm:p-6 border-2 transition-all cursor-pointer ${
          isTargetActive('scheme-eligibility')
            ? 'border-amber-500 ring-4 ring-amber-300 bg-amber-50/40 shadow-md'
            : 'border-stone-200 hover:border-amber-300 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-base sm:text-lg">
            <CheckCircle2 className="w-5 h-5 text-amber-700" />
            <span>4. தகுதிகள் (Eligibility Criteria)</span>
          </div>
          {isTargetActive('scheme-eligibility') && (
            <span className="px-2.5 py-0.5 bg-amber-600 text-white text-[11px] font-bold rounded-full animate-pulse flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>AI விளக்குகிறது</span>
            </span>
          )}
        </div>
        <ul className="space-y-2.5">
          {scheme.eligibility.map((item, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-800 bg-stone-50 p-3 rounded-xl border border-stone-200"
            >
              <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Section 5: What papers do you need? */}
      <div
        id="scheme-documents"
        onClick={() => onHighlightTargetClick('scheme-documents')}
        className={`bg-white rounded-2xl p-5 sm:p-6 border-2 transition-all cursor-pointer ${
          isTargetActive('scheme-documents')
            ? 'border-amber-500 ring-4 ring-amber-300 bg-amber-50/40 shadow-md'
            : 'border-stone-200 hover:border-amber-300 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-base sm:text-lg">
            <FileText className="w-5 h-5 text-amber-700" />
            <span>5. என்ன ஆவணங்கள் தேவை? (Required Papers)</span>
          </div>
          {isTargetActive('scheme-documents') && (
            <span className="px-2.5 py-0.5 bg-amber-600 text-white text-[11px] font-bold rounded-full animate-pulse flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>AI விளக்குகிறது</span>
            </span>
          )}
        </div>
        <p className="text-xs text-stone-500 mb-3">
          விண்ணப்பிக்கும் முன் இந்த காகிதங்களை தயாராக வைத்துக் கொள்ளவும்:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {scheme.requiredDocuments.map((doc, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs sm:text-sm text-stone-800 font-medium"
            >
              <span className="w-2 h-2 rounded-full bg-amber-600 shrink-0" />
              <span>{doc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Section 6: How can I apply & submit? (Assisted Submission Guide) */}
      <div
        id="scheme-application"
        className={`transition-all ${
          isTargetActive('scheme-application')
            ? 'ring-4 ring-amber-400 rounded-3xl shadow-xl'
            : ''
        }`}
      >
        <ApplicationSubmissionGuide
          scheme={scheme}
          onAskAiToExplain={onAskAiToExplain || (() => {})}
          onOpenOfficialUrl={onOpenOfficialUrl}
        />
      </div>

      {/* Section 7: Official Government Portal Source */}
      <div
        id="scheme-official-source"
        onClick={() => onHighlightTargetClick('scheme-official-source')}
        className={`bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 sm:p-6 border-2 transition-all ${
          isTargetActive('scheme-official-source')
            ? 'border-amber-500 ring-4 ring-amber-300 shadow-md'
            : 'border-amber-300 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 text-amber-950 font-bold text-base sm:text-lg">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            <span>7. அதிகாரப்பூர்வ அரசு தளம் (Official Government Source)</span>
          </div>
          <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
            Verified .gov.in / .nic.in
          </span>
        </div>
        <p className="text-stone-700 text-xs sm:text-sm leading-relaxed mb-4">
          இத்திட்டம் குறித்த முழு அதிகாரப்பூர்வ தகவல்கள் மற்றும் ஆன்லைன் விண்ணப்பம் அரசு தளத்தில் உள்ளது. நீங்கள் நேரடியாக சென்று பார்க்கலாம்:
        </p>
        <button
          onClick={() => setShowExitWarningModal(true)}
          className="w-full sm:w-auto px-6 py-3.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
        >
          <span>அரசு இணையதளத்தைத் திறக்கவும் (Open Official Portal)</span>
          <ExternalLink className="w-4 h-4 text-amber-400" />
        </button>
      </div>

      {/* Safety Departure Modal */}
      {showExitWarningModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="exit-modal-title"
          className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-stone-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center" aria-hidden="true">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h4 id="exit-modal-title" className="text-lg font-bold text-stone-900">
              அதிகாரப்பூர்வ அரசு தளத்திற்குச் செல்கிறீர்கள்
            </h4>
            <p className="text-stone-600 text-sm leading-relaxed">
              நீங்கள் தற்போது இந்திய அரசின் அதிகாரப்பூர்வ இணையதளத்திற்கு (
              <span className="font-semibold text-stone-900">{scheme.officialSourceUrl}</span>
              ) செல்ல இருக்கிறீர்கள். சகிசேது உங்கள் கடவுச்சொற்கள் அல்லது OTP எண்களை ஒருபோதும் கேட்காது.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowExitWarningModal(false)}
                className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-semibold text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                திரும்பு (Cancel)
              </button>
              <button
                onClick={() => {
                  setShowExitWarningModal(false);
                  onOpenOfficialUrl(scheme.officialSourceUrl);
                }}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold text-sm cursor-pointer shadow-sm flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <span>தொடரவும் (Proceed)</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
