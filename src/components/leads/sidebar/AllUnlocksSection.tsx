import React, { useState, useEffect } from 'react';
import { KeyRound, ArrowUpRight, Layers } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useUnlockedLeadsData } from '../../../hooks/useUnlockedLeadsData';
import { SidebarSection } from './SidebarSection';

interface AllUnlocksSectionProps {
  items: Array<{
    value: string;
    eventName: string;
    onClick: () => void;
    show: boolean;
  }>;
}

export function AllUnlocksSection({ items }: AllUnlocksSectionProps) {
  const [relatedLeadsCounts, setRelatedLeadsCounts] = useState<Record<string, number>>({});
  const { recordedLeads } = useUnlockedLeadsData();

  useEffect(() => {
    const checkRelatedLeads = async (eventName: string) => {
      if (!eventName) return;

      try {
        // Get all leads with same event name
        const { data: eventLeads, error } = await supabase
          .from('leads')
          .select('id')
          .eq('event_name', eventName);

        if (error) throw error;
        if (!eventLeads) return;

        // Create a Set of unlocked lead IDs for this event
        const unlockedIds = new Set(
          recordedLeads
            .filter(ul => ul.event_name === eventName)
            .map(ul => ul.lead_id)
        );

        // Calculate locked leads count by excluding unlocked leads
        const lockedCount = eventLeads.filter(l => !unlockedIds.has(l.id)).length;
        
        setRelatedLeadsCounts(prev => ({
          ...prev,
          [eventName]: lockedCount
        }));
      } catch (error) {
        console.error('Error checking related leads:', error);
      }
    };

    // Check related leads for each unique event name
    const uniqueEventNames = new Set(
      items
        .filter(item => item.show && item.eventName)
        .map(item => item.eventName)
    );

    uniqueEventNames.forEach(eventName => {
      checkRelatedLeads(eventName);
    });
  }, [items, recordedLeads]);

  return (
    <SidebarSection 
      title="All Unlocks For This Event"
      icon={KeyRound}
    >
      <div className="space-y-4">
        {items
          .filter(item => item.show)
          .map((item, index) => {
            const count = relatedLeadsCounts[item.eventName] || 0;
            
            if (count === 0) return null;

            return (
              <div key={index}>
                <button
                  onClick={item.onClick}
                  className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-gray-200 shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:shadow-[0_2px_4px_rgba(0,0,0,0.05)] hover:border-gray-300 transition-all duration-200"
                  title={count > 1 ? `View all ${count} leads from this event` : "View this lead"}
                >
                  <div className="relative">
                    <div className="relative">
                      <Layers className="w-3.5 h-3.5 text-gray-500 group-hover:text-gray-600 transition-colors" />
                      <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-700 group-hover:text-gray-900 transition-colors">
                      View All Leads
                    </span>
                    <div className="ml-1 w-px h-3.5 bg-gray-200 group-hover:bg-gray-300 transition-colors"></div>
                  </div>
                  <div className="relative">
                    <div className="flex items-center">
                      <span className="text-gray-500 group-hover:text-gray-700 transition-colors min-w-[0.875rem] text-center">
                        {count}
                      </span>
                      <ArrowUpRight className="w-3 h-3 text-gray-400 group-hover:text-gray-600 transition-colors -translate-y-px group-hover:translate-x-0.5 transform transition-all duration-200 -ml-0.5" />
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
      </div>
    </SidebarSection>
  );
}