export const ROUTES = {
  LOGIN: '/login',
  ADMIN: '/admin',
  REPRESENTATIVE: '/representative',
  ACADEMIC: '/academic',
  FINANCE: '/finance',
  AUDITOR: '/auditor',
  DESIGNER: '/designer',
} as const;

export const APP_NAME = 'Executive Portal';
export const WORKSPACE = 'Workspace Alpha';

export const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrator',
  representative: 'Representative',
  academic: 'Academic Officer',
  treasurer: 'Treasurer',
  auditor: 'Auditor',
  designer: 'Designer',
};

export const ROLE_LANDING: Record<string, string> = {
  admin: ROUTES.ADMIN,
  representative: ROUTES.REPRESENTATIVE,
  academic: ROUTES.ACADEMIC,
  treasurer: ROUTES.FINANCE,
  auditor: ROUTES.AUDITOR,
  designer: ROUTES.DESIGNER,
};

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
