import { Student, ReadingLog } from '../types';

// 초기 가상 학생 데이터 (초등학교 5학년 1반 콘셉트)
export const DEFAULT_STUDENTS: Student[] = [
  { id: 1, name: "김민준", avatar: "🤖" },
  { id: 2, name: "이서연", avatar: "🦄" },
  { id: 3, name: "박예준", avatar: "🦖" },
  { id: 4, name: "최아윤", avatar: "🐱" },
  { id: 5, name: "정지우", avatar: "🐼" },
  { id: 6, name: "강도윤", avatar: "🦊" },
  { id: 7, name: "조하은", avatar: "🐰" },
  { id: 8, name: "윤준서", avatar: "🦁" },
  { id: 9, name: "장지아", avatar: "🐯" },
  { id: 10, name: "임선우", avatar: "🐨" },
  { id: 11, name: "한지민", avatar: "🐥" },
  { id: 12, name: "오현우", avatar: "🐻" },
  { id: 13, name: "신서아", avatar: "🐹" },
  { id: 14, name: "서건우", avatar: "🐸" },
  { id: 15, name: "권다은", avatar: "🐝" }
];

// 2026-06-26 기준 최근 일주일 샘플 데이터
const generateSampleLogs = (): ReadingLog[] => {
  return [
    {
      id: "sample-1",
      studentId: 1, // 김민준
      bookTitle: "자전거 도둑",
      startPage: 10,
      endPage: 45,
      totalPage: 36, // 45 - 10 + 1 = 36
      comment: "수남이의 마음이 아프기도 하고 공감도 되었다. 나라도 무서웠을 것 같다.",
      timestamp: "2026-06-26T08:40:00.000Z", // 오늘 아침
      isUnknownPage: false,
      status: 'approved'
    },
    {
      id: "sample-2",
      studentId: 2, // 이서연
      bookTitle: "이상한 과자 가게 전천당",
      startPage: 1,
      endPage: 50,
      totalPage: 50,
      comment: "고양이가 만든 과자를 먹어보고 싶다. 나도 소원이 이루어질까?",
      timestamp: "2026-06-26T08:42:00.000Z", // 오늘 아침
      isUnknownPage: false,
      status: 'approved'
    },
    {
      id: "sample-3",
      studentId: 3, // 박예준
      bookTitle: "그리스 로마 신화",
      startPage: 120,
      endPage: 185,
      totalPage: 66,
      comment: "제우스가 번개를 던질 때가 제일 멋있다. 신들의 전쟁이 흥미진진하다.",
      timestamp: "2026-06-25T08:35:00.000Z",
      isUnknownPage: false,
      status: 'approved'
    },
    {
      id: "sample-4",
      studentId: 4, // 최아윤
      bookTitle: "마당을 나온 암탉",
      startPage: 50,
      endPage: 85,
      totalPage: 36,
      comment: "잎싹이가 초록이를 키우는 과정이 감동적이고 슬펐다.",
      timestamp: "2026-06-25T08:45:00.000Z",
      isUnknownPage: false,
      status: 'approved'
    },
    {
      id: "sample-5",
      studentId: 5, // 정지우
      bookTitle: "어린 왕자",
      startPage: 12,
      endPage: 40,
      totalPage: 29,
      comment: "여우가 '길들인다는 것'의 의미를 설명해 주는 부분이 마음에 와닿았다.",
      timestamp: "2026-06-24T08:38:00.000Z",
      isUnknownPage: false,
      status: 'approved'
    },
    {
      id: "sample-6",
      studentId: 1, // 김민준
      bookTitle: "자전거 도둑",
      startPage: 46,
      endPage: 90,
      totalPage: 45,
      comment: "수남이가 결국 고향으로 돌아가기로 결심했을 때 안도감이 들었다.",
      timestamp: "2026-06-25T08:39:00.000Z",
      isUnknownPage: false,
      status: 'approved'
    },
    {
      id: "sample-7",
      studentId: 7, // 조하은
      bookTitle: "샬롯의 거미줄",
      startPage: null,
      endPage: null,
      totalPage: 20, // 쪽수 모름 기본 지급
      comment: "샬롯이 윌버를 살리기 위해 글자를 쓰는 지혜가 대단하다.",
      timestamp: "2026-06-26T08:48:00.000Z", // 오늘 아침 (쪽수 대기)
      isUnknownPage: true,
      status: 'pending',
      originalEstimatedPage: 20
    },
    {
      id: "sample-8",
      studentId: 8, // 윤준서
      bookTitle: "해리 포터와 마법사의 돌",
      startPage: 100,
      endPage: 160,
      totalPage: 61,
      comment: "퀴디치 시합 장면은 책으로 읽어도 땀이 날 만큼 스릴 넘쳤다.",
      timestamp: "2026-06-23T08:41:00.000Z",
      isUnknownPage: false,
      status: 'approved'
    },
    {
      id: "sample-9",
      studentId: 2, // 이서연
      bookTitle: "이상한 과자 가게 전천당",
      startPage: 51,
      endPage: 110,
      totalPage: 60,
      comment: "전천당 주인 홍자 아줌마의 카리스마가 너무 멋지다.",
      timestamp: "2026-06-24T08:42:00.000Z",
      isUnknownPage: false,
      status: 'approved'
    },
    {
      id: "sample-10",
      studentId: 6, // 강도윤
      bookTitle: "마법천자문 50권",
      startPage: 1,
      endPage: 120,
      totalPage: 120,
      comment: "한자 마법 대결이 너무 박진감 넘친다. 한자 공부도 되는 것 같다.",
      timestamp: "2026-06-26T08:35:00.000Z", // 오늘 아침
      isUnknownPage: false,
      status: 'approved'
    }
  ];
};

const STORAGE_KEYS = {
  STUDENTS: 'morning_reading_students',
  LOGS: 'morning_reading_logs'
};

// 클라이언트 사이드 여부 체크
const isClient = typeof window !== 'undefined';

export const getStudents = (): Student[] => {
  if (!isClient) return DEFAULT_STUDENTS;
  const stored = localStorage.getItem(STORAGE_KEYS.STUDENTS);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(DEFAULT_STUDENTS));
    return DEFAULT_STUDENTS;
  }
  return JSON.parse(stored);
};

export const getReadingLogs = (): ReadingLog[] => {
  if (!isClient) return [];
  const stored = localStorage.getItem(STORAGE_KEYS.LOGS);
  if (!stored) {
    const samples = generateSampleLogs();
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(samples));
    return samples;
  }
  return JSON.parse(stored);
};

export const saveReadingLogs = (logs: ReadingLog[]): void => {
  if (isClient) {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  }
};

export const addReadingLog = (
  logData: Omit<ReadingLog, 'id' | 'timestamp'> & { id?: string; timestamp?: string }
): ReadingLog => {
  const logs = getReadingLogs();
  const newLog: ReadingLog = {
    id: logData.id || `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: logData.timestamp || new Date().toISOString(),
    studentId: logData.studentId,
    bookTitle: logData.bookTitle,
    startPage: logData.startPage,
    endPage: logData.endPage,
    totalPage: logData.totalPage,
    comment: logData.comment,
    isUnknownPage: logData.isUnknownPage,
    status: logData.status,
    originalEstimatedPage: logData.originalEstimatedPage
  };
  
  logs.push(newLog);
  saveReadingLogs(logs);
  return newLog;
};

export const updateReadingLog = (updatedLog: ReadingLog): void => {
  const logs = getReadingLogs();
  const index = logs.findIndex(l => l.id === updatedLog.id);
  if (index !== -1) {
    logs[index] = updatedLog;
    saveReadingLogs(logs);
  }
};

export const deleteReadingLog = (logId: string): void => {
  const logs = getReadingLogs();
  const filtered = logs.filter(l => l.id !== logId);
  saveReadingLogs(filtered);
};

// 특정 날짜(KST 기준)에 작성했는지 여부 체크를 돕는 유틸리티
// timestamp는 ISO String(UTC)으로 저장되므로 로컬 날짜 문자열(YYYY-MM-DD)로 변환해 비교
export const getLocalDateString = (isoString: string): string => {
  const date = new Date(isoString);
  // 한국 시간(UTC+9) 기준으로 연월일 추출
  const offset = 9 * 60; // minutes
  const kstDate = new Date(date.getTime() + offset * 60 * 1000);
  return kstDate.toISOString().split('T')[0];
};

// 특정 주의 시작일(월요일)과 종료일(일요일) 구하기
export const getWeekRange = (dateStr: string) => {
  const date = new Date(dateStr);
  const day = date.getDay(); // 0: 일요일, 1: 월요일, ...
  const diffToMonday = date.getDate() - day + (day === 0 ? -6 : 1); // 월요일 날짜
  
  const monday = new Date(date.setDate(diffToMonday));
  monday.setHours(0, 0, 0, 0);
  
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  
  return { monday, sunday };
};

// 학생의 핀번호 설정 / 업데이트 / 초기화
export const updateStudentPin = (studentId: number, pin: string | undefined): void => {
  if (typeof window === 'undefined') return;
  const students = getStudents();
  const index = students.findIndex(s => s.id === studentId);
  if (index !== -1) {
    if (pin === undefined) {
      delete students[index].pin;
    } else {
      students[index].pin = pin;
    }
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  }
};

// 특정 학생이 특정 도서를 읽은 가장 최근 기록 조회 (이어서 쓰기용)
export const getLastLogForBook = (studentId: number, bookTitle: string): ReadingLog | null => {
  const logs = getReadingLogs();
  const studentBookLogs = logs
    .filter(log => log.studentId === studentId && log.bookTitle.trim().toLowerCase() === bookTitle.trim().toLowerCase())
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()); // 최근 순 정렬

  return studentBookLogs.length > 0 ? studentBookLogs[0] : null;
};

