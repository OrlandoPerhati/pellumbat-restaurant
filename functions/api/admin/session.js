import { isAdmin, jsonResponse } from "../../_shared.js";

export async function onRequestGet({ request, env }) {
  return jsonResponse({ authenticated: await isAdmin(request, env) });
}
