// Equipment rental product interface
export interface RentalEquipment {
  title: string;
  subtitle: string;
  category: string;
  price: number;
  images: string[];
  features: string[];
  videoUrl: string;
}

// Final clean list (frontend only; no Supabase). 6 items exactly.
export const rentalEquipmentData: RentalEquipment[] = [
  {
    title: "Canon EOS 5D Mark II",
    subtitle: "Full Frame DSLR Camera",
    category: "Camera",
    price: 800,
    images: [
      "https://m.media-amazon.com/images/I/819GW4aelwL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/819GW4aelwL._AC_SL1500_.jpg"
    ],
    features: [
      "21MP - Full frame CMOS Sensor",
      "ISO 100 - 6400 (expands to 50 - 25600)",
      "3.00\" Fixed Type Screen",
      "Optical (pentaprism) viewfinder",
      "4.0fps continuous shooting",
      "FHD at 30fps Video Recording",
      "Weather-sealed Body"
    ],
    videoUrl: "https://www.youtube.com/embed/y_34mvEZGx0"
  },
  {
    title: "Sony FE 28-70mm f/3.5-5.6",
    subtitle: "Lightweight, compact 35mm full-frame standard zoom lens",
    category: "Lens",
    price: 150,
    images: [
      "https://www.sony.no/image/fd6df2f58083e52631a23154639f3571?fmt=pjpeg&wid=1014&hei=396&bgcolor=F1F5F9&bgc=F1F5F9",
      "https://www.sony.no/image/fd6df2f58083e52631a23154639f3571?fmt=pjpeg&wid=1014&hei=396&bgcolor=F1F5F9&bgc=F1F5F9"
    ],
    features: [
      "28-70mm zoom range and F3.5-5.6 aperture",
      "Optical SteadyShot",
      "7-blade circular aperture",
      "Dust and moisture resistant",
      "Minimum focus 0.3–0.45 m",
      "0.19x max magnification",
      "55mm filter, 295g"
    ],
    videoUrl: "https://www.youtube.com/embed/x4ZZC5nqS0o"
  },
  {
    title: "DJI MIC MINI",
    subtitle: "Carry Less, Capture More",
    category: "Audio",
    price: 30,
    images: [
      "https://djioslo.no/Userfiles/Upload/images/Modules/Eshop/31146_DJI-Mic-Mini-45-DJI-Mic-Mini-Transmitte(1).png",
      "https://djioslo.no/Userfiles/Upload/images/Modules/Eshop/31146_DJI-Mic-Mini-45-DJI-Mic-Mini-Transmitte(1).png"
    ],
    features: [
      "Small, ultralight, discreet",
      "Stable transmission",
      "48-hour operation with case",
      "Active noise cancellation",
      "Auto limiting"
    ],
    videoUrl: "https://www.youtube.com/embed/iBgZJJ-NBTs"
  },
  {
    title: "DJI Osmo Pocket 3 Creator Combo",
    subtitle: "Compact and capable 4K pocket gimbal camera",
    category: "Camera",
    price: 100,
    images: [
      "https://djioslo.no/Userfiles/Upload/images/Modules/Eshop/27490_31399_07.jpeg",
      "https://djioslo.no/Userfiles/Upload/images/Modules/Eshop/27490_31399_03.jpeg"
    ],
    features: [
      "1-Inch CMOS & 4K/120fps",
      "Rotatable 2-inch screen",
      "3-Axis Gimbal Stabilization",
      "ActiveTrack 6.0",
      "D-Log M & 10-Bit"
    ],
    videoUrl: "https://www.youtube.com/embed/MZq_2OJ5kOo"
  },
  {
    title: "Sony A7 IV",
    subtitle: "Mirrorless hybrid camera with image stabilization and lightning-fast autofocus",
    category: "Camera",
    price: 700,
    images: [
      "https://www.japanphoto.no/imageserver/750/750/scale/p/japan/PIM_PROD/Sony/PIM1143909_Sony_1634709214767.jpg",
      "https://www.japanphoto.no/imageserver/750/750/scale/p/japan/PIM_PROD/Sony/PIM1143909_Sony_1634709233962.jpg"
    ],
    features: [
      "33MP Exmor R sensor",
      "4K/60p (Super35) and 4K/30p (oversampled)",
      "BIONZ XR",
      "Up to 15 stops DR"
    ],
    videoUrl: "https://www.youtube.com/embed/bUgOEDqhZVY"
  },
  {
    title: "DJI MINI 4 PRO FLY MORE COMBO (with RC 2 Controller)",
    subtitle: "Professional drone with 4K camera and obstacle sensing",
    category: "Drone",
    price: 500,
    images: [
      "https://djioslo.no/Userfiles/Upload/images/Modules/Eshop/27473_31283_DJI-Mini-4-Pro-RC-2-2.jpeg",
      "https://djioslo.no/Userfiles/Upload/images/Modules/Eshop/27473_eddac3937fead916961e8596421efcbf-origin.jpg"
    ],
    features: [
      "Under 249g",
      "4K/60fps HDR",
      "Omnidirectional obstacle sensing",
      "20 km FHD transmission"
    ],
    videoUrl: "https://www.youtube.com/embed/FaCKViuXd_I"
  }
];
