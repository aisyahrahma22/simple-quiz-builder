import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Swal from 'sweetalert2'; // Import SweetAlert
import "../../app/globals.css";
import Navbar from './components/navbar';


const EditQuizBuilder = () => {
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState([
    {
      id: '',
      questionText: '',
      answers: [
        { id: '',text: '', isCorrect: false },
        { id: '', text: '', isCorrect: false },
        { id: '', text: '', isCorrect: false },
        { id: '', text: '', isCorrect: false },
        { id: '', text: '', isCorrect: false },
      ],
    },
  ]);
  const [userId, setUserId] = useState('');
  const [quizId, setQuizId] = useState<string | null>(null); // State to store the quizId
  const router = useRouter();

  // Fetch quiz data if editing an existing quiz
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('userToken'); // Simulated authentication
    if (!isAuthenticated) {
      router.push('/'); // Redirect to login if not authenticated
    } else {
      const cleanedString = isAuthenticated?.replace("dummy-token-for-", "");
      setUserId(cleanedString);
    }

    const { id } = router.query; // Get quizId from router query
    if (id) {
      setQuizId(id as string);
      fetchQuizData(id as string); // Fetch the existing quiz data for editing
    }
  }, [router]);

  // Fetch quiz data for editing
  const fetchQuizData = async (id: string) => {
    const response = await fetch(`/api/quiz/details?id=${id}`);
    const data = await response.json();
    if (response.ok) {
      setTitle(data.title);
      setQuestions(data.questions);
    } else {
      Swal.fire({
        title: 'Error!',
        text: data.error || 'Failed to fetch quiz data.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  };

  // Handle updating or creating a quiz
  const handleSaveQuiz = async () => {
    // Calculate score based on the number of questions
    const totalQuestions = questions.length;
    const scorePerQuestion = 100 / totalQuestions; // Each question is worth this many points
    let correctAnswersCount = 0;

    // Count correct answers
    questions.forEach((question) => {
      if (question.answers.some((answer) => answer.isCorrect)) {
        correctAnswersCount++;
      }
    });

    const score = scorePerQuestion * correctAnswersCount;

    const method = quizId ? 'PUT' : 'POST'; // If quizId exists, use PUT for updating, else POST for creating
    const url = quizId ? `/api/quiz/update` : '/api/quiz/create'; // Update URL if editing a quiz

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        user_id: userId,
        id:quizId,
        questions,
        score, 
      }),
    });

    const result = await response.json();

    if (response.ok) {
      // Show SweetAlert success message
      Swal.fire({
        title: quizId ? 'Quiz Updated!' : 'Quiz Saved!',
        text: `Your quiz has been successfully ${quizId ? 'updated' : 'saved'}!`,
        icon: 'success',
        confirmButtonText: 'OK',
      }).then(() => {
        router.push('/ui/list'); // Redirect to quiz list after success
      });
    } else {
      // Show SweetAlert error message
      Swal.fire({
        title: 'Error!',
        text: result.error || 'Something went wrong while saving your quiz.',
        icon: 'error',
        confirmButtonText: 'Try Again',
      });
    }
  };

  // Handle adding a question
  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: '',
        id: '',
        answers: [
          { id: '', text: '', isCorrect: false },
          { id: '', text: '', isCorrect: false },
          { id: '', text: '', isCorrect: false },
          { id: '', text: '', isCorrect: false },
          { id: '', text: '', isCorrect: false },
        ],
      },
    ]);
  };

  const deleteQuestionFromDatabase = async (questionId: string) => {
    const response = await fetch(`/api/quiz/delete?id=${questionId}`, {
      method: 'DELETE',
    });
  
    const result = await response.json();
  
    if (!response.ok) {
      Swal.fire({
        title: 'Error!',
        text: result.error || 'Failed to delete question.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }else{
     Swal.fire({
      title: 'Quiz Deleted!',
      text: `Your quiz has been successfully deleted!`,
      icon: 'success',
      confirmButtonText: 'OK'
    })
    }
  };

  
  // Handle removing a question
  const handleRemoveQuestion = (index: number) => {
    const questionToRemove = questions[index];
    const newQuestions = questions.filter((_, idx) => idx !== index); // Remove question by index
    setQuestions(newQuestions);
  
    // If necessary, delete the question from the database as well
    if (questionToRemove.id) {
      deleteQuestionFromDatabase(questionToRemove.id); // Optional: remove the question from the backend
    }
  };
  

  // Handle selecting the correct answer
  const handleCorrectAnswerChange = (questionIdx: number, answerIdx: number) => {
    const newQuestions = [...questions];
    // Reset the correct answer for the current question
    newQuestions[questionIdx].answers.forEach((answer, idx) => {
      answer.isCorrect = idx === answerIdx;
    });
    setQuestions(newQuestions);
  };

  const handleViewAllQuestions = () => {
    router.push('/ui/list');
  };

  return (
    <>
   <Navbar />
    <div className="container mx-auto p-8">
      <h2 className="text-3xl font-semibold text-gray-800 mb-6">{quizId ? 'Edit Quiz' : 'Create a New Quiz'}</h2>

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
        <div key={idx} className="mb-8 border-b pb-4">
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

          {/* Answer Inputs A-E */}
          {question.answers.map((answer, ansIdx) => (
            <div key={ansIdx} className="flex items-center mb-4">
              <span className="text-gray-700 font-semibold">{String.fromCharCode(65 + ansIdx)}.</span>
              <input
                type="text"
                placeholder={`Answer ${String.fromCharCode(65 + ansIdx)}`}
                value={answer.text}
                onChange={(e) => {
                  const newQuestions = [...questions];
                  newQuestions[idx].answers[ansIdx].text = e.target.value;
                  setQuestions(newQuestions);
                }}
                className="w-full p-4 ml-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="radio"
                name={`question-${idx}`}
                checked={answer.isCorrect}
                onChange={() => handleCorrectAnswerChange(idx, ansIdx)}
                className="ml-2"
              />
              <label className="ml-1 text-sm text-gray-600">Correct Answer</label>
            </div>
          ))}

          {/* Remove Question Button */}
          <button
            onClick={() => handleRemoveQuestion(idx)}
            className="text-red-500 text-sm mt-2"
          >
            Remove Question
          </button>
          
        </div>
      ))}

      {/* Add Question and Save/Update Quiz Buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleSaveQuiz}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          {quizId ? 'Update Quiz' : 'Save Quiz'}
        </button>
        <button
          onClick={handleViewAllQuestions}
          className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          View All Questions
        </button>
      </div>
    </div>
    </>
  );
};

export default EditQuizBuilder;
