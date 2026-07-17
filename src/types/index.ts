export type UserRole = 'admin' | 'representative' | 'academic' | 'treasurer' | 'auditor' | 'designer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  title?: string;
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
