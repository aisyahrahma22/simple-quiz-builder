import { createClient } from '@supabase/supabase-js';
import { NextApiRequest, NextApiResponse } from 'next';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,  // Your Supabase URL
  process.env.SUPABASE_ANON_KEY!  // Your Supabase Anon Key
);

type QuizData = {
  user_id: string;
  quiz_id: string;
  score: number; // User's score
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { user_id, quiz_id, score }: QuizData = req.body;

    const { error: quizError } = await supabase
      .from('submissions')
      .insert([{ user_id, quiz_id, score: Number(score) }])
      .select();

    if (quizError) {
      return res.status(400).json({ error: quizError.message });
    }

    return res.status(200).json({ message: 'Quiz submitted successfully' });
  } else {
    res.status(405).send({ message: 'Only POST requests are allowed' });
  }
}
