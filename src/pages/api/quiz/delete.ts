import { createClient } from '@supabase/supabase-js';
import { NextApiRequest, NextApiResponse } from 'next';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// API handler for DELETE request
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check if the HTTP method is DELETE
  if (req.method === 'DELETE') {
    // Extract questionId from query params
    const { id } = req.query;

    // Ensure the questionId is provided
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid questionId' });
    }

    // Delete associated answers first
    const { error: answerError } = await supabase
      .from('answers')  // Ensure the correct table name for answers
      .delete()
      .eq('question_id', id);

    if (answerError) {
      return res.status(500).json({ error: answerError.message });
    }

    // Now delete the question itself
    const { error: questionError } = await supabase
      .from('questions')  // Ensure the correct table name for questions
      .delete()
      .eq('id', id);

    if (questionError) {
      return res.status(500).json({ error: questionError.message });
    }

    // Return a success message if everything is successful
    return res.status(200).json({ message: 'Question and associated answers deleted successfully' });
  } else {
    // If the method is not DELETE, return a 405 Method Not Allowed
    return res.status(405).json({ message: 'Only DELETE requests are allowed' });
  }
}
