import type { UserRole } from '../types';

export type Permission =
  | 'resource.upload'
  | 'resource.delete'
  | 'receipt.upload'
  | 'receipt.verify'
  | 'receipt.view'
  | 'announcement.publish'
  | 'announcement.delete'
  | 'student.view'
  | 'student.manage'
  | 'birthday.view'
  | 'birthday.download'
  | 'profile.manage'
  | 'settings.view'
  | 'activity.view'
  | 'notifications.view';

const rolePermissions: Record<UserRole, Permission[]> = {
  admin: [
    'resource.upload', 'resource.delete',
    'receipt.upload', 'receipt.verify', 'receipt.view',
    'announcement.publish', 'announcement.delete',
    'student.view', 'student.manage',
    'birthday.view', 'birthday.download',
    'profile.manage',
    'settings.view',
    'activity.view',
    'notifications.view',
  ],
  representative: [
    'resource.upload',
    'announcement.publish',
    'student.view',
    'birthday.view', 'birthday.download',
    'activity.view',
    'notifications.view',
  ],
  academic: [
    'resource.upload', 'resource.delete',
    'student.view',
    'activity.view',
    'notifications.view',
  ],
  treasurer: [
    'receipt.upload',
    'student.view',
    'activity.view',
    'notifications.view',
  ],
  auditor: [
    'receipt.view', 'receipt.verify',
    'student.view',
    'activity.view',
    'notifications.view',
  ],
  designer: [
    'birthday.view', 'birthday.download',
    'student.view',
    'activity.view',
    'notifications.view',
  ],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false;
}

export function can(role: UserRole): {
  uploadSlides: () => boolean;
  deleteSlides: () => boolean;
  uploadReceipt: () => boolean;
  verifyReceipts: () => boolean;
  publishAnnouncements: () => boolean;
  manageStudents: () => boolean;
  downloadPhotos: () => boolean;
  viewSettings: () => boolean;
  viewActivity: () => boolean;
} {
  const check = (p: Permission) => hasPermission(role, p);
  return {
    uploadSlides: () => check('resource.upload'),
    deleteSlides: () => check('resource.delete'),
    uploadReceipt: () => check('receipt.upload'),
    verifyReceipts: () => check('receipt.verify'),
    publishAnnouncements: () => check('announcement.publish'),
    manageStudents: () => check('student.manage'),
    downloadPhotos: () => check('birthday.download'),
    viewSettings: () => check('settings.view'),
    viewActivity: () => check('activity.view'),
  };
}
