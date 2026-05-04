import { jsonResponse } from "../_shared.js";

export const onRequestGet = () => jsonResponse({ ok: true, service: "restaurant-website" });
