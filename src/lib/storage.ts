'use client';

import type { AppData, Project, Repo, Task, Activity, Contract, Contact } from './types';

const STORAGE_KEY = 'minotion_data';

const defaultData: AppData = {
  projects: [
    {
      id: '1',
      name: 'Mi Camello',
      description: 'Plataforma principal de productividad y gestión',
      status: 'activo',
      deadline: '2025-12-31',
      repoId: '1',
      color: '#0075de',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'MiCamello',
      description: 'Workspace personal tipo Notion',
      status: 'activo',
      deadline: '2025-06-30',
      repoId: '2',
      color: '#2a9d99',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  repos: [
    {
      id: '1',
      name: 'MiCamello',
      description: 'Repositorio principal de la plataforma',
      stack: ['TypeScript'],
      status: 'activo',
      url: 'https://github.com',
      lastUpdated: new Date().toISOString(),
      stars: 0,
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'MiNotion',
      description: 'Workspace personal tipo Notion',
      stack: ['TypeScript'],
      status: 'en-desarrollo',
      url: 'https://github.com',
      lastUpdated: new Date().toISOString(),
      stars: 0,
      createdAt: new Date().toISOString(),
    },
  ],
  tasks: [
    {
      id: '1',
      title: 'Configurar entorno de desarrollo',
      description: 'Instalar dependencias y configurar variables de entorno',
      status: 'completada',
      priority: 'alta',
      projectId: '1',
      dueDate: '2025-04-30',
      completed: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'Diseñar arquitectura del workspace',
      description: 'Definir estructura de datos y componentes principales',
      status: 'en-progreso',
      priority: 'alta',
      projectId: '2',
      dueDate: '2025-05-15',
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '3',
      title: 'Implementar autenticación',
      description: 'Sistema de login y gestión de sesiones',
      status: 'pendiente',
      priority: 'media',
      projectId: '1',
      dueDate: '2025-05-30',
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  activities: [
    {
      id: '1',
      date: new Date().toISOString(),
      projectId: '2',
      description: 'Scaffolding inicial del proyecto MiNotion',
      duration: 120,
      type: 'desarrollo',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      date: new Date(Date.now() - 86400000).toISOString(),
      projectId: '1',
      description: 'Revisión de requisitos del cliente',
      duration: 60,
      type: 'reunión',
      createdAt: new Date().toISOString(),
    },
  ],
  contracts: [
    {
      id: '1',
      clientName: 'Startup XYZ',
      title: 'Desarrollo de plataforma web',
      value: 5000,
      currency: 'USD',
      startDate: '2025-04-01',
      endDate: '2025-07-01',
      status: 'activo',
      notes: 'Proyecto de 3 meses, pagos mensuales',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  contacts: [
    {
      id: '1',
      name: 'Ana García',
      company: 'Startup XYZ',
      role: 'CTO',
      email: 'ana@startupxyz.com',
      phone: '+1 555 0100',
      tags: ['cliente', 'tech'],
      notes: 'Contacto principal del proyecto',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
};

export function loadData(): AppData {
  if (typeof window === 'undefined') return defaultData;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData;
    return JSON.parse(raw) as AppData;
  } catch {
    return defaultData;
  }
}

export function saveData(data: AppData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatCurrency(value: number, currency: string): string {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency }).format(value);
}
