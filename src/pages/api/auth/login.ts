import { createClient } from '@supabase/supabase-js';
import { NextApiRequest, NextApiResponse } from 'next';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

type LoginData = {
  email: string;
  password: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { email, password }: LoginData = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    try {
      // Cek apakah pengguna ada
      const { data: existingUser, error: findError } = await supabase
        .from('users')
        .select('email, id')
        .ilike('email', email.trim())
        .single();

      if (findError && findError.code !== 'PGRST116') {
        return res.status(500).json({ error: 'Error checking if user exists.' });
      }

      if (!existingUser) {
        return res.status(400).json({ error: 'Incorrect email or password.' });
      }

      // Buat token (opsional, tergantung kebutuhan)
      const token = `dummy-token-for-${existingUser.id}`; // Gunakan pustaka seperti `jsonwebtoken` untuk membuat token sebenarnya.

      return res.status(200).json({
        message: 'Login successful',
        user: existingUser,
        token, // Kembalikan token ke frontend
      });
    } catch (error) {
      console.log('err', error)
      return res.status(500).json({
        error: 'An unexpected error occurred during login.',
      });
    }
  } else {
    res.status(405).send({ message: 'Only POST requests are allowed' });
  }
}
