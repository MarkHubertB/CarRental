export type TourPackage = {
  id: string;
  slug: string;
  name: string;
  image: string;
  badge: string;
  duration: string;
  bookingDuration: string;
  passengers: string;
  vehicle: string;
  pickup: string;
  description: string;
  stopsLabel: string;
  stops: string[]; // ✅ change this from string to string[]
  pricing: string;
  priceSummary: string;
  ctaLabel: string;
  ctaHref: string;
  banner: string;
  bannerText: string;
  note?: string;
  actionLabel?: string;
};

export const TOUR_PACKAGES: TourPackage[] = [
  {
    id: "countryside-tour",
    slug: "countryside-tour",
    name: "Bohol Countryside Tour",
    image: "/tours/CountrySide.png",
    badge: "FULL DAY",
    duration: "Full Day · 8–10 hrs",
    bookingDuration: "8–10 hours",
    passengers: "Up to 10 pax",
    vehicle: "Sedan / SUV / Van",
    pickup: "Flexible",
    description:
      "The classic Bohol experience. Visit the island's most iconic landmarks in one full day with a local driver who knows every road.",
    stopsLabel: "Key stops",
    stops: [
      "Chocolate Hills",
      "Tarsier Sanctuary",
      "Loboc River Cruise",
      "Bilar Man-Made Forest",
      "Baclayon Church",
      "Hanging Bridge",
    ],
    pricing: "Starting at ₱3,500 (sedan) / ₱5,000 (van)",
    priceSummary: "₱3,500",
    ctaLabel: "Book Now",
    ctaHref: "/tours/countryside-tour",
    banner:
      "linear-gradient(135deg, rgba(212,168,67,.22) 0%, rgba(15,9,1,.88) 54%, rgba(6,4,1,.96) 100%)",
    bannerText: "COUNTRYSIDE",
  },
  {
    id: "panglao-beach-tour",
    slug: "panglao-beach-tour",
    name: "Panglao Beach Tour",
    image: "/tours/PanglaoBeach.png",
    badge: "HALF OR FULL DAY",
    duration: "Half Day or Full Day",
    bookingDuration: "Half day or full day",
    passengers: "Up to 7 pax",
    vehicle: "SUV or Van",
    pickup: "Flexible",
    description:
      "Explore Panglao Island's best beach spots, stunning cave, and scenic farm restaurant - all in one relaxing trip.",
    stopsLabel: "Key stops",
    stops: [
      "Alona Beach",
      "Hinagdanan Cave",
      "Panglao Church",
      "Bohol Bee Farm",
    ],
    pricing: "Starting at ₱2,500 (half day) / ₱4,000 (full day)",
    priceSummary: "₱2,500",
    ctaLabel: "Book Now",
    ctaHref: "/tours/panglao-beach-tour",
    banner:
      "linear-gradient(135deg, rgba(184,136,42,.22) 0%, rgba(18,11,4,.9) 52%, rgba(6,4,1,.98) 100%)",
    bannerText: "PANGLAO",
  },
  {
    id: "island-hopping",
    slug: "island-hopping",
    name: "Island Hopping Tour",
    image: "/tours/IslandHopping.png",
    badge: "FULL DAY",
    duration: "Full Day",
    bookingDuration: "Full day",
    passengers: "Per person rate",
    vehicle: "Boat coordination included",
    pickup: "Flexible",
    description:
      "Snorkel with sea turtles at Balicasag, walk the Virgin Island sandbar, and catch dolphins at sunrise. Land transfer + boat coordination included.",
    stopsLabel: "Key stops",
    stops: [
      "Balicasag Island Marine Sanctuary",
      "Virgin Island Sandbar",
      "Dolphin Watching",
    ],
    pricing: "Starting at ₱3,500/pax",
    priceSummary: "₱3,500",
    ctaLabel: "Book Now",
    ctaHref: "/tours/island-hopping",
    banner:
      "linear-gradient(135deg, rgba(212,168,67,.2) 0%, rgba(7,17,18,.86) 52%, rgba(3,7,7,.97) 100%)",
    bannerText: "ISLAND HOP",
    note: "Land transfer + boat coordination included",
  },
  {
    id: "firefly-watching",
    slug: "firefly-watching",
    name: "Firefly Watching at Abatan River",
    image: "/tours/FireflyWatching.png",
    badge: "EVENING TOUR",
    duration: "3–4 hours · departs 5:30 PM",
    bookingDuration: "3–4 hours",
    passengers: "Per vehicle",
    vehicle: "Land transfer + boat fee",
    pickup: "Abatan River, Cortes",
    description:
      "Watch thousands of fireflies light up the mangroves at night - one of Bohol's most magical and unique experiences.",
    stopsLabel: "Location",
    stops: ["Abatan River Mangroves, Cortes"],
    pricing: "Starting at ₱1,200/vehicle (land transfer) + boat fee",
    priceSummary: "₱1,200",
    ctaLabel: "Book Now",
    ctaHref: "/tours/firefly-watching",
    banner:
      "linear-gradient(135deg, rgba(214,180,86,.18) 0%, rgba(16,8,2,.9) 55%, rgba(5,3,1,.98) 100%)",
    bannerText: "FIREFLY",
  },
  {
    id: "danao-adventure",
    slug: "danao-adventure",
    name: "Danao Adventure Park Transfer",
    image: "/tours/AdventurePark.png",
    badge: "HALF DAY",
    duration: "4–5 hours",
    bookingDuration: "4–5 hours",
    passengers: "Round trip transfer",
    vehicle: "Zipline / ATV / Rappelling / Kayaking",
    pickup: "Flexible",
    description:
      "We'll get you to Danao Adventure Park and back. Activities are paid at the venue - just bring your sense of adventure.",
    stopsLabel: "Activities",
    stops: ["Zipline", "ATV", "Rappelling", "Kayaking"],
    pricing: "Starting at ₱2,500/vehicle (round trip transfer only)",
    priceSummary: "₱2,500",
    ctaLabel: "Book Now",
    ctaHref: "/tours/danao-adventure",
    banner:
      "linear-gradient(135deg, rgba(212,168,67,.18) 0%, rgba(23,12,3,.88) 54%, rgba(6,4,1,.98) 100%)",
    bannerText: "DANAO",
  },
  {
    id: "airport-transfer-tour",
    slug: "airport-transfer-tour",
    name: "Airport / Pier Transfer + Tour Combo",
    image: "/tours/AirportTransfer.png",
    badge: "COMBO",
    duration: "Flexible · based on arrival/departure time",
    bookingDuration: "Flexible",
    passengers: "Based on transfer needs",
    vehicle: "Sedan / SUV / Van",
    pickup: "Panglao International Airport or Tagbilaran Pier",
    description:
      "Arrive or depart in style. Add sightseeing stops on the way to or from the airport or pier - no wasted travel time.",
    stopsLabel: "Optional stops",
    stops: ["Baclayon Church", "Tarsier Sanctuary", "Blood Compact Shrine"],
    pricing: "Starting at ₱800 (transfer only) / ₱2,000 (with stops)",
    priceSummary: "₱800",
    ctaLabel: "Book Now",
    ctaHref: "/tours/airport-transfer-tour",
    banner:
      "linear-gradient(135deg, rgba(184,136,42,.2) 0%, rgba(13,8,3,.88) 54%, rgba(5,3,1,.98) 100%)",
    bannerText: "COMBO",
  },
  {
    id: "custom-private-tour",
    slug: "custom-private-tour",
    name: "Custom Private Tour",
    image: "/tours/CustomTour.png",
    badge: "PRIVATE",
    duration: "Flexible - you choose",
    bookingDuration: "Flexible",
    passengers: "You choose",
    vehicle: "Sedan / SUV / Van",
    pickup: "Flexible",
    description:
      "Build your own Bohol itinerary. Choose your destinations, set your pace, and enjoy a fully private tour with a dedicated local driver.",
    stopsLabel: "Build your own tour",
    stops: ["Sedan", "SUV", "Van"],
    pricing: "Request a Quote",
    priceSummary: "Request a Quote",
    ctaLabel: "Inquire Now",
    ctaHref: "/tours/custom-private-tour",
    banner:
      "linear-gradient(135deg, rgba(212,168,67,.2) 0%, rgba(15,9,1,.88) 54%, rgba(5,3,1,.98) 100%)",
    bannerText: "PRIVATE",
    actionLabel: "Send Inquiry",
  },
];
