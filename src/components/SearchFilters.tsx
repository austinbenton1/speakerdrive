import React, { useState } from 'react';
import { Search, Filter, ChevronDown, ChevronUp, Check } from 'lucide-react';
import type { FilterOptions } from '../types';

// Previous interfaces and helper components remain the same...

export default function SearchFilters({ filters, setFilters }: Props) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchValues, setSearchValues] = useState({
    all: '',
    eventInfo: '',
    orgName: '',
    speakers: '',
    industry: '',
    jobTitle: '',
    targetDemographic: ''
  });

  const [selectedFilters, setSelectedFilters] = useState({
    leadType: '',
    unlockType: [] as string[],
    extension: [] as string[],
    advancedTimeframes: [] as string[],
    advancedLocations: [] as string[]
  });

  const isContactType = selectedFilters.leadType === 'contact';
  const isEventType = selectedFilters.leadType === 'event';

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      {/* Main Search Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <SearchField
          placeholder="Search across all data..."
          value={searchValues.all}
          onChange={(value) => setSearchValues({ ...searchValues, all: value })}
          icon={<Search className="w-5 h-5" />}
        />
        <SearchField
          placeholder="Search event name..."
          value={searchValues.eventInfo}
          onChange={(value) => setSearchValues({ ...searchValues, eventInfo: value })}
          icon={<Search className="w-5 h-5" />}
        />
      </div>

      {/* Fixed Filter Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="space-y-2">
          <Select
            label="Lead Type"
            options={[
              { value: 'contact', label: 'Contact' },
              { value: 'event', label: 'Event' }
            ]}
            value={selectedFilters.leadType}
            onChange={(value) => setSelectedFilters({ ...selectedFilters, leadType: value })}
          />
          {isContactType && (
            <SearchField
              placeholder="Search job title..."
              value={searchValues.jobTitle}
              onChange={(value) => setSearchValues({ ...searchValues, jobTitle: value })}
            />
          )}
          {isEventType && (
            <SearchField
              placeholder="Search target demographic..."
              value={searchValues.targetDemographic}
              onChange={(value) => setSearchValues({ ...searchValues, targetDemographic: value })}
            />
          )}
        </div>
        <div className="col-span-2">
          <Select
            label="Unlock Type"
            options={[
              { value: 'contact', label: 'Contact Email' },
              { value: 'event', label: 'Event Email' },
              { value: 'url', label: 'Event URL' }
            ]}
            value={selectedFilters.unlockType.join(',')}
            onChange={(value) => setSelectedFilters({ ...selectedFilters, unlockType: value ? [value] : [] })}
          />
        </div>
      </div>

      {/* Advanced Filters Toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
      >
        <Filter className="w-4 h-4 mr-2" />
        {showAdvanced ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
        {showAdvanced ? (
          <ChevronUp className="w-4 h-4 ml-1" />
        ) : (
          <ChevronDown className="w-4 h-4 ml-1" />
        )}
      </button>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="space-y-4 pt-4 border-t border-gray-200">
          {/* Location and Organization */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SearchField
              placeholder="Search organization names..."
              value={searchValues.orgName}
              onChange={(value) => setSearchValues({ ...searchValues, orgName: value })}
            />
            <SearchField
              placeholder="Search by location..."
              value={searchValues.location}
              onChange={(value) => setSearchValues({ ...searchValues, location: value })}
            />
          </div>

          {/* Industry and Timeframe Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SearchField
              placeholder="Search by industry category..."
              value={searchValues.industry}
              onChange={(value) => setSearchValues({ ...searchValues, industry: value })}
            />
            <MultiSelect
              label="Added to SpeakerDrive"
              options={timeframeOptions}
              selected={selectedFilters.advancedTimeframes}
              onChange={(values) => setSelectedFilters({ ...selectedFilters, advancedTimeframes: values })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SearchField
              placeholder="Search past speakers & experts..."
              value={searchValues.speakers}
              onChange={(value) => setSearchValues({ ...searchValues, speakers: value })}
            />
          </div>
        </div>
      )}
    </div>
  );
}