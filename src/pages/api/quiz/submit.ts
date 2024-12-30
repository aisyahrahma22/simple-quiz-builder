import { createClient } from '@supabase/supabase-js';
import { NextApiRequest, NextApiResponse } from 'next';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

type AnswerSubmission = {
  questionId: string;
  answerId: string;
};

type SubmissionData = {
  userId: string;
  quizId: string;
  answers: AnswerSubmission[];
};

type CorrectAnswer = {
  id: string;
  is_correct: boolean;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { userId, quizId, answers }: SubmissionData = req.body;

    // Fetch correct answers
    const { data: correctAnswers, error } = await supabase
      .from('Answers')
      .select('id, is_correct')
      .eq('is_correct', true)
      .in('question_id', answers.map((a) => a.questionId));

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Calculate score
    const score = answers.reduce((total, answer) => {
      return total + (correctAnswers.some((a: CorrectAnswer) => a.id === answer.answerId) ? 1 : 0);
    }, 0);

    // Save submission
    const { error: submissionError } = await supabase
      .from('Submissions')
      .insert([{ user_id: userId, quiz_id: quizId, score }]);

    if (submissionError) {
      return res.status(400).json({ error: submissionError.message });
    }

    return res.status(200).json({ score });
  } else {
    res.status(405).send({ message: 'Only POST requests are allowed' });
  }
}
