function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...(init.headers || {})
    }
  });
}

export async function onRequestGet({ env }) {
  if (!env.DB) return json({ error: 'D1 数据库未绑定。' }, { status: 500 });

  const { results: chapterRows } = await env.DB.prepare(`
    select chapter_id as id, title, coalesce(description, '') as description
    from chapters
    order by sort_order, chapter_id
  `).all();

  const { results: cardRows } = await env.DB.prepare(`
    select chapter_id, card_index, front, back
    from cards
    order by chapter_id, card_index
  `).all();

  const chapters = chapterRows.map((chapter) => ({
    id: chapter.id,
    title: chapter.title,
    description: chapter.description,
    cards: cardRows
      .filter((card) => card.chapter_id === chapter.id)
      .map((card) => ({ front: card.front, back: card.back }))
  }));

  return json({ chapters });
}
