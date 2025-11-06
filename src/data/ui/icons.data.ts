import {
  Compass,
  MousePointerClick,
  Camera,
  Newspaper,
  Lightbulb,
  Cpu,
  PartyPopper,
} from "lucide-react";

/**
 * Icon mappings for business services
 * Maps service titles to their corresponding Lucide React icons
 */
export const serviceIconMappings = {
  Compass: Compass,
  MousePointerClick: MousePointerClick,
  Camera: Camera,
  Newspaper: Newspaper,
  Lightbulb: Lightbulb,
  Cpu: Cpu,
  PartyPopper: PartyPopper,
};

/**
 * Gets the appropriate icon component for a service title
 * @param serviceTitle - The title of the service
 * @returns The corresponding icon component
 */
export const getServiceIcon = (serviceTitle: string) => {
  const cleanTitle = serviceTitle.replace(/[^a-zA-Z]/g, "");
  return serviceIconMappings[cleanTitle as keyof typeof serviceIconMappings] || Compass;
};