import { useState, useEffect } from 'react';  
import { useRouter } from 'next/router';
import Swal from 'sweetalert2'; // Import SweetAlert
import "../../app/globals.css";
import Navbar from './components/navbar';


const QuizBuilder = () => {
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState([
    { questionText: '', answers: ['', '', '', '', ''], correctAnswer: 0 },
  ]);
  const [userId, setUserId] = useState(''); // You can get the user ID from Supabase session
  const router = useRouter();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('userToken'); // Simulasi token
    if (!isAuthenticated) {
      router.push('/'); // Redirect ke login jika belum login
    } else {
      const cleanedString = isAuthenticated?.replace("dummy-token-for-", "");
      setUserId(cleanedString);
    }
  }, [router]);

  // Handle adding quiz
  const handleAddQuiz = async () => {
    // Calculate score based on the number of questions
    const totalQuestions = questions.length;
    const scorePerQuestion = 100 / totalQuestions; // Each question is worth this many points
    let correctAnswersCount = 0;

    // Count correct answers
    questions.forEach((question) => {
      if (question.answers[question.correctAnswer]) {
        correctAnswersCount++;
      }
    });

    const score = scorePerQuestion * correctAnswersCount;

    const response = await fetch('/api/quiz/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        user_id: userId,
        questions,
        score, 
      }),
    });

    const result = await response.json();

    if (response.ok) {
      // Show SweetAlert success message
      Swal.fire({
        title: 'Quiz Saved!',
        text: `Your quiz has been successfully saved!`,
        icon: 'success',
        confirmButtonText: 'OK'
      });
    } else {
      // Show SweetAlert error message
      Swal.fire({
        title: 'Error!',
        text: result.error || 'Something went wrong while saving your quiz.',
        icon: 'error',
        confirmButtonText: 'Try Again'
      });
    }
  };

  // Handle adding question
  const handleAddQuestion = () => {
    setQuestions([...questions, { questionText: '', answers: ['', '', '', '', ''], correctAnswer: 0 }]);
  };

  // Handle removing a question
  const handleRemoveQuestion = (index: number) => {
    const newQuestions = questions.filter((_, idx) => idx !== index); // Remove question by index
    setQuestions(newQuestions);
  };

  const handleViewAllQuestions = () => {
    router.push(`/list`)
  };

  return (
   <>
    <Navbar />
   <div className="container mx-auto p-8">
      <h2 className="text-3xl font-semibold text-gray-800 mb-6">Create a New Quiz</h2>

      {/* Quiz Title */}
      <input
        type="text"
        placeholder="Quiz Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-4 mb-6 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Questions */}
      {questions.map((question, idx) => (
        <div key={idx} className="mb-8 border-b pb-4 ">
          <div className="flex items-center">
          <span className="text-gray-800 font-semibold mr-3">{idx + 1}.</span>
          <input
            type="text"
            placeholder="Question"
            value={question.questionText}
            onChange={(e) => {
              const newQuestions = [...questions];
              newQuestions[idx].questionText = e.target.value;
              setQuestions(newQuestions);
            }}
            className="w-full p-4 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          </div>
          {/* Answer Inputs A-E */}
          {question.answers.map((answer, ansIdx) => (
            <div key={ansIdx} className="flex items-center mb-4">
              <span className="text-gray-700 font-semibold">{String.fromCharCode(65 + ansIdx)}.</span>
              <input
                type="text"
                placeholder={`Answer ${String.fromCharCode(65 + ansIdx)}`}
                value={answer}
                onChange={(e) => {
                  const newQuestions = [...questions];
                  newQuestions[idx].answers[ansIdx] = e.target.value;
                  setQuestions(newQuestions);
                }}
                className="w-full p-4 ml-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}

          {/* Correct Answer Dropdown */}
          <select
            value={question.correctAnswer}
            onChange={(e) => {
              const newQuestions = [...questions];
              newQuestions[idx].correctAnswer = Number(e.target.value);
              setQuestions(newQuestions);
            }}
            className="w-full p-4 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={0}>Answer A</option>
            <option value={1}>Answer B</option>
            <option value={2}>Answer C</option>
            <option value={3}>Answer D</option>
            <option value={4}>Answer E</option>
          </select>

          {/* Remove Question Button */}
          <button
            onClick={() => handleRemoveQuestion(idx)}
            className="text-red-500 text-sm mt-2"
          >
            Remove Question
          </button>
        </div>
      ))}

      {/* Add Question and Save Quiz Buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleAddQuestion}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Add Question
        </button>
        <button
          onClick={handleAddQuiz}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          Save Quiz
        </button>
        <button
           onClick={() => router.push('/ui/list')} 
          className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          View All Questions
        </button>
      </div>
    </div>
   </>
  );
};

export default QuizBuilder;
