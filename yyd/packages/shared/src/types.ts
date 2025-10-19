export type QuoteRequest = {
  customer_id: string;
  tour_id: string;
  date: string;
  seats: number;
};

export type QuoteResponse = {
  price_eur: number;
  risk?: number;
};

export type BookingRequest = QuoteRequest & {
  payment_token?: string;
};
