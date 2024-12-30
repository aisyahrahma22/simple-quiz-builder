import argon2 from 'argon2';  // Ganti bcrypt dengan argon2
import { createClient } from '@supabase/supabase-js';
import { NextApiRequest, NextApiResponse } from 'next';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

     // Cek apakah email sudah terdaftar, hanya ambil kolom email
     const { data: existingUser, error: findError } = await supabase
     .from('users')
     .select('email, id')
     .ilike('email', email.trim())
     .single(); 

   if (findError && findError.code !== 'PGRST116') {
     return res.status(500).json({ error: 'Error checking if user exists.' });
   }

   // Jika email sudah terdaftar, beri respons error
   if (existingUser) {
     return res.status(400).json({ error: 'User already registered with this email.' });
   }

   // Hash the password using argon2
   const hashedPassword = await argon2.hash(password);

   // Insert user into the database
   const { data, error } = await supabase.from('users').insert({
     email,
     password: hashedPassword,
   });

   if (error) {
     return res.status(400).json({ error: error.message });
   }

   res.status(201).json({ message: 'Registration successful!', user: data });
  } else {
    res.status(405).json({ error: 'Method not allowed.' });
  }
}
