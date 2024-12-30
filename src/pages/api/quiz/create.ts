import { createClient } from '@supabase/supabase-js';
import { NextApiRequest, NextApiResponse } from 'next';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// Define types for quiz, question, and answer data
type Answer = {
  text: string;
  isCorrect: boolean;
};

type Question = {
  questionText: string;
  answers: string[]; // A-E answers (text)
  correctAnswer: number; // Correct answer index (0-4)
};

type QuizData = {
  user_id: string;
  title: string;
  questions: Question[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { user_id, title, questions }: QuizData = req.body;
    // Insert quiz metadata into the database
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .insert([{ user_id: user_id, title }])
      .select();

    if (quizError) {
      return res.status(400).json({ error: quizError.message });
    }

    // Iterate through each question and insert into the database
    for (const question of questions) {
      // Insert the question into the 'Questions' table
      const { data: questionData, error: questionError } = await supabase
        .from('questions')
        .insert([{ quiz_id: quiz[0].id, text: question.questionText, }])
        .select();

      if (questionError) {
        return res.status(400).json({ error: questionError.message });
      }

      // Insert the answers into the 'Answers' table with a flag for correct answer
      const answers = question.answers.map((answer, index) => ({
        question_id: questionData[0].id,
        text: answer,
        is_correct: index === question?.correctAnswer, // Mark the correct answer
      }));

      const { error: answersError } = await supabase.from('answers').insert(answers);

      if (answersError) {
        return res.status(400).json({ error: answersError.message });
      }
    }

    return res.status(200).json({ message: 'Quiz created successfully' });
  } else {
    res.status(405).send({ message: 'Only POST requests are allowed' });
  }
}
