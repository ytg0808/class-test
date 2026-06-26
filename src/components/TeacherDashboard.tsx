import React, { useState, useEffect } from 'react';
import { Lock, FileSpreadsheet, CheckCircle, XCircle, Search, Edit2, Trash2, Check, RefreshCw, KeyRound, RotateCcw } from 'lucide-react';
import { Student, ReadingLog } from '../types';
import { getStudents, getReadingLogs, updateReadingLog, deleteReadingLog, getLocalDateString, updateStudentPin } from '../utils/storage';

export default function TeacherDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const [students, setStudents] = useState<Student[]>([]);
  const [logs, setLogs] = useState<ReadingLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // 편집용 상태
  const [editingLog, setEditingLog] = useState<ReadingLog | null>(null);
  const [editStartPage, setEditStartPage] = useState('');
  const [editEndPage, setEditEndPage] = useState('');

  // 오늘 날짜 기준일
  const REFERENCE_DATE = "2026-06-26";

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = () => {
    setStudents(getStudents());
    setLogs(getReadingLogs());
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '5555') {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('비밀번호가 틀렸어요! 힌트: 5학년이니까 5555 🤫');
    }
  };

  // 1. 출석부 데이터 계산
  const getAttendanceData = () => {
    return students.map(student => {
      const todayLogs = logs.filter(log => {
        const logDate = getLocalDateString(log.timestamp);
        return log.studentId === student.id && logDate === REFERENCE_DATE;
      });

      const isSubmitted = todayLogs.length > 0;
      let submitTime = '';
      if (isSubmitted) {
        const lastLog = todayLogs[todayLogs.length - 1];
        const date = new Date(lastLog.timestamp);
        const offset = 9 * 60; // KST
        const kstDate = new Date(date.getTime() + offset * 60 * 1000);
        submitTime = kstDate.toTimeString().split(' ')[0].substring(0, 5); // HH:MM
      }

      return {
        ...student,
        isSubmitted,
        submitTime
      };
    });
  };

  // 2. CSV 다운로드 기능
  const downloadCSV = () => {
    const headers = ['작성일자', '학생이름', '도서명', '시작페이지', '끝페이지', '총페이지', '한줄느낀점', '승인상태'];
    
    const rows = logs.map(log => {
      const student = students.find(s => s.id === log.studentId);
      const studentName = student ? student.name : '알수없음';
      const logDate = getLocalDateString(log.timestamp);
      
      return [
        logDate,
        studentName,
        `"${log.bookTitle.replace(/"/g, '""')}"`,
        log.startPage ?? '모름',
        log.endPage ?? '모름',
        log.totalPage,
        `"${log.comment.replace(/"/g, '""')}"`,
        log.status === 'approved' ? '승인완료' : '교사확인필요'
      ];
    });

    let csvContent = '\uFEFF';
    csvContent += [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `5학년1반_아침독서기록장_${REFERENCE_DATE}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 3. 기록 관리 (수정/삭제)
  const handleEditClick = (log: ReadingLog) => {
    setEditingLog(log);
    setEditStartPage(log.startPage?.toString() || '');
    setEditEndPage(log.endPage?.toString() || '');
  };

  const handleUpdateLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLog) return;

    const start = parseInt(editStartPage);
    const end = parseInt(editEndPage);
    
    if (isNaN(start) || isNaN(end) || start < 1 || end < start) {
      alert('올바른 시작/끝 쪽수를 입력해주세요.');
      return;
    }

    const updated: ReadingLog = {
      ...editingLog,
      startPage: start,
      endPage: end,
      totalPage: end - start + 1,
      isUnknownPage: false,
      status: 'approved'
    };

    updateReadingLog(updated);
    setEditingLog(null);
    loadData();
    alert('기록이 성공적으로 수정(승인)되었습니다.');
  };

  const handleApprovePending = (log: ReadingLog) => {
    const updated: ReadingLog = {
      ...log,
      status: 'approved'
    };
    updateReadingLog(updated);
    loadData();
    alert(`${students.find(s => s.id === log.studentId)?.name} 학생의 기록이 20쪽으로 승인 처리 되었습니다.`);
  };

  const handleDeleteLog = (logId: string) => {
    if (window.confirm('이 독서 기록을 정말 삭제할까요?')) {
      deleteReadingLog(logId);
      loadData();
    }
  };

  // 4. 학생 비밀번호(핀번호) 초기화 처리
  const handleResetPin = (studentId: number, studentName: string) => {
    if (window.confirm(`${studentName} 어린이의 비밀번호를 정말 초기화할까요? 초기화하면 학생이 새로 설정할 수 있습니다.`)) {
      updateStudentPin(studentId, undefined);
      loadData();
      alert(`${studentName} 어린이의 비밀번호가 초기화되었습니다.`);
    }
  };

  // 학생별 월 누계 및 설정 데이터 계산
  const getStudentAggregates = () => {
    const refDate = new Date(REFERENCE_DATE);
    const currentYear = refDate.getFullYear();
    const currentMonth = refDate.getMonth();

    return students.map(student => {
      const studentLogs = logs.filter(log => {
        const date = new Date(log.timestamp);
        return log.studentId === student.id && 
               date.getFullYear() === currentYear && 
               date.getMonth() === currentMonth;
      });

      const booksCount = studentLogs.length;
      const pagesSum = studentLogs.reduce((sum, log) => sum + log.totalPage, 0);
      const pendingCount = studentLogs.filter(log => log.status === 'pending').length;

      return {
        ...student,
        booksCount,
        pagesSum,
        pendingCount
      };
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto bg-white/80 backdrop-blur-md rounded-3xl p-8 soft-shadow border border-slate-200/50 mt-10">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="bg-pastel-purple p-4 rounded-2xl text-pastel-purple-deep">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-black text-slate-800">선생님 확인 공간</h2>
          <p className="text-sm text-slate-500 font-medium">
            이 탭은 우리 반 담임 선생님만 들어갈 수 있어요.<br />
            입장 비밀번호를 입력해 주세요.
          </p>
          <form onSubmit={handleLogin} className="w-full space-y-4 pt-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="선생님 비밀번호 (4자리)"
              className="w-full text-center bg-slate-50 border border-slate-200 focus:border-pastel-purple-dark focus:ring-4 focus:ring-pastel-purple/20 transition-all px-4 py-3 rounded-2xl font-bold placeholder-slate-400 outline-none"
            />
            {authError && (
              <p className="text-xs font-bold text-rose-500">{authError}</p>
            )}
            <button
              type="submit"
              className="w-full bg-pastel-purple-deep hover:bg-purple-800 active:scale-[0.98] transition-all text-white font-extrabold py-3.5 px-6 rounded-2xl shadow-md"
            >
              입장하기 🔓
            </button>
          </form>
        </div>
      </div>
    );
  }

  const attendanceList = getAttendanceData();
  const studentAggregates = getStudentAggregates();
  const pendingLogs = logs.filter(log => log.status === 'pending');
  const allLogsFiltered = logs.filter(log => {
    if (!searchTerm.trim()) return true;
    const student = students.find(s => s.id === log.studentId);
    return student?.name.includes(searchTerm) || log.bookTitle.toLowerCase().includes(searchTerm.toLowerCase());
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="space-y-8">
      {/* 교사 메뉴 헤더 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/80 backdrop-blur-md rounded-3xl p-6 soft-shadow border border-slate-200/50">
        <div>
          <h2 className="text-xl font-bold text-slate-800">5학년 1반 독서 관리 센터 📊</h2>
          <p className="text-xs text-slate-500">학생들의 독서 참여율을 모니터링하고 데이터를 다운로드하세요.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={loadData}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-4 py-2.5 rounded-xl text-sm transition-colors"
          >
            <RefreshCw size={16} /> 새로고침
          </button>
          <button
            onClick={downloadCSV}
            className="flex items-center gap-1.5 bg-pastel-mint-deep hover:bg-teal-800 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors shadow-sm"
          >
            <FileSpreadsheet size={16} /> 엑셀 다운로드 (CSV)
          </button>
        </div>
      </div>

      {/* 1. 아침 독서 현황 출석부 */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 md:p-8 soft-shadow border border-slate-200/50">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          ☀️ 오늘 아침 독서 기록 출석부 ({REFERENCE_DATE})
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {attendanceList.map(student => (
            <div
              key={student.id}
              className={`p-3.5 rounded-2xl border flex flex-col items-center text-center transition-all ${
                student.isSubmitted
                  ? 'bg-emerald-50/50 border-emerald-200 text-emerald-800'
                  : 'bg-slate-50/50 border-slate-100 text-slate-400'
              }`}
            >
              <span className="text-3xl mb-1">{student.avatar}</span>
              <span className="font-extrabold text-sm">{student.name}</span>
              {student.isSubmitted ? (
                <span className="text-[10px] font-bold mt-1 bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                  <CheckCircle size={10} /> {student.submitTime}
                </span>
              ) : (
                <span className="text-[10px] font-bold mt-1 bg-slate-200/60 text-slate-500 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                  <XCircle size={10} /> 미작성
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 2. 쪽수 승인 대기 목록 (우선 노출) */}
      {pendingLogs.length > 0 && (
        <div className="bg-pastel-orange/40 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-pastel-orange shadow-sm">
          <h3 className="text-lg font-bold text-amber-800 mb-4 flex items-center gap-2">
            ⚠️ 쪽수 확인 대기 요청 ({pendingLogs.length}건)
          </h3>
          <div className="space-y-3">
            {pendingLogs.map(log => {
              const student = students.find(s => s.id === log.studentId);
              return (
                <div key={log.id} className="bg-white border border-pastel-orange rounded-2xl p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{student?.avatar}</span>
                      <span className="font-extrabold text-slate-800">{student?.name}</span>
                      <span className="text-xs bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full font-bold">쪽수 모름</span>
                    </div>
                    <p className="text-sm font-bold text-slate-700">📖 {log.bookTitle}</p>
                    <p className="text-xs text-slate-500 font-semibold">💭 느낀 점: {log.comment}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 shrink-0">
                    <button
                      onClick={() => handleEditClick(log)}
                      className="bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1 transition-colors"
                    >
                      <Edit2 size={13} /> 직접 쪽수 입력
                    </button>
                    <button
                      onClick={() => handleApprovePending(log)}
                      className="bg-pastel-mint-deep hover:bg-teal-800 text-white font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1 transition-colors"
                    >
                      <Check size={13} /> 20쪽으로 승인
                    </button>
                    <button
                      onClick={() => handleDeleteLog(log.id)}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1 transition-colors"
                    >
                      <Trash2 size={13} /> 삭제
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. 학생별 이번 달 누적 통계 및 비밀번호 관리 표 */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 md:p-8 soft-shadow border border-slate-200/50">
        <h3 className="text-lg font-bold text-slate-800 mb-4">
          📅 우리 반 학생 관리 및 이번 달 누적 현황
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-bold text-slate-400">
                <th className="py-3 px-4">학생</th>
                <th className="py-3 px-4 text-center">읽은 책 (권)</th>
                <th className="py-3 px-4 text-center">읽은 페이지 (쪽)</th>
                <th className="py-3 px-4 text-center">대기 기록</th>
                <th className="py-3 px-4 text-center">비밀번호(PIN)</th>
                <th className="py-3 px-4 text-center">관리</th>
              </tr>
            </thead>
            <tbody>
              {studentAggregates.map(student => (
                <tr key={student.id} className="border-b border-slate-50 hover:bg-slate-50/30 text-sm">
                  <td className="py-3.5 px-4 flex items-center gap-2">
                    <span className="text-xl">{student.avatar}</span>
                    <span className="font-bold text-slate-700">{student.name}</span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-extrabold text-slate-600">
                    {student.booksCount}권
                  </td>
                  <td className="py-3.5 px-4 text-center font-extrabold text-teal-600">
                    {student.pagesSum}쪽
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {student.pendingCount > 0 ? (
                      <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-xs font-bold">
                        {student.pendingCount}건 대기
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs font-medium">-</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {student.pin ? (
                      <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 flex items-center justify-center gap-1 w-20 mx-auto">
                        <KeyRound size={12} className="text-teal-600" />
                        {student.pin}
                      </span>
                    ) : (
                      <span className="text-xs text-rose-500 font-semibold">설정안됨 🔓</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {student.pin ? (
                      <button
                        onClick={() => handleResetPin(student.id, student.name)}
                        className="bg-slate-100 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 border border-slate-200 text-slate-500 font-bold px-2 py-1 rounded-lg text-xs transition-colors flex items-center gap-1 mx-auto"
                        title="학생 비밀번호 초기화"
                      >
                        <RotateCcw size={11} /> 초기화
                      </button>
                    ) : (
                      <span className="text-slate-400 text-xs">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. 전체 기록 로그 목록 (검색 지원) */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 md:p-8 soft-shadow border border-slate-200/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h3 className="text-lg font-bold text-slate-800">전체 독서 로그 리스트</h3>
          
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="이름 또는 도서명 검색"
              className="w-full bg-slate-50 border border-slate-200 focus:border-teal-400 focus:bg-white transition-all pl-9 pr-4 py-2 rounded-xl text-xs outline-none"
            />
            <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
          </div>
        </div>

        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          {allLogsFiltered.length > 0 ? (
            allLogsFiltered.map(log => {
              const student = students.find(s => s.id === log.studentId);
              const logDate = getLocalDateString(log.timestamp);
              
              return (
                <div key={log.id} className="p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors border border-slate-100 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{student?.avatar}</span>
                      <span className="font-bold text-slate-700">{student?.name}</span>
                      <span className="text-xs text-slate-400 font-semibold">{logDate}</span>
                      {log.status === 'pending' && (
                        <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">확인대기</span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-slate-800">📖 {log.bookTitle}</p>
                    <p className="text-xs text-slate-500 font-medium">
                      {log.isUnknownPage ? (
                        <span>페이지 모름 (가이드 {log.totalPage}쪽 부여)</span>
                      ) : (
                        <span>{log.startPage}쪽 ~ {log.endPage}쪽 (총 {log.totalPage}쪽)</span>
                      )}
                    </p>
                    <p className="text-xs font-semibold text-slate-600 bg-white/60 p-2 rounded-lg border border-slate-100 mt-1">
                      💭 느낀점: {log.comment}
                    </p>
                  </div>

                  <div className="flex gap-2 shrink-0 justify-end">
                    <button
                      onClick={() => handleEditClick(log)}
                      className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
                      title="수정"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => handleDeleteLog(log.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                      title="삭제"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-slate-400 font-bold">
              검색 조건에 맞는 독서 로그가 존재하지 않아요 🔎
            </div>
          )}
        </div>
      </div>

      {/* 직접 쪽수 입력/수정 모달 다이얼로그 */}
      {editingLog && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200/50 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-black text-slate-800 mb-2">📖 독서 기록 정보 정정</h3>
            <p className="text-xs text-slate-500 mb-4">
              <strong>{students.find(s => s.id === editingLog.studentId)?.name}</strong> 어린이의 독서 기록 쪽수를 수정하거나 승인합니다.
            </p>

            <form onSubmit={handleUpdateLog} className="space-y-4">
              <div className="bg-slate-50 p-3.5 rounded-xl space-y-1 text-xs">
                <p className="font-bold text-slate-700">도서명: {editingLog.bookTitle}</p>
                <p className="text-slate-500">한줄평: {editingLog.comment}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-500">시작 쪽수</span>
                  <input
                    type="number"
                    min="1"
                    value={editStartPage}
                    onChange={(e) => setEditStartPage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-teal-400 focus:bg-white px-3 py-2 rounded-xl text-sm font-bold outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-500">끝 쪽수</span>
                  <input
                    type="number"
                    min="1"
                    value={editEndPage}
                    onChange={(e) => setEditEndPage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-teal-400 focus:bg-white px-3 py-2 rounded-xl text-sm font-bold outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingLog(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 rounded-xl text-xs transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-pastel-purple-deep hover:bg-purple-800 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-sm"
                >
                  수정 완료 (승인)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
