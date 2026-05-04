import {
  jsonResponse,
  readJsonBody,
  requireAdmin,
  rowToMenuItem,
  validateMenuItem,
} from "../../_shared.js";

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    "SELECT id, category, name, description, price, tags, available FROM menu_items ORDER BY position ASC, rowid ASC",
  ).all();
  return jsonResponse({ menu: (results || []).map(rowToMenuItem) });
}

export async function onRequestPost({ request, env }) {
  const denied = await requireAdmin(request, env);
  if (denied) return denied;

  const input = await readJsonBody(request);
  const { item, error } = validateMenuItem(input);
  if (error) return jsonResponse({ error }, 400);

  let candidateId = item.id;
  let attempts = 0;
  while (attempts < 8) {
    const conflict = await env.DB.prepare("SELECT id FROM menu_items WHERE id = ?")
      .bind(candidateId)
      .first();
    if (!conflict) break;
    candidateId = `${item.id}-${crypto.randomUUID().slice(0, 4)}`;
    attempts += 1;
  }
  item.id = candidateId;

  const { results: maxRow } = await env.DB.prepare(
    "SELECT COALESCE(MAX(position), 0) AS max_position FROM menu_items",
  ).all();
  const nextPosition = (maxRow?.[0]?.max_position || 0) + 1;

  await env.DB.prepare(
    "INSERT INTO menu_items (id, category, name, description, price, tags, available, position) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
  )
    .bind(
      item.id,
      item.category,
      item.name,
      item.description,
      item.price,
      item.tags,
      item.available ? 1 : 0,
      nextPosition,
    )
    .run();

  return jsonResponse({ item }, 201);
}
