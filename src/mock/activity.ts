import type { ActivityLog } from '../types';

export const mockActivityLogs: ActivityLog[] = [
  { id: 'act-001', action: 'New Announcement: Semester 2 Schedule', module: 'Announcements', timestamp: '2 mins ago', status: 'LIVE', user: 'Administrator' },
  { id: 'act-002', action: 'Resource Upload: Lab_Protocol_v3.pdf', module: 'Resources', timestamp: '1 hour ago', status: 'SYNCED', user: 'Dr. Academic' },
  { id: 'act-003', action: 'Bulk Student Update: Year 3 Batch', module: 'Students', timestamp: '09:12 AM', status: 'PENDING', user: 'Representative' },
  { id: 'act-004', action: 'Receipt Verified: REC-99020', module: 'Audit', timestamp: 'Yesterday', status: 'VERIFIED', user: 'Auditor' },
  { id: 'act-005', action: 'New User Registration: 12 Students', module: 'Students', timestamp: '2 days ago', status: 'COMPLETED', user: 'System' },
];
