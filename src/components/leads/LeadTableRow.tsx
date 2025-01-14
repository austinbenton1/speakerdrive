import React, { useState, useRef, useEffect } from 'react';
import { Link, Mail, Eye, Layers, ArrowUpRight, Calendar, Building2, Users, MapPin, Search, Briefcase, Tag, ExternalLink, Globe } from 'lucide-react';
import { Tooltip } from '../ui/Tooltip';
import { supabase } from '../../lib/supabase';
import type { Lead } from '../../types';
import { useUnlockedLeadsData } from '../../hooks/useUnlockedLeadsData';

interface LeadTableRowProps {
  lead: Lead;
  onClick: () => Promise<void>;
}

export default function LeadTableRow({ lead, onClick }: LeadTableRowProps) {
  const [relatedLeadsCount, setRelatedLeadsCount] = useState<number | null>(null);
  const [isCountVisible, setIsCountVisible] = useState(false);
  const { recordedLeads } = useUnlockedLeadsData();

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

  // Effect to handle count visibility
  useEffect(() => {
    if (relatedLeadsCount !== null) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        setIsCountVisible(true);
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setIsCountVisible(false);
    }
  }, [relatedLeadsCount]);

  useEffect(() => {
    const checkRelatedLeads = async () => {
      try {
        // Get all leads with same event name
        const { data: eventLeads, error } = await supabase
          .from('leads')
          .select('id')
          .eq('event_name', lead.event_name);

        if (error) throw error;

        // Create a Set of unlocked lead IDs for this event
        const unlockedIds = new Set(
          recordedLeads
            .filter(ul => ul.event_name === lead.event_name)
            .map(ul => ul.lead_id)
        );

        // Calculate locked leads count by excluding unlocked leads
        const lockedCount = eventLeads.filter(l => !unlockedIds.has(l.id)).length;
        
        setRelatedLeadsCount(lockedCount);
      } catch (error) {
        console.error('Error checking related leads:', error);
      }
    };

    if (lead.event_name) {
      checkRelatedLeads();
    }
  }, [lead.event_name, lead.id, recordedLeads]);

  const handleViewMore = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Create URL parameters
    const params = new URLSearchParams();
    if (lead.event_name) params.set('event', lead.event_name);
    params.set('event_display', 'all');
    
    // Open in new tab
    const url = `${window.location.pathname}?${params.toString()}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const getFormattedUrl = (url: string | undefined | null) => {
    if (!url) return null;
    
    try {
      const urlToFormat = url.startsWith('http') ? url : `https://${url}`;
      const urlObj = new URL(urlToFormat);
      return {
        hostname: urlObj.hostname.replace(/^www\./, ''),
        fullUrl: urlToFormat
      };
    } catch (error) {
      console.error('Invalid URL:', url);
      return null;
    }
  };

  const urlData = getFormattedUrl(lead.event_url);

  const TooltipContent = React.memo(() => (
    <div className="w-[500px] divide-y divide-gray-100">
      {/* Event Name Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-gray-50/90 via-white to-gray-50/90 backdrop-blur-sm space-y-4">
        <h3 className="text-xl font-semibold text-gray-900 leading-tight">
          {lead.event_name || lead.lead_name}
        </h3>
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
            <div className="flex items-center text-gray-600">
              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
              <span className="text-[14.5px]">{lead.event_format}</span>
            </div>
          )}
          {lead?.industry && (
            <div className="flex items-center text-gray-600">
              <Tag className="w-4 h-4 mr-2 text-gray-400" />
              <span className="text-[14.5px] text-gray-500">{lead.industry}</span>
            </div>
          )}
          {lead?.region && (
            <div className="flex items-center text-gray-600">
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
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100"
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

  return (
    <>
      {/* Main Content */}
      <div 
        onClick={onClick}
        className="w-full text-left px-4 py-3 border-t border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer bg-white"
      >
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
                <div className="text-[17.5px] leading-6 font-medium text-gray-900 truncate">
                  {lead.event_name || lead.lead_name}
                </div>
              </div>
              
              {/* Subtext */}
              <div className="mt-1" title={lead.subtext}>
                <span className="text-[16.5px] leading-5 text-gray-500 truncate block">
                  {lead.subtext}
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
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-gray-50 shadow-[0_0_0_1px] shadow-gray-200 hover:bg-gray-100 hover:shadow-gray-300 transition-all duration-200">
                    <Eye className="w-3.5 h-3.5 text-gray-400 hover:text-gray-500 transition-colors" />
                  </div>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Topic Column */}
      <div className="px-3 border-t border-gray-200 flex flex-col items-start justify-center min-h-[88px] gap-2">
        {topic && (
          <div className="inline-flex items-center max-w-full relative">
            <span className={`
              inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium
              bg-white border border-gray-200 shadow-sm
              group-hover:border-gray-300 transition-colors truncate
            `}>
              <Tag className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span className="truncate">{topic}</span>
            </span>
          </div>
        )}
        {lead.event_format && (
          <div className="flex items-center gap-1.5 text-gray-500 ml-6 relative">
            <div className="absolute -left-3 top-[calc(50%-12px)] h-3 w-[1.5px] bg-gray-300/75 rounded-full"></div>
            <div className="absolute -left-3 top-[calc(50%-1px)] w-2 h-[1.5px] bg-gray-300/75 rounded-full"></div>
            <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="text-xs truncate">{lead.event_format}</span>
          </div>
        )}
      </div>

      {/* Event URL Column */}
      <div className="px-3 border-t border-gray-200 flex items-center min-h-[88px]">
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
              <span className="text-[14.5px] text-gray-600 group-hover:text-blue-600 transition-colors break-all">
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
      <div className="px-3 border-t border-gray-200 flex items-center min-h-[88px]">
        {lead.region && (
          <div className="flex items-center text-[14.5px] text-gray-700">
            <MapPin className="w-4 h-4 mr-1.5 text-[#DD4B3E] flex-shrink-0" />
            <span>
              {[lead.city, lead.state, lead.region]
                .filter(value => value && value.trim() !== '' && value.trim().toLowerCase() !== 'blank')
                .join(', ')}
            </span>
          </div>
        )}
      </div>

      {/* Group Column */}
      <div className="px-3 border-t border-gray-200 flex items-center justify-end min-h-[88px]">
        <button
          onClick={handleViewMore}
          className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-gray-200 shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:shadow-[0_2px_4px_rgba(0,0,0,0.05)] hover:border-gray-300 transition-all duration-200"
          title={relatedLeadsCount ? (relatedLeadsCount > 1 ? "View all leads from this event" : "View this lead") : "Loading..."}
        >
          <div className="relative">
            <div className="relative">
              <Layers className="w-3.5 h-3.5 text-gray-500 group-hover:text-gray-600 transition-colors" />
              <div className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${styles.dot} animate-pulse`}></div>
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-gray-700 group-hover:text-gray-900 transition-colors">
              View All Leads
            </span>
            <div 
              className={`
                ml-1 w-px h-3.5 bg-gray-200 group-hover:bg-gray-300 
                transition-all duration-300 ease-in-out
                ${relatedLeadsCount !== null ? 'opacity-100' : 'opacity-0 w-0 ml-0'}
              `}
            ></div>
          </div>
          <div 
            className={`
              relative flex items-center
              transition-all duration-300 ease-in-out
              ${isCountVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}
            `}
          >
            {relatedLeadsCount !== null && (
              <div className="flex items-center">
                <span className="text-gray-500 group-hover:text-gray-700 transition-colors min-w-[0.875rem] text-center">
                  {relatedLeadsCount}
                </span>
                <ArrowUpRight className="w-3 h-3 text-gray-400 group-hover:text-gray-600 transition-colors -translate-y-px group-hover:translate-x-0.5 transform transition-all duration-200 -ml-0.5" />
              </div>
            )}
          </div>
        </button>
      </div>
    </>
  );
}