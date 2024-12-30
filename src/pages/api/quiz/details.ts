import { createClient } from '@supabase/supabase-js';
import { NextApiRequest, NextApiResponse } from 'next';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    const { id } = req.query; 

    if (!id) {
      return res.status(400).json({ error: 'Quiz ID is required' });
    }

    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', id)
      .single();

    if (quizError) {
      return res.status(400).json({ error: quizError.message });
    }

    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('id, text, quiz_id')
      .eq('quiz_id', id);

    if (questionsError) {
      return res.status(400).json({ error: questionsError.message });
    }

    const { data: answers, error: answersError } = await supabase
      .from('answers')
      .select('id, question_id, text, is_correct')
      .in('question_id', questions.map((question: any) => question.id));

    if (answersError) {
      return res.status(400).json({ error: answersError.message });
    }

    const quizDetails = {
      id: quiz.id,
      title: quiz.title,
      questions: questions.map((question: any) => ({
        questionText: question.text,
        id: question.id,
        answers: answers
          .filter((answer: any) => answer.question_id === question.id)
          .map((answer: any) => ({
            text: answer.text,
            isCorrect: answer.is_correct,
            id: answer.id
          }))
      }))
    };

    return res.status(200).json(quizDetails);
  } else {
    res.status(405).send({ message: 'Only GET requests are allowed' });
  }
}
