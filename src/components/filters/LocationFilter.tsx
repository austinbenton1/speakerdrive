import React, { useState, KeyboardEvent } from 'react';
import { MapPin, Search, X } from 'lucide-react';
import FilterSection from './FilterSection';
import { usRegions } from '../../utils/constants';

// Split regions into primary and secondary
const primaryRegions = ['United States', 'Virtual Only'];
const secondaryRegions = [
  'Canada',
  'United Kingdom', 
  'Europe',
  'Asia Pacific',
  'Australia',
  'Middle East',
  'Latin America',
  'Africa',
  'Global / Unspecified'
];

interface LocationFilterProps {
  region: string;
  state: string[];
  city: string[];
  onRegionChange: (region: string) => void;
  onStateChange: (states: string[]) => void;
  onCityChange: (cities: string[]) => void;
  isOpen: boolean;
  onToggle: () => void;
  isUSAOnly?: boolean;
}

export default function LocationFilter({
  region,
  state,
  city,
  onRegionChange,
  onStateChange,
  onCityChange,
  isOpen,
  onToggle,
  isUSAOnly = false
}: LocationFilterProps) {
  const [stateSearch, setStateSearch] = useState('');
  const [cityInput, setCityInput] = useState('');
  const isUsRegion = region === 'United States' || isUSAOnly;
  const isVirtualOrGlobal = region === 'Virtual Only' || region === 'Global / Unspecified';

  // Effect to sync region with isUSAOnly
  React.useEffect(() => {
    if (isUSAOnly && region !== 'United States') {
      onRegionChange('United States');
    }
  }, [isUSAOnly, region, onRegionChange]);

  // Filter states based on search
  const getFilteredStates = () => {
    if (!stateSearch) return Object.entries(usRegions);
    
    return Object.entries(usRegions).map(([region, states]) => [
      region,
      states.filter(stateName => 
        stateName.toLowerCase().includes(stateSearch.toLowerCase())
      )
    ]).filter(([_, states]) => (states as string[]).length > 0);
  };

  const handleCityKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && cityInput.trim()) {
      e.preventDefault();
      if (!city.includes(cityInput.trim())) {
        onCityChange([...city, cityInput.trim()]);
      }
      setCityInput('');
    }
  };

  const removeCity = (cityToRemove: string) => {
    onCityChange(city.filter(c => c !== cityToRemove));
  };

  return (
    <FilterSection
      title="Location"
      icon={MapPin}
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div className="space-y-3">
        {/* Region Selection */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">Region</label>
          <div className="space-y-2">
            {/* Primary Regions */}
            <div className="space-y-1.5">
              {primaryRegions.map((r) => (
                <button
                  key={r}
                  onClick={() => onRegionChange(r === region ? '' : r)}
                  disabled={r === 'United States' && isUSAOnly}
                  className={`
                    flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm
                    transition-colors
                    ${r === region
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                    }
                    ${r === 'United States' && isUSAOnly ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <span>{r}</span>
                  {r === region && (
                    <X className="w-4 h-4" />
                  )}
                </button>
              ))}
            </div>

            {/* Divider */}
            {!isUsRegion && (
              <div className="relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-2 bg-white text-xs text-gray-500">Other Regions</span>
                </div>
              </div>
            )}

            {/* Secondary Regions - Only show if US is not selected */}
            {!isUsRegion && !isUSAOnly && (
              <div className="space-y-1.5">
                {secondaryRegions.map((r) => (
                  <button
                    key={r}
                    onClick={() => onRegionChange(r === region ? '' : r)}
                    className={`
                      flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm
                      transition-colors
                      ${r === region
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                      }
                    `}
                  >
                    <span>{r}</span>
                    {r === region && (
                      <X className="w-4 h-4" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* State Selection - Only for US */}
        {isUsRegion && (
          <div>
            <label className="block text-sm text-gray-600 mb-1">States</label>
            <div className="space-y-2">
              {/* Selected States Tags */}
              {state.length > 0 && (
                <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-lg">
                  {state.map((selectedState) => (
                    <span
                      key={selectedState}
                      className="inline-flex items-center px-2 py-1 rounded-md text-sm bg-white border border-gray-200 text-gray-700"
                    >
                      {selectedState}
                      <button
                        onClick={() => onStateChange(state.filter(s => s !== selectedState))}
                        className="ml-1 p-0.5 hover:text-red-500 rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={stateSearch}
                  onChange={(e) => setStateSearch(e.target.value)}
                  placeholder="Search states..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm 
                    placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40"
                />
              </div>

              {/* States list grouped by region */}
              <div className="max-h-60 overflow-y-auto space-y-2 bg-white rounded-lg border border-gray-200 p-2">
                {getFilteredStates().map(([region, states]) => (
                  <div key={region} className="space-y-1">
                    <div className="text-xs font-medium text-gray-500 px-2">{region}</div>
                    <div className="space-y-1">
                      {(states as string[]).map((stateName) => (
                        <label
                          key={stateName}
                          className="flex items-center px-2 py-1.5 rounded-md hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={state.includes(stateName)}
                            onChange={() => {
                              const newStates = state.includes(stateName)
                                ? state.filter(s => s !== stateName)
                                : [...state, stateName];
                              onStateChange(newStates);
                            }}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">{stateName}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* City Input */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">Cities</label>
          <div className="space-y-2">
            {/* Selected Cities Tags */}
            {city.length > 0 && (
              <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-lg">
                {city.map((selectedCity) => (
                  <span
                    key={selectedCity}
                    className="inline-flex items-center px-2 py-1 rounded-md text-sm bg-white border border-gray-200 text-gray-700"
                  >
                    {selectedCity}
                    <button
                      onClick={() => removeCity(selectedCity)}
                      className="ml-1 p-0.5 hover:text-red-500 rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            
            <input
              type="text"
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              onKeyDown={handleCityKeyDown}
              disabled={isVirtualOrGlobal || (!isUsRegion && !region)}
              placeholder="Type a city name and press Enter"
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm 
                focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40
                disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p className="text-xs text-gray-500">Press Enter to add each city</p>
          </div>
        </div>
      </div>
    </FilterSection>
  );
}