export type TourPackage = {
  id: string;
  name: string;
  badge: string;
  duration: string;
  description: string;
  stopsLabel: string;
  stops: string[];
  pricing: string;
  ctaLabel: string;
  ctaHref: string;
  banner: string;
  bannerText: string;
  note?: string;
};

export const TOUR_PACKAGES: TourPackage[] = [
  {
    id: "countryside-tour",
    name: "Countryside Tour",
    badge: "Most Popular",
    duration: "Full Day · 8–10 hrs",
    description:
      "Classic Bohol highlights in one seamless day with a driver who knows the best pacing for every stop.",
    stopsLabel: "Key stops",
    stops: [
      "Chocolate Hills",
      "Tarsier Sanctuary",
      "Loboc River Cruise",
      "Bilar Man-Made Forest",
      "Baclayon Church",
      "Hanging Bridge",
    ],
    pricing: "Starting at ₱3,500 (sedan, 1–4 pax) / ₱5,000 (van, up to 10 pax)",
    ctaLabel: "Book Now",
    ctaHref: "/contact",
    banner:
      "linear-gradient(135deg, rgba(212,168,67,.22) 0%, rgba(15,9,1,.88) 54%, rgba(6,4,1,.96) 100%)",
    bannerText: "COUNTRYSIDE",
  },
  {
    id: "panglao-beach-tour",
    name: "Panglao Beach Tour",
    badge: "Half or Full Day",
    duration: "Half Day or Full Day",
    description:
      "A flexible beach day for guests who want caves, churches, and island time in one easy route.",
    stopsLabel: "Key stops",
    stops: [
      "Alona Beach",
      "Hinagdanan Cave",
      "Panglao Church",
      "Bohol Bee Farm",
    ],
    pricing: "Starting at ₱2,500 (half day) / ₱4,000 (full day)",
    ctaLabel: "Book Now",
    ctaHref: "/contact",
    banner:
      "linear-gradient(135deg, rgba(184,136,42,.22) 0%, rgba(18,11,4,.9) 52%, rgba(6,4,1,.98) 100%)",
    bannerText: "PANGLAO",
  },
  {
    id: "island-hopping",
    name: "Island Hopping",
    badge: "Full Day",
    duration: "Full Day",
    description:
      "Best for sea lovers who want dolphins, a sandbar stop, and smooth land transfer coordination.",
    stopsLabel: "Key stops",
    stops: ["Balicasag Island", "Virgin Island Sandbar", "Dolphin Watching"],
    pricing: "Starting at ₱3,500/pax",
    ctaLabel: "Book Now",
    ctaHref: "/contact",
    banner:
      "linear-gradient(135deg, rgba(212,168,67,.2) 0%, rgba(7,17,18,.86) 52%, rgba(3,7,7,.97) 100%)",
    bannerText: "ISLAND HOP",
    note: "Land transfer + boat coordination included",
  },
  {
    id: "firefly-watching",
    name: "Firefly Watching",
    badge: "Evening Tour",
    duration: "3–4 hrs · starts 5:30 PM",
    description:
      "An atmospheric evening ride to one of Bohol’s most memorable river experiences.",
    stopsLabel: "Location",
    stops: ["Abatan River, Cortes"],
    pricing: "Starting at ₱1,200/vehicle (land transfer) + boat fee",
    ctaLabel: "Book Now",
    ctaHref: "/contact",
    banner:
      "linear-gradient(135deg, rgba(214,180,86,.18) 0%, rgba(16,8,2,.9) 55%, rgba(5,3,1,.98) 100%)",
    bannerText: "FIREFLY",
  },
  {
    id: "danao-adventure-park",
    name: "Danao Adventure Park",
    badge: "Half Day",
    duration: "4–5 hrs",
    description:
      "A transfer-only option for guests chasing Bohol’s adrenaline stops and outdoor activities.",
    stopsLabel: "Activities",
    stops: ["Zipline", "ATV", "Rappelling"],
    pricing: "Starting at ₱2,500/vehicle (round trip transfer)",
    ctaLabel: "Book Now",
    ctaHref: "/contact",
    banner:
      "linear-gradient(135deg, rgba(212,168,67,.18) 0%, rgba(23,12,3,.88) 54%, rgba(6,4,1,.98) 100%)",
    bannerText: "DANAO",
  },
  {
    id: "airport-pier-combo",
    name: "Airport/Pier Transfer + Tour",
    badge: "Combo",
    duration: "Flexible",
    description:
      "Perfect for arrivals and departures that still want a quick stop or two before heading in or out.",
    stopsLabel: "Pickup",
    stops: ["Panglao Airport or Tagbilaran Pier"],
    pricing: "Starting at ₱800 (transfer only) / ₱2,000 (transfer + stops)",
    ctaLabel: "Book Now",
    ctaHref: "/contact",
    banner:
      "linear-gradient(135deg, rgba(184,136,42,.2) 0%, rgba(13,8,3,.88) 54%, rgba(5,3,1,.98) 100%)",
    bannerText: "COMBO",
  },
  {
    id: "custom-private-tour",
    name: "Custom Private Tour",
    badge: "Private",
    duration: "Flexible - you choose",
    description:
      "Build your own Bohol itinerary with the vehicle size and pace that fits your group.",
    stopsLabel: "Vehicles",
    stops: ["Sedan", "SUV", "Van"],
    pricing: "Request a Quote",
    ctaLabel: "Inquire Now",
    ctaHref: "/contact",
    banner:
      "linear-gradient(135deg, rgba(212,168,67,.2) 0%, rgba(15,9,1,.88) 54%, rgba(5,3,1,.98) 100%)",
    bannerText: "PRIVATE",
  },
];
