import type { Car } from "@/types";

export const DEMO_CARS: Car[] = [
  {
    id: "c93cf1b7-51ce-4d91-891d-821b1c1b4d8c",
    name: "Toyota Hi-Ace Van",
    brand: "Toyota",
    model: "Hi-Ace",
    year: 2025,
    type: "van",
    color: "White",
    transmission: "Automatic",
    seats: 12,
    price_per_day: 3500,
    status: "available",
    image_urls: ["/cars/toyota_hi-ace.jpg"],
    description:
      "A premium group carrier for island tours, airport transfers, and executive travel across Bohol.",
    created_at: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "4edefa42-bcae-4999-9c2d-094b95cc49a8",
    name: "Toyota Rush",
    brand: "Toyota",
    model: "Rush",
    year: 2025,
    type: "suv",
    color: "Metallic Brown",
    transmission: "Automatic",
    seats: 7,
    price_per_day: 2500,
    status: "available",
    image_urls: ["/cars/toyota rush.jpg"],
    description:
      "A refined SUV with elevated seating, flexible cabin space, and confident island-road handling.",
    created_at: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "d94ea4e9-cc1e-446b-aa63-70705b8fa7df",
    name: "Toyota Avanza",
    brand: "Toyota",
    model: "Avanza",
    year: 2024,
    type: "mpv",
    color: "Silver",
    transmission: "Automatic",
    seats: 7,
    price_per_day: 2000,
    status: "available",
    image_urls: ["/cars/toyota-avanza.jpg"],
    description:
      "A balanced MPV for families and small groups who want comfort, economy, and luggage flexibility.",
    created_at: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "66e1d48a-4ffa-4dfc-a2fb-106e63eb85ab",
    name: "Suzuki Celerio",
    brand: "Suzuki",
    model: "Celerio",
    year: 2024,
    type: "hatchback",
    color: "Blue",
    transmission: "Automatic",
    seats: 5,
    price_per_day: 1500,
    status: "available",
    image_urls: ["/cars/Maruti_Suzuki_Celerio.avif"],
    description:
      "A compact, efficient city car ideal for solo travelers and couples exploring Panglao and Dauis.",
    created_at: "2026-01-01T00:00:00.000Z",
  },
];

export function findDemoCar(id: string): Car | null {
  return DEMO_CARS.find((car) => car.id === id) ?? null;
}
