import React, { useState } from 'react';
import { Quiz } from '../types';
import { CheckIcon, HeaderIcon } from './Icons';

interface QuizViewProps {
  quiz: Quiz;
}

const QuizView: React.FC<QuizViewProps> = ({ quiz }) => {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleAnswerChange = (questionIndex: number, option: string) => {
    if (isSubmitted) return;
    setAnswers(prev => ({ ...prev, [questionIndex]: option }));
  };

  const handleSubmit = () => {
    if (Object.keys(answers).length !== quiz.items.length) {
      alert('すべての質問に回答してください。');
      return;
    }
    let correctCount = 0;
    quiz.items.forEach((item, index) => {
      if (answers[index] === item.answer) {
        correctCount++;
      }
    });
    setScore(correctCount);
    setIsSubmitted(true);
    window.scrollTo(0, 0); 
  };
  
  const handleRetry = () => {
    setAnswers({});
    setIsSubmitted(false);
    setScore(0);
  };

  const getOptionStyle = (option: string, questionIndex: number) => {
    if (!isSubmitted) {
      return answers[questionIndex] === option ? 'bg-tokium-green/20 border-tokium-green' : 'bg-white hover:bg-gray-50';
    }
    const isCorrect = option === quiz.items[questionIndex].answer;
    const isSelected = answers[questionIndex] === option;

    if (isCorrect) return 'bg-light-green/30 border-light-green text-tokium-green font-semibold';
    if (isSelected && !isCorrect) return 'bg-red-100 border-red-300 line-through';
    return 'bg-gray-100 border-gray-200 opacity-70';
  };

  return (
    <div className="min-h-screen bg-gray-bg text-text-black flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <main className="w-full max-w-3xl">
        <header className="bg-white rounded-t-2xl shadow-lg p-6 sm:p-8 border-b-4 border-tokium-green">
            <div className="flex items-center gap-4 mb-3">
                <HeaderIcon className="w-10 h-10 text-tokium-green" />
                <div>
                    <h1 className="text-3xl font-bold">{quiz.title}</h1>
                    <p className="text-gray-600 mt-1">{quiz.description}</p>
                </div>
            </div>
        </header>

        <div className="bg-white rounded-b-2xl shadow-lg p-6 sm:p-8">
            {isSubmitted && (
                <div className="mb-8 p-6 text-center bg-pale-blue-bg rounded-xl">
                    <h2 className="text-2xl font-bold text-tokium-green">テスト結果</h2>
                    <p className="text-4xl font-bold my-3">
                        <span className="text-tokium-green">{score}</span> / {quiz.items.length}
                    </p>
                    <p className="text-gray-700">
                        {score === quiz.items.length ? '素晴らしい！全問正解です！' : 'お疲れ様でした。もう一度挑戦してみましょう。'}
                    </p>
                </div>
            )}

            <div className="space-y-8">
            {quiz.items.map((item, index) => (
                <div key={item.question} className="border-t border-gray-200 pt-6">
                    <p className="font-semibold text-gray-800 mb-4 text-lg">
                        <span className="text-tokium-green font-bold">問 {index + 1}.</span> {item.question}
                    </p>
                    <div className="space-y-3">
                        {item.options.map(option => (
                        <div
                            key={option}
                            onClick={() => handleAnswerChange(index, option)}
                            className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all duration-200 ${getOptionStyle(option, index)}`}
                        >
                            {isSubmitted && option === quiz.items[index].answer && <CheckIcon className="w-6 h-6 mr-3 text-tokium-green" />}
                            <span className="flex-1">{option}</span>
                        </div>
                        ))}
                    </div>
                </div>
            ))}
            </div>

            <div className="mt-10 pt-6 border-t border-gray-200 text-center">
            {isSubmitted ? (
                 <button
                    onClick={handleRetry}
                    className="w-full sm:w-auto bg-orange hover:brightness-95 transition-all text-white font-bold py-3 px-8 rounded-lg"
                >
                    もう一度挑戦する
                </button>
            ) : (
                <button
                    onClick={handleSubmit}
                    className="w-full sm:w-auto bg-tokium-green hover:brightness-95 transition-all text-white font-bold py-3 px-8 rounded-lg"
                >
                    回答を送信
                </button>
            )}
            </div>
        </div>
      </main>
      <footer className="mt-8 text-center text-gray-500 text-sm">
          <p>© 2024 TOKIUM INC.</p>
      </footer>
    </div>
  );
};

export default QuizView;