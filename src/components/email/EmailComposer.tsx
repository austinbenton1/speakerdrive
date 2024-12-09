import React, { useState } from 'react';
import { X, Send, Copy, ExternalLink, Sparkles } from 'lucide-react';
import type { SpeakerLead } from '../../types';

interface EmailComposerProps {
  lead: SpeakerLead;
  isOpen: boolean;
  onClose: () => void;
}

export default function EmailComposer({ lead, isOpen, onClose }: EmailComposerProps) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);

  // Dummy data
  const dummyEmail = 'contact@organization.com';
  const dummyUrl = 'https://organization.com/call-for-speakers';

  const handleWriteIntro = () => {
    setSubject(`Speaking Opportunity Discussion - ${lead.name}`);
    setMessage(`Dear [Name],

I hope this email finds you well. I came across ${lead.name} and was particularly impressed by your focus on ${lead.focus}.

As a professional speaker specializing in ${lead.industryCategory}, I believe I could provide valuable insights to your audience through engaging presentations and workshops.

Would you be open to a brief conversation about how I could contribute to your upcoming events? I'm confident I can help deliver exceptional value to your audience.

Looking forward to connecting.

Best regards,
[Your Name]`);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-gray-500/75 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="fixed inset-y-0 right-0 flex max-w-full">
        <div className="w-screen max-w-2xl transform transition-transform duration-500 ease-in-out translate-x-0">
          <div className="flex h-full flex-col overflow-hidden bg-white shadow-2xl rounded-l-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <h2 className="text-lg font-semibold text-gray-900">New Message</h2>
                  <p className="text-sm text-gray-500">Draft your cold outreach</p>
                  <div className="absolute -top-1 -right-2 w-2 h-2 bg-blue-600 rounded-full animate-ping" />
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-50 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Email Form */}
            <div className="flex-1 overflow-y-auto px-6 py-6 bg-gray-50/50">
              <div className="space-y-6">
                {/* Write Intro Button */}
                <button
                  onClick={handleWriteIntro}
                  className="group w-full px-4 py-4 text-sm font-medium text-blue-700 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 transform hover:scale-[1.02]"
                >
                  <div className="flex items-center justify-center">
                    <Sparkles className="w-4 h-4 mr-2 group-hover:animate-pulse" />
                    Write Cold Intro
                  </div>
                </button>

                {/* Email Fields */}
                <div className="space-y-4">
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <label htmlFor="to" className="block text-sm font-medium text-gray-700 mb-2">
                      To
                    </label>
                    {(lead.unlockType === 'Contact Email' || lead.unlockType === 'Event Email') ? (
                      <input
                        type="email"
                        id="to"
                        value={dummyEmail}
                        disabled
                        className="block w-full rounded-lg border-gray-200 bg-gray-50/50 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          id="to"
                          value={dummyUrl}
                          disabled
                          className="block w-full rounded-lg border-gray-200 bg-gray-50/50 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        />
                        <a
                          href={dummyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    )}
                  </div>

                  {(lead.unlockType === 'Contact Email' || lead.unlockType === 'Event Email') && (
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
                      <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                          Subject
                        </label>
                        <input
                          type="text"
                          id="subject"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          className="block w-full rounded-lg border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          placeholder="Enter email subject..."
                        />
                      </div>

                      <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                          Message
                        </label>
                        <textarea
                          id="message"
                          rows={12}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          className="block w-full rounded-lg border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          placeholder="Write your message..."
                        />
                      </div>
                    </div>
                  )}

                  {lead.unlockType === 'Event URL' && (
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                        Message Template
                      </label>
                      <textarea
                        id="message"
                        rows={12}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="block w-full rounded-lg border-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        placeholder="Write your message template..."
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-gray-100">
              <div className="text-sm text-gray-500">
                Draft saved
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                {(lead.unlockType === 'Contact Email' || lead.unlockType === 'Event Email') ? (
                  <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 border border-transparent rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-sm">
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </button>
                ) : (
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 border border-transparent rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-sm"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    {copied ? 'Copied!' : 'Copy Message'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}