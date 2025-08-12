// App.tsx

import React, { useState, useEffect } from 'react';
import AdminView from './components/AdminView';
import QuizView from './components/QuizView';
import AdminDashboard from './components/AdminDashboard';
import { Quiz, QuizItem } from './types';
import { collection, addDoc, getDocs } from "firebase/firestore"; 
import { db } from './firebase';

const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState(window.location.hash);
  const [quizzes, setQuizzes] = useState<Record<string, Quiz>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchQuizzes = async () => {
      setIsLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "quizzes"));
        const quizzesData: Record<string, Quiz> = {};
        querySnapshot.forEach((doc) => {
          quizzesData[doc.id] = { ...doc.data(), id: doc.id } as Quiz;
        });
        setQuizzes(quizzesData);
      } catch (error) {
        console.error("Error fetching quizzes from Firestore: ", error);
      }
      setIsLoading(false);
    };
    fetchQuizzes();
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentRoute(window.location.hash);
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const addQuiz = async (quizData: { title: string; description: string; items: QuizItem[], creator: string }): Promise<string> => {
    try {
      const newQuizData = {
        ...quizData,
        createdAt: new Date().toISOString(),
      };
      const docRef = await addDoc(collection(db, "quizzes"), newQuizData);
      
      setQuizzes(prevQuizzes => ({
        ...prevQuizzes,
        [docRef.id]: { ...newQuizData, id: docRef.id } as Quiz
      }));
      return docRef.id;
    } catch (e) {
      console.error("Error adding document: ", e);
      alert("クイズの保存に失敗しました。");
      return "";
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return <div className="flex justify-center items-center min-h-screen">読み込み中...</div>;
    }
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
          <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <h1 className="text-3xl font-bold mb-4 text-text-black">Quiz Not Found</h1>
              <p className="text-gray-600 mb-6">クイズが見つからないか、削除された可能性があります。</p>
              <a href="#/" className="bg-tokium-green text-white font-bold py-2 px-4 rounded-lg hover:brightness-95 transition-all">
                作成画面に戻る
              </a>
            </div>
          </div>
        );
      }
    }
    return <AdminView addQuiz={addQuiz} />;
  };

  return (
    <div className="bg-pale-blue-bg font-sans min-h-screen">
      {renderContent()}
    </div>
  );
};

export default App;