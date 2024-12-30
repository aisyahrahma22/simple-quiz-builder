"use client"; 

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import "../../../app/globals.css";
import Swal from 'sweetalert2';
import Navbar from "../components/navbar";
interface Answer {
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  text: string;
  answers: Answer[];
}

interface Quiz {
  id: string;
  title: string;
  questions: Question[];
}

const QuizDetail = () => {
  const router = useRouter();
  const { quizId } = router.query;
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState<string[]>([]);
  const [userId, setUserId] = useState(''); // You can get the user ID from Supabase session
  
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('userToken'); // Simulasi token
    if (!isAuthenticated) {
      router.push('/'); // Redirect ke login jika belum login
    } else {
      const cleanedString = isAuthenticated?.replace("dummy-token-for-", "");
      setUserId(cleanedString);
    }
  }, [router]);

  useEffect(() => {
    if (!quizId) return;

    // Fetch quiz data by quizId
    const fetchQuizData = async () => {
      const response = await fetch(`/api/quiz/details?id=${quizId}`);
      const data: Quiz = await response.json();
      setQuiz(data);
      setAnswers(Array(data.questions.length).fill("")); // Initialize answers array
    };
    
    fetchQuizData();
  }, [quizId]);

  const handleAnswerChange = (index: number, value: string) => {
    const updatedAnswers = [...answers];
    updatedAnswers[index] = value;
    setAnswers(updatedAnswers);
  };

  const handleSubmitAnswers = async () => {
    if (!quiz) return;
  
    let correctCount = 0;
    const correctAnswerTexts: string[] = [];
  
    quiz.questions.forEach((question, index) => {
      const selectedAnswerText = answers[index]?.trim().toLowerCase(); // Normalize selected answer (trim and lowercase)
      const correctAnswer = question.answers.find((a) => a.isCorrect);
  
      if (correctAnswer) {
        const correctAnswerText = correctAnswer.text.trim().toLowerCase(); // Normalize correct answer (trim and lowercase)
  
        // Check if the selected answer is correct
        if (selectedAnswerText === correctAnswerText) {
          correctCount++;
        }
  
        correctAnswerTexts.push(correctAnswerText); // Save correct answer text
      }
    });
  
    const calculatedScore = (correctCount / quiz.questions.length) * 100;
    setScore(calculatedScore);
    setCorrectAnswers(correctAnswerTexts);
  
    // Save the result (score and answers) to the backend
    try {
      const response = await fetch("/api/quiz/save-submission", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quiz_id: quiz.id,
          score: calculatedScore,
          user_id: userId,
        }),
      });
  
      if (response.ok) {
        const data = await response.json();
        Swal.fire({
          icon: 'success',
          title: 'Submission saved successfully!',
          text: `Your score: ${calculatedScore}`,
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Failed to save submission',
          text: `Error: ${response.statusText}`,
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error submitting answers',
        text: `Error: ${error}`,
      });
    }
  };
  

  if (!quiz) return <div>Loading...</div>;

  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-8">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6">{quiz.title}</h2>
        {score === null ? (
          <form>
            {quiz.questions.map((question, index) => (
              <div key={question.id} className="mb-6">
                <p className="text-xl text-gray-800 mb-2">
                  Question {index + 1}: {question.text}
                </p>
                {question.answers.map((answer, ansIndex) => (
                  <div key={ansIndex} className="flex items-center mb-2">
                    <input
                      type="radio"
                      name={`question-${index}`}
                      value={answer.text}
                      onChange={(e) => handleAnswerChange(index, e.target.value)}
                      className="mr-2"
                    />
                    <label>{answer.text}</label>
                  </div>
                ))}
              </div>
            ))}
            <button
              type="button"
              onClick={handleSubmitAnswers}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Submit Answers
            </button>
          </form>
        ) : (
          <div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Your Score: {score}</h3>
            <h4 className="text-xl font-semibold text-gray-800 mb-2">Correct Answers:</h4>
            <ul className="list-disc pl-6">
              {correctAnswers.map((answer, index) => (
                <li key={index}>
                  Question {index + 1}: {answer}
                </li>
              ))}
            </ul>
            <button
              onClick={() => router.push("/ui/take-quiz")}
              className="mt-6 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Take Another Quiz
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizDetail;
