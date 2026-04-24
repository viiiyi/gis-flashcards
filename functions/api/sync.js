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
  try {
    return await request.json();
  } catch {
    return {};
  }
}

function cleanStudent(input = {}) {
  const code = String(input.code || input.student_code || '').trim().slice(0, 64);
  const name = String(input.name || input.student_name || '').trim().slice(0, 64);
  if (!code || !name) throw new Error('姓名和学号不能为空');
  return { code, name };
}

export async function onRequestPost({ request, env }) {
  if (!env.DB) return json({ error: 'D1 数据库未绑定，请在 Cloudflare Pages 里绑定 DB。' }, { status: 500 });

  const body = await readJson(request);
  const student = cleanStudent(body.student);
  const favorites = body.favorites && typeof body.favorites === 'object' ? body.favorites : {};
  const progress = body.progress && typeof body.progress === 'object' ? body.progress : {};
  const answer = body.answer || null;
  const now = new Date().toISOString();

  const statements = [
    env.DB.prepare(`
      insert into students (student_code, student_name, updated_at)
      values (?, ?, ?)
      on conflict(student_code) do update set
        student_name = excluded.student_name,
        updated_at = excluded.updated_at
    `).bind(student.code, student.name, now),
    env.DB.prepare('delete from favorites where student_code = ?').bind(student.code)
  ];

  for (const [chapterId, indexes] of Object.entries(favorites)) {
    const uniqueIndexes = [...new Set((Array.isArray(indexes) ? indexes : []).map(Number))]
      .filter(Number.isInteger)
      .sort((a, b) => a - b);

    for (const cardIndex of uniqueIndexes) {
      statements.push(env.DB.prepare(`
        insert or ignore into favorites (student_code, chapter_id, card_index, updated_at)
        values (?, ?, ?, ?)
      `).bind(student.code, chapterId, cardIndex, now));
    }
  }

  for (const [chapterId, value] of Object.entries(progress)) {
    statements.push(env.DB.prepare(`
      insert into progress (student_code, chapter_id, card_index, correct_count, incorrect_count, updated_at)
      values (?, ?, ?, ?, ?, ?)
      on conflict(student_code, chapter_id) do update set
        card_index = excluded.card_index,
        correct_count = excluded.correct_count,
        incorrect_count = excluded.incorrect_count,
        updated_at = excluded.updated_at
    `).bind(
      student.code,
      chapterId,
      Number(value.index) || 0,
      Number(value.correct) || 0,
      Number(value.incorrect) || 0,
      value.updatedAt ? new Date(value.updatedAt).toISOString() : now
    ));
  }

  if (answer) {
    statements.push(env.DB.prepare(`
      insert into answer_logs (student_code, chapter_id, card_index, study_mode, is_correct, answered_at)
      values (?, ?, ?, ?, ?, ?)
    `).bind(
      student.code,
      String(answer.chapter_id || ''),
      Number(answer.card_index) || 0,
      String(answer.study_mode || 'chapter'),
      answer.is_correct ? 1 : 0,
      now
    ));
  }

  await env.DB.batch(statements);
  return json({ ok: true, synced_at: now });
}
