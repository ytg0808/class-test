import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, User, Calendar, CheckCircle2, ChevronDown, BookMarked, HelpCircle, Lock, Unlock, LogOut, Info } from 'lucide-react';
import { Student, ReadingLog } from '../types';
import { getStudents, getReadingLogs, addReadingLog, updateStudentPin, getLastLogForBook } from '../utils/storage';

interface StudentFormProps {
  onSuccess: () => void;
}

export default function StudentForm({ onSuccess }: StudentFormProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  
  // 로그인(핀번호) 인증 관련 상태
  const [loggedInStudent, setLoggedInStudent] = useState<Student | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [isRegisteringPin, setIsRegisteringPin] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  // 폼 필드 상태
  const [bookTitle, setBookTitle] = useState('');
  const [startPage, setStartPage] = useState('');
  const [endPage, setEndPage] = useState('');
  const [isUnknownPage, setIsUnknownPage] = useState(false);
  const [comment, setComment] = useState('');
  
  // 부가 UI 상태
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [recentBooks, setRecentBooks] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [calculatedPages, setCalculatedPages] = useState<number | null>(null);
  const [pageError, setPageError] = useState('');
  const [autoPageInfo, setAutoPageInfo] = useState<string>(''); // 자동 입력된 쪽수 안내 메시지

  const suggestionRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 초기 로딩 및 세션 복구
  useEffect(() => {
    loadStudentsData();
    // 브라우저 세션에 로그인된 학생이 있다면 복구
    const savedSession = sessionStorage.getItem('morning_reading_active_student');
    if (savedSession) {
      try {
        const student = JSON.parse(savedSession) as Student;
        setLoggedInStudent(student);
        setSelectedStudent(student);
      } catch (e) {
        console.error('Session recovery failed', e);
      }
    }
  }, []);

  const loadStudentsData = () => {
    const loadedStudents = getStudents();
    setStudents(loadedStudents);
    
    // 세션이 살아있는 상태면 갱신
    if (loggedInStudent) {
      const updated = loadedStudents.find(s => s.id === loggedInStudent.id);
      if (updated) {
        setLoggedInStudent(updated);
        setSelectedStudent(updated);
      }
    }

    const logs = getReadingLogs();
    const uniqueBooks = Array.from(new Set(logs.map(log => log.bookTitle))).slice(0, 10);
    setRecentBooks(uniqueBooks);
  };

  // 바깥 클릭 시 자동완성/드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 책 제목 타이핑 시 자동완성 제안 필터링
  useEffect(() => {
    if (bookTitle.trim().length > 0) {
      const filtered = recentBooks.filter(book =>
        book.toLowerCase().includes(bookTitle.toLowerCase()) && book !== bookTitle
      );
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [bookTitle, recentBooks]);

  // 책 제목이 변경되었을 때 이전 기록을 찾아 시작 쪽수 자동 입력
  useEffect(() => {
    if (!loggedInStudent || !bookTitle.trim() || isUnknownPage) {
      setAutoPageInfo('');
      return;
    }

    const lastLog = getLastLogForBook(loggedInStudent.id, bookTitle);
    if (lastLog && lastLog.endPage !== null) {
      const nextStart = lastLog.endPage + 1;
      setStartPage(nextStart.toString());
      setAutoPageInfo(`이전에 읽은 끝 쪽수(${lastLog.endPage}쪽)를 바탕으로 시작 쪽수를 채웠어요!`);
    } else {
      setStartPage('');
      setAutoPageInfo('');
    }
  }, [bookTitle, loggedInStudent, isUnknownPage]);

  // 시작/끝 쪽수 입력 시 실시간 총 페이지 계산
  useEffect(() => {
    if (isUnknownPage) {
      setCalculatedPages(20); // 쪽수 모를 시 기본 가이드 쪽수
      setPageError('');
      return;
    }

    const start = parseInt(startPage);
    const end = parseInt(endPage);

    if (isNaN(start) || startPage.trim() === '' || isNaN(end) || endPage.trim() === '') {
      setCalculatedPages(null);
      setPageError('');
      return;
    }

    if (start < 1) {
      setPageError('시작 쪽수는 1쪽 이상이어야 해요.');
      setCalculatedPages(null);
      return;
    }

    if (end < start) {
      setPageError('끝 쪽수는 시작 쪽수보다 크거나 같아야 해요.');
      setCalculatedPages(null);
      return;
    }

    const pages = end - start + 1;
    setCalculatedPages(pages);
    setPageError('');
  }, [startPage, endPage, isUnknownPage]);

  // 학생 선택 시 핀번호 상태 체크
  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
    setPinInput('');
    setPinError('');
    setNewPin('');
    setConfirmPin('');
    
    // 세션 초기화
    setLoggedInStudent(null);
    sessionStorage.removeItem('morning_reading_active_student');

    if (!student.pin) {
      // 핀이 없으면 신규 등록 모드로 진입
      setIsRegisteringPin(true);
    } else {
      setIsRegisteringPin(false);
    }
  };

  // 핀번호 등록 처리
  const handleRegisterPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    if (!/^\d{4}$/.test(newPin)) {
      setPinError('비밀번호는 숫자 4자리여야 해요.');
      return;
    }

    if (newPin !== confirmPin) {
      setPinError('비밀번호가 서로 다릅니다. 다시 입력해주세요.');
      return;
    }

    // 핀번호 저장
    updateStudentPin(selectedStudent.id, newPin);
    
    // 데이터 새로고침
    const loadedStudents = getStudents();
    setStudents(loadedStudents);
    const updatedStudent = loadedStudents.find(s => s.id === selectedStudent.id) || selectedStudent;
    
    // 로그인 상태 부여 및 세션 보존
    setLoggedInStudent(updatedStudent);
    sessionStorage.setItem('morning_reading_active_student', JSON.stringify(updatedStudent));
    setIsRegisteringPin(false);
    setPinError('');
    alert(`🔐 비밀번호(PIN) 등록 완료! 앞으로 로그아웃 전까지는 입력 안 해도 돼요.`);
  };

  // 핀번호 로그인 인증 처리
  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    if (pinInput === selectedStudent.pin) {
      setLoggedInStudent(selectedStudent);
      sessionStorage.setItem('morning_reading_active_student', JSON.stringify(selectedStudent));
      setPinInput('');
      setPinError('');
    } else {
      setPinError('비밀번호가 틀렸어요. 다시 시도해 주세요.');
    }
  };

  // 로그아웃 처리
  const handleLogout = () => {
    setLoggedInStudent(null);
    setSelectedStudent(null);
    sessionStorage.removeItem('morning_reading_active_student');
    setBookTitle('');
    setStartPage('');
    setEndPage('');
    setIsUnknownPage(false);
    setComment('');
  };

  // 기록 제출 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!loggedInStudent) {
      alert('비밀번호를 입력하여 로그인을 먼저 완료해 주세요!');
      return;
    }

    if (!bookTitle.trim()) {
      alert('읽은 책의 제목을 입력해 주세요!');
      return;
    }

    if (!isUnknownPage) {
      const start = parseInt(startPage);
      const end = parseInt(endPage);
      if (isNaN(start) || isNaN(end) || start < 1 || end < start) {
        alert('올바른 페이지 쪽수를 입력해 주세요!');
        return;
      }
    }

    if (!comment.trim()) {
      alert('한 줄 느낀 점이나 마음에 남는 문장을 적어주세요!');
      return;
    }

    const logTotalPages = isUnknownPage ? 20 : (parseInt(endPage) - parseInt(startPage) + 1);

    const newLog = {
      studentId: loggedInStudent.id,
      bookTitle: bookTitle.trim(),
      startPage: isUnknownPage ? null : parseInt(startPage),
      endPage: isUnknownPage ? null : parseInt(endPage),
      totalPage: logTotalPages,
      comment: comment.trim(),
      isUnknownPage: isUnknownPage,
      status: (isUnknownPage ? 'pending' : 'approved') as 'pending' | 'approved',
      originalEstimatedPage: isUnknownPage ? 20 : undefined
    };

    addReadingLog(newLog);

    // 축하 폭죽 효과
    try {
      const confetti = (await import('canvas-confetti')).default;
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#A5D6A7', '#90CAF9', '#FFF59D', '#F48FB1', '#CE93D8']
      });
    } catch (err) {
      console.log('Confetti load error', err);
    }

    // 작성 폼 초기화 (이름 세션은 그대로 유지하여 이어서 기록 작성 가능)
    setBookTitle('');
    setStartPage('');
    setEndPage('');
    setIsUnknownPage(false);
    setComment('');
    setAutoPageInfo('');
    
    alert(`🎉 ${loggedInStudent.name} 어린이의 독서 기록이 성공적으로 등록되었습니다!`);
    onSuccess();
    
    // 데이터 및 자동완성 목록 리로드
    loadStudentsData();
  };

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 md:p-8 soft-shadow border border-slate-200/50">
      {/* 타이틀 영역 */}
      <div className="flex items-center justify-between gap-3 mb-6 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-teal-50 p-2 rounded-xl text-teal-600">
            <BookMarked size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">오늘 아침 내 독서 기록</h2>
            <p className="text-xs text-slate-500">읽은 책과 쪽수를 차근차근 적어 보아요.</p>
          </div>
        </div>
        {loggedInStudent && (
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-all border border-rose-100"
          >
            <LogOut size={13} /> 로그아웃
          </button>
        )}
      </div>

      {/* 1단계: 학생 이름 고르기 (로그인 여부 불문하고 상단에 항상 배치하되, 로그인되면 표시 전환) */}
      {!loggedInStudent ? (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700 flex items-center gap-1.5">
              <User size={16} className="text-teal-500" />
              내 이름 고르기
            </label>
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full bg-slate-50 hover:bg-slate-100/80 transition-colors border border-slate-200 text-left px-4 py-3.5 rounded-2xl flex items-center justify-between text-slate-700"
              >
                {selectedStudent ? (
                  <span className="flex items-center gap-2 font-bold text-slate-800">
                    <span className="text-xl">{selectedStudent.avatar}</span>
                    {selectedStudent.name}
                  </span>
                ) : (
                  <span className="text-slate-400 font-medium font-bold">누구인가요? 이름을 골라주세요</span>
                )}
                <ChevronDown size={20} className={`text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute z-20 mt-2 w-full bg-white border border-slate-200 rounded-2xl shadow-xl max-h-60 overflow-y-auto p-2 grid grid-cols-2 md:grid-cols-3 gap-1">
                  {students.map((student) => (
                    <button
                      key={student.id}
                      type="button"
                      onClick={() => {
                        handleStudentSelect(student);
                        setDropdownOpen(false);
                      }}
                      className={`flex items-center gap-2 p-2.5 rounded-xl text-left hover:bg-teal-50/50 transition-colors ${
                        selectedStudent?.id === student.id
                          ? 'bg-pastel-mint border border-teal-200 text-teal-800 font-bold'
                          : 'text-slate-700 font-medium'
                      }`}
                    >
                      <span className="text-lg">{student.avatar}</span>
                      <span className="text-sm">{student.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 2단계: 선택된 학생에 맞춘 핀번호 입력 게이트 */}
          {selectedStudent && (
            <div className="bg-slate-50/60 p-5 rounded-2xl border border-slate-200/50 space-y-4 animate-in fade-in slide-in-from-top-4 duration-200">
              {isRegisteringPin ? (
                /* 신규 핀번호 등록 */
                <form onSubmit={handleRegisterPin} className="space-y-3">
                  <div className="flex items-center gap-1.5 text-slate-700 font-bold text-sm">
                    <Lock size={15} className="text-pastel-orange-deep" />
                    <span>첫 로그인! 비밀번호를 설정할게요</span>
                  </div>
                  <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                    친구가 내 이름을 잘못 선택하여 독서 기록을 지우거나 쓰는 걸 막기 위해, <br />
                    앞으로 사용할 나만의 <strong>비밀번호 4자리(숫자)</strong>를 입력해 주세요.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <input
                      type="password"
                      maxLength={4}
                      pattern="\d{4}"
                      inputMode="numeric"
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="비밀번호 4자리"
                      className="bg-white border border-slate-200 focus:border-teal-400 px-3 py-2 rounded-xl text-sm font-bold text-center outline-none"
                    />
                    <input
                      type="password"
                      maxLength={4}
                      pattern="\d{4}"
                      inputMode="numeric"
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="한번 더 확인"
                      className="bg-white border border-slate-200 focus:border-teal-400 px-3 py-2 rounded-xl text-sm font-bold text-center outline-none"
                    />
                  </div>
                  
                  {pinError && (
                    <p className="text-xs font-semibold text-rose-500">{pinError}</p>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-teal-500 hover:bg-teal-600 text-white font-extrabold py-2 px-4 rounded-xl text-xs shadow-sm transition-all"
                  >
                    🔐 비밀번호 설정 완료하기
                  </button>
                </form>
              ) : (
                /* 기존 핀번호 확인 */
                <form onSubmit={handleVerifyPin} className="space-y-3">
                  <div className="flex items-center gap-1.5 text-slate-700 font-bold text-sm">
                    <Lock size={15} className="text-teal-600" />
                    <span>비밀번호 4자리를 적어주세요</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <input
                      type="password"
                      maxLength={4}
                      pattern="\d{4}"
                      inputMode="numeric"
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                      placeholder="숫자 4자리"
                      className="flex-1 bg-white border border-slate-200 focus:border-teal-400 px-4 py-2 rounded-xl text-sm font-bold text-center tracking-widest outline-none"
                    />
                    <button
                      type="submit"
                      className="bg-teal-500 hover:bg-teal-600 text-white font-extrabold px-6 py-2 rounded-xl text-sm shadow-sm transition-all"
                    >
                      확인 🔑
                    </button>
                  </div>
                  
                  {pinError && (
                    <p className="text-xs font-semibold text-rose-500">{pinError}</p>
                  )}
                </form>
              )}
            </div>
          )}
        </div>
      ) : (
        /* 로그인 완료 상태: 독서기록 입력 폼 오픈 */
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 상단 로그인 알림판 */}
          <div className="bg-pastel-mint border border-pastel-mint-dark rounded-2xl px-4 py-3 flex items-center justify-between text-teal-900">
            <span className="text-xs md:text-sm font-extrabold flex items-center gap-1.5">
              <Unlock size={16} className="text-teal-600" />
              {loggedInStudent.avatar} <strong className="text-teal-950 font-black">{loggedInStudent.name}</strong> 어린이 모드로 안전하게 기록하는 중이에요.
            </span>
          </div>

          {/* 2. 책 제목 입력 및 최근 도서 추천 */}
          <div className="space-y-2 relative" ref={suggestionRef}>
            <label className="block text-sm font-bold text-slate-700 flex items-center gap-1.5">
              <BookOpen size={16} className="text-teal-500" />
              책 제목
            </label>
            <input
              type="text"
              value={bookTitle}
              onChange={(e) => setBookTitle(e.target.value)}
              onFocus={() => {
                if (recentBooks.length > 0 && bookTitle.trim() === '') {
                  setSuggestions(recentBooks);
                  setShowSuggestions(true);
                }
              }}
              placeholder="읽고 있는 책 이름을 적어주세요 (예: 자전거 도둑)"
              className="w-full bg-slate-50 border border-slate-200 focus:border-teal-400 focus:bg-white focus:ring-4 focus:ring-teal-100 transition-all px-4 py-3.5 rounded-2xl text-slate-800 font-medium placeholder-slate-400 outline-none"
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-2xl shadow-lg max-h-48 overflow-y-auto p-1.5">
                <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 border-b border-slate-100">
                  {bookTitle.trim() === '' ? '최근 우리 반이 읽은 책' : '추천 책 목록'}
                </div>
                {suggestions.map((title, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setBookTitle(title);
                      setShowSuggestions(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-xl transition-colors font-medium"
                  >
                    📖 {title}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 3. 읽은 페이지 입력 */}
          <div className="space-y-3 bg-slate-50/60 p-4 rounded-2xl border border-slate-200/50">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                <Calendar size={16} className="text-teal-500" />
                읽은 페이지(쪽수)
              </label>
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isUnknownPage}
                  onChange={(e) => {
                    setIsUnknownPage(e.target.checked);
                    if (e.target.checked) {
                      setStartPage('');
                      setEndPage('');
                    }
                  }}
                  className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
                />
                <span className="text-pastel-orange-deep flex items-center gap-0.5">
                  ⚠️ 쪽수를 모르겠어요
                </span>
              </label>
            </div>

            {/* 연속 읽기 쪽수 자동 입력 가이드 노출 */}
            {autoPageInfo && !isUnknownPage && (
              <div className="bg-sky-50 border border-sky-100 rounded-xl p-2.5 flex items-center gap-2 text-sky-800 text-xs font-bold animate-in fade-in duration-200">
                <Info size={14} className="shrink-0 text-sky-500" />
                <span>{autoPageInfo}</span>
              </div>
            )}

            {!isUnknownPage ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-500">시작 쪽수</span>
                  <input
                    type="number"
                    min="1"
                    value={startPage}
                    onChange={(e) => setStartPage(e.target.value)}
                    placeholder="예: 10"
                    className="w-full bg-white border border-slate-200 focus:border-teal-400 focus:ring-4 focus:ring-teal-100 transition-all px-4 py-2.5 rounded-xl text-slate-800 font-semibold outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-500">끝 쪽수</span>
                  <input
                    type="number"
                    min="1"
                    value={endPage}
                    onChange={(e) => setEndPage(e.target.value)}
                    placeholder="예: 35"
                    className="w-full bg-white border border-slate-200 focus:border-teal-400 focus:ring-4 focus:ring-teal-100 transition-all px-4 py-2.5 rounded-xl text-slate-800 font-semibold outline-none"
                  />
                </div>
              </div>
            ) : (
              <div className="bg-pastel-yellow/80 border border-pastel-yellow-dark rounded-xl p-3 flex gap-2 text-amber-800 text-xs">
                <HelpCircle size={16} className="shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">걱정 마세요!</p>
                  <p className="mt-0.5 text-slate-600">쪽수를 깜빡했다면 우선 대략 <strong>20쪽</strong>을 읽은 것으로 기록되고, 선생님이 확인하신 후 바르게 수정해 주실 거예요. (확인 대기 상태로 저장)</p>
                </div>
              </div>
            )}

            {pageError && (
              <p className="text-xs font-semibold text-rose-500 pl-1">{pageError}</p>
            )}

            {calculatedPages !== null && !pageError && (
              <div className="bg-pastel-mint border border-pastel-mint-dark rounded-xl p-3 flex items-center justify-between text-teal-800">
                <span className="text-xs font-bold">✨ 자동 계산된 독서량</span>
                <span className="text-sm font-extrabold">
                  {isUnknownPage ? '임시 가이드 20쪽' : `오늘 총 ${calculatedPages}쪽 읽었어요!`}
                </span>
              </div>
            )}
          </div>

          {/* 4. 한 줄 느낀 점 */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700 flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-teal-500" />
              한 줄 느낀 점 / 기억나는 문장
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="오늘 읽은 내용 중 가장 재밌었던 일이나 멋진 말을 적어보세요. (예: 샬롯이 위기에 처한 친구를 지혜롭게 구해줘서 감동받았다!)"
              rows={3}
              className="w-full bg-slate-50 border border-slate-200 focus:border-teal-400 focus:bg-white focus:ring-4 focus:ring-teal-100 transition-all px-4 py-3.5 rounded-2xl text-slate-800 font-medium placeholder-slate-400 outline-none resize-none"
            />
          </div>

          {/* 등록 버튼 */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 active:scale-[0.98] transition-all text-white font-extrabold py-4 px-6 rounded-2xl shadow-md flex items-center justify-center gap-2 text-base md:text-lg"
          >
            📝 독서기록장 등록하기
          </button>
        </form>
      )}
    </div>
  );
}
