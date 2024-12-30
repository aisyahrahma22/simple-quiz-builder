import { createClient } from '@supabase/supabase-js';
import { NextApiRequest, NextApiResponse } from 'next';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// Define types for quiz, question, and answer data
type Answer = {
  id: string;
  text: string;
  isCorrect: boolean;
};

type Question = {
  id: string; // Question ID
  questionText: string;
  answers: Answer[]; // Answer objects
  correctAnswer: number; // Correct answer index (0-4)
};

type QuizData = {
  id: string; // Quiz ID
  user_id: string;
  title: string;
  questions: Question[];
  score: number
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') {
    const { id, title, questions, score }: QuizData = req.body;

    // Update quiz metadata in the 'quizzes' table
    const { error: quizError } = await supabase
      .from('quizzes')
      .update({ title, score})
      .eq('id', id)
      .select();

    if (quizError) {
      return res.status(400).json({ error: quizError.message });
    }

    // Iterate through each question and update in the database
    for (const question of questions) {
      // Update the question in the 'questions' table
      const { error: questionError } = await supabase
        .from('questions')
        .update({ text: question.questionText })
        .eq('id', question.id) // Use the specific question ID
        .select();

      if (questionError) {
        return res.status(400).json({ error: questionError.message });
      }

      // Now handle the answers for this question
      const answers = question.answers.map((answer) => ({
        question_id: question.id, // Use the correct question_id
        text: answer.text,
        is_correct: answer.isCorrect,
        id: answer.id
      }));

      // Insert or update the answers
      for (const answer of answers) {
        const { error: answerError } = await supabase
          .from('answers')
          .update({ text: answer.text, is_correct: answer.is_correct})
          .eq('id', answer.id) 
           

        if (answerError) {
          return res.status(400).json({ error: answerError.message });
        }
      }
    }

    return res.status(200).json({ message: 'Quiz updated successfully' });
  } else {
    res.status(405).send({ message: 'Only PUT requests are allowed' });
  }
}
