// Career role interface
export interface CareerRole {
  name: string;
  description: string;
}

// Team structure interface
export interface CareerTeam {
  title: string;
  roles: CareerRole[];
  imageUrl: string;
}

// Available career opportunities organized by team
export const careerTeamsData: CareerTeam[] = [
  {
    title: "Strategy & Planning Team",
    imageUrl: "https://images.pexels.com/photos/7490890/pexels-photo-7490890.jpeg",
    roles: [
      { 
        name: "Brand Strategist", 
        description: "Lead strategic initiatives and provide expert consultation to drive business growth and innovation."
      },
      { 
        name: "Advertising Specialist",
        description: "Analyze business processes and requirements to identify opportunities for improvement and optimization."
      },
       { 
        name: "Product Innovator",
        description: "Analyze business processes and requirements to identify opportunities for improvement and optimization."
      },
    ]
  },
  {
    title: "Technology and Innovation Team",
    imageUrl: "https://images.pexels.com/photos/5239811/pexels-photo-5239811.jpeg",
    roles: [
      { 
        name: "Software Developer/Engineer", 
        description: "Build and maintain web applications using modern technologies and best practices."
      },
      { 
        name: "Cloud Architect/DevOps Engineer", 
        description: "Create intuitive and engaging user experiences through thoughtful design and user research."
      },
      { 
        name: "Artificial Inteligence Specialist", 
        description: "Focus on exploring, prototyping, and integrating cutting-edge technologies relevant to their clients' needs."
      }
    ]
  },
  {
    title: "Marketing Team",
    imageUrl: "https://images.pexels.com/photos/7691715/pexels-photo-7691715.jpeg",
    roles: [
      { 
        name: "Digital Marketer", 
        description: "Drive digital marketing campaigns and strategies to increase brand awareness and customer acquisition."
      },
     { 
        name: "Influencer / Brand Ambassador", 
        description: "Builds visibility for clients by creating content that amplifies clients' brand campaigns and engages target audiences."
      },
      { 
        name: "Content Creator", 
        description: "Produce engaging content across various platforms to connect with our audience and tell our story."
      }
    ]
  },
  {
    title: "Content & Production Team",
    imageUrl: "https://images.pexels.com/photos/12249084/pexels-photo-12249084.jpeg",
    roles: [
      { 
        name: "Video Editor /  Videographer", 
        description: "Produces, edits and enhances video content to deliver polished, high-impact campaigns."
      },
      { 
        name: "Photographer", 
        description: "Product, lifestyle, and brand photography."
      },
      { 
        name: "Graphic Designer", 
        description: "Develop visual concepts and designs that communicate ideas and inspire audiences."
      },
      { 
        name: "Motion Graphics Designer", 
        description: "Produces animations and visuals for ads, social media and brand storytelling.."
      },
    ]
  }
];