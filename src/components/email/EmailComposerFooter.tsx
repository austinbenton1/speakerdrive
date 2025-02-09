import React, { useState } from 'react';
import {
  Wand2,
  Eye,
  ArrowLeft,
  Copy,
  Save as SaveIcon,
  Download,
  ChevronRight,
  FlaskConical as Flask,
  UserPlus,
} from 'lucide-react';

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
  // For multiple message options:
  messageOptionsCount?: number;
  selectedOptionIndex?: number;
  onRefresh?: () => void;
}

export default function EmailComposerFooter({
  showMessage,
  isGenerating,
  isCopying,
  isSaving,
  showInputs,
  isPreviewMode,
  input,
  leadPitch,
  handleGenerate,
  handleCopyOutreach,
  handleSavePitch,
  togglePreviewMode,
  onBackToEditor,
  messageOptionsCount,
  selectedOptionIndex,
  onRefresh,
}: EmailComposerFooterProps) {
  /**
   * Tracks which version index (if any) has been saved.
   * If null, no version is saved yet.
   */
  const [savedOptionIndex, setSavedOptionIndex] = useState<number | null>(null);

  /**
   * Called when the user clicks "Save".
   * - Only allow saving if nothing is saved yet (savedOptionIndex === null).
   * - Then call the existing handleSavePitch() (to do the actual saving logic).
   * - Finally store which version index got saved.
   */
  function onClickSavePitch() {
    // If we haven't saved anything yet, proceed
    if (savedOptionIndex === null) {
      handleSavePitch();
      setSavedOptionIndex(selectedOptionIndex ?? 0);
    }
  }

  /**
   * Decide if the currently selected version is the saved one.
   */
  const isSaved = savedOptionIndex !== null && savedOptionIndex === selectedOptionIndex;

  //
  // BEFORE / PREVIEW STATE
  //
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

        {/* Generate + Preview (BEFORE) */}
        {!showMessage && (
          <div className="flex items-start gap-3 px-4 py-3 bg-gradient-to-b from-white to-gray-50/50">
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

            {!isGenerating && showInputs && (
              <button
                onClick={togglePreviewMode}
                className={`
                  inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all mt-0.5
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

  //
  // AFTER STATE
  //

  /**
   * If one version is already saved, and the user tries to see
   * a different version (selectedOptionIndex !== savedOptionIndex),
   * hide that content entirely so it "disappears" as an option.
   */
  if (savedOptionIndex !== null && savedOptionIndex !== selectedOptionIndex) {
    // This ensures you cannot view or save any other versions once one is saved
    return null;
  }

  return (
    <div
      className="sticky bottom-0 bg-white border-t border-gray-200 flex flex-col rounded-bl-2xl"
      style={{ zIndex: 10 }}
    >
      <div className="p-3 bg-gray-50">
        {/* Single row, no scroll and no wrap => can get clipped if too narrow */}
        <div className="flex items-center gap-3 flex-nowrap">
          {/* "Version" button if multiple message options AND nothing is saved yet */}
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
              <ChevronRight size={18} />
            </button>
          )}

          {/* Save (or Saved confirmation) */}
          {(() => {
            // We show the button if text changed, or if it's saved (to confirm).
            // Because we want to keep the button visible in a "Saved" state.
            const textHasChanged = input !== leadPitch;

            if (isSaved) {
              // Already saved => show "Saved"
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
              // Not saved yet => show Save button
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
            // If none of the above apply, render nothing
            return null;
          })()}

          {/* Divider */}
          <div className="h-5 w-px bg-gray-300 flex-shrink-0" />

          {/* Copy (icon only) */}
          <button
            onClick={handleCopyOutreach}
            disabled={isCopying}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center text-gray-600"
            title="Copy to Clipboard"
          >
            {isCopying ? (
              <div className="w-3 h-3 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Copy size={16} />
            )}
          </button>

          {/* Download (icon only) */}
          <button
            onClick={() => {/* do nothing for now */}}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            title="Download"
          >
            <Download size={16} className="text-gray-600" />
          </button>

          {/* Export to CRM - uses UserPlus icon */}
          <button
            onClick={() => {/* do nothing for now */}}
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
