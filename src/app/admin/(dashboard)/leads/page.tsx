export const dynamic = 'force-dynamic';

import { createAdminClient } from '@/lib/supabase/server';
import { LeadsTableFiltered } from '@/components/admin/leads-table-filtered';

export default async function LeadsPage() {
  const supabase = createAdminClient();

  const [sessionsResult, quizzesResult] = await Promise.all([
    supabase
      .from('quiz_sessions')
      .select(`
        *,
        user:users(*),
        quiz:quizzes(title, slug),
        session_results(
          *,
          quiz_result:quiz_results(title)
        )
      `)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(100),
    supabase
      .from('quizzes')
      .select('id, title')
      .order('title'),
  ]);

  if (sessionsResult.error) {
    return <div>Error loading leads: {sessionsResult.error.message}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Leads & Completions</h1>
      </div>

      <LeadsTableFiltered
        sessions={sessionsResult.data ?? []}
        quizzes={quizzesResult.data ?? []}
      />
    </div>
  );
}
