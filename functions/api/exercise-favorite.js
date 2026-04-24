function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...(init.headers || {})
    }
  });
}

async function readJson(request) {
  try { return await request.json(); } catch { return {}; }
}

export async function onRequestPost({ request, env }) {
  if (!env.DB) return json({ error: 'D1 数据库未绑定。' }, { status: 500 });
  const body = await readJson(request);
  const studentCode = String(body.student_code || '').trim().slice(0, 64);
  const chapterId = String(body.chapter_id || '').trim();
  const exerciseIndex = Number(body.exercise_index);
  if (!studentCode || !chapterId || !Number.isInteger(exerciseIndex)) return json({ error: '参数不完整。' }, { status: 400 });

  const now = new Date().toISOString();
  await env.DB.batch([
    env.DB.prepare(`
      insert into students (student_code, student_name, updated_at)
      values (?, ?, ?)
      on conflict(student_code) do update set updated_at = excluded.updated_at
    `).bind(studentCode, studentCode, now),
    env.DB.prepare(`
      insert or ignore into exercise_favorites (student_code, chapter_id, exercise_index, updated_at)
      values (?, ?, ?, ?)
    `).bind(studentCode, chapterId, exerciseIndex, now)
  ]);

  return json({ ok: true });
}
