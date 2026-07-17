import type {
  User, Student, Resource, Receipt, Birthday,
  Announcement, Course, ActivityLog, Notification
} from '../types';

export interface IAuthService {
  login(email: string, password: string): Promise<User>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
}

export interface IStudentService {
  search(query: string): Promise<Student[]>;
  getById(id: string): Promise<Student | null>;
  getAll(): Promise<Student[]>;
  getBirthdays(month?: number): Promise<Birthday[]>;
}

export interface IResourceService {
  create(resource: Omit<Resource, 'id' | 'uploadDate'>): Promise<Resource>;
  getAll(): Promise<Resource[]>;
  getByCourse(courseId: string): Promise<Resource[]>;
  delete(id: string): Promise<void>;
}

export interface IReceiptService {
  upload(receipt: Omit<Receipt, 'id' | 'status'>): Promise<Receipt>;
  getAll(): Promise<Receipt[]>;
  getById(id: string): Promise<Receipt | null>;
  verify(id: string, userId: string): Promise<Receipt>;
  getPending(): Promise<Receipt[]>;
}

export interface IBirthdayService {
  getUpcoming(month?: number): Promise<Birthday[]>;
  getByStudentId(studentId: string): Promise<Birthday | null>;
}

export interface IAnnouncementService {
  publish(announcement: Omit<Announcement, 'id'>): Promise<Announcement>;
  getAll(): Promise<Announcement[]>;
  getActive(): Promise<Announcement[]>;
}

export interface ICourseService {
  getAll(): Promise<Course[]>;
  getById(id: string): Promise<Course | null>;
}

export interface INotificationService {
  getAll(): Promise<Notification[]>;
  getUnread(): Promise<Notification[]>;
  markAsRead(id: string): Promise<void>;
}

export interface IActivityService {
  getRecent(limit?: number): Promise<ActivityLog[]>;
  log(action: string, module: string): Promise<void>;
}
