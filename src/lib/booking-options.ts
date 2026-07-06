export interface BookingOption {
  id: string;
  name: string;
  pricePerDay: number;
  description: string;
  icon: string;
}

export const PREMIUM_OPTIONS: BookingOption[] = [
  {
    id: "insurance_premium",
    name: "Premium Insurance",
    pricePerDay: 500,
    description: "Full coverage including zero-deductible and roadside assistance.",
    icon: "🛡️",
  },
  {
    id: "gps_navigation",
    name: "Satellite GPS",
    pricePerDay: 200,
    description: "Latest high-precision GPS for seamless island navigation.",
    icon: "📍",
  },
  {
    id: "child_seat",
    name: "Child Safety Seat",
    pricePerDay: 300,
    description: "Certified safety seat for infants and toddlers.",
    icon: "👶",
  },
  {
    id: "airport_transfer",
    name: "VIP Airport Meet & Greet",
    pricePerDay: 1000,
    description: "Dedicated chauffeur waiting at the arrival gate.",
    icon: "✈️",
  },
];
