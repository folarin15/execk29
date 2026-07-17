import type { Announcement } from '../types';

export const mockAnnouncements: Announcement[] = [
  {
    id: 'ann-001',
    title: 'Semester 2 Schedule Published',
    content: 'The schedule for Semester 2 has been published. Please review and note your class times.',
    date: '2026-07-17T08:00:00',
    status: 'live',
    author: 'Administrator',
  },
  {
    id: 'ann-002',
    title: 'Faculty Meeting Friday',
    content: 'All faculty are required to attend the end-of-term meeting this Friday at 10 AM.',
    date: '2026-07-16T14:00:00',
    status: 'live',
    author: 'Dr. Academic',
  },
  {
    id: 'ann-003',
    title: 'Holiday Notice',
    content: 'The school will be closed on Monday for the public holiday.',
    date: '2026-07-20T09:00:00',
    status: 'scheduled',
    author: 'Administrator',
  },
];
