'use client';

import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import TabNavigation from '../components/TabNavigation';
import StudentForm from '../components/StudentForm';
import RankingBoard from '../components/RankingBoard';
import TeacherDashboard from '../components/TeacherDashboard';
import { TabType } from '../types';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('student');
  const [mounted, setMounted] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Next.js Hydration Mismatch 방지
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
          <span className="text-sm font-bold text-slate-500">독서 숲으로 가는 중... 🌳</span>
        </div>
      </div>
    );
  }

  return (
    <main className="space-y-6">
      {/* 귀여운 5학년 헤더 */}
      <Header />

      {/* 탭 메뉴 */}
      <TabNavigation activeTab={activeTab} onChangeTab={setActiveTab} />

      {/* 탭 내용 영역 */}
      <div className="transition-all duration-300">
        {activeTab === 'student' && (
          <div className="max-w-2xl mx-auto">
            <StudentForm onSuccess={handleRefresh} />
          </div>
        )}
        
        {activeTab === 'ranking' && (
          <div key={`ranking-${refreshTrigger}`} className="w-full">
            <RankingBoard />
          </div>
        )}
        
        {activeTab === 'teacher' && (
          <div key={`teacher-${refreshTrigger}`} className="w-full">
            <TeacherDashboard />
          </div>
        )}
      </div>

      {/* 푸터 */}
      <footer className="pt-12 pb-6 text-center text-xs text-slate-400 font-semibold">
        <p>© 2026 아침 독서 요정. 초등학교 5학년 학급용 온라인 독서기록장.</p>
        <p className="mt-1 text-[10px] text-slate-300">이 서비스는 로컬 브라우저에 안전하게 저장됩니다. (LocalStorage 활용)</p>
      </footer>
    </main>
  );
}
