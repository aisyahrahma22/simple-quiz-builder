import { useState, useEffect } from 'react';  
import Swal from 'sweetalert2'; // Import SweetAlert
import { useRouter } from 'next/router';
import "../../app/globals.css";
import Navbar from './components/navbar';

// Define interface for Answer
interface Answer {
  text: string;
  is_correct: boolean;
}

// Define interface for Question
interface Question {
  id: string;
  text: string;
  answers: Answer[];
}

// Define interface for Quiz
interface Quiz {
  id: string;
  title: string;
  questions: Question[];
  score: number
}

const QuizList = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]); // Use Quiz type for state
  const [userId, setUserId] = useState<string>(''); // Use string type for userId
  const [loading, setLoading] = useState<boolean>(true); // Loading state to track the loading status
  const router = useRouter();

  // Fetch quizzes when the page loads
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('userToken'); // Simulated authentication
    if (!isAuthenticated) {
      router.push('/'); // Redirect to login if not authenticated
    } else {
      const cleanedString = isAuthenticated?.replace("dummy-token-for-", "");
      setUserId(cleanedString);
      fetchQuizzes();
    }
  }, [router]);

  // Fetch quizzes from the backend
  const fetchQuizzes = async () => {
    setLoading(true); // Start loading
    const response = await fetch(`/api/quiz/list?user_id=${userId}`);
    const data = await response.json();
    if (response.ok) {
      setQuizzes(data); // Ensure data is of type Quiz[]
    } else {
      Swal.fire({
        title: 'Error!',
        text: 'Unable to fetch quizzes.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
    setLoading(false); // Stop loading after data is fetched
  };

  // Handle viewing all questions for a specific quiz
  const handleViewAllQuestions = (quizId: string) => {
    const quiz = quizzes.find((quiz: Quiz) => quiz.id === quizId);
    if (!quiz) return;

    const questionsText = quiz.questions
      .map((q: Question, index: number) => {
        // Display answers with correct answer highlighted in green
        const answersText = q.answers
          .map((ans: Answer, ansIdx: number) => {
            const answerText = `${String.fromCharCode(65 + ansIdx)}. ${ans.text}`;
            return ans.is_correct
              ? `<span style="color: green;">${answerText} (Correct)</span>` // Correct answer in green
              : answerText;
          })
          .join('<br />'); // Use <br /> for line breaks in the modal
        return `<strong>Question ${index + 1}:</strong> ${q.text}<br />${answersText}`;
      })
      .join('<br /><br />'); // Add extra space between questions

    Swal.fire({
      title: 'All Questions',
      html: questionsText, // Use `html` to allow HTML content
      icon: 'info',
      confirmButtonText: 'Close',
      width: '80%', // Adjust width for better visibility if there are many questions
      preConfirm: () => {
        // Optional: Handle actions after closing the modal
      },
    });
  };


  // Handle editing a quiz (redirects to quiz-builder with the quiz data)
  const handleEditQuiz = (quizId: string) => {
    router.push(`/ui/edit-quiz-builder?id=${quizId}`); // Pass quiz id to the quiz-builder page
  };

  // Handle deleting a quiz
  const handleDeleteQuiz = async (quizId: string) => {
    const confirmDelete = await Swal.fire({
      title: 'Are you sure?',
      text: 'This quiz will be deleted permanently!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    });

    if (confirmDelete.isConfirmed) {
      const response = await fetch(`/api/quiz/delete-quiz?id=${quizId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        Swal.fire({
          title: 'Deleted!',
          text: 'Your quiz has been deleted.',
          icon: 'success',
          confirmButtonText: 'OK',
        });

        // Update quiz list after deletion
        setQuizzes(quizzes.filter((quiz) => quiz.id !== quizId));
      } else {
        Swal.fire({
          title: 'Error!',
          text: 'Unable to delete quiz.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      }
    }
  };

  return (
   <>
   <Navbar />
    <div className="container mx-auto p-8">
     <div className='flex justify-between'>
      <h2 className="text-3xl font-semibold text-gray-800 mb-6">All Quizzes</h2>
      <button
        onClick={() => router.push('/ui/quiz-builder')}
        className="px-2 py-1 text-sm h-8 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        Create Question
      </button>
    </div>


      {/* Show loading spinner while quizzes are being fetched */}
      {loading ? (
        <div className="flex justify-center items-center">
          <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-blue-600 rounded-full" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      ) : quizzes.length === 0 ? (
        <p>No quizzes available.</p>
      ) : (
        <ul>
          {quizzes.map((quiz) => (
            <li key={quiz.id} className="mb-6 p-4 border border-gray-300 rounded-lg">
             <div>
             <h3 className="text-xl font-semibold">{quiz.title}</h3>
             <h5 className="text-s font-semibold">Score: {quiz.score}</h5>
             </div>
              <div className="mt-4">
                <button
                  onClick={() => handleViewAllQuestions(quiz.id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 mr-4"
                >
                  View All Questions
                </button>
                <button
                  onClick={() => handleEditQuiz(quiz.id)}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 mr-4"
                >
                  Edit Quiz
                </button>
                <button
                  onClick={() => handleDeleteQuiz(quiz.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Delete Quiz
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
   </>
  );
};

export default QuizList;
