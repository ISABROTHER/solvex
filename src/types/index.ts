export interface Service {
  Icon: React.ComponentType<any>;
  title: string;
  summary: string;
  imageUrl: string;
  titleColor: string;
  details: {
    description: string;
    subServices: string[];
    outcome: string;
  };
}

export interface RentalProduct {
  title: string;
  subtitle: string;
  images: string[];
  features: string[];
  videoUrl: string;
}

export interface Leader {
  name: string;
  role: string;
  imageUrl: string;
  bio: string;
  fullBio?: string;
  linkedinUrl?: string;
  email?: string;
}