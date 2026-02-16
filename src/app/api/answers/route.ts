import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { withAdminAuth } from '@/lib/auth/admin';

// POST /api/answers - Create a new answer
export const POST = withAdminAuth(async (request: NextRequest) => {
  const supabase = createAdminClient();
  const body = await request.json();

  const { data, error } = await supabase
    .from('answers')
    .insert({
      question_id: body.question_id,
      answer_text: body.answer_text,
      display_order: body.display_order || 0,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
});
