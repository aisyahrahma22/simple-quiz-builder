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
    const { userId } = req.query;
console.log('userId', userId)
    if (!userId) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

     // Fetch the quiz submissions for the user
     const { data: submissions, error: subQuizError } = await supabase
     .from('submissions')
     .select('*')
     .eq('user_id', userId);

   if (subQuizError) {
     throw new Error(subQuizError.message);
   }

   if (!submissions || submissions.length === 0) {
     return res.status(404).json({ message: 'No submissions found for this user' });
   }

   const quizIds = submissions.map((submission: any) => submission.quiz_id);

   // Fetch the quizzes by IDs
   const { data: quizzes, error: quizError } = await supabase
     .from('quizzes')
     .select('id, title') // Only fetch necessary fields (id, title)
     .in('id', quizIds);
   if (quizError) {
     throw new Error(quizError.message);
   }
   const result = submissions.map((submission) => {
    const quiz = quizzes.find((quiz) => quiz.id === submission.quiz_id);
    const newData = {
        ...submission,
        title: quiz?.title
    }
    return newData;
  });


  return res.status(200).json(result);
  } else {
    res.status(405).send({ message: 'Only GET requests are allowed' });
  }
}
