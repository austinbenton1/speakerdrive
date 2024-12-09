import React from 'react';
import { X, Mail, Link, Building, Users, Calendar, MapPin, Layout } from 'lucide-react';
import type { SpeakerLead } from '../types';

interface Props {
  lead: SpeakerLead;
  onClose: () => void;
}

export default function LeadDetail({ lead, onClose }: Props) {
  const isEventLead = lead.unlockType === 'Event Email' || lead.unlockType === 'Event URL';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <img 
              src={lead.image} 
              alt={lead.name}
              className="h-12 w-12 rounded-full object-cover"
            />
            <div>
              <h2 className="text-xl font-bold text-gray-900">{lead.name}</h2>
              <p className="text-sm text-gray-500">{lead.focus}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {isEventLead && (
            <>
              <div>
                <div className="flex items-center mb-2">
                  <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                  <h3 className="text-sm font-medium text-gray-500">Event Purpose & Scope</h3>
                </div>
                <p className="text-gray-900">{lead.eventPurpose}</p>
              </div>

              {lead.hostOrganization && (
                <div>
                  <div className="flex items-center mb-2">
                    <Building className="w-5 h-5 text-gray-400 mr-2" />
                    <h3 className="text-sm font-medium text-gray-500">Host Organization Overview</h3>
                  </div>
                  <p className="text-gray-900">{lead.hostOrganization}</p>
                </div>
              )}

              {lead.targetAudience && (
                <div>
                  <div className="flex items-center mb-2">
                    <Users className="w-5 h-5 text-gray-400 mr-2" />
                    <h3 className="text-sm font-medium text-gray-500">Target Audience & Relevance</h3>
                  </div>
                  <p className="text-gray-900">{lead.targetAudience}</p>
                </div>
              )}

              {lead.eventDetails && (
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center mb-2">
                      <MapPin className="w-5 h-5 text-gray-400 mr-2" />
                      <h3 className="text-sm font-medium text-gray-500">Location</h3>
                    </div>
                    <p className="text-gray-900">{lead.eventDetails.location}</p>
                  </div>
                  <div>
                    <div className="flex items-center mb-2">
                      <Layout className="w-5 h-5 text-gray-400 mr-2" />
                      <h3 className="text-sm font-medium text-gray-500">Event Format</h3>
                    </div>
                    <p className="text-gray-900">{lead.eventDetails.format}</p>
                  </div>
                </div>
              )}
            </>
          )}

          {!isEventLead && (
            <div>
              <div className="flex items-center mb-2">
                <Users className="w-5 h-5 text-gray-400 mr-2" />
                <h3 className="text-sm font-medium text-gray-500">Professional Background</h3>
              </div>
              <p className="text-gray-900">{lead.eventPurpose}</p>
            </div>
          )}

          <div className="space-y-4">
            {!lead.isUnlocked && (
              <button className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
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
                    <Link className="w-4 h-4 mr-2" />
                    Unlock Event URL
                  </>
                )}
              </button>
            )}
            {lead.isUnlocked && (
              <div className="space-y-2">
                {lead.unlockType === 'Contact Email' && (
                  <p className="flex items-center text-gray-900">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                    contact@example.com
                  </p>
                )}
                {(lead.unlockType === 'Event Email' || lead.unlockType === 'Event URL') && (
                  <p className="flex items-center text-blue-600 hover:text-blue-800">
                    <Link className="w-4 h-4 mr-2" />
                    <a href="#" target="_blank" rel="noopener noreferrer">
                      View Event Details
                    </a>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}