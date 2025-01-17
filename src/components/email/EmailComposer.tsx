import React, { useState, useRef, useEffect } from 'react';
import { 
  PaperclipIcon, Image, Send, X, Wand2, ArrowUpDown, 
  ShrinkIcon, MoreHorizontal, Lock, Trash2, Link, TextSelect,
  FileText, Mail, Linkedin, ChevronDown, Edit2, Eye, Copy,
  Presentation, School, Target, Briefcase, Users, Plus
} from 'lucide-react';
import { MinimalToggle } from '../ui/toggle';
import { useProfile } from '../../hooks/useProfile';
import { services } from '../../utils/constants';

interface EmailComposerProps {
  lead: any;
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
  lead: any;
}

const MessagePreview = ({ content, type, lead }: PreviewProps) => {
  if (type === 'email') {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50 p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">To:</span>
              <span className="text-sm font-medium">{lead.email || 'recipient@example.com'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Subject:</span>
              <span className="text-sm font-medium">Speaking Opportunity: {lead.eventName}</span>
            </div>
          </div>
        </div>
        <div className="p-4">
          <div className="prose prose-sm max-w-none">
            {content || <span className="text-gray-400">Your email content will appear here...</span>}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">Best regards,</div>
            <div className="text-sm font-medium text-gray-900">Your Name</div>
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
            {content || <span className="text-gray-400">Your LinkedIn message will appear here...</span>}
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
              {content || <span className="text-gray-400">Your proposal content will appear here...</span>}
            </div>
          </section>
          <section className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Speaker Details</h2>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Name: Your Name</p>
              <p className="text-sm text-gray-600">Topics: Leadership, Innovation, Technology</p>
              <p className="text-sm text-gray-600">Experience: 10+ years</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default function EmailComposer({ lead, isOpen, onClose }: EmailComposerProps) {
  const { profile } = useProfile();
  const [input, setInput] = useState('');
  const [messageType, setMessageType] = useState<MessageType>('email');
  const [showMyContext, setShowMyContext] = useState(true);
  const [showLeadContext, setShowLeadContext] = useState(true);
  const [showCustomization, setShowCustomization] = useState(false);
  const [customizationText, setCustomizationText] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize selected services from profile and check if we need to expand additional services
  useEffect(() => {
    if (profile?.services) {
      const profileServices = parseProfileServices(profile.services);
      setSelectedServices(profileServices.length > 0 ? [profileServices[0]] : ['keynote']);
      
      // Check if any profile service is in the additional services section
      const additionalServices = services.slice(3).map(s => s.id);
      const hasAdditionalProfileService = profileServices.some(service => 
        additionalServices.includes(service)
      );
      
      if (hasAdditionalProfileService) {
        setShowCustomization(true);
      }
    }
  }, [profile?.services]);

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

      // EmailComposer details
      ...(selectedServices.length > 0 && { pitching: selectedServices[0] }),
      ...(showMyContext && { context: profile?.offering || null }),
      message_format: messageType,
      ...(showCustomization && { message_customization: customizationText || null })
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
      const message = responseData?.message;
      
      if (!message) {
        throw new Error('Invalid response format');
      }

      // Use the message from n8n response
      setShowMessage(true);
      setShowAdvanced(false);
      setIsPreviewMode(false);
      setInput(message);
    } catch (error) {
      setInput("We encountered an error. Please contact the administrators.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50" onClick={onClose}>
      <div className="fixed inset-y-0 right-0 flex max-w-full">
        <div 
          className="w-screen max-w-lg transform transition-transform duration-500 ease-in-out translate-x-0 pointer-events-auto"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex h-full flex-col overflow-hidden bg-white shadow-2xl rounded-l-2xl">
            {/* Lead Info Header */}
            <div className={`bg-gradient-to-b py-3 ${
              lead.leadType === 'Contact' 
                ? 'from-white via-blue-50/20 to-blue-100/10'
                : 'from-white via-emerald-50/20 to-emerald-100/10'
            } border-b border-gray-100 relative z-10`}>
              <div className="px-4">
                {/* Lead Info */}
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <img
                      src={lead.image}
                      alt={lead.leadName}
                      className={`h-12 w-12 rounded-lg object-cover shadow-lg ${
                        lead.leadType === 'Contact'
                          ? 'ring-4 ring-blue-100/50'
                          : 'ring-4 ring-emerald-100/50'
                      }`}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[16.5px] leading-6 font-medium text-gray-900 break-words">
                      {lead.leadType === 'Contact' 
                        ? (
                          <>
                            <div>{lead.leadName}</div>
                            <div className="text-[14px] text-gray-600">{lead.jobTitle}</div>
                          </>
                        )
                        : (
                          <div>{lead.eventName || lead.eventName}</div>
                        )
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Outreach Channels */}
            <div className="bg-white p-4 border-b border-gray-200">
              <p className="mb-3 text-sm font-medium text-gray-700">
                Outreach Channel
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {[
                    { id: 'email', icon: Mail, label: 'Email' },
                    { id: 'linkedin', icon: Linkedin, label: 'LinkedIn' },
                    { id: 'proposal', icon: FileText, label: 'Proposal' }
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setMessageType(type.id as MessageType)}
                      className={`
                        flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                        transition-colors duration-200
                        border shadow-sm
                        ${messageType === type.id
                          ? 'bg-blue-500 border-blue-500 text-white'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                        }
                      `}
                    >
                      <type.icon className={`w-4 h-4 ${messageType === type.id ? 'text-white' : 'text-gray-400'}`} />
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Message Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="space-y-4">
                {/* AI Tools Bar */}
                {/* Advanced Options Panel */}
                {showAdvanced && (
                  <div className="bg-white rounded-lg">
                    <p className="text-sm text-gray-500 mb-2 pl-1">
                      Outreach Settings
                    </p>
                    <div className="space-y-6 px-3">
                      {/* Services */}
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <MinimalToggle
                            className="scale-[0.35] -ml-1"
                            checked={selectedServices.length > 0}
                            onChange={(e) => {
                              if (!e.target.checked) {
                                setSelectedServices([]);
                              } else {
                                // Use first service from profile, or default to keynote
                                const profileServices = profile?.services ? parseProfileServices(profile.services) : [];
                                setSelectedServices(profileServices.length > 0 ? [profileServices[0]] : ['keynote']);
                              }
                            }}
                          />
                          <label className="text-sm font-medium text-gray-900">
                            I'm Pitching
                          </label>
                        </div>
                        <div className="flex items-center gap-2">
                          {services.slice(0, 3).map((service) => {
                            const Icon = {
                              'Presentation': Presentation,
                              'School': School,
                              'Target': Target,
                              'Briefcase': Briefcase,
                              'Users': Users,
                              'Plus': Plus
                            }[service.icon];

                            // Check if this service is in user's profile services
                            const profileServices = parseProfileServices(profile?.services || '');
                            const isProfileService = profileServices.includes(service.id);

                            return (
                              <button
                                key={service.id}
                                onClick={() => setSelectedServices([service.id])}
                                className={`relative flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium
                                  transition-colors duration-200
                                  border
                                  ${selectedServices.includes(service.id)
                                    ? 'bg-blue-500 border-blue-500 text-white shadow-sm' 
                                    : isProfileService
                                      ? 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                  }
                                `}
                              >
                                {Icon && (
                                  <Icon 
                                    className={`w-3 h-3 ${
                                      selectedServices.includes(service.id)
                                        ? 'text-white'
                                        : 'text-gray-500'
                                    }`}
                                  />
                                )}
                                {service.label}
                                {isProfileService && (
                                  <span className="ml-1 w-1.5 h-1.5 rounded-full bg-green-500" />
                                )}
                              </button>
                            );
                          })}
                          <div
                            className="relative"
                            onClick={() => setShowCustomization(!showCustomization)}
                          >
                            <button
                              className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                            >
                              <MoreHorizontal className="w-4 h-4 text-gray-500" />
                            </button>
                          </div>
                        </div>
                        {showCustomization && (
                          <div className="flex gap-2 mt-2">
                            {services.slice(3).map((service) => {
                              const Icon = {
                                'Presentation': Presentation,
                                'School': School,
                                'Target': Target,
                                'Briefcase': Briefcase,
                                'Users': Users,
                                'Plus': Plus
                              }[service.icon];

                              // Check if this service is in user's profile services
                              const profileServices = parseProfileServices(profile?.services || '');
                              const isProfileService = profileServices.includes(service.id);

                              return (
                                <button
                                  key={service.id}
                                  onClick={() => setSelectedServices([service.id])}
                                  className={`relative flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium
                                    transition-colors duration-200
                                    border
                                    ${selectedServices.includes(service.id)
                                      ? 'bg-blue-500 border-blue-500 text-white shadow-sm' 
                                      : isProfileService
                                        ? 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                    }
                                  `}
                                >
                                  {Icon && (
                                    <Icon 
                                      className={`w-3 h-3 ${
                                        selectedServices.includes(service.id)
                                          ? 'text-white'
                                          : 'text-gray-500'
                                      }`}
                                    />
                                  )}
                                  {service.label}
                                  {isProfileService && (
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
                              <span className={`line-clamp-1 inline ${profile?.offering ? '' : 'italic'}`}>
                                {profile?.offering || "Award-winning keynote speaker specializing in leadership and innovation"}
                                <span className="mx-1">...</span>
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
                            onClick={() => setMessageType('email')}
                            className={`
                              relative flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium
                              transition-colors duration-200
                              border
                              ${messageType === 'email'
                                ? 'bg-blue-500 border-blue-500 text-white shadow-sm'
                                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                              }
                              flex items-center justify-center
                            `}
                          >
                            Concise
                            {messageType === 'email' && (
                              <span className="text-yellow-500 ml-1.5 hover:scale-110 transition-transform">✨</span>
                            )}
                          </button>
                          <button
                            onClick={() => setMessageType('proposal')}
                            className={`
                              relative flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium
                              transition-colors duration-200
                              border
                              ${messageType === 'proposal'
                                ? 'bg-blue-500 border-blue-500 text-white shadow-sm'
                                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                              }
                              flex items-center justify-center
                            `}
                          >
                            Expanded
                          </button>
                        </div>
                        <div className="flex gap-2 text-xs text-gray-500">
                          {messageType === 'email' && (
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
                          {messageType === 'proposal' && (
                            <div className="ml-[82px]">
                              <span>More detailed message</span>
                            </div>
                          )}
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

                {/* Message Body */}
                {showMessage && (
                  <>
                    {isPreviewMode ? (
                      <MessagePreview 
                        content={input} 
                        type={messageType}
                        lead={lead}
                      />
                    ) : (
                      <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={`Write your ${messageType} message...`}
                        rows={3}
                        disabled={isSubmitting}
                        className={`w-full resize-none p-4 text-gray-900 placeholder:text-gray-400 focus:outline-none text-sm leading-relaxed
                          disabled:opacity-50 min-h-[200px] border border-gray-200 rounded-lg
                          shadow-[0_1px_2px_rgba(0,0,0,0.05)]
                          hover:border-gray-300 focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/20
                          transition-all duration-200
                          ${messageType === 'email' ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
                      />
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200">
              {/* Write Message Button */}
              {!showMessage && (
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
                          <span className="font-medium">Write {messageType === 'linkedin' ? 'LinkedIn' : messageType === 'email' ? 'Email' : 'Proposal'} Message</span>
                        </>
                      )}
                    </button>
                    <div className="flex-1" />
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
                  </div>
                </div>
              )}

              {/* Message Actions */}
              <div className="px-3 py-1.5">
                <div className="flex items-center justify-between gap-4">
                  {/* Character Counter and Copy Text Button */}
                  <div className="flex items-center gap-3 ml-auto">
                    <div className={`flex items-center gap-2 ${!showMessage ? 'hidden' : ''}`}>
                      <div className="relative group">
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 text-xs text-white bg-gray-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
                          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                          Character limit for {messageType} messages
                        </div>
                        <div className={`
                          flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium
                          ${input.length > 1000 
                            ? 'bg-red-50 text-red-600' 
                            : input.length > 1000 * 0.9
                            ? 'bg-yellow-50 text-yellow-600'
                            : 'bg-gray-100 text-gray-600'
                          }
                        `}>
                          <span>{input.length}</span>
                          <span className="text-gray-400">/</span>
                          <span className="text-gray-500">1000</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Copy Text Button */}
                    <button
                      onClick={() => {/* TODO: Implement copy text */}}
                      className={`${!showMessage ? 'hidden' : ''}
                        inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                        border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300 shadow-sm
                      `}
                    >
                      <Copy className="w-4 h-4" />
                      Copy Text
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}