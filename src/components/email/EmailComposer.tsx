import React, { useState, useEffect, useRef } from 'react';
import {
  Mail,
  Linkedin,
  FileText,
  Bold,
  Italic,
  Link2,
  Copy,
  List,
  ChevronsDown,
  Underline as UnderlineIcon,
} from 'lucide-react';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { Mark } from '@tiptap/core';

import EmailComposerHeader from './EmailComposerHeader';
import OutreachSettingsPanel from './OutreachSettingsPanel';
import EmailComposerFooter from './EmailComposerFooter';

import { useProfile } from '../../hooks/useProfile';
import { services } from '../../utils/constants';
import { supabase } from '../../lib/supabase';
import Toast from '../ui/Toast';

/** Minimal custom Underline extension (avoids installing @tiptap/extension-underline). */
const Underline = Mark.create({
  name: 'underline',
  parseHTML() {
    return [{ tag: 'u' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['u', HTMLAttributes, 0];
  },
  addCommands() {
    return {
      toggleUnderline:
        () =>
        ({ commands }) => {
          return commands.toggleMark('underline');
        },
    };
  },
});

interface EmailComposerProps {
  lead: {
    leadType: 'Contact' | 'Event';
    lead_name?: string;
    eventName?: string;
    jobTitle?: string;
    image: string;
    email?: string;
    infoUrl?: string;
    detailedInfo?: {
      infoUrl?: string;
      [key: string]: any;
    };
    outreachPathways?: any;
    unlockValue?: any;
    unlockType?: string;
    organization?: any;
    location?: any;
    eventUrl?: any;
    city?: string;
    state?: string;
    region?: string;
    pitch?: string;
    id?: string;
    unlocked_lead_id?: string;
    focus?: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

type MessageType = 'proposal' | 'linkedin' | 'email';

const parseProfileServices = (servicesStr: string | null): string[] => {
  if (!servicesStr) return [];
  try {
    if (servicesStr.startsWith('[') && servicesStr.endsWith(']')) {
      return JSON.parse(servicesStr);
    }
    return [servicesStr];
  } catch {
    return [];
  }
};

function MessagePreview({
  contentHTML,
  type,
  lead,
}: {
  contentHTML: string;
  type: MessageType;
  lead: EmailComposerProps['lead'];
}) {
  const renderContent = (html: string) => (
    <div
      className="text-[16px] leading-[1.7] text-gray-800 tracking-[-0.011em] font-normal max-w-[70ch]"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );

  if (type === 'linkedin') {
    return (
      <div className="bg-[#F3F2EF] rounded-lg p-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gray-200" />
            <div>
              <div className="text-sm font-medium">You</div>
              <div className="text-xs text-gray-500">1st</div>
            </div>
          </div>
          {contentHTML
            ? renderContent(contentHTML)
            : <span className="text-gray-400">Your LinkedIn message will appear here...</span>
          }
        </div>
      </div>
    );
  }

  if (type === 'proposal') {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">{lead.eventName}</h1>
          <div className="space-y-6">
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Speaking Proposal</h2>
              {contentHTML
                ? renderContent(contentHTML)
                : <span className="text-gray-400">Your proposal content will appear here...</span>
              }
            </section>
          </div>
        </div>
      </div>
    );
  }

  // Default: email
  return contentHTML ? (
    renderContent(contentHTML)
  ) : (
    <span className="text-gray-400">Your email content will appear here...</span>
  );
}

/** Minimal Tiptap Editor with B/I/U, bullet list, link, copy, and scroll (smaller icons/text). */
function TiptapEditor({
  content,
  onUpdate,
  handleCopyOutreach,
  handleScrollDown,
  isCopying,
}: {
  content: string;
  onUpdate: (html: string) => void;
  handleCopyOutreach: () => void;
  handleScrollDown: () => void;
  isCopying: boolean;
}) {
  const editorContainerRef = useRef<HTMLDivElement>(null);

  // Initialize Tiptap
  const editor = useEditor({
    extensions: [
      StarterKit.configure({}),
      Link.configure({ openOnClick: false }),
      Underline,
    ],
    content,
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  if (!editor) return null;

  const scrollToBottom = () => {
    if (!editorContainerRef.current) return;
    editorContainerRef.current.scrollTo({
      top: editorContainerRef.current.scrollHeight,
      behavior: 'smooth',
    });
  };

  const onScrollClick = () => {
    scrollToBottom();
    handleScrollDown();
  };

  const setLink = () => {
    const url = prompt('Enter the URL:', 'https://');
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  };

  return (
    <div className="border border-gray-300 rounded-lg flex flex-col shadow-2xl bg-gray-100 h-full">
      {/* Toolbar with smaller text/icons */}
      <div className="flex items-center gap-1 p-1 border-b border-gray-300 text-xs">
        {/* Bold */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1 rounded hover:bg-gray-200 transition ${
            editor.isActive('bold') ? 'bg-gray-200 text-blue-600' : 'text-gray-600'
          }`}
        >
          <Bold className="w-3.5 h-3.5" />
        </button>

        {/* Italic */}
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1 rounded hover:bg-gray-200 transition ${
            editor.isActive('italic') ? 'bg-gray-200 text-blue-600' : 'text-gray-600'
          }`}
        >
          <Italic className="w-3.5 h-3.5" />
        </button>

        {/* Underline */}
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-1 rounded hover:bg-gray-200 transition ${
            editor.isActive('underline') ? 'bg-gray-200 text-blue-600' : 'text-gray-600'
          }`}
        >
          <UnderlineIcon className="w-3.5 h-3.5" />
        </button>

        {/* Bullet List */}
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1 rounded hover:bg-gray-200 transition ${
            editor.isActive('bulletList') ? 'bg-gray-200 text-blue-600' : 'text-gray-600'
          }`}
        >
          <List className="w-3.5 h-3.5" />
        </button>

        {/* Link */}
        <button
          onClick={setLink}
          className="p-1 rounded hover:bg-gray-200 transition text-gray-600"
        >
          <Link2 className="w-3.5 h-3.5" />
        </button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Copy Button */}
        <button
          onClick={handleCopyOutreach}
          disabled={isCopying}
          className="flex items-center gap-1 px-1 py-1 rounded hover:bg-gray-200 transition-colors text-gray-600"
        >
          {isCopying ? (
            <span>Copying...</span>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              Copy
            </>
          )}
        </button>

        {/* Scroll Button */}
        <button
          onClick={onScrollClick}
          className="flex items-center gap-1 px-1 py-1 rounded hover:bg-gray-200 transition-colors text-gray-600"
        >
          <ChevronsDown className="w-3.5 h-3.5" />
          Scroll
        </button>
      </div>

      {/* Flexible editor area with scrolling */}
      <div
        ref={editorContainerRef}
        className="p-3 bg-white rounded-b-lg flex-1 min-h-0 overflow-y-auto"
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

export default function EmailComposer({ lead, isOpen, onClose }: EmailComposerProps) {
  const { profile } = useProfile();

  // The “main” HTML content
  const [htmlContent, setHtmlContent] = useState<string>(lead.pitch || '');
  const [outreachChannel, setOutreachChannel] = useState<'email' | 'linkedin' | 'proposal'>('email');
  const [emailWrittenFrom, setEmailWrittenFrom] = useState<'myself' | 'team'>('myself');
  const [linkedinNoteType, setLinkedinNoteType] = useState<'smart' | 'event'>('smart');
  const [proposalContentType, setProposalContentType] = useState<'smart' | 'custom'>('smart');
  const [customFocus, setCustomFocus] = useState('');

  // Toggles
  const [showAdvanced] = useState(true);
  const [isPitching, setIsPitching] = useState(false);
  const [showMyContext, setShowMyContext] = useState(true);  // Set to true by default
  const [selectedService, setSelectedService] = useState(services[0].id);

  const [showInputs, setShowInputs] = useState(true);
  const [showMessage, setShowMessage] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // States for generating, copying, saving, etc.
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Multi-option messages
  const [messageOptions, setMessageOptions] = useState<
    { message: string; keyElements: string[] }[]
  >([]);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    return text.length <= maxLength ? text : text.slice(0, maxLength) + '...';
  };

  const isButtonDisabled = (buttonId: string) => {
    return (
      (buttonId === 'proposal' && lead.unlockType === 'Unlock Contact Email') ||
      ((buttonId === 'linkedin' || buttonId === 'proposal') &&
        lead.unlockType === 'Unlock Event Email') ||
      ((buttonId === 'email' || buttonId === 'linkedin') &&
        lead.unlockType === 'Unlock Event URL')
    );
  };

  const findFirstEnabledButton = () => {
    const channels: MessageType[] = ['email', 'linkedin', 'proposal'];
    return channels.find((ch) => !isButtonDisabled(ch)) || 'email';
  };

  useEffect(() => {
    if (profile?.services) {
      const pServices = parseProfileServices(profile.services);
      const matchingService = services.find((svc) =>
        pServices.some((ps) => svc.id === ps)
      );
      if (matchingService) {
        setSelectedService(matchingService.id);
      } else if (services.length > 0) {
        setSelectedService(services[0].id);
      }
    } else if (services.length > 0) {
      setSelectedService(services[0].id);
    }
  }, [profile?.services]);

  useEffect(() => {
    if (profile?.services) {
      setSelectedService(profile.services);
      setIsPitching(true); // Also enable pitching when we have a service
    }
  }, [profile?.services]);

  // Decide initial state
  useEffect(() => {
    if (lead.pitch) {
      setHtmlContent(lead.pitch);
      setShowMessage(true);
      setShowInputs(false);
    } else {
      setShowMessage(false);
      setShowInputs(true);
    }
  }, [lead.pitch]);

  useEffect(() => {
    if (isOpen) {
      if (lead.pitch) {
        setShowMessage(true);
        setShowInputs(false);
      } else {
        setShowMessage(false);
        setShowInputs(true);
      }
    }
  }, [isOpen, lead.pitch]);

  // If email is disabled, pick another channel
  useEffect(() => {
    if (isButtonDisabled('email')) {
      setOutreachChannel(findFirstEnabledButton());
    }
  }, [lead.unlockType]);

  // Generate from external API
  const handleGenerate = async () => {
    setIsGenerating(true);
    // Validate custom focus requirement
    if (outreachChannel === 'proposal' && 
        proposalContentType === 'custom' && 
        !customFocus.trim()) {
      setToastMessage('Please enter your specific topic or focus area');
      setToastType('error');
      setShowToast(true);
      setIsGenerating(false);
      return;
    }

    try {
      const contextData = {
        outreach_pathways: lead.outreachPathways || null,
        unlock_value: lead.unlockValue || null,
        unlock_type: lead.unlockType || null,
        location:
          `${lead.city || ''}${
            lead.city && (lead.state || lead.region) ? ', ' : ''
          }${lead.state || ''}${
            lead.state && lead.region ? ', ' : ''
          }${lead.region || ''}`.trim() || null,
        organization: lead.organization || null,
        event_url: lead.eventUrl || null,
        event_name: lead.eventName || null,
        event_info: (lead as any).eventInfo || null,
        job_title: lead.jobTitle || null,
        lead_name: lead.lead_name || null,
        ...(isPitching && { pitching: selectedService }),
        ...(showMyContext && profile?.offering && {
          message_context: profile.offering,
        }),
        ...(profile?.display_name && {
          display_name: profile.display_name,
        }),
        outreach_channel: outreachChannel,
        ...(outreachChannel === 'email' && {
          email_written_from: emailWrittenFrom === 'myself' ? 'My Profile' : 'My Team/Manager'
        }),
        ...(outreachChannel === 'linkedin' && {
          linkedin_note: linkedinNoteType === 'smart' ? 'Smart Personalization' : 'Event Focused'
        }),
        ...(outreachChannel === 'proposal' && {
          submission_content: proposalContentType === 'smart' ? 'Smart Match' : 'Custom Focus',
          ...(proposalContentType === 'custom' && {
            custom_focus: customFocus
          })
        }),
      };

      const response = await fetch('https://n8n.speakerdrive.com/webhook/composer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contextData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      console.log('Raw result from composer:', result);

      let rawArray: any[] = [];
      if (Array.isArray(result)) {
        rawArray = result;
      } else if (Array.isArray(result.messages)) {
        rawArray = result.messages;
      } else {
        rawArray = [result];
      }

      // Convert \n to <br> for Tiptap
      const parsedMessageOptions = rawArray.map((item: any) => {
        let text = item.response || '';
        text = text.replace(/\\n/g, '\n');
        text = text.replace(/\n/g, '<br>');
        return {
          message: text,
          keyElements: item.keyElements || [],
        };
      });

      if (!parsedMessageOptions.length) {
        throw new Error('No valid messages returned from the server');
      }

      setMessageOptions(parsedMessageOptions);
      setSelectedOptionIndex(0);
      setHtmlContent(parsedMessageOptions[0].message);

      setShowMessage(true);
      setShowInputs(false);
    } catch (err) {
      console.error(err);
      setHtmlContent('<p>We encountered an error. Please contact the administrators.</p>');
      setShowMessage(true);
      setShowInputs(false);
    } finally {
      setIsGenerating(false);
    }
  };

  // Next message option
  const refreshOption = () => {
    if (!messageOptions.length) return;
    const newIndex = (selectedOptionIndex + 1) % messageOptions.length;
    setSelectedOptionIndex(newIndex);
    setHtmlContent(messageOptions[newIndex].message);
  };

  // Copy final HTML
  const handleCopyOutreach = async () => {
    setIsCopying(true);
    try {
      // Use the Clipboard API to copy both plain text and HTML
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/plain': new Blob([document.querySelector('.ProseMirror')?.textContent || ''], { type: 'text/plain' }),
          'text/html': new Blob([htmlContent], { type: 'text/html' })
        })
      ]);
      
      setToastMessage('Outreach message copied');
      setToastType('success');
      setShowToast(true);
    } catch (error) {
      console.error(error);
      // Fallback to basic clipboard API if the advanced one fails
      try {
        await navigator.clipboard.writeText(htmlContent);
        setToastMessage('Outreach message copied (formatting may be limited)');
        setToastType('success');
        setShowToast(true);
      } catch (fallbackError) {
        console.error(fallbackError);
        setToastMessage('Failed to copy message');
        setToastType('error');
        setShowToast(true);
      }
    } finally {
      setIsCopying(false);
    }
  };

  // Called by the "Scroll" button
  const handleScrollDown = () => {
    console.log('Scrolling to bottom...');
  };

  // Save pitch
  const handleSavePitch = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('unlocked_leads')
        .update({ pitch: htmlContent })
        .eq('id', lead.unlocked_lead_id);

      if (error) throw error;
      lead.pitch = htmlContent;
      setToastMessage('Message saved successfully');
      setToastType('success');
      setShowToast(true);
    } catch (err) {
      console.error(err);
      setToastMessage('Failed to save message');
      setToastType('error');
      setShowToast(true);
    } finally {
      setIsSaving(false);
    }
  };

  // Example submission
  const handleSubmit = async () => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    const plainText = tempDiv.innerText.trim() || '';

    if (!plainText || isSubmitting || plainText.length > 1000) return;
    try {
      setIsSubmitting(true);
      // ... your sending logic ...
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
      setHtmlContent('');
    }
  };

  if (!isOpen) return null;

  const isAfterState = showMessage && !isPreviewMode && !isGenerating;
  const currentKeyElements = isAfterState
    ? messageOptions[selectedOptionIndex]?.keyElements || []
    : [];

  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose}>
      <div
        className="absolute inset-y-0 right-0 w-screen max-w-lg pointer-events-auto flex flex-col min-h-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative flex-1 overflow-y-auto bg-white shadow-2xl rounded-l-2xl flex flex-col min-h-0">
          
          {/* HEADER */}
          <EmailComposerHeader
            lead={lead}
            onClose={onClose}
            truncateText={truncateText}
          />

          {/* MAIN BODY (fills space above footer) */}
          <div className="px-4 flex-1 flex flex-col h-full overflow-y-auto">
            {/* BEFORE: choose channel */}
            {showInputs && !isPreviewMode && !showMessage && (
              <div className="overflow-y-auto">
                <div className="mb-2 border-b border-gray-200 pb-2">
                  <p className="mb-3 text-sm font-medium text-gray-700">
                    Outreach Channel
                  </p>
                  <div className="flex items-center gap-2 pl-3">
                    {[
                      { id: 'email' as MessageType, icon: Mail, label: 'Email' },
                      { id: 'linkedin' as MessageType, icon: Linkedin, label: 'LinkedIn' },
                      { id: 'proposal' as MessageType, icon: FileText, label: 'Apply' },
                    ].map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setOutreachChannel(type.id)}
                        disabled={isButtonDisabled(type.id)}
                        className={`
                          inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-all
                          ${
                            isButtonDisabled(type.id)
                              ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400 border border-gray-200'
                              : outreachChannel === type.id
                              ? 'bg-blue-500 border-blue-500 text-white shadow-sm'
                              : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                          }
                        `}
                      >
                        <type.icon className="w-3.5 h-3.5" />
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                <OutreachSettingsPanel
                  showAdvanced={showAdvanced}
                  isPitching={isPitching}
                  setIsPitching={setIsPitching}
                  showMyContext={showMyContext}
                  setShowMyContext={setShowMyContext}
                  profileOffering={profile?.offering}
                  profileServicesString={profile?.services}
                  selectedService={selectedService}
                  setSelectedService={setSelectedService}
                  parseProfileServices={parseProfileServices}
                  outreachChannel={outreachChannel}
                  setOutreachChannel={setOutreachChannel}
                  emailWrittenFrom={emailWrittenFrom}
                  setEmailWrittenFrom={setEmailWrittenFrom}
                  linkedinNoteType={linkedinNoteType}
                  setLinkedinNoteType={setLinkedinNoteType}
                  proposalContentType={proposalContentType}
                  setProposalContentType={setProposalContentType}
                  customFocus={customFocus}
                  setCustomFocus={setCustomFocus}
                  lead={lead}
                />
              </div>
            )}

            {/* PREVIEW mode */}
            {isPreviewMode && !showMessage && (
              <div className="bg-white border border-gray-200 rounded-md shadow-sm">
                <div className="p-4">
                  <MessagePreview
                    contentHTML={htmlContent}
                    type={outreachChannel}
                    lead={lead}
                  />
                </div>
              </div>
            )}

            {/* AFTER: main Editor (75%) + Why This Works (25%) */}
            {isAfterState && (
              <div className="flex flex-col h-full min-h-0">
                {/* Top 75%: Editor */}
                <div className="flex-1 basis-3/4 min-h-0 flex flex-col overflow-hidden mb-4">
                  <TiptapEditor
                    content={htmlContent}
                    onUpdate={(val) => setHtmlContent(val)}
                    handleCopyOutreach={handleCopyOutreach}
                    handleScrollDown={handleScrollDown}
                    isCopying={isCopying}
                  />
                </div>

                {/* Bottom 25%: Why This Works */}
                {!!currentKeyElements.length && (
                  <div className="flex-none basis-1/4 min-h-0 flex flex-col overflow-hidden">
                    <div className="border border-gray-200 rounded-lg shadow-sm flex flex-col overflow-hidden h-full">
                      <div className="h-[2px] bg-gradient-to-r from-green-200 to-green-300" />
                      <div className="flex-1 p-4 bg-white overflow-y-auto">
                        <h3 className="text-base font-semibold text-gray-900 mb-3">
                          Why This Works
                        </h3>
                        <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
                          {currentKeyElements.map((el, idx) => (
                            <li key={idx}>{el}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* FOOTER (button row) */}
          <EmailComposerFooter
            showMessage={showMessage}
            isGenerating={isGenerating}
            isSaving={isSaving}
            showInputs={showInputs}
            isPreviewMode={isPreviewMode}
            input={htmlContent}
            leadPitch={lead.pitch}
            handleGenerate={handleGenerate}
            handleSavePitch={handleSavePitch}
            togglePreviewMode={() => setIsPreviewMode(!isPreviewMode)}
            onBackToEditor={() => {
              setShowMessage(false);
              setShowInputs(true);
              setIsPreviewMode(false);
            }}
            messageOptionsCount={messageOptions.length}
            selectedOptionIndex={selectedOptionIndex}
            onRefresh={refreshOption}
            lead={{
              leadType: lead.leadType,
              lead_name: lead.lead_name,
              region: lead.region,
              state: lead.state,
              city: lead.city,
              unlockType: lead.unlockType,
              eventName: lead.eventName,
            }}
            displayName={profile?.display_name}
          />
        </div>
      </div>

      {/* Toast notification */}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}
