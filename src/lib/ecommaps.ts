import { createEcommapsClient } from "@ecommaps/client";

const API_URL = process.env.NEXT_PUBLIC_ECOMMAPS_API_URL || "https://api.ecommaps.com/api/v1/storefront";
const API_KEY = process.env.ECOMMAPS_API_KEY || "";

if (!process.env.NEXT_PUBLIC_ECOMMAPS_API_URL || !process.env.ECOMMAPS_API_KEY) {
  console.warn("⚠️ Ecommaps credentials are not defined in environment variables. Function calls will fail.");
}

export const ecommapsClient = createEcommapsClient({
  apiUrl: API_URL,
  apiKey: API_KEY,
});
