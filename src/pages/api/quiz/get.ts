import { createClient } from '@supabase/supabase-js';
import { NextApiRequest, NextApiResponse } from 'next';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

type Answer = {
  id: string;
  text: string;
  is_correct: boolean;
};

type Question = {
  id: string;
  text: string;
  Answers: Answer[];
};

type Quiz = {
  id: string;
  title: string;
  user_id: string;
  score: number
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    const { quizId } = req.query;

    if (!quizId || Array.isArray(quizId)) {
      return res.status(400).json({ error: 'Invalid quiz ID' });
    }

    // Fetch quiz details
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', quizId)
      .single();

    if (quizError) {
      return res.status(404).json({ error: quizError.message });
    }

    // Fetch questions and answers
    const { data: questions, error: questionError } = await supabase
      .from('questions')
      .select(`
        id,
        text,
        Answers (
          id,
          text,
          is_correct
        )
      `)
      .eq('quiz_id', quizId);

    if (questionError) {
      return res.status(404).json({ error: questionError.message });
    }

    return res.status(200).json({ quiz, questions });
  } else {
    res.status(405).send({ message: 'Only GET requests are allowed' });
  }
}
