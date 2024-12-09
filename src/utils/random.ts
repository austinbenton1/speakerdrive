import { services, industries } from './constants';

export function getRandomSelections() {
  // Helper function to get random items from array
  const getRandomItems = (arr: { id: string }[], min: number, max: number) => {
    const count = Math.floor(Math.random() * (max - min + 1)) + min;
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count).map(item => item.id);
  };

  // Get random services (1-5)
  const selectedServices = getRandomItems(services, 1, 5);

  // Get random industries (1-3)
  const selectedIndustries = getRandomItems(industries, 1, 3);

  return {
    services: selectedServices,
    industries: selectedIndustries
  };
}