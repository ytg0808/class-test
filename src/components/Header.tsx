import React from 'react';
import { BookOpen, Sun } from 'lucide-react';

export default function Header() {
  return (
    <header className="mb-8 text-center">
      <div className="inline-flex items-center justify-center gap-3 mb-2">
        <div className="relative">
          <div className="absolute -top-3 -right-3 text-pastel-yellow-deep animate-pulse">
            <Sun size={28} fill="currentColor" />
          </div>
          <div className="bg-gradient-to-tr from-pastel-mint-dark to-pastel-sky-dark p-3 rounded-2xl shadow-md border-2 border-white">
            <BookOpen className="text-teal-700" size={36} />
          </div>
        </div>
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 md:text-4xl">
        아침 독서 요정 <span className="text-teal-600">🧚‍♂️</span>
      </h1>
      <p className="mt-2 text-sm text-slate-500 font-medium md:text-base">
        ✨ 아침 10분, 나를 무럭무럭 키우는 독서 습관! 5학년 1반 독서기록장 ✨
      </p>
    </header>
  );
}
