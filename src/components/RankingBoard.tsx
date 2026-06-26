import React, { useState, useEffect } from 'react';
import { Trophy, Award, BookOpen, Star, Flame, Sparkles } from 'lucide-react';
import { Student, ReadingLog } from '../types';
import { getStudents, getReadingLogs, getLocalDateString, getWeekRange } from '../utils/storage';

export default function RankingBoard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [logs, setLogs] = useState<ReadingLog[]>([]);
  
  // 랭킹 세팅 토글
  const [period, setPeriod] = useState<'week' | 'month'>('week');
  const [metric, setMetric] = useState<'pages' | 'books'>('pages');
  
  // 개인 프로필 선택 상태
  const [profileStudentId, setProfileStudentId] = useState<number>(1);

  useEffect(() => {
    setStudents(getStudents());
    setLogs(getReadingLogs());
  }, []);

  // 오늘 날짜 기준 주/월 필터링을 위한 기준일 (현재 시간 또는 임의 가상 시간 2026-06-26)
  const REFERENCE_DATE = "2026-06-26"; 

  // 필터링된 로그 가져오기
  const getFilteredLogs = () => {
    if (period === 'week') {
      const { monday, sunday } = getWeekRange(REFERENCE_DATE);
      return logs.filter(log => {
        const date = new Date(log.timestamp);
        return date >= monday && date <= sunday;
      });
    } else {
      // 월별 필터 (2026년 06월)
      const refDate = new Date(REFERENCE_DATE);
      const targetYear = refDate.getFullYear();
      const targetMonth = refDate.getMonth(); // 0-11
      return logs.filter(log => {
        const date = new Date(log.timestamp);
        return date.getFullYear() === targetYear && date.getMonth() === targetMonth;
      });
    }
  };

  // 학생별 누적 데이터 계산
  const calculateStudentStats = () => {
    const filtered = getFilteredLogs();
    
    return students.map(student => {
      const studentLogs = filtered.filter(log => log.studentId === student.id);
      
      const totalPages = studentLogs.reduce((sum, log) => sum + log.totalPage, 0);
      const totalBooks = studentLogs.length;

      return {
        ...student,
        totalPages,
        totalBooks
      };
    }).sort((a, b) => {
      if (metric === 'pages') {
        return b.totalPages - a.totalPages || b.totalBooks - a.totalBooks || a.name.localeCompare(b.name);
      } else {
        return b.totalBooks - a.totalBooks || b.totalPages - a.totalPages || a.name.localeCompare(b.name);
      }
    });
  };

  const rankedData = calculateStudentStats();
  
  // 시상대(Podium)에 올릴 상위 3명 추출 (2등, 1등, 3등 순으로 배치하여 시각적 단상 연출)
  const topThree = rankedData.slice(0, 3);
  const podiumData = [
    topThree[1] || null, // 2등
    topThree[0] || null, // 1등
    topThree[2] || null  // 3등
  ];

  const runnersUp = rankedData.slice(3);

  // 개인 프로필 통계 (이번 달 기준 고정)
  const getPersonalMonthlyStats = (studentId: number) => {
    const refDate = new Date(REFERENCE_DATE);
    const targetYear = refDate.getFullYear();
    const targetMonth = refDate.getMonth();

    const monthlyLogs = logs.filter(log => {
      const date = new Date(log.timestamp);
      return log.studentId === studentId && 
             date.getFullYear() === targetYear && 
             date.getMonth() === targetMonth;
    });

    const pages = monthlyLogs.reduce((sum, log) => sum + log.totalPage, 0);
    const books = monthlyLogs.length;

    // 목표 설정 (초등학교 5학년 권장 목표: 월 5권 / 500페이지)
    const targetBooks = 5;
    const targetPages = 500;

    const bookPercent = Math.min(Math.round((books / targetBooks) * 100), 100);
    const pagePercent = Math.min(Math.round((pages / targetPages) * 100), 100);

    return {
      pages,
      books,
      targetBooks,
      targetPages,
      bookPercent,
      pagePercent
    };
  };

  const selectedStudentProfile = students.find(s => s.id === profileStudentId) || students[0];
  const personalStats = selectedStudentProfile ? getPersonalMonthlyStats(selectedStudentProfile.id) : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* 랭킹 보드 메인 영역 (2/3 크기) */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 md:p-8 soft-shadow border border-slate-200/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="bg-pastel-orange p-2 rounded-xl text-pastel-orange-deep">
                <Trophy size={24} fill="currentColor" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">우리가 만든 독서 숲</h2>
                <p className="text-xs text-slate-500">누가 누가 가장 책과 친해졌을까요?</p>
              </div>
            </div>

            {/* 정렬 & 기간 선택 필터 */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
                <button
                  onClick={() => setPeriod('week')}
                  className={`px-3 py-1.5 rounded-md font-bold transition-all ${
                    period === 'week' ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  이번 주
                </button>
                <button
                  onClick={() => setPeriod('month')}
                  className={`px-3 py-1.5 rounded-md font-bold transition-all ${
                    period === 'month' ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  이번 달
                </button>
              </div>

              <div className="flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
                <button
                  onClick={() => setMetric('pages')}
                  className={`px-3 py-1.5 rounded-md font-bold transition-all ${
                    metric === 'pages' ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  쪽수 기준
                </button>
                <button
                  onClick={() => setMetric('books')}
                  className={`px-3 py-1.5 rounded-md font-bold transition-all ${
                    metric === 'books' ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  권수 기준
                </button>
              </div>
            </div>
          </div>

          {/* 1. 시상대 (Weekly/Monthly Podium) */}
          <div className="grid grid-cols-3 gap-2 md:gap-4 items-end justify-center mb-8 px-2 md:px-8 pt-8">
            {podiumData.map((student, index) => {
              if (!student) return <div key={index} />;

              // index: 0(2등), 1(1등), 2(3등)
              const position = index === 1 ? 1 : index === 0 ? 2 : 3;
              const heightClass = position === 1 ? 'h-36 md:h-48' : position === 2 ? 'h-28 md:h-36' : 'h-24 md:h-30';
              const podiumBg = position === 1 ? 'bg-pastel-yellow-dark' : position === 2 ? 'bg-pastel-sky-dark' : 'bg-pastel-orange-dark';
              const medalIcon = position === 1 ? '🥇' : position === 2 ? '🥈' : '🥉';
              const textDeepColor = position === 1 ? 'text-pastel-yellow-deep' : position === 2 ? 'text-pastel-sky-deep' : 'text-pastel-orange-deep';
              
              const displayValue = metric === 'pages' 
                ? `${student.totalPages}쪽`
                : `${student.totalBooks}권`;

              return (
                <div key={student.id} className="flex flex-col items-center select-none">
                  {/* 프로필 이미지 & 메달 */}
                  <div className="relative mb-2 flex flex-col items-center">
                    {position === 1 && (
                      <span className="absolute -top-6 text-xl animate-bounce">👑</span>
                    )}
                    <span className="text-4xl md:text-5xl">{student.avatar}</span>
                    <span className="absolute -bottom-1.5 -right-1 bg-white rounded-full w-6 h-6 shadow-sm border border-slate-100 flex items-center justify-center text-xs">
                      {medalIcon}
                    </span>
                  </div>

                  {/* 이름 */}
                  <span className="font-extrabold text-xs md:text-base text-slate-800 truncate max-w-full">
                    {student.name}
                  </span>

                  {/* 수치 */}
                  <span className={`text-[10px] md:text-xs font-black ${textDeepColor} mb-2 bg-white px-2 py-0.5 rounded-full border border-slate-100`}>
                    {displayValue}
                  </span>

                  {/* 단상 자체 */}
                  <div className={`w-full rounded-t-2xl shadow-inner ${podiumBg} ${heightClass} flex flex-col items-center justify-center border-t-4 border-white`}>
                    <span className="text-2xl md:text-4xl font-black text-white/80">{position}</span>
                    <span className="text-[10px] md:text-xs text-white/60 font-bold">등</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 2. 랭킹 리스트 (4위 이하) */}
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {runnersUp.map((student, index) => {
              const displayValue = metric === 'pages' 
                ? `${student.totalPages}쪽` 
                : `${student.totalBooks}권`;
              const rank = index + 4;

              return (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-3.5 bg-slate-50/50 hover:bg-slate-50 transition-colors border border-slate-100 rounded-2xl"
                >
                  <div className="flex items-center gap-3.5">
                    <span className="w-6 text-center text-sm font-black text-slate-400">
                      {rank}
                    </span>
                    <span className="text-2xl">{student.avatar}</span>
                    <span className="font-bold text-sm md:text-base text-slate-700">
                      {student.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-100/50">
                      {displayValue}
                    </span>
                    {student.totalPages >= 100 && (
                      <span className="text-sm cursor-help" title="100쪽 이상 읽은 우수 독서가!">
                        ⭐
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 개인 프로필 보드 (1/3 크기) */}
      <div className="space-y-6">
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 md:p-8 soft-shadow border border-slate-200/50">
          <div className="flex items-center gap-2.5 mb-6 border-b border-slate-100 pb-4">
            <div className="bg-pastel-pink p-2 rounded-xl text-pastel-pink-deep">
              <Award size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">나의 독서 챌린지</h2>
              <p className="text-xs text-slate-500">내 이번 달 독서 진척도를 확인해요.</p>
            </div>
          </div>

          {/* 학생 선택 드롭다운 */}
          <div className="space-y-1 mb-6">
            <span className="text-xs font-bold text-slate-500">이름을 선택하세요:</span>
            <select
              value={profileStudentId}
              onChange={(e) => setProfileStudentId(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 font-bold px-3 py-2.5 rounded-xl outline-none focus:border-teal-400"
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.avatar} {s.name}
                </option>
              ))}
            </select>
          </div>

          {personalStats && selectedStudentProfile && (
            <div className="space-y-6">
              {/* 프로필 요약 */}
              <div className="flex items-center gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                <span className="text-4xl">{selectedStudentProfile.avatar}</span>
                <div>
                  <h3 className="font-extrabold text-slate-800">{selectedStudentProfile.name}</h3>
                  <p className="text-xs text-slate-500 font-semibold flex items-center gap-0.5 mt-0.5">
                    <Flame size={12} className="text-rose-500 fill-rose-500" />
                    이번 달 독서 열정 충전 중!
                  </p>
                </div>
              </div>

              {/* 통계 지표 1: 책 권수 */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-600">
                  <span className="flex items-center gap-1">
                    <BookOpen size={14} className="text-teal-600" />
                    읽은 책 수
                  </span>
                  <span>{personalStats.books}권 / {personalStats.targetBooks}권</span>
                </div>
                <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                  <div
                    className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${personalStats.bookPercent}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium">
                  <span>달성도 {personalStats.bookPercent}%</span>
                  {personalStats.bookPercent >= 100 && (
                    <span className="text-teal-600 font-bold flex items-center gap-0.5">
                      <Sparkles size={10} /> 목표 달성!
                    </span>
                  )}
                </div>
              </div>

              {/* 통계 지표 2: 읽은 쪽수 */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-600">
                  <span className="flex items-center gap-1">
                    <Star size={14} className="text-pastel-orange-deep" />
                    읽은 페이지 수
                  </span>
                  <span>{personalStats.pages}쪽 / {personalStats.targetPages}쪽</span>
                </div>
                <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                  <div
                    className="h-full bg-gradient-to-r from-pastel-orange-dark to-pastel-orange-deep rounded-full transition-all duration-500"
                    style={{ width: `${personalStats.pagePercent}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium">
                  <span>달성도 {personalStats.pagePercent}%</span>
                  {personalStats.pagePercent >= 100 && (
                    <span className="text-pastel-orange-deep font-bold flex items-center gap-0.5">
                      <Sparkles size={10} /> 목표 달성!
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
