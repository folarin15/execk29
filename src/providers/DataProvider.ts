import type { User, Student, Resource, Receipt, Birthday, Announcement, Course, Notification, ActivityEntry, StudentProfile } from '../types';

export interface DataProvider {
  auth: {
    login(email: string, password: string): Promise<User>;
    logout(): Promise<void>;
    getCurrentUser(): Promise<User | null>;
  };
  students: {
    search(query: string): Promise<Student[]>;
    getById(id: string): Promise<Student | null>;
    getAll(): Promise<Student[]>;
  };
  profiles: {
    getByStudentId(id: string): Promise<StudentProfile | null>;
    getAll(): Promise<StudentProfile[]>;
    create(profile: Omit<StudentProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<StudentProfile>;
    updatePhoto(id: string, photoUrl: string): Promise<StudentProfile>;
  };
  birthdays: {
    getUpcoming(month?: number): Promise<Birthday[]>;
    getByStudentId(studentId: string): Promise<Birthday | null>;
  };
  resources: {
    create(resource: Omit<Resource, 'id' | 'uploadDate'>): Promise<Resource>;
    getAll(): Promise<Resource[]>;
    getByCourse(courseCode: string): Promise<Resource[]>;
    delete(id: string): Promise<void>;
  };
  receipts: {
    upload(receipt: Omit<Receipt, 'id' | 'status'>): Promise<Receipt>;
    getAll(): Promise<Receipt[]>;
    getById(id: string): Promise<Receipt | null>;
    verify(id: string, userId: string): Promise<Receipt>;
    getPending(): Promise<Receipt[]>;
  };
  announcements: {
    publish(announcement: Omit<Announcement, 'id'>): Promise<Announcement>;
    getAll(): Promise<Announcement[]>;
    getActive(): Promise<Announcement[]>;
  };
  courses: {
    getAll(): Promise<Course[]>;
    getById(id: string): Promise<Course | null>;
  };
  notifications: {
    getAll(): Promise<Notification[]>;
    getUnread(): Promise<Notification[]>;
    markAsRead(id: string): Promise<void>;
  };
  activity: {
    getRecent(limit?: number): Promise<ActivityEntry[]>;
    log(entry: Omit<ActivityEntry, 'id'>): Promise<void>;
  };
}
