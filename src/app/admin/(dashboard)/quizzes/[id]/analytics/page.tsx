export const dynamic = 'force-dynamic';

import { createAdminClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { AnalyticsDashboard } from '@/components/admin/analytics-dashboard';
import { QuizLeadsTable } from '@/components/admin/quiz-leads-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function QuizAnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: quiz, error } = await supabase
    .from('quizzes')
    .select('id, title, slug')
    .eq('id', id)
    .single();

  if (error || !quiz) {
    notFound();
  }

  const { data: sessions } = await supabase
    .from('quiz_sessions')
    .select(`
      id,
      completed_at,
      is_lead,
      user:users(name, email, profile_picture_url),
      session_results(
        is_primary,
        quiz_result:quiz_results(title)
      )
    `)
    .eq('quiz_id', id)
    .eq('status', 'completed')
    .eq('is_lead', true)
    .order('completed_at', { ascending: false })
    .limit(100);

  const leads = sessions ?? [];

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/admin/quizzes/${id}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Quiz
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Analytics: {quiz.title}</h1>
        <p className="text-muted-foreground mt-1">/q/{quiz.slug}</p>
      </div>

      <Tabs defaultValue="dashboard">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="leads">Leads ({leads.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <AnalyticsDashboard quizId={quiz.id} />
        </TabsContent>

        <TabsContent value="leads">
          <Card>
            <CardHeader>
              <CardTitle>Quiz Completions</CardTitle>
            </CardHeader>
            <CardContent>
              <QuizLeadsTable sessions={leads} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
