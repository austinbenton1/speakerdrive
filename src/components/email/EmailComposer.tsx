import React, { useState, useRef, useEffect } from 'react';
import { 
  PaperclipIcon, Image, Send, X, Wand2, ArrowUpDown, ArrowLeft,
  ShrinkIcon, MoreHorizontal, Lock, Trash2, Link, TextSelect,
  FileText, Mail, Linkedin, ChevronDown, Edit2, Eye, Copy,
  GraduationCap, Presentation, Target, Briefcase, Users, Plus
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { 
  MinimalToggle 
} from '../ui/toggle';
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
  };
  isOpen: boolean;
  onClose: () => void;
}

type MessageType = 'proposal' | 'linkedin' | 'email';

// Helper function to parse services string from profile
const parseProfileServices = (services: string | null): string[] => {
  if (!services) return [];
  
  try {
    if (services.startsWith('[') && services.endsWith(']')) {
      return JSON.parse(services);
    }
    return [services]; // Single service as string
  } catch {
    return [];
  }
};

interface PreviewProps {
  content: string;
  type: MessageType;
  lead: EmailComposerProps['lead'];
}

const MessagePreview = ({ content, type, lead }: PreviewProps) => {
  // Helper function to format text with markdown
  const renderContent = (text: string) => {
    return (
      <ReactMarkdown
        components={{
          // Override default element styling
          p: ({node, ...props}) => <p className="mb-4 last:mb-0" {...props} />,
          h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-4" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-xl font-bold mb-3" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-lg font-bold mb-2" {...props} />,
          ul: ({node, ...props}) => (
            <ul className="mb-4 last:mb-0 space-y-0" {...props} />
          ),
          ol: ({node, ...props}) => (
            <ol className="mb-4 last:mb-0 space-y-0" {...props} />
          ),
          li: ({node, children, ...props}) => {
            const content = React.Children.toArray(children).map(child => {
              // If it's a paragraph, extract its children to remove the wrapping <p>
              if (React.isValidElement(child) && child.type === 'p') {
                return child.props.children;
              }
              return child;
            });
            
            return (
              <li className="relative pl-5" {...props}>
                <span className="absolute left-0">•</span>
                {content}
              </li>
            );
          },
          a: ({node, ...props}) => (
            <a 
              className="text-blue-600 hover:underline" 
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
          blockquote: ({node, ...props}) => (
            <blockquote 
              className="border-l-4 border-gray-200 pl-4 italic my-4" 
              {...props}
            />
          ),
          code: ({node, inline, ...props}) => 
            inline ? (
              <code className="bg-gray-100 rounded px-1 py-0.5" {...props} />
            ) : (
              <code className="block bg-gray-100 rounded p-3 my-4 whitespace-pre-wrap" {...props} />
            ),
          hr: ({node, ...props}) => <hr className="my-4 border-gray-200" {...props} />,
          strong: ({node, ...props}) => <strong className="font-semibold" {...props} />,
          em: ({node, ...props}) => <em className="italic" {...props} />,
        }}
      >
        {text}
      </ReactMarkdown>
    );
  };

  if (type === 'email') {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 p-4">
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">To:</span>
              <span className="text-sm font-medium">{lead.email || 'recipient@example.com'}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Subject:</span>
              <span className="text-sm font-medium">Speaking Opportunity: {lead.eventName}</span>
            </div>
          </div>
        </div>
        <div className="p-4">
          <div className="prose prose-sm max-w-none">
            {content ? renderContent(content) : (
              <span className="text-gray-400">Your email content will appear here...</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (type === 'linkedin') {
    return (
      <div className="bg-[#F3F2EF] rounded-lg p-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
            <div>
              <div className="text-sm font-medium">You</div>
              <div className="text-xs text-gray-500">1st</div>
            </div>
          </div>
          <div className="text-[15px] text-gray-900">
            {content ? renderContent(content) : (
              <span className="text-gray-400">Your LinkedIn message will appear here...</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{lead.eventName}</h1>
        <div className="space-y-6">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Speaking Proposal</h2>
            <div className="prose prose-sm max-w-none">
              {content ? renderContent(content) : (
                <span className="text-gray-400">Your proposal content will appear here...</span>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default function EmailComposer({ lead, isOpen, onClose }: EmailComposerProps) {
  const { profile } = useProfile();
  const [input, setInput] = useState(lead.pitch || '');
  const [outreachChannel, setOutreachChannel] = useState<MessageType>('email');
  const [messageFormat, setMessageFormat] = useState<'concise' | 'expanded'>('concise');
  const [showMyContext, setShowMyContext] = useState(true);
  const [showLeadContext, setShowLeadContext] = useState(true);
  const [showCustomization, setShowCustomization] = useState(false);
  const [showAdditionalServices, setShowAdditionalServices] = useState(false);
  const [isPitching, setIsPitching] = useState(true);
  const [customizationText, setCustomizationText] = useState('');
  const [selectedService, setSelectedService] = useState<string>('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showInputs, setShowInputs] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [isCopying, setIsCopying] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Helper function to truncate text
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  // Helper function to check if a button is disabled
  const isButtonDisabled = (buttonId: string) => {
    return (
      (buttonId === 'proposal' && lead.unlockType === 'Unlock Contact Email') ||
      ((buttonId === 'linkedin' || buttonId === 'proposal') && lead.unlockType === 'Unlock Event Email') ||
      ((buttonId === 'email' || buttonId === 'linkedin') && lead.unlockType === 'Unlock Event URL')
    );
  };

  // Helper function to find the first enabled button
  const findFirstEnabledButton = () => {
    const buttons = ['email', 'linkedin', 'proposal'];
    return buttons.find(buttonId => !isButtonDisabled(buttonId)) || 'email';
  };

  // Initialize the selected service when component mounts
  useEffect(() => {
    if (profile?.services) {
      const profileServices = parseProfileServices(profile.services);
      
      // Find the service that matches the profile's service
      const matchingService = services.find(service => 
        profileServices.some(ps => service.id === ps)
      );

      if (matchingService) {
        setSelectedService(matchingService.id);
      }
    }
  }, [profile?.services]); // Only run when profile services change

  useEffect(() => {
    setShowMyContext(true);
  }, []);

  // Initialize input with pitch if available
  useEffect(() => {
    if (lead.pitch) {
      setInput(lead.pitch);
      setShowMessage(true);  // Show Response textarea
      setShowInputs(false);  // Hide Editor
    } else {
      setShowMessage(false); // Hide Response textarea
      setShowInputs(true);   // Show Editor
    }
  }, [lead.pitch]);

  useEffect(() => {
    // Reset states when modal is opened
    if (isOpen) {
      if (lead.pitch) {
        setShowMessage(true);  // Show Response textarea
        setShowInputs(false);  // Hide Editor
      } else {
        setShowMessage(false); // Hide Response textarea
        setShowInputs(true);   // Show Editor
      }
      setSelectedService(null);
    }
  }, [isOpen, lead.pitch]);

  useEffect(() => {
    if (isButtonDisabled('email')) {
      setOutreachChannel(findFirstEnabledButton() as MessageType);
    }
  }, [lead.unlockType]);

  const handleSubmit = async () => {
    if (!input.trim() || isSubmitting || input.length > 1000) return;
    
    try {
      setIsSubmitting(true);
      // TODO: Implement email sending logic
      onClose();
    } catch (error) {
      throw error;
    } finally {
      setIsSubmitting(false);
      setInput('');
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    // Collect data for context
    const contextData = {
      // Lead details
      detailed_info: lead.detailedInfo || null,
      outreach_pathways: lead.outreachPathways || null,
      unlock_value: lead.unlockValue || null,
      unlock_type: lead.unlockType || null,
      organization: lead.organization || null,
      location: `${lead.city || ''}${lead.city && (lead.state || lead.region) ? ', ' : ''}${lead.state || ''}${lead.state && lead.region ? ', ' : ''}${lead.region || ''}`.trim() || null,
      event_url: lead.eventUrl || null,
      event_name: lead.eventName || null,
      job_title: lead.jobTitle || null,
      lead_name: lead.lead_name || null,

      // EmailComposer details
      ...(isPitching && { pitching: selectedService || (profile?.services ? parseProfileServices(profile.services)[0] : null) }),
      ...(showMyContext && profile?.offering && { message_context: profile.offering }),
      message_format: messageFormat === 'concise' ? 'email' : 'proposal',
      outreach_channel: outreachChannel,
      ...(showCustomization && customizationText?.trim() && { message_customization: customizationText })
    };

    try {
      // Send data to webhook
      const response = await fetch('https://n8n.speakerdrive.com/webhook/composer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contextData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Check if result is an array and get the first item
      const responseData = Array.isArray(result) ? result[0] : result;
      
      // Extract the 'response' field from the n8n response
      const generatedResponse = responseData?.response;
      
      if (!generatedResponse) {
        throw new Error('No response content in the n8n response');
      }

      // Decode any HTML entities and preserve special characters
      const decodedResponse = generatedResponse
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\\n/g, '\n');  // Preserve newlines

      // Show message and update UI with the decoded response
      setShowMessage(true);
      setShowInputs(false);
      setInput(decodedResponse);
    } catch (error) {
      setInput("We encountered an error. Please contact the administrators.");
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
      console.error('Error copying to clipboard:', error);
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

      // Update the lead.pitch value to match the saved input
      lead.pitch = input;

      setToastMessage('Message saved successfully');
      setToastType('success');
      setShowToast(true);
    } catch (error) {
      console.error('Error saving pitch:', error);
      setToastMessage('Failed to save message');
      setToastType('error');
      setShowToast(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!isOpen) return null;

  // Get the header title
  const headerTitle = lead.unlockType === 'Unlock Contact Email'
    ? `${lead.lead_name}${lead.jobTitle ? `, ${lead.jobTitle}` : ''}`
    : lead.eventName || '';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50" onClick={onClose}>
      <div className="fixed inset-y-0 right-0 flex max-w-full">
        <div 
          className="w-screen max-w-lg transform transition-transform duration-500 ease-in-out translate-x-0 pointer-events-auto"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex h-full flex-col overflow-hidden bg-white shadow-2xl rounded-l-2xl">
            {/* Lead Info Header */}
            <div className="relative">
              <div className={`bg-gradient-to-b ${
                lead.leadType === 'Contact' 
                  ? 'from-blue-50/30 to-white'
                  : 'from-emerald-50/30 to-white'
              } border-b border-gray-200`}>
                <div className="px-6 py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <img
                          src={lead.image}
                          alt={lead.leadType === 'Contact' ? lead.leadName : lead.eventName}
                          className={`h-16 w-16 rounded-xl object-cover shadow-md ${
                            lead.leadType === 'Contact'
                              ? 'ring-2 ring-blue-100'
                              : 'ring-2 ring-emerald-100'
                          }`}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h2 className="text-xl font-semibold text-gray-900 leading-6 break-words">
                          {truncateText(headerTitle, 30)}
                        </h2>
                        <div className="mt-1">
                          <p className="text-sm text-gray-500">
                            {lead.focus}
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="flex-shrink-0 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-y-auto">
              {/* Editor Panel - For configurations */}
              {showInputs && !isPreviewMode && !showMessage && (
                <div className="flex-1">
                  {/* Outreach Channel Selector */}
                  <div className="bg-white p-4 border-b border-gray-200">
                    <p className="mb-3 text-sm font-medium text-gray-700">
                      Outreach Channel
                    </p>
                    <div className="flex items-center gap-2">
                      {[
                        { id: 'email', icon: Mail, label: 'Email' },
                        { id: 'linkedin', icon: Linkedin, label: 'LinkedIn' },
                        { id: 'proposal', icon: FileText, label: 'Apply' }
                      ].map((type) => (
                        <button
                          key={type.id}
                          onClick={() => setOutreachChannel(type.id as MessageType)}
                          disabled={isButtonDisabled(type.id)}
                          className={`
                            inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-all
                            ${isButtonDisabled(type.id) ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400 border border-gray-200' :
                            outreachChannel === type.id
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

                  {/* Unlock Value Display */}
                  {lead.unlockValue && (
                    <div className="flex items-center bg-blue-50 px-4 py-2">
                      <Lock className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium text-blue-700 ml-2">
                        {lead.unlockValue} Credits
                      </span>
                    </div>
                  )}

                  {/* Input Fields */}
                  <div className="bg-white p-4">
                    {/* Advanced Options Panel */}
                    {showAdvanced && (
                      <div className="bg-white rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-3">
                          Outreach Settings
                        </p>
                        <div className="space-y-6 px-3">
                          {/* Services */}
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <MinimalToggle
                                className="scale-[0.35] -ml-1"
                                checked={isPitching}
                                onChange={(e) => setIsPitching(e.target.checked)}
                              />
                              <label className="text-sm font-medium text-gray-900">
                                I'm Pitching
                              </label>
                            </div>
                            {isPitching && (
                              <div className="flex items-center gap-2">
                                {services.slice(0, 3).map((service) => {
                                  const Icon = {
                                    'Presentation': Presentation,
                                    'School': GraduationCap,
                                    'Target': Target,
                                    'Briefcase': Briefcase,
                                    'Users': Users,
                                    'Plus': Plus
                                  }[service.icon];

                                  // Check if this service is in user's profile services
                                  const profileServices = parseProfileServices(profile?.services || '');
                                  const isInProfile = profileServices.some(ps => ps === service.id);
                                  // Use selectedService if set, otherwise fall back to profile selection
                                  const isSelected = selectedService ? selectedService === service.id : isInProfile;

                                  const buttonClasses = [
                                    'relative flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
                                    'transition-colors duration-200',
                                    'border',
                                    isSelected
                                      ? 'bg-blue-500 border-blue-500 text-white shadow-sm'
                                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                  ].join(' ');

                                  return (
                                    <button
                                      key={service.id}
                                      onClick={() => setSelectedService(service.id)}
                                      className={buttonClasses}
                                    >
                                      {Icon && (
                                        <Icon 
                                          className={`w-3 h-3 ${
                                            isSelected
                                              ? 'text-white'
                                              : 'text-gray-500'
                                          }`}
                                        />
                                      )}
                                      {service.label}
                                      {isInProfile && (
                                        <span className="ml-1 w-1.5 h-1.5 rounded-full bg-green-500" />
                                      )}
                                    </button>
                                  );
                                })}
                                <div
                                  className="relative"
                                  onClick={() => setShowAdditionalServices(!showAdditionalServices)}
                                >
                                  <button
                                    className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                                  >
                                    <MoreHorizontal className="w-4 h-4 text-gray-500" />
                                  </button>
                                </div>
                              </div>
                            )}
                            {isPitching && showAdditionalServices && (
                              <div className="flex gap-2 mt-2">
                                {services.slice(3).map((service) => {
                                  const Icon = {
                                    'Presentation': Presentation,
                                    'School': GraduationCap,
                                    'Target': Target,
                                    'Briefcase': Briefcase,
                                    'Users': Users,
                                    'Plus': Plus
                                  }[service.icon];

                                  // Check if this service is in user's profile services
                                  const profileServices = parseProfileServices(profile?.services || '');
                                  const isInProfile = profileServices.some(ps => ps === service.id);
                                  // Use selectedService if set, otherwise fall back to profile selection
                                  const isSelected = selectedService ? selectedService === service.id : isInProfile;

                                  const buttonClasses = [
                                    'relative flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
                                    'transition-colors duration-200',
                                    'border',
                                    isSelected
                                      ? 'bg-blue-500 border-blue-500 text-white shadow-sm'
                                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                  ].join(' ');

                                  return (
                                    <button
                                      key={service.id}
                                      onClick={() => setSelectedService(service.id)}
                                      className={buttonClasses}
                                    >
                                      {Icon && (
                                        <Icon 
                                          className={`w-3 h-3 ${
                                            isSelected
                                              ? 'text-white'
                                              : 'text-gray-500'
                                          }`}
                                        />
                                      )}
                                      {service.label}
                                      {isInProfile && (
                                        <span className="ml-1 w-1.5 h-1.5 rounded-full bg-green-500" />
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          {/* My Context */}
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <MinimalToggle 
                                className="scale-[0.35] mr-1" 
                                checked={showMyContext}
                                onChange={(e) => setShowMyContext(e.target.checked)}
                              />
                              <label className="text-sm font-medium text-gray-900">
                                My Context
                              </label>
                            </div>
                            {showMyContext && (
                              <div className="flex items-center gap-2">
                                <p className="text-sm text-gray-600 flex-1 min-w-0">
                                  <span className={`inline ${profile?.offering ? '' : 'italic'}`}>
                                    {truncateText(profile?.offering || "Award-winning keynote speaker specializing in leadership and innovation", 130)}
                                  </span>
                                  <a 
                                    href="/settings"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:text-blue-700 hover:underline ml-1"
                                  >
                                    Edit
                                  </a>
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Message Format */}
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <label className="text-sm font-medium text-gray-900">
                                Message Format
                              </label>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => setMessageFormat('concise')}
                                className={`
                                  relative flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium
                                  transition-colors duration-200
                                  border
                                  ${messageFormat === 'concise'
                                    ? 'bg-blue-500 border-blue-500 text-white shadow-sm'
                                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                  }
                                  flex items-center justify-center
                                `}
                              >
                                Concise
                                {messageFormat === 'concise' && (
                                  <span className="text-yellow-500 ml-1.5 hover:scale-110 transition-transform">✨</span>
                                )}
                              </button>
                              <button
                                onClick={() => setMessageFormat('expanded')}
                                className={`
                                  relative flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium
                                  transition-colors duration-200
                                  border
                                  ${messageFormat === 'expanded'
                                    ? 'bg-blue-500 border-blue-500 text-white shadow-sm'
                                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                  }
                                  flex items-center justify-center
                                `}
                              >
                                Expanded
                              </button>
                              <div className="flex gap-2 text-xs text-gray-500">
                                {messageFormat === 'concise' && (
                                  <div className="flex items-center gap-1 ml-2">
                                    <span>Recommended</span>
                                    <a 
                                      href="#"
                                      className="text-blue-600 hover:text-blue-700 hover:underline ml-1"
                                    >
                                      Learn more
                                    </a>
                                  </div>
                                )}
                                {messageFormat === 'expanded' && (
                                  <div className="ml-[82px]">
                                    <span>More detailed message</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Message Customization */}
                          <div className="pb-2">
                            <div className="flex items-center gap-2 mb-2">
                              <MinimalToggle 
                                className="scale-[0.35] mr-1"
                                checked={showCustomization}
                                onChange={(e) => setShowCustomization(e.target.checked)}
                              />
                              <label className="text-sm font-medium text-gray-900">
                                Message Customization
                              </label>
                            </div>
                            <p className="text-sm text-gray-600">
                              Add override or customization instructions for your outreach message
                            </p>
                            {showCustomization && (
                            <textarea
                              value={customizationText}
                              onChange={(e) => setCustomizationText(e.target.value)}
                              placeholder="e.g. 'Focus on sustainability achievements' or 'Emphasize workshop experience'"
                              className={`
                                w-full h-24 px-3 py-2 text-sm border border-gray-200 bg-white rounded-lg resize-none mt-2
                                focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40
                              `}
                            />
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Preview Panel */}
              {isPreviewMode && !showMessage && (
                <div className="flex-1 p-4">
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <div className="border-b border-gray-200 bg-gray-50 p-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-600">To:</span>
                          <span className="text-sm font-medium">{lead.email || 'recipient@example.com'}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-600">Subject:</span>
                          <span className="text-sm font-medium">Speaking Opportunity: {lead.eventName}</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <MessagePreview content={input} type={outreachChannel} lead={lead} />
                    </div>
                  </div>
                </div>
              )}

              {/* Outreach Panel */}
              {showMessage && !isGenerating && !isPreviewMode && (
                <div className="flex-1 p-4">
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <div className="border-b border-gray-200 bg-gray-50 p-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-600">To:</span>
                          <span className="text-sm font-medium">{lead.email || 'recipient@example.com'}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-600">Subject:</span>
                          <span className="text-sm font-medium">Speaking Opportunity: {lead.eventName}</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="relative">
                        <textarea
                          ref={textareaRef}
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder={`Your message to ${lead.leadName}...`}
                          className="w-full resize-none text-gray-900 placeholder:text-gray-400 focus:outline-none text-sm leading-relaxed
                            min-h-[450px] bg-transparent
                            focus:ring-0 focus:border-0"
                          style={{ minHeight: '450px' }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between w-full gap-2">
                    <div>
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
                    </div>
                    <div>
                      {input !== lead.pitch && (
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
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2zm-5 14a3 3 0 110-6 3 3 0 010 6zm0 0V7" />
                              </svg>
                              <span>Save Message</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200">
              {/* Write Message Button */}
              {!showMessage ? (
                <div className="px-4 py-1.5 border-b border-gray-100 bg-gradient-to-b from-white to-gray-50/50">
                  <div className="flex items-start gap-3">
                    <button 
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      className={`
                        flex items-center gap-2 px-6 py-2 
                        ${isGenerating 
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
                    {!isGenerating && showInputs && (
                      <button 
                        onClick={() => setIsPreviewMode(!isPreviewMode)}
                        className={`
                          inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-all mt-0.5
                          ${isPreviewMode 
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
              ) : (
                <div className="px-4 py-1.5 border-b border-gray-100 bg-gradient-to-b from-white to-gray-50/50">
                  <div className="flex items-start gap-3">
                    <button 
                      onClick={() => {
                        setShowMessage(false);
                        setShowInputs(true);
                        setIsPreviewMode(false);
                      }}
                      className="flex items-center gap-2 px-6 py-2.5 bg-[#0066FF] text-white rounded-lg shadow-sm hover:bg-[#0052CC] transition-all duration-200"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span className="font-medium">Back to Editor</span>
                    </button>
                    <div className="flex-1" />
                    {showInputs && (
                      <button 
                        onClick={() => setIsPreviewMode(!isPreviewMode)}
                        className={`
                          inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-all mt-0.5
                          ${isPreviewMode 
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
              )}
            </div>
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