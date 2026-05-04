import {
  jsonResponse,
  readJsonBody,
  requireAdmin,
  rowToMenuItem,
  validateMenuItem,
} from "../../_shared.js";

async function findById(env, id) {
  return env.DB.prepare(
    "SELECT id, category, name, description, price, tags, available FROM menu_items WHERE id = ?",
  )
    .bind(id)
    .first();
}

export async function onRequestPatch({ request, env, params }) {
  const denied = await requireAdmin(request, env);
  if (denied) return denied;

  const existing = await findById(env, params.id);
  if (!existing) return jsonResponse({ error: "Menu item not found." }, 404);

  const input = await readJsonBody(request);
  const merged = { ...rowToMenuItem(existing), ...input };
  const { item, error } = validateMenuItem(merged, existing.id);
  if (error) return jsonResponse({ error }, 400);

  await env.DB.prepare(
    "UPDATE menu_items SET category = ?, name = ?, description = ?, price = ?, tags = ?, available = ? WHERE id = ?",
  )
    .bind(item.category, item.name, item.description, item.price, item.tags, item.available ? 1 : 0, item.id)
    .run();

  return jsonResponse({ item });
}

export async function onRequestDelete({ request, env, params }) {
  const denied = await requireAdmin(request, env);
  if (denied) return denied;

  const existing = await findById(env, params.id);
  if (!existing) return jsonResponse({ error: "Menu item not found." }, 404);

  await env.DB.prepare("DELETE FROM menu_items WHERE id = ?").bind(params.id).run();
  return jsonResponse({ item: rowToMenuItem(existing) });
}
