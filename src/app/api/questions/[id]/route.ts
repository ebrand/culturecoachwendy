import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { withAdminAuth } from '@/lib/auth/admin';

// PATCH /api/questions/[id] - Update a question
export const PATCH = withAdminAuth(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const supabase = createAdminClient();
  const body = await request.json();

  const { data, error } = await supabase
    .from('questions')
    .update(body)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
});

// DELETE /api/questions/[id] - Delete a question
export const DELETE = withAdminAuth(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('questions')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
});
