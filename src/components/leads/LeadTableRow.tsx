import React, { useState, useRef, useEffect } from 'react';
import { Link, Mail, Eye, Layers, ArrowUpRight, Target, Building2, Users, MapPin, Search, Briefcase, Tag, ExternalLink, Globe, Loader, Calendar, Unlock } from 'lucide-react';
import { Tooltip } from '../ui/Tooltip';
import { supabase } from '../../lib/supabase';
import type { Lead } from '../../types';
import { useUnlockedLeadsData } from '../../hooks/useUnlockedLeadsData';

interface LeadTableRowProps {
  lead: Lead;
  onRowClick: (leadId: string) => Promise<void>;
}

export default function LeadTableRow({ lead, onRowClick }: LeadTableRowProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { recordedLeads } = useUnlockedLeadsData();

  // Check if this lead is unlocked
  const isUnlocked = recordedLeads.some(recordedLead => recordedLead.lead_id === lead.id);

  // Get topic from keywords (first keyword)
  const topic = lead.keywords?.split(',')[0]?.trim();

  // Calculate styles based on lead type
  const styles = {
    bg: lead.lead_type === 'Contact' 
      ? 'bg-blue-50 border border-blue-100' 
      : 'bg-emerald-50 border border-emerald-100',
    text: lead.lead_type === 'Contact' 
      ? 'text-blue-600' 
      : 'text-emerald-600',
    dot: lead.lead_type === 'Contact'
      ? 'bg-blue-400'
      : 'bg-emerald-400'
  };

  const handleViewMore = (e: React.MouseEvent) => {
    // Create URL parameters
    const params = new URLSearchParams();
    if (lead.event_name) params.set('event', lead.event_name);
    if (lead.organization) params.set('organization', lead.organization);
    params.set('event_display', 'all');
    params.set('show_unlocks', 'true');  // Add show_unlocks parameter
    
    // Open in new tab
    const url = `${window.location.pathname}?${params.toString()}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const TooltipContent = React.memo(() => (
    <div className="w-[500px] divide-y divide-gray-100">
      {/* Event/Lead Name Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-gray-50/90 via-white to-gray-50/90 backdrop-blur-sm space-y-1">
        {lead.lead_type === 'Contact' ? (
          <>
            <h3 className="text-xl font-semibold text-gray-900 leading-tight">
              {lead.lead_name}{lead.job_title && `, ${lead.job_title}`}
            </h3>
            <div className="text-base text-gray-600">
              {lead.focus}
            </div>
          </>
        ) : (
          <>
            <h3 className="text-xl font-semibold text-gray-900 leading-tight">
              {lead.event_name || lead.lead_name}
            </h3>
            <div className="text-base text-gray-600">
              {lead.focus}
            </div>
          </>
        )}
      </div>

      <div className="p-4 bg-white space-y-4">
        {/* Organization Info */}
        {(lead.organization || lead?.organization_type) && (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-gray-400" />
            {lead.organization && (
              <div className="text-base text-gray-900">
                {lead.organization}
              </div>
            )}
            </div>
            {lead?.organization_type && (
              <div className="text-sm text-gray-500">
                {lead.organization_type}
              </div>
            )}
          </div>
        )}

        {/* Description */}
        {lead?.detailed_info && (
          <div>
            <div className="pt-4 border-t border-gray-100">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">At a Glance</div>
            <p className="text-[14.5px] text-gray-600 leading-relaxed max-w-[560px]">
              {(() => {
                if (!lead.detailed_info) return '';

                // Split into sections and normalize whitespace
                const sections = lead.detailed_info
                  .split('\n\n')
                  .map(s => s.trim())
                  .filter(Boolean);

                // Find the "At a Glance" section (case insensitive)
                const atAGlanceSection = sections.find(section =>
                  section.toLowerCase().includes('at a glance ->'));
                
                if (!atAGlanceSection) return '';
                
                // Get content after the arrow
                const [, ...content] = atAGlanceSection.split('->');
                return content.join('->').trim();
              })()}
            </p>
            </div>
          </div>
        )}
        
        {/* Event Details */}
        <div className="border-t border-gray-100 pt-4 space-y-3">
          {lead?.event_format && (
            <div className="flex items-center gap-1.5 text-gray-600">
              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
              <span className="text-[14.5px]">{lead.event_format}</span>
            </div>
          )}
          {lead?.industry && (
            <div className="flex items-center gap-1.5 text-gray-600">
              <Tag className="w-4 h-4 mr-2 text-gray-400" />
              <span className="text-[14.5px] text-gray-500">{lead.industry}</span>
            </div>
          )}
          {lead?.region && (
            <div className="flex items-center gap-1.5 text-gray-600">
              <MapPin className="w-4 h-4 mr-2 text-gray-400" />
              <span className="text-[14.5px]">
                {[lead.city, lead.state, lead.region]
                  .filter(value => value && value.trim() !== '')
                  .join(', ')}
              </span>
            </div>
          )}
        </div>
        
        {/* Keywords */}
        {lead?.keywords && (
          <div className="pt-4 mt-4 border-t border-gray-100">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              Keywords
            </div>
            <div className="flex flex-wrap gap-1.5">
              {lead.keywords.split(',').map((keyword, index) => (
                <span 
                  key={index}
                  className="inline-flex items-start gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100"
                >
                  {keyword.trim()}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  ), [lead]);

  const getFormattedUrl = (url: string | undefined | null) => {
    if (!url) return null;
    
    try {
      const urlToFormat = url.startsWith('http') ? url : `https://${url}`;
      const urlObj = new URL(urlToFormat);
      const hostname = urlObj.hostname.replace(/^www\./, '');
      return {
        hostname: hostname.length > 20 ? hostname.substring(0, 20) + '...' : hostname,
        fullUrl: urlToFormat
      };
    } catch (error) {
      // Return original string if URL is invalid
      return { hostname: url, fullUrl: url };
    }
  };

  const urlData = getFormattedUrl(lead.event_url);

  return (
    <div className={`contents group ${isUnlocked ? 'unlocked-row' : ''}`}>
      {/* Main Content */}
      <div 
        onClick={async () => {
          if (isLoading) return;
          setIsLoading(true);
          try {
            await onRowClick(lead.id);
          } finally {
            setIsLoading(false);
          }
        }}
        className={`w-full text-left px-4 py-3 border-t border-gray-200 transition-colors cursor-pointer relative ${
          isUnlocked ? 'bg-blue-50/80 hover:bg-blue-100/90 group-hover:bg-blue-100/90' : 'bg-white hover:bg-gray-50'
        } ${isLoading ? 'pointer-events-none' : ''}`}
      >
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] flex items-center justify-center z-10">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/90 shadow-sm border border-gray-100">
              <Loader className="w-4 h-4 text-blue-600 animate-spin" />
              <span className="text-sm text-gray-600">Fetching lead details...</span>
            </div>
          </div>
        )}
        <div className="flex items-start">
          <div className="flex gap-3 min-w-0">
            {/* Image */}
            <div className="flex-shrink-0 mt-[5px]">
              <img 
                src={lead.image_url} 
                alt={lead.lead_name}
                className="h-11 w-11 rounded-full object-cover"
              />
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                {/* Name */}
                <div className="text-[16.5px] leading-6 font-medium text-gray-900 truncate">
                  {lead.unlock_type === 'Unlock Contact Email' 
                    ? `${lead.lead_name}${lead.job_title ? `, ${lead.job_title}` : ''}`
                    : lead.event_name
                  }
                </div>
              </div>
              
              {/* Subtext */}
              <div className="mt-1">
                <span className="text-[15.5px] leading-5 text-gray-500 truncate block">
                  {lead.unlock_type === 'Unlock Contact Email' 
                    ? (lead.event_name || 'No event specified')
                    : (lead.organization || 'No organization specified')
                  }
                </span>
              </div>
              
              {/* Unlock Type and Eye Icon */}
              <div className="mt-1.5 mb-0.5 flex items-center gap-2">
                <div 
                  className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium transition-colors ${styles.bg} ${styles.text} hover:bg-opacity-75 flex-shrink-0`}
                >
                  {lead.unlock_type.includes('URL') ? (
                    <Link className="w-3 h-3 mr-1" />
                  ) : (
                    <Mail className="w-3 h-3 mr-1" />
                  )}
                  {lead.unlock_type.replace('Unlock ', '')}
                </div>

                {/* Eye Icon with Tooltip */}
                <Tooltip content={<TooltipContent />} side="right" delayShow={100}>
                  <div 
                    role="button"
                    tabIndex={0}
                    className="w-6 h-6 rounded-lg flex items-center justify-center bg-gray-50 shadow-[0_0_0_1px] shadow-gray-200 hover:bg-gray-100 hover:shadow-gray-300 transition-all duration-200 cursor-pointer"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                      }
                    }}
                  >
                    <Eye className="w-3.5 h-3.5 text-gray-400 hover:text-gray-500 transition-colors" />
                  </div>
                </Tooltip>

                {/* Static Unlock Icon with Simple Tooltip - Only show if lead is unlocked */}
                {isUnlocked && (
                  <div className="flex items-center gap-1">
                    <Tooltip 
                      content={
                        <div className="p-2 max-w-[200px] text-sm">
                          Unlocked. Click the View All Leads button to show more of these leads.
                        </div>
                      } 
                      side="right" 
                      delayShow={100}
                    >
                      <div 
                        className="w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-200 shadow-[0_0_0_1px] group-hover:shadow-amber-200 group-hover:bg-amber-100 group-hover:text-amber-600 bg-blue-100 shadow-blue-200 text-blue-600"
                      >
                        <Unlock className="w-3.5 h-3.5" />
                      </div>
                    </Tooltip>
                    <span className="text-xs font-medium text-blue-600 group-hover:text-amber-600 transition-colors">
                      Unlocked
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Topic Column */}
      <div className={`px-3 border-t border-gray-200 flex flex-col items-start justify-center min-h-[88px] gap-2 relative transition-colors ${
        isUnlocked ? 'bg-blue-50/80 group-hover:bg-blue-100/90' : 'bg-white group-hover:bg-gray-50'
      }`}>
        {topic && (
          <div className="flex items-start relative">
            <span className={`
              inline-flex items-start gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium
              bg-white border border-gray-200 shadow-sm
              group-hover:border-gray-300 transition-colors
            `}>
              <Tag className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span className="whitespace-normal">{topic}</span>
            </span>
          </div>
        )}
        {lead.focus && (
          <div className="flex items-start gap-1.5 text-gray-500 ml-6 relative w-full">
            <div className="absolute -left-3 top-[calc(50%-12px)] h-3 w-[1.5px] bg-gray-300/75 rounded-full"></div>
            <div className="absolute -left-3 top-[calc(50%-1px)] w-2 h-[1.5px] bg-gray-300/75 rounded-full"></div>
            <Calendar className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <span className="text-xs whitespace-normal">{lead.subtext}</span>
          </div>
        )}
      </div>

      {/* Event URL Column */}
      <div className={`px-3 border-t border-gray-200 flex items-center min-h-[88px] relative transition-colors ${
        isUnlocked ? 'bg-blue-50/80 group-hover:bg-blue-100/90' : 'bg-white group-hover:bg-gray-50'
      }`}>
        {urlData && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              window.open(urlData.fullUrl, '_blank', 'noopener,noreferrer');
            }}
            className="group text-left hover:bg-gray-50 rounded-md p-2 transition-colors w-full"
          >
            <div className="flex items-start gap-1.5">
              <Search className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-500 transition-colors mt-1" />
              <span className="text-[14.5px] text-gray-600 group-hover:text-blue-600 transition-colors whitespace-normal">
                {urlData.hostname}
              </span>
            </div>
            <div className="flex items-center gap-1 mt-0.5 ml-5">
              <span className="text-xs text-blue-600 group-hover:text-blue-700 transition-colors">
                View page
              </span>
              <ExternalLink className="w-3 h-3 text-blue-600 group-hover:text-blue-700 transition-colors" />
            </div>
          </button>
        )}
      </div>

      {/* Location Column */}
      <div className={`px-3 border-t border-gray-200 flex items-center min-h-[88px] relative transition-colors ${
        isUnlocked ? 'bg-blue-50/80 group-hover:bg-blue-100/90' : 'bg-white group-hover:bg-gray-50'
      }`}>
        {lead.region && (
          <div className="flex items-start text-[14.5px] text-gray-700">
            <MapPin className="w-4 h-4 mr-1.5 text-[#DD4B3E] flex-shrink-0" />
            <span className="whitespace-normal">
              {[lead.city, lead.state, lead.region]
                .filter(value => value && value.trim() !== '' && value.trim().toLowerCase() !== 'blank')
                .join(', ')}
            </span>
          </div>
        )}
      </div>

      {/* Group Column */}
      <div className={`px-3 border-t border-gray-200 flex items-center justify-end min-h-[88px] relative transition-colors ${
        isUnlocked ? 'bg-blue-50/80 group-hover:bg-blue-100/90' : 'bg-white group-hover:bg-gray-50'
      }`}>
        <button
          onClick={handleViewMore}
          className="group inline-flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-gray-200 shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:shadow-[0_2px_4px_rgba(0,0,0,0.05)] hover:border-gray-300 transition-all duration-200 w-[185px]"
          title="View all leads from this event"
        >
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="relative">
                <Layers className="w-3.5 h-3.5 text-gray-500 group-hover:text-gray-600 transition-colors" />
                <div className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${styles.dot}`}></div>
              </div>
            </div>
            <span className="text-gray-700 group-hover:text-gray-900 transition-colors">
              View All Unlocks
              {lead.related_leads && (
                <>
                  <span className="ml-1 text-gray-400">·</span>
                  <span className="ml-1 text-gray-500">{lead.related_leads}</span>
                </>
              )}
            </span>
          </div>
          <ArrowUpRight className="w-3 h-3 text-gray-400 group-hover:text-gray-600 transition-colors -translate-y-px group-hover:translate-x-0.5 transform transition-all duration-200" />
        </button>
      </div>
    </div>
  );
}