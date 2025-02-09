import React from 'react';
import { Wand2, Eye, ArrowLeft, Copy } from 'lucide-react';

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
  onBackToEditor
}: EmailComposerFooterProps) {
  // BEFORE state (no final message yet)
  if (!showMessage) {
    return (
      <div className="border-t border-gray-200">
        <div className="px-4 py-1.5 border-b border-gray-100 bg-gradient-to-b from-white to-gray-50/50">
          <div className="flex items-start gap-3">
            {/* Generate Outreach */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`
                flex items-center gap-2 px-6 py-2 
                ${
                  isGenerating
                    ? 'bg-gray-300 text-gray-600'
                    : 'bg-gradient-to-r from-[#00B341] to-[#009938] hover:from-[#009938] hover:to-[#008530] text-white'
                }
                rounded-lg shadow-sm hover:shadow-md transition-all duration-200
                ${isGenerating ? 'cursor-not-allowed' : ''}
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

            {/* Preview button */}
            {!isGenerating && showInputs && (
              <button
                onClick={togglePreviewMode}
                className={`
                  inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-all mt-0.5
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
        </div>
      </div>
    );
  }

  // AFTER state (message generated)
  // We want just "Copy Outreach" + "Save Outreach" side by side, with no "Back to Editor" button, etc.
  return (
    <div className="border-t border-gray-200">
      <div className="px-4 py-1.5 border-b border-gray-100 bg-gradient-to-b from-white to-gray-50/50">
        <div className="flex items-center gap-3">
          {/* Copy Outreach */}
          <button
            onClick={handleCopyOutreach}
            disabled={isCopying}
            className={`
              inline-flex items-center gap-2 px-4 py-2
              ${isCopying ? 'bg-gray-300' : 'bg-blue-500 hover:bg-blue-600'}
              text-white rounded-lg shadow-sm transition-colors duration-200
            `}
          >
            {isCopying ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Copying...</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Outreach</span>
              </>
            )}
          </button>

          {/* Save Outreach (only if text changed) */}
          {input !== leadPitch && (
            <button
              onClick={handleSavePitch}
              disabled={isSaving}
              className={`
                inline-flex items-center gap-2 px-4 py-2
                ${isSaving ? 'bg-gray-300' : 'bg-green-500 hover:bg-green-600'}
                text-white rounded-lg shadow-sm transition-colors duration-200
              `}
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2zm-5 14a3 3 0 110-6 3 3 0 010 6zm0 0V7"
                    />
                  </svg>
                  <span>Save Outreach</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
