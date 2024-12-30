import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { user_id } = req.query;

  if (req.method === 'GET') {
    // Fetch all quizzes by user_id
    const { data: quizzes, error: quizError } = await supabase
      .from('quizzes')
      .select('*')
      .eq('user_id', user_id);

    if (quizError) {
      return res.status(400).json({ error: quizError.message });
    }

    // Fetch questions and answers for each quiz
    const quizzesWithQuestions = await Promise.all(
      quizzes.map(async (quiz) => {
        const { data: questions, error: questionError } = await supabase
          .from('questions')
          .select('id, text')
          .eq('quiz_id', quiz.id);

        if (questionError) {
          return res.status(400).json({ error: questionError.message });
        }

        // Fetch answers for each question
        const questionsWithAnswers = await Promise.all(
          questions.map(async (question) => {
            const { data: answers, error: answerError } = await supabase
              .from('answers')
              .select('text, is_correct')
              .eq('question_id', question.id);

            if (answerError) {
              return res.status(400).json({ error: answerError.message });
            }

            return {
              ...question,
              answers,
            };
          })
        );

        return {
          ...quiz,
          questions: questionsWithAnswers,
        };
      })
    );

    res.status(200).json(quizzesWithQuestions);
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
