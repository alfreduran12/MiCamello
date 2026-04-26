export type ProjectStatus = 'activo' | 'pausado' | 'completado' | 'cancelado';
export type TaskStatus = 'pendiente' | 'en-progreso' | 'completada' | 'bloqueada';
export type TaskPriority = 'baja' | 'media' | 'alta' | 'urgente';
export type ContractStatus = 'activo' | 'pendiente' | 'completado' | 'cancelado';
export type RepoStatus = 'activo' | 'archivado' | 'en-desarrollo';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  deadline: string;
  repoId?: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface Repo {
  id: string;
  name: string;
  description: string;
  language: string;
  status: RepoStatus;
  url: string;
  lastUpdated: string;
  stars: number;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId?: string;
  dueDate: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  date: string;
  projectId?: string;
  description: string;
  duration: number; // minutes
  type: string;
  createdAt: string;
}

export interface Contract {
  id: string;
  clientName: string;
  title: string;
  value: number;
  currency: string;
  startDate: string;
  endDate: string;
  status: ContractStatus;
  pdfUrl?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  name: string;
  company: string;
  role: string;
  email: string;
  phone: string;
  tags: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppData {
  projects: Project[];
  repos: Repo[];
  tasks: Task[];
  activities: Activity[];
  contracts: Contract[];
  contacts: Contact[];
}
