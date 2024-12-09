import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Link as LinkIcon, PenLine, Copy, ExternalLink, Check } from 'lucide-react';
import type { SpeakerLead } from '../../types';
import { useLeadUnlock } from '../../hooks/useLeadUnlock';
import EmailComposer from '../email/EmailComposer';

interface LeadDetailHeaderProps {
  lead: SpeakerLead;
}

export default function LeadDetailHeader({ lead }: LeadDetailHeaderProps) {
  const { unlockLead, isLeadUnlocked } = useLeadUnlock();
  const [copied, setCopied] = useState(false);
  const [showEmailComposer, setShowEmailComposer] = useState(false);
  const isUnlocked = isLeadUnlocked(lead.id);

  // Dummy data for demonstration
  const dummyEmail = 'contact@organization.com';
  const dummyUrl = 'https://organization.com/call-for-speakers';

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <>
      <div className="bg-gradient-to-b from-white to-gray-50/50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <div className="flex items-center">
              <Link 
                to="/find-leads" 
                className="group flex items-center text-sm font-medium text-gray-500 hover:text-[#0066FF] transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Lead Finder
              </Link>
            </div>
            <div className="mt-8 flex items-center justify-between">
              <div className="flex items-center">
                <div className="relative">
                  <img
                    src={lead.image}
                    alt={lead.name}
                    className="h-20 w-20 rounded-xl object-cover ring-2 ring-gray-100 shadow-sm"
                  />
                  <span className="absolute -bottom-2 -right-2 h-6 w-6 rounded-full bg-white ring-2 ring-white flex items-center justify-center">
                    <span className={`w-2.5 h-2.5 rounded-full ${isUnlocked ? 'bg-[#00B341]' : 'bg-[#0066FF]'}`} />
                  </span>
                </div>
                <div className="ml-8">
                  <h1 className="text-2xl font-semibold text-gray-900">
                    {lead.name}
                  </h1>
                  <div className="mt-2 flex items-center space-x-4">
                    <span className="text-sm text-gray-500">{lead.focus}</span>
                    <span className="text-gray-200">•</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#0066FF]/5 text-[#0066FF] border border-[#0066FF]/10">
                      {lead.leadType}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {/* Write Cold Intro Button */}
                <button 
                  onClick={() => setShowEmailComposer(true)}
                  disabled={!isUnlocked}
                  className={`
                    inline-flex items-center px-6 py-2.5 border rounded-lg text-sm font-medium
                    transition-all duration-200
                    ${!isUnlocked
                      ? 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                      : 'border-[#00B341]/20 bg-[#00B341]/5 text-[#00B341] hover:bg-[#00B341]/10'
                    }
                  `}
                >
                  <PenLine className="w-4 h-4 mr-2" />
                  Write Cold Intro
                </button>

                {!isUnlocked ? (
                  <button 
                    onClick={() => unlockLead(lead.id)}
                    className="inline-flex items-center px-6 py-2.5 border border-transparent rounded-lg text-sm font-medium text-white bg-[#0066FF] hover:bg-[#0052CC] transition-all duration-200"
                  >
                    {lead.unlockType === 'Contact Email' && (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Unlock Contact Email
                      </>
                    )}
                    {lead.unlockType === 'Event Email' && (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Unlock Event Email
                      </>
                    )}
                    {lead.unlockType === 'Event URL' && (
                      <>
                        <LinkIcon className="w-4 h-4 mr-2" />
                        Unlock Event URL
                      </>
                    )}
                  </button>
                ) : (
                  <div className="flex items-center space-x-3">
                    {(lead.unlockType === 'Contact Email' || lead.unlockType === 'Event Email') && (
                      <div className="flex items-center space-x-2 px-4 py-2.5 bg-[#00B341]/5 border border-[#00B341]/10 rounded-lg">
                        <Mail className="w-4 h-4 text-[#00B341]" />
                        <span className="text-sm text-gray-700">{dummyEmail}</span>
                        <button
                          onClick={() => handleCopy(dummyEmail)}
                          className="p-1 text-[#00B341] hover:text-[#009938] rounded-md hover:bg-[#00B341]/10"
                        >
                          {copied ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    )}
                    {lead.unlockType === 'Event URL' && (
                      <div className="flex items-center space-x-2 px-4 py-2.5 bg-[#0066FF]/5 border border-[#0066FF]/10 rounded-lg">
                        <LinkIcon className="w-4 h-4 text-[#0066FF]" />
                        <span className="text-sm text-gray-700 truncate max-w-[200px]">
                          {dummyUrl}
                        </span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleCopy(dummyUrl)}
                            className="p-1 text-[#0066FF] hover:text-[#0052CC] rounded-md hover:bg-[#0066FF]/10"
                          >
                            {copied ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                          <a
                            href={dummyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-[#0066FF] hover:text-[#0052CC] rounded-md hover:bg-[#0066FF]/10"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <EmailComposer
        lead={lead}
        isOpen={showEmailComposer}
        onClose={() => setShowEmailComposer(false)}
      />
    </>
  );
}