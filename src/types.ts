export enum ProjectStage {
  NEW = 'New',
  IN_PRODUCTION = 'In Production',
  COMPLETED = 'Completed'
}

export enum JobType {
  LOOSE_ITEM = 'Loose item',
  BIG_INSTALL = 'Big Install',
  SMALL_INSTALL = 'Small Install'
}

export enum TaskStatus {
  PENDING = 'Pending',
  IN_PROGRESS = 'In Progress',
  DONE = 'Done'
}

export interface FileAttachment {
  id: string;
  name: string;
  url: string;
  size: string;
}

export interface Note {
  id: string;
  content: string;
  createdAt: string;
  author: string;
}

export interface Task {
  id: string;
  name: string;
  dateLoaded: string;
  deadline: string;
  accountable: string;
  projectId: string | 'OTHER';
  details: string;
  fileLinks: string[]; // Just storing URLs as strings for simplicity in mock
  status: TaskStatus;
  archived: boolean;
}

export interface Project {
  id: string;
  name: string;
  deadline: string;
  designer: string;
  accountable: string; // New field: The team member responsible
  stage: ProjectStage;
  description: string;
  jobType: JobType;
  delivery: boolean;
  files: FileAttachment[];
  notes: string; // Requirement says "Paragraph free text"
  dateLoaded: string;
  archived: boolean;
}

export interface DashboardStats {
  projectCount: number;
  openTaskCount: number;
}