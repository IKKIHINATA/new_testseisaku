import React, { useState, useEffect } from 'react';
import AdminView from './components/AdminView';
import QuizView from './components/QuizView';
import AdminDashboard from './components/AdminDashboard';
import { Quiz, QuizItem } from './types';

// In-memory store for quizzes to persist them for the session.
// This is a simple solution for this app. In a real-world scenario,
// you might use localStorage, sessionStorage, or a backend service.
const quizStore: Record<string, Quiz> = {};

const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState(window.location.hash);
  // Initialize state from the store in case of hot-reloads
  const [quizzes, setQuizzes] = useState<Record<string, Quiz>>(quizStore);

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentRoute(window.location.hash);
    };

    // Set initial route
    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const addQuiz = (quizData: { title: string; description: string; items: QuizItem[], creator: string }): string => {
    const newId = `quiz_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const newQuiz: Quiz = {
      id: newId,
      ...quizData,
      createdAt: new Date().toISOString(),
    };
    
    // Update both component state and the in-memory store
    const updatedQuizzes = { ...quizzes, [newId]: newQuiz };
    setQuizzes(updatedQuizzes);
    quizStore[newId] = newQuiz;

    return newId;
  };

  const renderContent = () => {
    const quizMatch = currentRoute.match(/^#\/quiz\/(.+)$/);

    if (currentRoute === '#/admin') {
      return <AdminDashboard quizzes={Object.values(quizzes)} />;
    }
    
    if (quizMatch) {
      const quizId = quizMatch[1];
      const quiz = quizzes[quizId];
      if (quiz) {
        return <QuizView quiz={quiz} />;
      } else {
        return (
          <div className="flex flex-col items-center justify-center min-h-screen text-center p-4 bg-gray-bg">
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <h1 className="text-3xl font-bold mb-4 text-text-black">Quiz Not Found</h1>
              <p className="text-gray-600 mb-6">The quiz you are looking for does not exist or may have been removed.</p>
              <a href="#" className="bg-tokium-green text-white font-bold py-2 px-4 rounded-lg hover:brightness-95 transition-all">
                Create a new Quiz
              </a>
            </div>
          </div>
        );
      }
    }
    return <AdminView addQuiz={addQuiz} />;
  };

  return <>{renderContent()}</>;
};

export default App;
