import React, { useState, useRef, useEffect } from 'react';
import {
  Mail,
  Linkedin,
  FileText,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

import EmailComposerHeader from './EmailComposerHeader';
import OutreachSettingsPanel from './OutreachSettingsPanel';
import EmailComposerFooter from './EmailComposerFooter';

import { useProfile } from '../../hooks/useProfile';
import { services } from '../../utils/constants';
import { supabase } from '../../lib/supabase';
import Toast from '../ui/Toast';

interface EmailComposerProps {
  lead: {
    leadType: 'Contact' | 'Event';
    leadName: string;
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
    unlockType?: any;
    organization?: any;
    location?: any;
    eventUrl?: any;
    city?: any;
    state?: any;
    region?: any;
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

/** For “Preview” mode display */
interface PreviewProps {
  content: string;
  type: MessageType;
  lead: EmailComposerProps['lead'];
}

const MessagePreview = ({ content, type, lead }: PreviewProps) => {
  const renderContent = (text: string) => (
    <div className="text-[16px] leading-[1.7] text-[#1F2937] tracking-[-0.011em] font-normal max-w-[70ch] whitespace-pre-wrap">
      <ReactMarkdown>{text}</ReactMarkdown>
    </div>
  );

  if (type === 'email') {
    return (
      <div>
        {content
          ? renderContent(content)
          : <span className="text-gray-400">Your email content will appear here...</span>
        }
      </div>
    );
  }

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
          {content
            ? renderContent(content)
            : <span className="text-gray-400">Your LinkedIn message will appear here...</span>
          }
        </div>
      </div>
    );
  }

  // Otherwise "proposal"
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{lead.eventName}</h1>
        <div className="space-y-6">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Speaking Proposal</h2>
            {content
              ? renderContent(content)
              : <span className="text-gray-400">Your proposal content will appear here...</span>
            }
          </section>
        </div>
      </div>
    </div>
  );
};

export default function EmailComposer({ lead, isOpen, onClose }: EmailComposerProps) {
  const { profile } = useProfile();

  // The text input displayed after generation
  const [input, setInput] = useState(lead.pitch || '');

  // Outreach channel
  const [outreachChannel, setOutreachChannel] = useState<MessageType>('email');

  // “Advanced settings”
  const [showAdvanced] = useState(true); // always show advanced
  const [isPitching, setIsPitching] = useState(true);
  const [selectedService, setSelectedService] = useState<string>('');
  const [showMyContext, setShowMyContext] = useState(true);
  const [showCustomization, setShowCustomization] = useState(false);
  const [customizationText, setCustomizationText] = useState('');

  // “Before” vs. “After”
  const [showInputs, setShowInputs] = useState(true);
  const [showMessage, setShowMessage] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Busy states
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // If you want “enter to send”
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // For the header
  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  // Disable logic for certain channels based on unlockType
  const isButtonDisabled = (buttonId: string) => {
    return (
      (buttonId === 'proposal' && lead.unlockType === 'Unlock Contact Email') ||
      ((buttonId === 'linkedin' || buttonId === 'proposal') && lead.unlockType === 'Unlock Event Email') ||
      ((buttonId === 'email' || buttonId === 'linkedin') && lead.unlockType === 'Unlock Event URL')
    );
  };

  const findFirstEnabledButton = () => {
    const channels: MessageType[] = ['email', 'linkedin', 'proposal'];
    return channels.find((ch) => !isButtonDisabled(ch)) || 'email';
  };

  // Default service (pick first from user profile or fallback to the first in the list)
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

  // If there's already a pitch in the lead
  useEffect(() => {
    if (lead.pitch) {
      setInput(lead.pitch);
      setShowMessage(true);
      setShowInputs(false);
    } else {
      setShowMessage(false);
      setShowInputs(true);
    }
  }, [lead.pitch]);

  // If the modal just opened
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

  // If email is disabled, find another default
  useEffect(() => {
    if (isButtonDisabled('email')) {
      setOutreachChannel(findFirstEnabledButton());
    }
  }, [lead.unlockType]);

  // Press enter to submit
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!input.trim() || isSubmitting || input.length > 1000) return;
    try {
      setIsSubmitting(true);
      // your actual sending logic ...
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
      setInput('');
    }
  };

  // MULTIPLE MESSAGE OPTIONS
  const [messageOptions, setMessageOptions] = useState<
    { message: string; keyElements: string[] }[]
  >([]);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);

  // Our handleGenerate
  const handleGenerate = async () => {
    setIsGenerating(true);

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
      lead_name: lead.leadName || (lead as any).lead_name || null,

      ...(isPitching && {
        pitching: selectedService,
      }),
      ...(showMyContext && profile?.offering && {
        message_context: profile.offering,
      }),
      ...(profile?.display_name && {
        display_name: profile.display_name,
      }),
      outreach_channel: outreachChannel,
      ...(showCustomization && customizationText.trim() && {
        message_customization: customizationText,
      }),
    };

    try {
      const response = await fetch('https://n8n.speakerdrive.com/webhook/composer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contextData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Raw result from n8n:', result);

      let rawArray: any[] = [];
      if (Array.isArray(result)) {
        rawArray = result;
      } else if (Array.isArray(result.messages)) {
        rawArray = result.messages;
      } else {
        rawArray = [result];
      }

      const parsedMessageOptions = rawArray.map((item: any) => ({
        message: (item.response || '')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/\\n/g, '\n'),
        keyElements: item.keyElements || [],
      }));

      console.log('Parsed message options:', parsedMessageOptions);

      if (parsedMessageOptions.length === 0) {
        throw new Error('No valid messages returned from the server');
      }

      setMessageOptions(parsedMessageOptions);
      setSelectedOptionIndex(0);

      // Use first message
      setInput(parsedMessageOptions[0].message);

      // Switch to "after" state
      setShowMessage(true);
      setShowInputs(false);
    } catch (err) {
      console.error(err);
      setInput('We encountered an error. Please contact the administrators.');
      setShowMessage(true);
      setShowInputs(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const refreshOption = () => {
    if (messageOptions.length === 0) return;
    const newIndex = (selectedOptionIndex + 1) % messageOptions.length;
    setSelectedOptionIndex(newIndex);
    setInput(messageOptions[newIndex].message);
  };

  // COPY & SAVE
  const handleCopyOutreach = async () => {
    setIsCopying(true);
    try {
      await navigator.clipboard.writeText(input);
      setToastMessage('Outreach message copied to clipboard');
      setToastType('success');
      setShowToast(true);
    } catch (error) {
      console.error(error);
      setToastMessage('Failed to copy message');
      setToastType('error');
      setShowToast(true);
    } finally {
      setIsCopying(false);
    }
  };

  const handleSavePitch = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('unlocked_leads')
        .update({ pitch: input })
        .eq('id', lead.unlocked_lead_id);

      if (error) throw error;

      lead.pitch = input;
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

  if (!isOpen) return null;

  // AFTER state => gather key elements
  const isAfterState = showMessage && !isPreviewMode && !isGenerating;
  const currentKeyElements = isAfterState
    ? messageOptions[selectedOptionIndex]?.keyElements || []
    : [];

  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose}>
      <div
        className="absolute inset-y-0 right-0 w-screen max-w-lg pointer-events-auto
                   flex flex-col min-h-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* White panel with rounded left side */}
        <div className="relative flex-1 overflow-y-auto bg-white shadow-2xl rounded-l-2xl flex flex-col min-h-0">
          
          {/* Header */}
          <EmailComposerHeader
            lead={lead}
            onClose={onClose}
            truncateText={truncateText}
          />

          {/* Scrollable Middle */}
          <div className="p-4 flex-1 flex flex-col min-h-0">
            
            {/* BEFORE */}
            {showInputs && !isPreviewMode && !showMessage && (
              <div>
                {/* Outreach Channel */}
                <div className="mb-4 border-b border-gray-200 pb-4">
                  {/* Tier 1 heading */}
                  <p className="mb-3 text-sm font-medium text-gray-700">
                    Outreach Channel
                  </p>
                  {/* Tier 2 (same as toggles): channel buttons */}
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
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-all
                          ${
                            isButtonDisabled(type.id)
                              ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400 border border-gray-200'
                              : outreachChannel === type.id
                              ? 'bg-blue-500 border-blue-500 text-white shadow-sm'
                              : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                          }`
                        }
                      >
                        <type.icon className="w-3.5 h-3.5" />
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Outreach Settings Panel */}
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
                  showCustomization={showCustomization}
                  setShowCustomization={setShowCustomization}
                  customizationText={customizationText}
                  setCustomizationText={setCustomizationText}
                />
              </div>
            )}

            {/* PREVIEW */}
            {isPreviewMode && !showMessage && (
              <div className="bg-white border border-gray-200 rounded-md shadow-sm">
                <div className="p-4">
                  <MessagePreview
                    content={input}
                    type={outreachChannel}
                    lead={lead}
                  />
                </div>
              </div>
            )}

            {/* AFTER state */}
            {isAfterState && (
              <div className="flex flex-col flex-1 min-h-0">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Your message to ${lead.leadName}...`}
                  className="
                    w-full 
                    text-[16px] leading-[1.7] text-[#1F2937] tracking-[-0.011em] font-normal
                    placeholder:text-gray-400 
                    focus:outline-none focus:ring-0 focus:border-0 
                    resize-none 
                    p-3 
                    flex-grow min-h-0 
                    max-w-[70ch]
                  "
                />

                {!!currentKeyElements.length && (
                  <div className="mt-3 border border-gray-200 rounded-md shadow-sm overflow-hidden">
                    {/* Subtle 1px gradient bar */}
                    <div className="h-[1px] bg-gradient-to-r from-green-200 to-green-300" />
                    <div className="p-4 bg-white">
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
                )}
              </div>
            )}
          </div>

          {/* FOOTER pinned at bottom */}
          <EmailComposerFooter
            showMessage={showMessage}
            isGenerating={isGenerating}
            isCopying={isCopying}
            isSaving={isSaving}
            showInputs={showInputs}
            isPreviewMode={isPreviewMode}
            input={input}
            leadPitch={lead.pitch}
            handleGenerate={handleGenerate}
            handleCopyOutreach={handleCopyOutreach}
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
          />
        </div>
      </div>

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
