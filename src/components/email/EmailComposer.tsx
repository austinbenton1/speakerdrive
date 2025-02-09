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

/** Rendered content in “Preview” mode */
interface PreviewProps {
  content: string;
  type: MessageType;
  lead: EmailComposerProps['lead'];
}

const MessagePreview = ({ content, type, lead }: PreviewProps) => {
  const renderContent = (text: string) => (
    <ReactMarkdown>{text}</ReactMarkdown>
  );

  if (type === 'email') {
    return (
      <div className="prose prose-sm max-w-none">
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
          <div className="text-[15px] text-gray-900">
            {content
              ? renderContent(content)
              : <span className="text-gray-400">Your LinkedIn message will appear here...</span>
            }
          </div>
        </div>
      </div>
    );
  }

  // Otherwise "proposal" (Apply)
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{lead.eventName}</h1>
        <div className="space-y-6">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Speaking Proposal</h2>
            <div className="prose prose-sm max-w-none">
              {content
                ? renderContent(content)
                : <span className="text-gray-400">Your proposal content will appear here...</span>
              }
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default function EmailComposer({ lead, isOpen, onClose }: EmailComposerProps) {
  const { profile } = useProfile();

  // The actual text input (pitch) displayed after generation
  const [input, setInput] = useState(lead.pitch || '');

  // Outreach channel (Email / LinkedIn / Apply)
  const [outreachChannel, setOutreachChannel] = useState<MessageType>('email');

  // “Advanced settings”
  const [showAdvanced, setShowAdvanced] = useState(true);
  const [isPitching, setIsPitching] = useState(true);
  const [selectedService, setSelectedService] = useState<string>('');
  const [showMyContext, setShowMyContext] = useState(true);
  const [showCustomization, setShowCustomization] = useState(false);
  const [customizationText, setCustomizationText] = useState('');
  const [showAdditionalServices, setShowAdditionalServices] = useState(false);
  const [messageFormat, setMessageFormat] = useState<'concise' | 'expanded'>('concise');

  // States controlling the “before” vs. “after” flow
  const [showInputs, setShowInputs] = useState(true);   // “before” we have a final message
  const [showMessage, setShowMessage] = useState(false); // “after” we have generated or loaded a message
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

  // If you want “enter to send”:
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // For the header
  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  // Channel restrictions
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

  // On mount, see if the user’s profile has a default service
  useEffect(() => {
    if (profile?.services) {
      const pServices = parseProfileServices(profile.services);
      const matchingService = services.find((svc) =>
        pServices.some((ps) => svc.id === ps),
      );
      if (matchingService) {
        setSelectedService(matchingService.id);
      }
    }
  }, [profile?.services]);

  // If there's already a pitch in the lead, show it “after” by default
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

  // If the modal just opened, reset
  useEffect(() => {
    if (isOpen) {
      if (lead.pitch) {
        setShowMessage(true);
        setShowInputs(false);
      } else {
        setShowMessage(false);
        setShowInputs(true);
      }
      setSelectedService('');
    }
  }, [isOpen, lead.pitch]);

  // If “email” is disabled, pick another channel
  useEffect(() => {
    if (isButtonDisabled('email')) {
      setOutreachChannel(findFirstEnabledButton());
    }
  }, [lead.unlockType]);

  // “Enter to submit”
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

  const handleGenerate = async () => {
    setIsGenerating(true);

    const contextData = {
      outreach_pathways: lead.outreachPathways || null,
      unlock_value: lead.unlockValue || null,
      unlock_type: lead.unlockType || null,
      organization: lead.organization || null,
      location: `${lead.city || ''}${
        lead.city && (lead.state || lead.region) ? ', ' : ''
      }${lead.state || ''}${lead.state && lead.region ? ', ' : ''}${
        lead.region || ''
      }`.trim() || null,
      event_url: lead.eventUrl || null,
      event_name: lead.eventName || null,
      event_info: (lead as any).eventInfo || null,
      job_title: lead.jobTitle || null,
      lead_name: lead.leadName || (lead as any).lead_name || null,

      // advanced toggles
      ...(isPitching && {
        pitching:
          selectedService ||
          (profile?.services ? parseProfileServices(profile.services)[0] : null),
      }),
      ...(showMyContext && profile?.offering && {
        message_context: profile.offering,
      }),
      ...(profile?.display_name && {
        display_name: profile.display_name,
      }),
      message_format: messageFormat === 'concise' ? 'email' : 'proposal',
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
      const responseData = Array.isArray(result) ? result[0] : result;
      const generated = responseData?.response;
      if (!generated) throw new Error('No response content returned');

      const decodedResponse = generated
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\\n/g, '\n');

      setInput(decodedResponse);
      // Now show the final “To:” + message area
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

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50" onClick={onClose}>
      <div className="fixed inset-y-0 right-0 flex max-w-full">
        <div
          className="w-screen max-w-lg transform transition-transform duration-500 ease-in-out translate-x-0 pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex h-full flex-col overflow-hidden bg-white shadow-2xl rounded-l-2xl">
            
            {/* Header */}
            <EmailComposerHeader
              lead={lead}
              onClose={onClose}
              truncateText={truncateText}
            />

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-y-auto">

              {/* BEFORE state: advanced settings only (no “To” or message area) */}
              {showInputs && !isPreviewMode && !showMessage && (
                <div className="flex-1">
                  {/* Outreach Channel buttons */}
                  <div className="bg-white p-4 border-b border-gray-200">
                    <p className="mb-3 text-sm font-medium text-gray-700">
                      Outreach Channel
                    </p>
                    <div className="flex items-center gap-2">
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
                                ? 'text-[#0066FF] border border-[#0066FF]/20 bg-blue-50/50 hover:bg-blue-50 shadow-[0_1px_2px_rgba(0,108,255,0.05)]'
                                : 'text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 shadow-sm'
                            }
                          `}
                        >
                          <type.icon className="w-3.5 h-3.5" />
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Re-insert unlock_value display under channel buttons */}
                  {lead.unlockValue && (
                    <div className="flex items-center bg-blue-50 px-4 py-2">
                      <span className="text-sm font-medium text-blue-700 ml-2">
                        {lead.unlockValue}
                      </span>
                    </div>
                  )}

                  {/* Our advanced outreach settings (including My Context) */}
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
                    showAdditionalServices={showAdditionalServices}
                    setShowAdditionalServices={setShowAdditionalServices}
                    parseProfileServices={parseProfileServices}
                    messageFormat={messageFormat}
                    setMessageFormat={setMessageFormat}
                    showCustomization={showCustomization}
                    setShowCustomization={setShowCustomization}
                    customizationText={customizationText}
                    setCustomizationText={setCustomizationText}
                  />
                </div>
              )}

              {/* PREVIEW mode (still “before” state, but user wants a quick look) */}
              {isPreviewMode && !showMessage && (
                <div className="flex-1 p-4">
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    {outreachChannel === 'email' && (
                      <div className="border-b border-gray-200 bg-gray-50 p-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600">To:</span>
                            <span className="text-sm font-medium">{lead.unlockValue}</span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="p-4">
                      <MessagePreview
                        content={input}
                        type={outreachChannel}
                        lead={lead}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* AFTER state: final “To:” + message area (only shown after generate) */}
              {showMessage && !isGenerating && !isPreviewMode && (
                <div className="flex-1 p-4">
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">

                    {/* “To:” line only if emailing */}
                    {outreachChannel === 'email' && (
                      <div className="border-b border-gray-200 bg-gray-50 p-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600">To:</span>
                            <span className="text-sm font-medium">{lead.unlockValue}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Final text area to edit the generated message */}
                    <div className="p-4">
                      <div className="relative">
                        <textarea
                          ref={textareaRef}
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder={`Your message to ${lead.leadName}...`}
                          className="w-full resize-none text-gray-900 placeholder:text-gray-400 focus:outline-none text-sm leading-relaxed min-h-[450px] bg-transparent focus:ring-0 focus:border-0"
                          style={{ minHeight: '450px' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer with Generate, Preview, Copy, etc. */}
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
                // revert to “before” state
                setShowMessage(false);
                setShowInputs(true);
                setIsPreviewMode(false);
              }}
            />
          </div>
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
