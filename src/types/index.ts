export type UserRole = 'admin' | 'representative' | 'academic' | 'treasurer' | 'auditor' | 'designer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  title?: string;
  mustChangePassword?: boolean;
}

export interface Student {
  id: string;
  studentId: string;
  name: string;
  email: string;
  class?: string;
  avatar?: string;
  dateOfBirth?: string;
  enrollmentStatus?: 'active' | 'inactive' | 'graduated';
}

export interface Resource {
  id: string;
  course: string;
  courseCode: string;
  week: number;
  title: string;
  fileName: string;
  fileType: 'pdf' | 'pptx' | 'xlsx' | 'docx' | 'other';
  fileSize: number;
  uploadDate: string;
  uploadedBy: string;
  fileUrl?: string;
}

export interface Receipt {
  id: string;
  receiptNumber: string;
  purpose: string;
  amount: number;
  date: string;
  uploadedBy: string;
  uploaderRole: string;
  students: string[];
  studentDetails?: { id: string; name: string; studentId: string }[];
  status: 'pending' | 'verified';
  verifiedBy?: string;
  verifiedAt?: string;
  receiptUrl?: string;
}

export interface Birthday {
  id: string;
  studentId: string;
  studentName: string;
  dateOfBirth: string;
  birthDate: string;
  photoUrl?: string;
  daysUntilBirthday: number;
  isToday: boolean;
  month: string;
  day: number;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  status: 'live' | 'draft' | 'scheduled';
  author: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  department?: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  module: string;
  timestamp: string;
  status: string;
  user: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  timestamp: string;
}

export interface ActivityEntry {
  id: string;
  action: string;
  actor: string;
  actorRole: string;
  module: string;
  target?: string;
  timestamp: string;
  category: 'upload' | 'verify' | 'publish' | 'download' | 'update' | 'create';
}

export interface StudentProfile {
  id: string;
  studentId: string;
  fullName: string;
  matricNumber: string;
  birthday: string;
  photoUrl?: string;
  profileCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  email?: string;
  class?: string;
}

export interface Suggestion {
  id: string;
  name: string;
  matricNumber: string;
  category: string;
  message: string;
  status: 'pending' | 'reviewed' | 'addressed';
  createdAtMs: number;
}

export interface QuizAttempt {
  id: string;
  memberId: string;
  memberName?: string;
  courseCode: string;
  mode: 'practice' | 'exam';
  score: number;
  questionCount: number;
  percent: number;
  durationSeconds: number;
  submittedAtMs: number;
}

export interface TopicPerformance {
  memberId: string;
  topic: string;
  accuracy: number;
  attempts: number;
}

export interface WeeklyActivity {
  day: string;
  value: number;
}

export interface EngagementRing {
  opened: number;
  reading: number;
  done: number;
  notStarted: number;
  total: number;
  percentOpened: number;
}

export interface LeaderboardEntry {
  memberId: string;
  memberName: string;
  matricNumber: string;
  attemptCount: number;
  avgPercent: number;
  streak: number;
  lastActive: number;
}

export interface AnalyticsSummary {
  totalAttempts: number;
  avgPercent: number;
  uniqueStudents: number;
  avgDuration: number;
  totalQuizzes: number;
  totalExams: number;
  totalStudyMinutes: number;
  activeToday: number;
  activeWeek: number;
  topStreak: number;
  topStreakMember: string;
  classAverage: number;
}

export interface MemberStudyHistory {
  member: { id: string; name: string; matricNumber: string };
  attempts: QuizAttempt[];
  topics: TopicPerformance[];
  streak: number;
}
