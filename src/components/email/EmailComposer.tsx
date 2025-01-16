import React, { useState, useRef, useEffect } from 'react';
import { 
  PaperclipIcon, Image, Send, X, Wand2, ArrowUpDown, 
  ShrinkIcon, MoreHorizontal, Lock, Trash2, Link, TextSelect,
  FileText, Mail, Linkedin, ChevronDown, Edit2, Eye, Copy,
  Mic2, Users, Target, Briefcase, GitCommit, Plus
} from 'lucide-react';
import { MinimalToggle } from '../ui/toggle';
import { useProfile } from '../../hooks/useProfile';

interface EmailComposerProps {
  lead: any;
  isOpen: boolean;
  onClose: () => void;
}

type MessageType = 'proposal' | 'linkedin' | 'email';

interface PreviewProps {
  content: string;
  type: MessageType;
  lead: any;
}

const MAX_CHARS = 1000;
const LINKEDIN_MAX_CHARS = 300;

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
              <span className="text-sm font-medium">Speaking Opportunity: {lead.event_name}</span>
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
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{lead.event_name}</h1>
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
  const [input, setInput] = useState('');
  const [messageType, setMessageType] = useState<MessageType>('email');
  const [showMyContext, setShowMyContext] = useState(true);
  const [showLeadContext, setShowLeadContext] = useState(true);
  const [showCustomization, setShowCustomization] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>(['Keynote Speaking']);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { profile } = useProfile();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSubmit = async () => {
    if (!input.trim() || isSubmitting || input.length > MAX_CHARS) return;
    
    try {
      setIsSubmitting(true);
      // TODO: Implement email sending logic
      onClose();
    } catch (error) {
      console.error('Failed to send email:', error);
    } finally {
      setIsSubmitting(false);
      setInput('');
    }
  };

  const handleGenerate = () => {
    setShowMessage(true);
    setShowAdvanced(false);
    setIsPreviewMode(false);
    setInput("Dear [Name],\n\nI hope this email finds you well. I came across your event and I believe I could add significant value as a speaker...");
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
                      alt={lead.lead_name}
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
                            <div>{lead.lead_name}</div>
                            <div className="text-[14px] text-gray-600">{lead.jobTitle}</div>
                          </>
                        )
                        : (
                          <div>{lead.eventName || lead.event_name}</div>
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
                                setSelectedServices(['Keynote Speaking']);
                              }
                            }}
                          />
                          <label className="text-sm font-medium text-gray-900">
                            I'm Pitching
                          </label>
                        </div>
                        <div className="flex items-center gap-2">
                          {['Keynote Speaking', 'Workshops', 'Coaching'].map((service) => (
                            <button
                              key={service}
                              onClick={() => {
                                setSelectedServices([service]);
                              }}
                              className={`relative flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium
                                transition-colors duration-200
                                border
                                ${selectedServices.includes(service) 
                                  ? 'bg-blue-500 border-blue-500 text-white shadow-sm' 
                                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                }
                              `}
                            >
                              {service === 'Keynote Speaking' && <Mic2 className={`w-3 h-3 ${selectedServices.includes(service) ? 'text-white' : 'text-gray-500'}`} />}
                              {service === 'Workshops' && <Users className={`w-3 h-3 ${selectedServices.includes(service) ? 'text-white' : 'text-gray-500'}`} />}
                              {service === 'Coaching' && <Target className={`w-3 h-3 ${selectedServices.includes(service) ? 'text-white' : 'text-gray-500'}`} />}
                              {service}
                            </button>
                          ))}
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
                          <div className="flex flex-wrap gap-2 mt-2">
                            <div className="w-full">
                            {['Consulting', 'Facilitation', 'Other'].map((service) => (
                              <button
                                key={service}
                                onClick={() => {
                                  setSelectedServices([service]);
                                }}
                                className={`relative flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium
                                  transition-colors duration-200
                                  border
                                  ${selectedServices.includes(service) 
                                    ? 'bg-blue-500 border-blue-500 text-white shadow-sm' 
                                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                  }
                                `}
                              >
                                {service === 'Consulting' && <Briefcase className={`w-3 h-3 ${selectedServices.includes(service) ? 'text-white' : 'text-gray-500'}`} />}
                                {service === 'Facilitation' && <GitCommit className={`w-3 h-3 ${selectedServices.includes(service) ? 'text-white' : 'text-gray-500'}`} />}
                                {service === 'Other' && <Plus className={`w-3 h-3 ${selectedServices.includes(service) ? 'text-white' : 'text-gray-500'}`} />}
                                {service}
                              </button>
                            ))}
                            </div>
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
                      className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#00B341] to-[#009938] hover:from-[#009938] hover:to-[#008530] text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <Wand2 className="w-4 h-4" />
                      <span className="text-sm font-medium">Write {messageType === 'linkedin' ? 'LinkedIn' : messageType === 'email' ? 'Email' : 'Proposal'} Message</span>
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
                          ${input.length > MAX_CHARS 
                            ? 'bg-red-50 text-red-600' 
                            : input.length > MAX_CHARS * 0.9
                            ? 'bg-yellow-50 text-yellow-600'
                            : 'bg-gray-100 text-gray-600'
                          }
                        `}>
                          <span>{input.length}</span>
                          <span className="text-gray-400">/</span>
                          <span className="text-gray-500">{MAX_CHARS}</span>
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