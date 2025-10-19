// Schemas for validation (can be expanded with zod later)
export const schemas = {
  quote: {
    type: "object",
    required: ["customer_id", "tour_id", "date", "seats"],
    properties: {
      customer_id: { type: "string" },
      tour_id: { type: "string" },
      date: { type: "string" },
      seats: { type: "number", minimum: 1 }
    }
  }
};
