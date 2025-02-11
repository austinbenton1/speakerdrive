import React, { useState, useEffect, useRef } from 'react';
import {
  Wand2,
  Eye,
  ArrowLeft,
  Save as SaveIcon,
  Download,
  FlaskConical as Flask,
  UserPlus,
} from 'lucide-react';

/**
 * Updated to show an actual progress bar that fills from 0% to 100%.
 * Also ensure we use 'lead_name' consistently.
 */
interface LoadingMessage {
  id: string;
  template: string;
  condition?: {
    field: string;
    value: string | null;
  };
  variables: string[];
}

const loadingSequence: LoadingMessage[] = [
  {
    id: 'event_context',
    template: 'Initializing info: {event_name}...',
    variables: ['event_name']
  },
  {
    id: 'lead_review',
    template: "Reviewing {lead_name}'s background...",
    condition: {
      field: 'leadType',
      value: 'Contact'
    },
    variables: ['lead_name']
  },
  {
    id: 'lead_review_event',
    template: 'SpeakerDrive lead type is {unlockType}...',
    condition: {
      field: 'leadType',
      value: 'Event'
    },
    variables: ['unlockType']
  },
  {
    id: 'profile_match',
    template: "Matching with {display_name}'s profile...",
    variables: ['display_name']
  },
  {
    id: 'location',
    template: 'Checking location: {region} {state} {city}',
    variables: ['region', 'state', 'city']
  },
  {
    id: 'personalization',
    template: 'Pinpointing {display_name} personalization...',
    variables: ['display_name']
  },
  {
    id: 'message',
    template: 'Crafting optimal message...',
    variables: []
  },
  {
    id: 'variations',
    template: 'Creating message variations...',
    variables: []
  },
  {
    id: 'finalizing',
    template: 'Finalizing your outreach...',
    variables: []
  }
];

interface EmailComposerFooterProps {
  showMessage: boolean;
  isGenerating: boolean;
  isCopying: boolean;
  isSaving: boolean;
  showInputs: boolean;
  isPreviewMode: boolean;
  input: string;
  leadPitch?: string;
  handleGenerate: () => void;
  handleCopyOutreach: () => void;
  handleSavePitch: () => void;
  togglePreviewMode: () => void;
  onBackToEditor: () => void;
  // For multiple message options
  messageOptionsCount?: number;
  selectedOptionIndex?: number;
  onRefresh?: () => void;

  lead?: {
    leadType?: 'Contact' | 'Event';
    lead_name?: string;
    region?: string;
    state?: string;
    city?: string;
    unlockType?: string;
    eventName?: string;
  };
  displayName?: string;
}

export default function EmailComposerFooter({
  // Standard props
  showMessage,
  isGenerating,
  isCopying,
  isSaving,
  showInputs,
  isPreviewMode,
  input,
  leadPitch,
  handleGenerate,
  handleCopyOutreach, // passed, but not used for a button
  handleSavePitch,
  togglePreviewMode,
  onBackToEditor,
  messageOptionsCount,
  selectedOptionIndex,
  onRefresh,
  // For loading sequence
  lead,
  displayName,
}: EmailComposerFooterProps) {
  const [savedOptionIndex, setSavedOptionIndex] = useState<number | null>(null);

  // ─────────────────────────────────────────
  // 1) Build the list of relevant messages
  // ─────────────────────────────────────────
  const filteredMessages = React.useMemo(() => {
    if (!lead) return [];
    return loadingSequence.filter((msg) => {
      if (msg.condition) {
        const actual = (lead as any)[msg.condition.field];
        if (actual !== msg.condition.value) return false;
      }
      // skip "location" if user has no region/state/city
      if (msg.id === 'location') {
        const hasLocation = lead.region || lead.state || lead.city;
        if (!hasLocation) return false;
      }
      return true;
    });
  }, [lead]);

  // ─────────────────────────────────────────
  // 2) Animate through the messages
  // ─────────────────────────────────────────
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // ↓↓↓ Make this faster ↓↓↓
  const messageInterval = 2000; // 2 seconds instead of 4

  useEffect(() => {
    if (isGenerating && filteredMessages.length > 0) {
      setCurrentIndex(0);

      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev < filteredMessages.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, messageInterval);

    } else {
      // Not generating => reset
      setCurrentIndex(0);
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isGenerating, filteredMessages]);

  // Once generation completes, jump to last message
  useEffect(() => {
    if (!isGenerating && filteredMessages.length > 0) {
      setCurrentIndex(filteredMessages.length - 1);
    }
  }, [isGenerating, filteredMessages]);

  // ─────────────────────────────────────────
  // 3) Build the final text for the current message
  // ─────────────────────────────────────────
  function getLoadingMessage(): string {
    if (!lead || filteredMessages.length === 0) {
      return 'Preparing your outreach...';
    }
    const msg = filteredMessages[currentIndex];
    if (!msg) return 'Preparing your outreach...';

    let text = msg.template;
    for (const v of msg.variables) {
      let replacement = '';
      switch (v) {
        case 'event_name':
          replacement = lead.eventName ?? '';
          break;
        case 'lead_name':
          replacement = lead.lead_name ?? '';
          break;
        case 'leadType':
          replacement = lead.leadType ?? '';
          break;
        case 'unlockType':
          replacement = lead.unlockType ?? '';
          break;
        case 'display_name':
          replacement = displayName ?? '';
          break;
        case 'region':
          replacement = lead.region ?? '';
          break;
        case 'state':
          replacement = lead.state ?? '';
          break;
        case 'city':
          replacement = lead.city ?? '';
          break;
        default:
          break;
      }
      text = text.replace(`{${v}}`, replacement.trim());
    }

    return text.replace(/\s+/g, ' ').trim();
  }

  // Calculate progress as a percentage
  const totalSteps = filteredMessages.length;
  const progressPercent =
    totalSteps > 1
      ? ((currentIndex + 1) / totalSteps) * 100
      : 100; // fallback if only 1 step

  // ─────────────────────────────────────────
  // SAVE LOGIC
  // ─────────────────────────────────────────
  function onClickSavePitch() {
    if (savedOptionIndex === null) {
      handleSavePitch();
      setSavedOptionIndex(selectedOptionIndex ?? 0);
    }
  }
  const isSaved = savedOptionIndex !== null && savedOptionIndex === selectedOptionIndex;
  const textHasChanged = input !== leadPitch;

  // ─────────────────────────────────────────
  // BEFORE / PREVIEW vs AFTER
  // ─────────────────────────────────────────

  // If not in the AFTER state (or we're previewing), show “Generate”/“Preview” UI
  if (!showMessage || isPreviewMode) {
    return (
      <div
        className="sticky bottom-0 bg-white border-t border-gray-200 flex flex-col rounded-bl-2xl"
        style={{ zIndex: 10 }}
      >
        {/* If in PREVIEW but not AFTER => "Back to Editor" */}
        {isPreviewMode && !showMessage && (
          <div className="flex gap-3 px-4 py-2 border-b border-gray-200">
            <button
              onClick={onBackToEditor}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50"
            >
              <ArrowLeft className="w-3 h-3" />
              Back to Editor
            </button>
          </div>
        )}

        {/* BEFORE => Generate + Preview */}
        {!showMessage && (
          <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-b from-white to-gray-50/50">
            {/* The “Generate Outreach” button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm hover:shadow-md
                text-sm transition-all duration-200
                ${
                  isGenerating
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#00B341] to-[#009938] hover:from-[#009938] hover:to-[#008530] text-white'
                }
              `}
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                  <span className="font-medium">Generating...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span className="font-medium">Generate Outreach</span>
                </>
              )}
            </button>

            {/* Loading area if generating */}
            {isGenerating && (
              <div className="flex flex-col items-start gap-1">
                {/* Actual progress bar */}
                <div className="relative w-48 h-2 bg-gray-300 rounded overflow-hidden">
                  <div
                    className="absolute left-0 top-0 h-full bg-blue-500 transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                {/* The dynamic text */}
                <div className="whitespace-normal break-words flex-1 min-w-0 text-sm text-gray-700 font-medium mt-1">
                  {getLoadingMessage()}
                </div>
              </div>
            )}

            {/* “Preview” button if not generating */}
            {!isGenerating && showInputs && (
              <button
                onClick={togglePreviewMode}
                className={`
                  inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                  ${
                    isPreviewMode
                      ? 'text-[#0066FF] border border-[#0066FF]/20 bg-blue-50/50 hover:bg-blue-50 shadow-[0_1px_2px_rgba(0,108,255,0.05)]'
                      : 'text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 shadow-sm'
                  }
                `}
              >
                <Eye className="w-3 h-3" />
                Preview
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // AFTER STATE
  if (savedOptionIndex !== null && savedOptionIndex !== selectedOptionIndex) {
    return null;
  }

  return (
    <div
      className="sticky bottom-0 bg-white border-t border-gray-200 flex flex-col rounded-bl-2xl"
      style={{ zIndex: 10 }}
    >
      <div className="p-3 bg-gray-50">
        <div className="flex items-center gap-3 flex-nowrap">

          {/* "Version" button if multiple message options AND not saved */}
          {onRefresh && messageOptionsCount && messageOptionsCount > 1 && savedOptionIndex === null && (
            <button
              onClick={onRefresh}
              className="
                px-4 py-2 bg-blue-500 text-white rounded-lg 
                text-base font-medium hover:bg-blue-600 
                transition-colors flex items-center gap-2 whitespace-nowrap
              "
            >
              <Flask size={18} />
              Version
              <span className="opacity-40 text-sm">|</span>
              {selectedOptionIndex! + 1} of {messageOptionsCount}
              {/* (Chevron removed) */}
            </button>
          )}

          {/* Save button or “Saved” */}
          {(() => {
            if (isSaved) {
              return (
                <button
                  disabled
                  className="
                    px-4 py-2 rounded-lg text-base font-medium 
                    bg-green-200 text-green-800 cursor-default 
                    flex items-center gap-2 whitespace-nowrap
                  "
                >
                  <SaveIcon size={18} />
                  Saved
                </button>
              );
            } else if (textHasChanged || savedOptionIndex === null) {
              return (
                <button
                  onClick={onClickSavePitch}
                  disabled={isSaving}
                  className={`
                    px-4 py-2 rounded-lg text-base font-medium text-white transition-colors 
                    flex items-center gap-2 whitespace-nowrap
                    ${
                      isSaving
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-green-500 hover:bg-green-600'
                    }
                  `}
                >
                  {isSaving ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <SaveIcon size={18} />
                      Save
                    </>
                  )}
                </button>
              );
            }
            return null;
          })()}

          {/* Divider */}
          <div className="h-5 w-px bg-gray-300 flex-shrink-0" />

          {/* (Copy button removed from here) */}

          {/* Download */}
          <button
            onClick={() => {
              /* do nothing for now */
            }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            title="Download"
          >
            <Download size={16} className="text-gray-600" />
          </button>

          {/* Export to CRM */}
          <button
            onClick={() => {
              /* do nothing for now */
            }}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
            title="Export to CRM"
          >
            <UserPlus size={16} className="text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
