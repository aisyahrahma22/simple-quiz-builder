import { createClient } from '@supabase/supabase-js';
import { NextApiRequest, NextApiResponse } from 'next';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Only DELETE requests are allowed' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid questionId' });
  }

  try {
    const { data: questionData, error: questionError } = await supabase
      .from('questions')
      .delete()
      .eq('quiz_id', id)
      .select();

    if (questionError) {
      throw new Error(questionError.message);
    }

    if (questionData?.length > 0) {
      const questionIds = questionData.map((question) => question.id);
      const { error: answerError } = await supabase
        .from('answers')
        .delete()
        .in('question_id', questionIds);

      if (answerError) {
        throw new Error(answerError.message);
      }
    }

    // Delete the quiz
    const { error: quizError } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', id);

    if (quizError) {
      throw new Error(quizError.message);
    }

    return res.status(200).json({ message: 'Quiz and associated data deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: error || 'something wrong'});
  }
}
