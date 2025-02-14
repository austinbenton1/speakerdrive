import { industries } from './constants';

export function validateIndustries(selectedIndustries: string[]): boolean {
  if (!Array.isArray(selectedIndustries)) return false;
  return selectedIndustries.every(industry => 
    industries.some(valid => valid.id === industry)
  );
}

export function validateService(selectedService: string): boolean {
  if (!selectedService) return false;
  
  if (selectedService.startsWith('other:')) {
    return selectedService.length > 6; // Must have text after "other:"
  }
  
  const validServices = ['Keynote Speaking', 'Workshops', 'Coaching', 'Consulting', 'Facilitation'];
  return validServices.includes(selectedService);
}

export function formatIndustryName(industryId: string): string {
  const industry = industries.find(i => i.id === industryId);
  return industry?.label || industryId;
}

export function getAvailableIndustries(selectedIndustries: string[] = []) {
  return industries.map(industry => ({
    ...industry,
    isSelected: selectedIndustries.includes(industry.id)
  }));
}

export function getAvailableService(currentService: string = '') {
  const services = [
    { id: 'keynote', label: 'Keynote Speaking' },
    { id: 'workshops', label: 'Workshops' },
    { id: 'coaching', label: 'Coaching' },
    { id: 'consulting', label: 'Consulting' },
    { id: 'facilitation', label: 'Facilitation' }
  ];

  return services.map(service => ({
    ...service,
    isSelected: service.label === currentService
  }));
}