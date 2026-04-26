import type { ProjectStatus, TaskStatus, TaskPriority, ContractStatus, RepoStatus } from './types';

type BadgeStyle = { bg: string; text: string; label: string };

export const projectStatusBadge: Record<ProjectStatus, BadgeStyle> = {
  activo: { bg: '#f0fdf4', text: '#16a34a', label: 'Activo' },
  pausado: { bg: '#fff7ed', text: '#c2410c', label: 'Pausado' },
  completado: { bg: '#f2f9ff', text: '#097fe8', label: 'Completado' },
  cancelado: { bg: '#fef2f2', text: '#dc2626', label: 'Cancelado' },
};

export const taskStatusBadge: Record<TaskStatus, BadgeStyle> = {
  pendiente: { bg: '#f6f5f4', text: '#615d59', label: 'Pendiente' },
  'en-progreso': { bg: '#f2f9ff', text: '#097fe8', label: 'En progreso' },
  completada: { bg: '#f0fdf4', text: '#16a34a', label: 'Completada' },
  bloqueada: { bg: '#fef2f2', text: '#dc2626', label: 'Bloqueada' },
};

export const priorityBadge: Record<TaskPriority, BadgeStyle> = {
  baja: { bg: '#f6f5f4', text: '#a39e98', label: 'Baja' },
  media: { bg: '#fefce8', text: '#ca8a04', label: 'Media' },
  alta: { bg: '#fff7ed', text: '#c2410c', label: 'Alta' },
  urgente: { bg: '#fef2f2', text: '#dc2626', label: 'Urgente' },
};

export const contractStatusBadge: Record<ContractStatus, BadgeStyle> = {
  activo: { bg: '#f0fdf4', text: '#16a34a', label: 'Activo' },
  pendiente: { bg: '#fefce8', text: '#ca8a04', label: 'Pendiente' },
  completado: { bg: '#f2f9ff', text: '#097fe8', label: 'Completado' },
  cancelado: { bg: '#fef2f2', text: '#dc2626', label: 'Cancelado' },
};

export const repoStatusBadge: Record<RepoStatus, BadgeStyle> = {
  activo: { bg: '#f0fdf4', text: '#16a34a', label: 'Activo' },
  archivado: { bg: '#f6f5f4', text: '#a39e98', label: 'Archivado' },
  'en-desarrollo': { bg: '#f2f9ff', text: '#097fe8', label: 'En desarrollo' },
};

export const languageColors: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f7df1e',
  Python: '#3572a5',
  Rust: '#dea584',
  Go: '#00add8',
  Java: '#b07219',
  'C#': '#178600',
  PHP: '#4f5d95',
  Ruby: '#cc342d',
  Swift: '#f05138',
  Kotlin: '#a97bff',
  Dart: '#00b4ab',
  CSS: '#563d7c',
  HTML: '#e34c26',
  Shell: '#89e051',
  default: '#615d59',
};
