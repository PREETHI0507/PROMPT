import {
  AlertTriangle,
  Building,
  Check,
  CheckCircle2,
  ChevronRight,
  Download,
  ExternalLink,
  FileCheck,
  Globe,
  HelpCircle,
  PhoneCall,
  Printer,
  ShieldCheck,
  Sparkles,
  Volume2,
} from 'lucide-react';
import React, { useState } from 'react';
import { Scheme } from '../../data/schemes';

interface ApplicationSubmissionGuideProps {
  scheme: Scheme;
  onAskAiToExplain: (prompt: string) => void;
  onOpenOfficialUrl: (url: string) => void;
}

export const ApplicationSubmissionGuide: React.FC<ApplicationSubmissionGuideProps> = ({
  scheme,
  onAskAiToExplain,
  onOpenOfficialUrl,
}) => {
  const [selectedRoute, setSelectedRoute] = useState<'CSC' | 'ONLINE'>('CSC');
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});
  const [applicantName, setApplicantName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [hasAadhaarLinkedBank, setHasAadhaarLinkedBank] = useState<boolean | null>(null);
  const [showSlipModal, setShowSlipModal] = useState(false);

  // Common essential rural documents
  const standardDocs = [
    {
      id: 'aadhaar',
      name: 'ஆதார் அட்டை (Aadhaar Card)',
      desc: 'விண்ணப்பதாரரின் அசல் ஆதார் அட்டை மற்றும் நகல்.',
      tip: 'ஆதார் அட்டையில் உள்ள பெயர் மற்றும் பிறந்த தேதி ஆவணங்களுடன் ஒத்துப்போக வேண்டும்.',
    },
    {
      id: 'bank',
      name: 'வங்கி பாஸ்புக் (Bank Passbook linked to Aadhaar)',
      desc: 'உங்கள் பெயரில் உள்ள வங்கி கணக்கு புத்தகம் (DBT இயக்கப்பட்டிருக்க வேண்டும்).',
      tip: 'அரசு உதவித்தொகை நேரடியாக இந்த வங்கி கணக்கிற்கு அனுப்பப்படும்.',
    },
    {
      id: 'photo',
      name: 'பாஸ்போர்ட் அளவு புகைப்படம் (Passport Photographs)',
      desc: 'சமீபத்தில் எடுக்கப்பட்ட 2 வண்ண புகைப்படங்கள்.',
      tip: 'வெள்ளை அல்லது வெளிர் பின்னணியில் தெளிவான புகைப்படம்.',
    },
    {
      id: 'ration',
      name: 'குடும்ப அட்டை / இருப்பிட சான்று (Ration Card / Address Proof)',
      desc: 'ஸ்மார்ட் குடும்ப அட்டை அல்லது முகவரி சான்றிதழ்.',
      tip: 'குடும்ப உறுப்பினர்களின் விவரங்களை சரிபார்க்க இது பயன்படுகிறது.',
    },
    {
      id: 'income',
      name: 'வருமான சான்றிதழ் / சாதி சான்றிதழ் (Income / Community Certificate)',
      desc: 'வட்டாட்சியர் அலுவலகம் அல்லது இ-சேவை மூலம் பெறப்பட்ட சான்றிதழ்.',
      tip: 'வருமான வரம்பு உள்ள திட்டங்களுக்கு வருமான சான்றிதழ் கட்டாயம்.',
    },
  ];

  const toggleDoc = (id: string) => {
    setCheckedDocs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const totalDocsCount = standardDocs.length;
  const checkedDocsCount = Object.values(checkedDocs).filter(Boolean).length;
  const progressPercent = Math.round((checkedDocsCount / totalDocsCount) * 100);

  const handlePrintSlip = () => {
    window.print();
  };

  return (
    <div className="bg-white border-2 border-amber-300 rounded-3xl p-6 sm:p-8 shadow-lg space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold text-2xl shadow-sm">
            📝
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 font-extrabold text-xs rounded-full uppercase tracking-wider">
                வழிகாட்டப்பட்ட விண்ணப்ப சமர்ப்பிப்பு
              </span>
              <span className="text-xs text-stone-500">• Assisted Submission</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-stone-900 mt-1">
              {scheme.name} - விண்ணப்பிக்கும் வழி
            </h3>
          </div>
        </div>

        <button
          onClick={() => {
            onAskAiToExplain(
              `தயவுசெய்து இந்த ${scheme.name} திட்டத்திற்கு விண்ணப்பிக்கும் முறையை எனக்கு எளிய தமிழில் விளக்குங்கள்.`
            );
          }}
          className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Volume2 className="w-4 h-4 animate-pulse" />
          <span>AI குரல் வழிகாட்டுதல் (Voice Guide)</span>
        </button>
      </div>

      {/* Step 1: Document Readiness Checklist */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-stone-900 font-extrabold text-base sm:text-lg">
            <FileCheck className="w-5 h-5 text-amber-600" />
            <span>படி 1: தேவையான ஆவணங்கள் சரிபார்ப்பு (Document Checklist)</span>
          </div>
          <span className="text-xs font-bold text-stone-600 bg-stone-100 px-3 py-1 rounded-full">
            {checkedDocsCount} / {totalDocsCount} தயார் ({progressPercent}%)
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-amber-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <p className="text-stone-600 text-xs sm:text-sm">
          விண்ணப்பிக்க தொடங்கும் முன் பின்வரும் ஆவணங்கள் உங்களிடம் உள்ளதா என சரிபார்க்கவும்:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {standardDocs.map((doc) => {
            const isChecked = !!checkedDocs[doc.id];
            return (
              <div
                key={doc.id}
                onClick={() => toggleDoc(doc.id)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 select-none ${
                  isChecked
                    ? 'border-emerald-500 bg-emerald-50/50 shadow-xs'
                    : 'border-stone-200 hover:border-amber-300 bg-stone-50/50'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center mt-0.5 transition-colors ${
                    isChecked
                      ? 'bg-emerald-600 text-white'
                      : 'border-2 border-stone-300 bg-white text-transparent'
                  }`}
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-stone-900 text-sm leading-snug">{doc.name}</div>
                  <div className="text-xs text-stone-600 mt-1">{doc.desc}</div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md font-medium">
                      💡 {doc.tip}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAskAiToExplain(
                          `இந்த திட்டத்திற்கு ${doc.name} ஆவணம் ஏன் தேவை, அதை எங்கு பெறுவது என சுருக்கமாக விளக்குங்கள்.`
                        );
                      }}
                      className="text-[11px] text-amber-700 hover:text-amber-900 font-bold underline flex items-center gap-1 cursor-pointer"
                      title="AI Explanation"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>விளக்கு</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 2: Choose How to Submit */}
      <div className="space-y-4 pt-4 border-t border-stone-200">
        <div className="flex items-center gap-2 text-stone-900 font-extrabold text-base sm:text-lg">
          <Building className="w-5 h-5 text-amber-600" />
          <span>படி 2: நீங்கள் எவ்வாறு விண்ணப்பிக்க விரும்புகிறீர்கள்? (Submission Route)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Route 1: CSC / Village Centre */}
          <div
            onClick={() => setSelectedRoute('CSC')}
            className={`p-5 rounded-2xl border-2 transition-all cursor-pointer space-y-3 ${
              selectedRoute === 'CSC'
                ? 'border-amber-600 bg-amber-50/60 ring-2 ring-amber-300 shadow-sm'
                : 'border-stone-200 hover:border-amber-300 bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-black text-amber-950 text-base">
                <Building className="w-5 h-5 text-amber-700" />
                <span>கிராம சேவை மையம் / இ-சேவை (CSC)</span>
              </div>
              <span className="text-[11px] bg-amber-200 text-amber-900 font-extrabold px-2 py-0.5 rounded-full">
                பரிந்துரைக்கப்படுகிறது
              </span>
            </div>
            <p className="text-stone-700 text-xs sm:text-sm leading-relaxed">
              உங்கள் ஊரில் உள்ள இ-சேவை மையம் (e-Sevai), பொது சேவை மையம் (CSC) அல்லது கிராம பஞ்சாயத்து
              அலுவலகம் சென்று ஆவணங்களை வழங்கி எளிதாக விண்ணப்பிக்கலாம்.
            </p>
            <div className="text-xs text-stone-600 bg-white/80 p-3 rounded-xl border border-stone-200 space-y-1">
              <div className="font-bold text-stone-800">அங்கு கேட்க வேண்டியவை:</div>
              <div>• &quot;{scheme.name} திட்டத்திற்கு விண்ணப்பிக்க வேண்டும்&quot; எனக் கூறவும்.</div>
              <div>• நிர்ணயிக்கப்பட்ட அரசு கட்டணம் ₹30 - ₹60 மட்டுமே.</div>
              <div>• விண்ணப்பித்த பின் ரசீது / ஒப்புதல் சீட்டு பெற மறக்காதீர்கள்.</div>
            </div>
          </div>

          {/* Route 2: Online Official Portal */}
          <div
            onClick={() => setSelectedRoute('ONLINE')}
            className={`p-5 rounded-2xl border-2 transition-all cursor-pointer space-y-3 ${
              selectedRoute === 'ONLINE'
                ? 'border-amber-600 bg-amber-50/60 ring-2 ring-amber-300 shadow-sm'
                : 'border-stone-200 hover:border-amber-300 bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-black text-amber-950 text-base">
                <Globe className="w-5 h-5 text-amber-700" />
                <span>ஆன்லைன் அரசு தளம் (Online Portal)</span>
              </div>
              <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                நேரடி தளம்
              </span>
            </div>
            <p className="text-stone-700 text-xs sm:text-sm leading-relaxed">
              அரசின் அதிகாரப்பூர்வ இணையதளம் மூலம் உங்கள் கைபேசி அல்லது கணினியிலேயே நேரடியாக
              விண்ணப்பத்தை சமர்ப்பிக்கலாம்.
            </p>
            <div className="text-xs text-stone-600 bg-white/80 p-3 rounded-xl border border-stone-200 space-y-1">
              <div className="font-bold text-stone-800">ஆன்லைன் விண்ணப்ப படிகள்:</div>
              <div>1. அதிகாரப்பூர்வ தளத்தில் &quot;புதிய பதிவு&quot; என்பதைத் தேர்வு செய்யவும்.</div>
              <div>2. ஆதார் எண் மற்றும் கைபேசி எண்ணை உள்ளிட்டு OTP சரிபார்க்கவும்.</div>
              <div>3. ஆவணங்களை பதிவேற்றி, விண்ணப்ப எண்ணை (Application ID) குறித்துக் கொள்ளவும்.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Step 3: Pre-submission details check */}
      <div className="space-y-4 pt-4 border-t border-stone-200">
        <div className="flex items-center gap-2 text-stone-900 font-extrabold text-base sm:text-lg">
          <ShieldCheck className="w-5 h-5 text-amber-600" />
          <span>படி 3: விண்ணப்பதாரர் விவரங்கள் சரிபார்ப்பு (Details Check)</span>
        </div>
        <p className="text-stone-600 text-xs sm:text-sm">
          ஆவணங்களில் உள்ளவாறே விவரங்களை சரிபார்த்துக் கொள்ளவும் (நாங்கள் எந்த கடவுச்சொல் அல்லது OTP
          எண்களையும் கேட்க மாட்டோம்):
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-stone-50 p-4 sm:p-5 rounded-2xl border border-stone-200">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              விண்ணப்பதாரர் பெயர் (Name as in Aadhaar):
            </label>
            <input
              type="text"
              value={applicantName}
              onChange={(e) => setApplicantName(e.target.value)}
              placeholder="எ.கா. கவிதா மு"
              className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              OTP பெற கைபேசி எண் (Mobile Number):
            </label>
            <input
              type="tel"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              placeholder="எ.கா. 98765 43210"
              className="w-full px-3.5 py-2.5 bg-white border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
            />
          </div>

          <div className="sm:col-span-2 pt-2">
            <span className="block text-xs font-bold text-stone-700 mb-2">
              உங்கள் வங்கி கணக்குடன் ஆதார் எண் இணைக்கப்பட்டுள்ளதா? (Aadhaar DBT Linked?):
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setHasAadhaarLinkedBank(true)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  hasAadhaarLinkedBank === true
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
                }`}
              >
                ✓ ஆம், இணைக்கப்பட்டுள்ளது (Yes, Linked)
              </button>
              <button
                type="button"
                onClick={() => {
                  setHasAadhaarLinkedBank(false);
                  onAskAiToExplain(
                    'என் வங்கி கணக்குடன் ஆதார் எண்ணை இணைப்பது எப்படி? அதை வங்கியில் எவ்வாறு சரிபார்ப்பது?'
                  );
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  hasAadhaarLinkedBank === false
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
                }`}
              >
                ? தெரியாது / இணைக்கவில்லை (Check / Link)
              </button>
            </div>
            {hasAadhaarLinkedBank === false && (
              <p className="mt-2 text-xs text-amber-800 bg-amber-100/70 p-2.5 rounded-xl font-medium">
                💡 உதவித்தொகை வர வங்கி கணக்கில் ஆதார் NPCI இணைப்பு அவசியம். உங்கள் வங்கி கிளையில்
                &quot;ஆதார் சீடிங் (Aadhaar Seeding)&quot; படிவம் கொடுத்து இணைக்கலாம்.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons: Download Guidance Slip & Go to Portal */}
      <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={() => setShowSlipModal(true)}
          className="w-full sm:w-auto flex-1 px-5 py-3.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer text-sm"
        >
          <Printer className="w-4 h-4 text-amber-400" />
          <span>விண்ணப்ப வழிகாட்டி சீட்டை பதிவிறக்கு (Application Slip)</span>
        </button>

        <button
          onClick={() => onOpenOfficialUrl(scheme.officialSourceUrl)}
          className="w-full sm:w-auto flex-1 px-5 py-3.5 bg-amber-600 hover:bg-amber-500 text-white font-extrabold rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer text-sm"
        >
          <span>அதிகாரப்பூர்வ அரசு தளத்தில் சமர்ப்பிக்கவும்</span>
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>

      {/* Helpline Info */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-emerald-950 font-bold">
          <PhoneCall className="w-4 h-4 text-emerald-700" />
          <span>பெண்கள் உதவி எண் (Women Helpline): 181 (கட்டணமில்லா இலவச அழைப்பு)</span>
        </div>
        <span className="text-emerald-800 font-semibold hidden sm:inline">24x7 அவசர உதவி & வழிகாட்டுதல்</span>
      </div>

      {/* Application Slip Modal for Printing or Saving */}
      {showSlipModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="border-b-2 border-stone-800 pb-4 text-center">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-widest">
                சகிசேது அரசு உதவி விண்ணப்ப வழிகாட்டி சீட்டு
              </span>
              <h2 className="text-2xl font-black text-stone-900 mt-1">{scheme.name}</h2>
              <div className="text-xs text-stone-600 mt-1">
                {scheme.sectorLabel} • அதிகாரப்பூர்வ அரசு தளம்: {scheme.officialSourceUrl}
              </div>
            </div>

            {/* Applicant Summary */}
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs space-y-1.5">
              <div className="font-bold text-stone-900 text-sm mb-1">விண்ணப்பதாரர் தகவல்:</div>
              <div>
                • பெயர்: <span className="font-bold">{applicantName || 'விண்ணப்பதாரர்'}</span>
              </div>
              <div>
                • கைபேசி எண்: <span className="font-bold">{mobileNumber || 'வழங்கப்படவில்லை'}</span>
              </div>
              <div>
                • தேர்ந்தெடுக்கப்பட்ட முறை:{' '}
                <span className="font-bold">
                  {selectedRoute === 'CSC' ? 'கிராம சேவை மையம் (CSC/e-Sevai)' : 'ஆன்லைன் அரசு தளம்'}
                </span>
              </div>
            </div>

            {/* Required Checklist */}
            <div className="space-y-2 text-xs">
              <div className="font-bold text-stone-900 text-sm">கொண்டு செல்ல வேண்டிய ஆவணங்கள்:</div>
              <ul className="space-y-1.5 text-stone-700">
                {standardDocs.map((doc) => (
                  <li key={doc.id} className="flex items-center gap-2">
                    <span
                      className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold ${
                        checkedDocs[doc.id]
                          ? 'bg-emerald-600 text-white'
                          : 'border border-stone-400 text-stone-400'
                      }`}
                    >
                      {checkedDocs[doc.id] ? '✓' : '○'}
                    </span>
                    <span>{doc.name}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Instructions for Operator / Applicant */}
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-xs text-amber-950 space-y-1.5">
              <div className="font-bold text-sm text-amber-900">சேவை மையத்தில் சமர்ப்பிக்க:</div>
              <p>
                1. உங்கள் ஊரில் உள்ள இ-சேவை மையம் அல்லது CSC அலுவலரிடம் இந்த சீட்டைக் காட்டவும்.
              </p>
              <p>2. &quot;{scheme.name}&quot; திட்டத்தில் பதிவு செய்யக் கோரவும்.</p>
              <p>3. விண்ணப்ப எண் (Application Reference ID) அடங்கிய ஒப்புதல் சீட்டை பெற்றுக் கொள்ளவும்.</p>
              <p className="font-bold pt-1">அரசு உதவி எண்: 181 (பெண்கள் உதவி மையம்)</p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowSlipModal(false)}
                className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-semibold text-sm cursor-pointer"
              >
                மூடு (Close)
              </button>
              <button
                onClick={handlePrintSlip}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold text-sm cursor-pointer shadow-md flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>அச்சிடு / சேமி (Print / Save)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
