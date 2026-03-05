import React from 'react';
import UrwisQuiz from '@/components/urwisek/games/UrwisQuiz';

export const metadata = {
  title: 'Quiz Urwisa | Sklep Urwis',
  description: 'Rozwiąż quiz i dowiedz się, jakim Urwisem jesteś!',
};

export default function UrwisQuizPage() {
  return (
    <main className="w-full min-h-screen bg-[#1a1c29]">
      <UrwisQuiz />
    </main>
  );
}
