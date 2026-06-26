export interface Student {
  id: number;
  name: string;
  avatar: string;
  pin?: string; // 4자리 숫자 비밀번호
}

export interface ReadingLog {
  id: string;
  studentId: number;
  bookTitle: string;
  startPage: number | null;
  endPage: number | null;
  totalPage: number;
  comment: string;
  timestamp: string; // YYYY-MM-DD
  isUnknownPage: boolean;
  status: 'approved' | 'pending';
  originalEstimatedPage?: number; // 쪽수를 모를 경우 가이드로 지정한 페이지 수
}

export type TabType = 'student' | 'ranking' | 'teacher';
