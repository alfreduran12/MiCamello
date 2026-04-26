'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AppData, Project, Repo, Task, Activity, Contract, Contact } from './types';

const EMPTY: AppData = {
  projects: [], repos: [], tasks: [], activities: [], contracts: [], contacts: [],
};

async function apiFetch(endpoint: string, method: string, body?: unknown) {
  const res = await fetch(`/api/${endpoint}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

const get = (e: string) => apiFetch(e, 'GET');
const post = (e: string, b: unknown) => apiFetch(e, 'POST', b);
const put = (e: string, b: unknown) => apiFetch(e, 'PUT', b);
const del = (e: string, id: string) => apiFetch(e, 'DELETE', { id });

interface AppContextType {
  data: AppData;
  loading: boolean;
  reload: () => void;
  addProject: (p: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProject: (id: string, p: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  addRepo: (r: Omit<Repo, 'id' | 'createdAt'>) => Promise<void>;
  updateRepo: (id: string, r: Partial<Repo>) => Promise<void>;
  deleteRepo: (id: string) => Promise<void>;
  addTask: (t: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTask: (id: string, t: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  addActivity: (a: Omit<Activity, 'id' | 'createdAt'>) => Promise<void>;
  updateActivity: (id: string, a: Partial<Activity>) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
  addContract: (c: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateContract: (id: string, c: Partial<Contract>) => Promise<void>;
  deleteContract: (id: string) => Promise<void>;
  addContact: (c: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateContact: (id: string, c: Partial<Contact>) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(EMPTY);
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [projects, repos, tasks, activities, contracts, contacts] = await Promise.all([
        get('projects'), get('repos'), get('tasks'),
        get('activities'), get('contracts'), get('contacts'),
      ]);
      setData({ projects, repos, tasks, activities, contracts, contacts });
    } catch (e) {
      console.error('Error cargando datos:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const refresh = useCallback((key: keyof AppData, fetcher: () => Promise<unknown[]>) => async () => {
    const rows = await fetcher() as AppData[typeof key];
    setData(d => ({ ...d, [key]: rows }));
  }, []);

  return (
    <AppContext.Provider value={{
      data, loading, reload: loadAll,
      addProject: async (p) => { await post('projects', p); await loadAll(); },
      updateProject: async (id, p) => { await put('projects', { id, ...p }); await loadAll(); },
      deleteProject: async (id) => { await del('projects', id); await loadAll(); },
      addRepo: async (r) => { await post('repos', r); await loadAll(); },
      updateRepo: async (id, r) => { await put('repos', { id, ...r }); await loadAll(); },
      deleteRepo: async (id) => { await del('repos', id); await loadAll(); },
      addTask: async (t) => { await post('tasks', t); await loadAll(); },
      updateTask: async (id, t) => { await put('tasks', { id, ...t }); await loadAll(); },
      deleteTask: async (id) => { await del('tasks', id); await loadAll(); },
      addActivity: async (a) => { await post('activities', a); await loadAll(); },
      updateActivity: async (id, a) => { await put('activities', { id, ...a }); await loadAll(); },
      deleteActivity: async (id) => { await del('activities', id); await loadAll(); },
      addContract: async (c) => { await post('contracts', c); await loadAll(); },
      updateContract: async (id, c) => { await put('contracts', { id, ...c }); await loadAll(); },
      deleteContract: async (id) => { await del('contracts', id); await loadAll(); },
      addContact: async (c) => { await post('contacts', c); await loadAll(); },
      updateContact: async (id, c) => { await put('contacts', { id, ...c }); await loadAll(); },
      deleteContact: async (id) => { await del('contacts', id); await loadAll(); },
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
