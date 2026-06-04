export type CarStatus = "available" | "rented" | "maintenance";
export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface Car {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  type: string;
  color: string;
  transmission: string;
  seats: number;
  price_per_day: number;
  status: CarStatus;
  image_urls: string[];
  description: string;
  created_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  car_id: string;
  pickup_date: string;
  return_date: string;
  pickup_location: string;
  total_price: number;
  status: BookingStatus;
  notes: string;
  created_at: string;
  car?: Car;
}

export interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  method: string;
  reference_no: string;
  status: PaymentStatus;
  paid_at: string;
  created_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  license_url: string;
  created_at: string;
}
