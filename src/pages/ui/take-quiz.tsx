import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import "../../app/globals.css";
import Navbar from "./components/navbar";

interface Answer {
  text: string;
  is_correct: boolean;
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

interface QuizHistory {
  id: string;
  quiz_id: string;
  title: string;
  score: number;
}

const TakeQuiz = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [quizHistory, setQuizHistory] = useState<QuizHistory[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null); // Assuming this is fetched from session

  const router = useRouter();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("userToken"); // Simulate token retrieval
    if (!isAuthenticated) {
      router.push("/"); // Redirect to login if not authenticated
    } else {
      const cleanedUserId = isAuthenticated.replace("dummy-token-for-", "");
      setUserId(cleanedUserId);
    }
  }, [router]);

  // Fetch quizzes and quiz history
  useEffect(() => {
    if (!userId) return;

    const fetchQuizzes = async () => {
      try {
        const response = await fetch("/api/quiz/all-quiz");
        const data = await response.json();
        setQuizzes(data);
      } catch (error) {
        console.error("Error fetching quizzes:", error);
      }
    };

    const fetchQuizHistory = async () => {
      try {
        const response = await fetch(`/api/quiz/history?userId=${userId}`);
        const data = await response.json();
        console.log('data', data)
        setQuizHistory(data);
      } catch (error) {
        console.error("Error fetching quiz history:", error);
      }
    };

    fetchQuizzes();
    fetchQuizHistory();
  }, [userId]);

  const handleQuizSelection = (quizId: string) => {
    router.push(`/ui/single-quiz/${quizId}`);
  };

  const handleAnswerChange = (index: number, value: string) => {
    const updatedAnswers = [...answers];
    updatedAnswers[index] = value;
    setAnswers(updatedAnswers);
  };

  const handleSubmitAnswers = () => {
    if (!selectedQuiz) return;

    let correctCount = 0;
    const correctAnswerTexts: string[] = [];

    selectedQuiz.questions.forEach((question, index) => {
      const selectedAnswerText = answers[index];
      const correctAnswer = question.answers.find((a) => a.is_correct);

      if (correctAnswer && correctAnswer.text === selectedAnswerText) {
        correctCount++;
      }
      if (correctAnswer) {
        correctAnswerTexts.push(correctAnswer.text);
      }
    });

    const calculatedScore = (correctCount / selectedQuiz.questions.length) * 100;
    setScore(calculatedScore);
    setCorrectAnswers(correctAnswerTexts);

    // Save score to quiz history (this could be updated in your DB too)
    if (userId) {
      const newQuizHistory: QuizHistory = {
        id: `${selectedQuiz.id}-${userId}`, // Using quizId and userId for a unique key
        quiz_id: selectedQuiz.id,
        title: selectedQuiz.title,
        score: calculatedScore,
      };

      setQuizHistory((prevHistory) => [...prevHistory, newQuizHistory]);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-8">
        {!selectedQuiz ? (
          <>
            <h2 className="text-3xl font-semibold text-gray-800 mb-6">Select a Quiz</h2>
            <ul className="list-disc pl-6">
              {quizzes.map((quiz) => (
                <li key={quiz.id}>
                  <button
                    onClick={() => handleQuizSelection(quiz.id)}
                    className="text-blue-600 hover:underline"
                  >
                    {quiz.title}
                  </button>
                </li>
              ))}
            </ul>

            {/* Display Quiz History */}
            <h3 className="text-2xl font-semibold text-gray-800 mb-6 mt-8">Quiz History</h3>
            <ul className="list-disc pl-6">
              {quizHistory.length > 0 ? (
                quizHistory.map((history) => (
                  <li key={history.id}>
                    <p className="text-gray-800">
                      {history.title} - Score: {history.score}
                    </p>
                  </li>
                ))
              ) : (
                <p>No quiz history available</p>
              )}
            </ul>
          </>
        ) : (
          <div>
            <h2 className="text-3xl font-semibold text-gray-800 mb-6">{selectedQuiz.title}</h2>
            {score === null ? (
              <>
                <form>
                  {selectedQuiz.questions.map((question, index) => (
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
              </>
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
                  onClick={() => setSelectedQuiz(null)} // Go back to quiz list
                  className="mt-6 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Take Another Quiz
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TakeQuiz;
