// App.tsx

import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import Login from './Login';
import AdminView from './components/AdminView';
import QuizView from './components/QuizView';
import AdminDashboard from './components/AdminDashboard';
import { Quiz, QuizItem } from './types';
// ↓↓↓ doc と deleteDoc をインポートに追加 ↓↓↓
import { collection, addDoc, getDocs, doc, deleteDoc } from "firebase/firestore"; 
import { db } from './firebase';

const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState(window.location.hash);
  const [quizzes, setQuizzes] = useState<Record<string, Quiz>>({});
  const [isLoading, setIsLoading] = useState(true);
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user) {
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
    } else {
      setIsLoading(false);
    }
  }, [user]);

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
      const newQuizData = { ...quizData, createdAt: new Date().toISOString() };
      const docRef = await addDoc(collection(db, "quizzes"), newQuizData);
      setQuizzes(prev => ({ ...prev, [docRef.id]: { ...newQuizData, id: docRef.id } as Quiz }));
      return docRef.id;
    } catch (e) {
      console.error("Error adding document: ", e);
      alert("クイズの保存に失敗しました。");
      return "";
    }
  };

  // ↓↓↓ クイズを削除する関数を新しく追加 ↓↓↓
  const deleteQuiz = async (quizId: string): Promise<void> => {
    try {
      // Firestoreからドキュメントを削除
      await deleteDoc(doc(db, "quizzes", quizId));
      
      // 画面（state）からも削除して、即時反映させる
      setQuizzes(prevQuizzes => {
        const newQuizzes = { ...prevQuizzes };
        delete newQuizzes[quizId];
        return newQuizzes;
      });
    } catch (error) {
      console.error("Error deleting document: ", error);
      alert("クイズの削除に失敗しました。");
    }
  };


  if (loading) {
    return null; 
  }

  if (!user) {
    return <Login />;
  }

  if (!user.email?.endsWith('@tokium.jp')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        {/* ...アクセス権がない場合の表示... */}
      </div>
    );
  }

  const renderContent = () => {
    if (isLoading) {
      return <div className="flex justify-center items-center min-h-screen">読み込み中...</div>;
    }
    
    const [hash, queryString] = currentRoute.split('?');
    const quizMatch = hash.match(/^#\/quiz\/(.+)$/);
    
    if (quizMatch) {
      const quizId = quizMatch[1];
      const quiz = quizzes[quizId];
      const params = new URLSearchParams(queryString);
      const isPreview = params.get('preview') === 'true';

      if (quiz) {
        return <QuizView quiz={quiz} isPreview={isPreview} />;
      } else {
        return (
          <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
            {/* ...Quiz Not Foundの表示... */}
          </div>
        );
      }
    }

    if (currentRoute === '#/admin') {
      // ↓↓↓ AdminDashboardにdeleteQuiz関数を渡す ↓↓↓
      return <AdminDashboard quizzes={Object.values(quizzes)} deleteQuiz={deleteQuiz} />;
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