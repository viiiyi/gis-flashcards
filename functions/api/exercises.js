const corsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, OPTIONS',
  'access-control-allow-headers': 'content-type'
};

function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...corsHeaders,
      ...(init.headers || {})
    }
  });
}

export async function onRequestGet({ env }) {
  if (!env.DB) return json({ error: 'D1 数据库未绑定。' }, { status: 500 });

  const { results: chapterRows } = await env.DB.prepare(`
    select c.chapter_id as id, c.title, coalesce(c.description, '') as description
    from chapters c
    where exists (select 1 from exercises e where e.chapter_id = c.chapter_id)
    order by c.sort_order, c.chapter_id
  `).all();

  const { results: exerciseRows } = await env.DB.prepare(`
    select chapter_id, exercise_index, question, option_a, option_b, option_c, option_d, correct_answer, explanation
    from exercises
    order by chapter_id, exercise_index
  `).all();

  const chapters = chapterRows.map((chapter) => ({
    id: chapter.id,
    title: chapter.title,
    description: chapter.description,
    exercises: exerciseRows
      .filter((exercise) => exercise.chapter_id === chapter.id)
      .map((exercise) => ({
        question: exercise.question,
        options: {
          A: exercise.option_a,
          B: exercise.option_b,
          C: exercise.option_c,
          D: exercise.option_d
        },
        correctAnswer: exercise.correct_answer,
        explanation: exercise.explanation
      }))
  }));

  return json({ chapters });
}

export function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders });
}
