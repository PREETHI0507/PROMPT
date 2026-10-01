import { useCallback, useEffect, useState } from 'react';
import { AIGuideAvatar } from './components/AIGuide/AIGuideAvatar';
import { DiagnosticsDrawer } from './components/Diagnostics/DiagnosticsDrawer';
import { LanguageSelector } from './components/LanguageSelector/LanguageSelector';
import { SchemeDetails } from './components/SchemeDetails/SchemeDetails';
import { SchemeResults } from './components/SchemeResults/SchemeResults';
import { LiveTranscript } from './components/Transcript/LiveTranscript';
import { VoiceStatusBar } from './components/VoiceStatus/VoiceStatusBar';
import { SupportedLanguageCode, getLanguageConfig } from './data/languages';
import { getSchemeById } from './data/schemes';
import { useVoiceSession } from './hooks/useVoiceSession';

export default function App() {
  const {
    context,
    voiceState,
    transcripts,
    micActive,
    micVolume,
    micError,
    securityNotice,
    dismissSecurityNotice,
    diagnostics,
    diagnosticsOpen,
    setDiagnosticsOpen,
    selectLanguageAndStart,
    handleSelectScheme,
    handleHighlightTarget,
    handleGoBack,
    sendTextMessage,
    toggleMicMute,
    openOfficialUrl,
  } = useVoiceSession();

  const [selectedLanguageForModal, setSelectedLanguageForModal] =
    useState<boolean>(false);
  const [screenAnnouncement, setScreenAnnouncement] = useState<string>('');

  const currentScheme = context.selectedSchemeId
    ? getSchemeById(context.selectedSchemeId)
    : undefined;

  const langConfig = getLanguageConfig(context.language);

  // Announce screen transitions to assistive tech
  useEffect(() => {
    if (context.currentScreen === 'LANGUAGE') {
      setScreenAnnouncement('Language selection screen. Choose your language to begin speaking.');
    } else if (context.currentScreen === 'DISCOVERY') {
      setScreenAnnouncement(`Discovery screen in ${langConfig.englishName}. SakhiSetu AI is listening.`);
    } else if (context.currentScreen === 'SCHEME_RESULTS') {
      setScreenAnnouncement(`Showing ${context.candidateSchemeIds.length} recommended government schemes.`);
    } else if (context.currentScreen === 'SCHEME_DETAILS' && currentScheme) {
      setScreenAnnouncement(`Viewing guided details for ${currentScheme.name}.`);
    }
  }, [context.currentScreen, context.candidateSchemeIds.length, currentScheme, langConfig.englishName]);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedLanguageForModal) {
        setSelectedLanguageForModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedLanguageForModal]);

  // Demo mode launcher for judges
  const handleLaunchDemo = useCallback((code: SupportedLanguageCode) => {
    void selectLanguageAndStart(code).then(() => {
      // Send sample query after a brief delay so session connects
      setTimeout(() => {
        sendTextMessage('என் மகளுக்கு படிப்புக்கு அரசு உதவி வேண்டும்.');
      }, 1500);
    });
  }, [selectLanguageAndStart, sendTextMessage]);

  return (
    <div className="min-h-screen bg-stone-100/60 text-stone-900 flex flex-col font-sans selection:bg-amber-200">
      {/* Skip to Content Link for Keyboard Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-amber-700 focus:text-white focus:rounded-xl focus:font-bold focus:shadow-lg focus:outline-none"
      >
        முக்கிய பகுதிக்கு செல்லவும் (Skip to main content)
      </a>

      {/* Screen Reader Live Announcement */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {screenAnnouncement}
      </div>

      {/* Top Navbar */}
      <header role="banner" className="bg-white border-b border-stone-200/90 sticky top-0 z-20 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-500 text-white flex items-center justify-center font-bold text-xl shadow-xs" aria-hidden="true">
              👩‍💼
            </div>
            <div>
              <span className="font-extrabold text-stone-900 text-base sm:text-lg tracking-tight block leading-none">
                SakhiSetu AI
              </span>
              <span className="text-[11px] text-amber-800 font-semibold tracking-wide">
                Just speak. I’ll guide you.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {context.currentScreen !== 'LANGUAGE' && (
              <button
                onClick={() => setSelectedLanguageForModal(true)}
                aria-label={`Current language: ${langConfig.name}. Click to change language.`}
                className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <span>{langConfig.name}</span>
                <span className="text-stone-400 font-normal">| மாற்றவும்</span>
              </button>
            )}

            <button
              onClick={() => setDiagnosticsOpen(!diagnosticsOpen)}
              className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500"
              title="Diagnostics Panel"
              aria-label="Toggle developer diagnostics panel"
            >
              ⚙️ Debug
            </button>
          </div>
        </div>
      </header>

      {/* Security Notification Banner (Thread-safe, accessible in-app alert) */}
      {securityNotice && (
        <div
          role="alert"
          aria-live="assertive"
          className="bg-amber-50 border-b border-amber-300 px-4 py-2.5 text-amber-950 text-xs sm:text-sm flex items-center justify-between shadow-xs sticky top-[57px] z-19"
        >
          <div className="flex items-center gap-2 max-w-4xl mx-auto w-full">
            <span className="font-bold text-base" aria-hidden="true">🛡️</span>
            <span className="flex-1 font-medium">{securityNotice}</span>
            <button
              onClick={dismissSecurityNotice}
              aria-label="Dismiss security notice"
              className="ml-2 px-2.5 py-1 bg-amber-200/80 hover:bg-amber-300 text-amber-900 font-bold rounded-lg text-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-600"
            >
              சரி (OK)
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main id="main-content" tabIndex={-1} className="flex-1 flex flex-col focus:outline-none">
        {/* Screen 1: Language Selection */}
        {context.currentScreen === 'LANGUAGE' && (
          <LanguageSelector
            onSelectLanguage={selectLanguageAndStart}
            onLaunchDemo={handleLaunchDemo}
          />
        )}

        {/* Screen 2: Discovery Screen */}
        {context.currentScreen === 'DISCOVERY' && (
          <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 flex flex-col gap-6">
            {/* AI Guide Dominant Avatar */}
            <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm">
              <AIGuideAvatar
                voiceState={voiceState}
                micVolume={micVolume}
                language={context.language}
                onAvatarClick={toggleMicMute}
              />
            </div>

            {/* Conversation Transcript */}
            <div className="flex-1">
              <LiveTranscript
                transcripts={transcripts}
                language={context.language}
                onSampleQueryClick={sendTextMessage}
              />
            </div>
          </div>
        )}

        {/* Screen 3: Scheme Results Screen (Dual Column on Desktop) */}
        {context.currentScreen === 'SCHEME_RESULTS' && (
          <div className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Persistent AI Guide & Conversation */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-sm sticky top-20">
                  <AIGuideAvatar
                    voiceState={voiceState}
                    micVolume={micVolume}
                    language={context.language}
                    onAvatarClick={toggleMicMute}
                  />
                  <div className="mt-4">
                    <LiveTranscript
                      transcripts={transcripts}
                      language={context.language}
                      onSampleQueryClick={sendTextMessage}
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Scheme Results */}
              <div className="lg:col-span-7">
                <SchemeResults
                  candidateSchemeIds={context.candidateSchemeIds}
                  userNeed={context.userNeed}
                  onSelectScheme={handleSelectScheme}
                />
              </div>
            </div>
          </div>
        )}

        {/* Screen 4: Scheme Details Screen (Dual Column on Desktop) */}
        {context.currentScreen === 'SCHEME_DETAILS' && currentScheme && (
          <div className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Persistent AI Guide & Conversation */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-sm sticky top-20">
                  <AIGuideAvatar
                    voiceState={voiceState}
                    micVolume={micVolume}
                    language={context.language}
                    onAvatarClick={toggleMicMute}
                  />
                  <div className="mt-4">
                    <LiveTranscript
                      transcripts={transcripts}
                      language={context.language}
                      onSampleQueryClick={sendTextMessage}
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Guided Scheme Details Sections */}
              <div className="lg:col-span-7">
                <SchemeDetails
                  scheme={currentScheme}
                  currentGuidanceStep={context.currentGuidanceStep}
                  activeHighlightTarget={context.activeHighlightTarget}
                  onHighlightTargetClick={handleHighlightTarget}
                  onOpenOfficialUrl={openOfficialUrl}
                  onAskAiToExplain={sendTextMessage}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Persistent Voice Status Bar when in active session */}
      {context.currentScreen !== 'LANGUAGE' && (
        <VoiceStatusBar
          voiceState={voiceState}
          micActive={micActive}
          micVolume={micVolume}
          micError={micError}
          language={context.language}
          canGoBack={context.currentScreen !== 'DISCOVERY'}
          onGoBack={handleGoBack}
          onToggleMic={toggleMicMute}
          onChangeLanguage={() => setSelectedLanguageForModal(true)}
          onSendTextMessage={sendTextMessage}
          onToggleDiagnostics={() => setDiagnosticsOpen(!diagnosticsOpen)}
          diagnosticsOpen={diagnosticsOpen}
        />
      )}

      {/* Change Language Modal */}
      {selectedLanguageForModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="language-modal-title"
          className="fixed inset-0 z-50 bg-stone-950/50 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 id="language-modal-title" className="text-lg font-bold text-stone-900">
              மொழியை மாற்றவும் • Change Language
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { code: 'ta-IN', name: 'தமிழ்' },
                { code: 'hi-IN', name: 'हिन्दी' },
                { code: 'te-IN', name: 'తెలుగు' },
                { code: 'bn-IN', name: 'বাংলা' },
                { code: 'mr-IN', name: 'मराठी' },
                { code: 'kn-IN', name: 'ಕನ್ನಡ' },
              ].map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    setSelectedLanguageForModal(false);
                    void selectLanguageAndStart(l.code as SupportedLanguageCode);
                  }}
                  className={`p-3 rounded-xl font-bold text-sm border text-left cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    context.language === l.code
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'bg-stone-50 hover:bg-stone-100 text-stone-800 border-stone-200'
                  }`}
                >
                  {l.name}
                </button>
              ))}
            </div>
            <button
              onClick={() => setSelectedLanguageForModal(false)}
              className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-sm font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              ரத்து செய் (Cancel)
            </button>
          </div>
        </div>
      )}

      {/* Diagnostics Drawer */}
      <DiagnosticsDrawer
        isOpen={diagnosticsOpen}
        onClose={() => setDiagnosticsOpen(false)}
        diagnostics={diagnostics}
      />
    </div>
  );
}
