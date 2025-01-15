import React, { useState, useRef, useEffect } from 'react';
import { 
  PaperclipIcon, Image, Send, X, Wand2, ArrowUpDown, 
  ShrinkIcon, MoreHorizontal, Lock, Trash2, Link, TextSelect,
  FileText, Mail, Linkedin, ChevronDown, Edit2, Eye, Copy
} from 'lucide-react';

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

export default function EmailComposer({ lead, isOpen, onClose }: EmailComposerProps) {
  const [input, setInput] = useState('');
  const [messageType, setMessageType] = useState<MessageType>('email');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="fixed inset-y-0 right-0 flex max-w-full">
        <div className="w-screen max-w-lg transform transition-transform duration-500 ease-in-out translate-x-0 pointer-events-auto">
          <div className="flex h-full flex-col overflow-hidden bg-white shadow-2xl rounded-l-2xl">
            {/* Lead Info Header */}
            <div className={`bg-gradient-to-b ${
              lead.leadType === 'Contact' 
                ? 'from-white via-blue-50/20 to-blue-100/10'
                : 'from-white via-emerald-50/20 to-emerald-100/10'
            } border-b border-gray-100 relative z-10`}>
              <div className="px-6 py-4">
                {/* Lead Info */}
                <div className="flex items-start space-x-6">
                  <div className="flex-shrink-0">
                    <img
                      src={lead.image}
                      alt={lead.eventName || lead.name}
                      className={`h-16 w-16 rounded-xl object-cover shadow-lg ${
                        lead.leadType === 'Contact'
                          ? 'ring-4 ring-blue-100/50'
                          : 'ring-4 ring-emerald-100/50'
                      }`}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-xl font-semibold text-gray-900 leading-tight break-words">
                      {lead.eventName || lead.name}
                    </h1>
                    {lead.subtext && (
                      <div className="mt-2">
                        <span className="text-base text-gray-600 leading-normal">{lead.subtext}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Close Button */}
            <div className="absolute right-0 top-0 pr-4 pt-4 z-20">
              <button
                onClick={onClose}
                className="rounded-md bg-white text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Message Type Toggle */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex bg-gray-50 p-1 rounded-lg">
                {[
                  { id: 'email', icon: Mail, label: 'Email' },
                  { id: 'linkedin', icon: Linkedin, label: 'LinkedIn' },
                  { id: 'proposal', icon: FileText, label: 'Proposal' }
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setMessageType(type.id as MessageType)}
                    className={`
                      relative flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
                      ${messageType === type.id
                        ? 'bg-white text-[#0066FF] shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
                      }
                    `}
                  >
                    <type.icon className="w-4 h-4" />
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* AI Tools Bar */}
              <div className="flex items-center justify-between">
                <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00B341] to-[#009938] hover:from-[#009938] hover:to-[#008530] text-white rounded-lg shadow-sm hover:shadow transition-all duration-200">
                  <Wand2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Write {messageType === 'linkedin' ? 'LinkedIn' : messageType === 'email' ? 'Email' : 'Proposal'} Message</span>
                </button>
                <button 
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className={`
                    relative group flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium
                    transition-all duration-200
                    ${showAdvanced 
                      ? 'text-[#0066FF] bg-blue-50/50'
                      : 'text-gray-500 hover:text-gray-700'
                    }
                  `}
                >
                  Advanced Options
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`} />
                </button>
              </div>
              
              {/* Advanced Options Panel */}
              {showAdvanced && (
                <div className="p-4 bg-gray-50/50 backdrop-blur-[2px] rounded-lg border border-gray-200/75 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)]">
                  <textarea
                    placeholder="Add any specific instructions for message generation..."
                    className="w-full h-24 px-3 py-2 text-sm border border-gray-200 bg-white rounded-lg resize-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40"
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Add instructions about tone, length, style, or any other preferences for your message.
                  </p>
                </div>
              )}

              {/* Message Body */}
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
                  className={`
                    w-full resize-none p-4 text-gray-900 placeholder:text-gray-400 focus:outline-none text-sm leading-relaxed
                    disabled:opacity-50 min-h-[200px] border border-gray-200 rounded-lg
                    shadow-[0_2px_4px_-2px_rgba(0,0,0,0.05),0_1px_2px_-1px_rgba(0,0,0,0.05)]
                    hover:border-gray-300 focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/20
                    transition-all duration-200
                    ${messageType === 'email' ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}
                  `}
                />
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center justify-between gap-4">
                {/* Preview Button */}
                <button 
                  onClick={() => setIsPreviewMode(!isPreviewMode)}
                  className={`
                    inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${isPreviewMode 
                      ? 'text-[#0066FF] border border-[#0066FF]/20 bg-blue-50/50 hover:bg-blue-50 shadow-[0_1px_2px_rgba(0,108,255,0.05)]'
                      : 'text-gray-600 border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 shadow-sm'
                    }
                  `}
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </button>
                {/* Character Counter and Copy Text Button */}
                <div className="flex items-center gap-3 ml-auto">
                  <div className="flex items-center gap-2">
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
                    className={`
                      inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                      border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300 shadow-sm
                      ${isPreviewMode ? 'border-l-0 rounded-l-none' : ''}
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
  );
}



function MessagePreview({ content, type, lead }: PreviewProps) {
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
}