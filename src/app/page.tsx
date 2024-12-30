'use client'; // Marking as a Client Component

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Home() {
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and register
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // State untuk show/hide password
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false); // State untuk loading
  const router = useRouter();

  const handleSubmit = async () => {
    setErrorMessage(''); // Reset error message
    if (!email || !password) {
      setErrorMessage('Email and password are required.');
      return;
    }

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    setIsLoading(true);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if(data.token) localStorage.setItem('userToken', data.token);
    if (!response.ok) {
      setErrorMessage(data.error || 'An error occurred');
    } else {
      setIsLoading(false);
      setErrorMessage('Something went wrong, please try again.');
      router.push('/ui/quiz-builder');
    }
  };

  // Reset error message when toggling between login and register
  const handleToggle = () => {
    setIsLogin(!isLogin);
    setErrorMessage(''); // Clear error message when switching
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <Image
        className="dark:invert mb-6"
        src="/quiz-logo.png"
        alt="Quiz logo"
        width={180}
        height={38}
        priority
      />
      <div className="bg-white p-8 rounded-lg shadow-md max-w-sm w-full">
        <h1 className="text-2xl font-semibold text-center mb-6">
          {isLogin ? 'Login' : 'Register'}
        </h1>
        {errorMessage && (
          <p className="text-red-500 text-sm mb-4 text-center">{errorMessage}</p>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="space-y-4"
        >
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'} // Show/Hide password
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className={`w-full py-2 px-4 rounded-lg ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'  // Color for the loading state (disabled)
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : isLogin ? 'Login' : 'Register'}
          </button>
        </form>
        <p className="text-sm text-center mt-4">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            type="button"
            onClick={handleToggle} // Use the new toggle function
            className="text-blue-500 hover:underline"
          >
            {isLogin ? 'Register here' : 'Login here'}
          </button>
        </p>
      </div>
    </div>
  );
}
