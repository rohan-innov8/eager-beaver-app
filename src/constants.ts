import { JobType, Project, ProjectStage, Task, TaskStatus } from './types';

// ==========================================
// 👥 TEAM DIRECTORY (Allowed Users)
// ==========================================
// This list defines who is part of the system.
// - Admin: Can receive system reports
// - Designer: Appears in designer dropdowns
// - Maker: General team members
export const AUTHORIZED_USERS = [
  { name: 'Bram', email: 'bram@eagerbeaver.co.za', phone: '27821234567', role: 'admin' },
  { name: 'Jacques', email: 'jacques@eagerbeaver.co.za', phone: '27821234568', role: 'admin' },
  { name: 'William', email: 'william@eagerbeaver.co.za', phone: '27821234569', role: 'designer' },
  { name: 'Johannes', email: 'johannes@eagerbeaver.co.za', phone: '27821234570', role: 'maker' },
  { name: 'Fred', email: 'fred@eagerbeaver.co.za', phone: '27821234571', role: 'maker' },
  { name: 'Timot', email: 'timot@eagerbeaver.co.za', phone: '27821234572', role: 'maker' },
  { name: 'Tapi', email: 'tapi@eagerbeaver.co.za', phone: '27821234573', role: 'maker' },
  { name: 'Bennie', email: 'bennie@eagerbeaver.co.za', phone: '27821234574', role: 'maker' }
];

// Derived lists for the app to use
export const TEAM_MEMBERS = AUTHORIZED_USERS.map(u => u.name);
export const TEAM_PHONE_NUMBERS = AUTHORIZED_USERS.reduce((acc, u) => ({ ...acc, [u.name]: u.phone }), {});
export const ADMIN_EMAILS = AUTHORIZED_USERS.filter(u => u.role === 'admin').map(u => u.email);
export const INITIAL_DESIGNERS = AUTHORIZED_USERS.filter(u => u.role === 'designer' || u.role === 'admin').map(u => u.name);

// ==========================================
// 🛠 MOCK DATA
// ==========================================

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'Oak Dining Table',
    deadline: '2024-06-15',
    designer: 'Bram',
    accountable: 'Fred',
    stage: ProjectStage.IN_PRODUCTION,
    description: 'A 12-seater solid oak dining table with matte finish.',
    jobType: JobType.LOOSE_ITEM,
    delivery: true,
    files: [],
    notes: 'Client requested extra clear coat.',
    dateLoaded: '2024-05-01',
    archived: false
  },
  {
    id: 'p2',
    name: 'Downtown Penthouse Kitchen',
    deadline: '2024-07-01',
    designer: 'Jacques',
    accountable: 'Jacques',
    stage: ProjectStage.NEW,
    description: 'Full kitchen install, walnut veneer.',
    jobType: JobType.BIG_INSTALL,
    delivery: true,
    files: [],
    notes: 'Site measurements pending verification.',
    dateLoaded: '2024-05-10',
    archived: false
  },
  {
    id: 'p3',
    name: 'Reception Desk - Law Firm',
    deadline: '2024-05-20',
    designer: 'William',
    accountable: 'William',
    stage: ProjectStage.COMPLETED,
    description: 'Curved reception desk, marble top.',
    jobType: JobType.SMALL_INSTALL,
    delivery: false,
    files: [],
    notes: 'Marble supplier confirmed delivery.',
    dateLoaded: '2024-04-15',
    archived: false
  }
];

export const MOCK_TASKS: Task[] = [
  {
    id: 't1',
    name: 'Order Oak Timber',
    dateLoaded: '2024-05-02',
    deadline: '2024-05-05',
    accountable: 'Fred',
    projectId: 'p1',
    details: 'Order 50mm thick French Oak boards.',
    fileLinks: [],
    status: TaskStatus.DONE,
    archived: false
  },
  {
    id: 't2',
    name: 'Cut Veneer Sheets',
    dateLoaded: '2024-05-12',
    deadline: '2024-05-15',
    accountable: 'Johannes',
    projectId: 'p2',
    details: 'Prepare walnut veneer for press.',
    fileLinks: [],
    status: TaskStatus.PENDING,
    archived: false
  }
];
