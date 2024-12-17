import { industries, services } from './constants';

export function validateIndustries(selectedIndustries: string[]): boolean {
  if (!Array.isArray(selectedIndustries)) return false;
  return selectedIndustries.every(industry => 
    industries.some(valid => valid.id === industry)
  );
}

export function validateServices(selectedServices: string[]): boolean {
  if (!Array.isArray(selectedServices)) return false;
  return selectedServices.every(service => 
    services.some(valid => valid.id === service)
  );
}

export function formatIndustryName(industryId: string): string {
  const industry = industries.find(i => i.id === industryId);
  return industry?.label || industryId;
}

export function formatServiceName(serviceId: string): string {
  const service = services.find(s => s.id === serviceId);
  return service?.label || serviceId;
}

export function getAvailableIndustries(selectedIndustries: string[] = []) {
  return industries.map(industry => ({
    ...industry,
    isSelected: selectedIndustries.includes(industry.id)
  }));
}

export function getAvailableServices(selectedServices: string[] = []) {
  return services.map(service => ({
    ...service,
    isSelected: selectedServices.includes(service.id)
  }));
}