'use client';

import { useState, useEffect } from 'react';
import { AppProvider } from '@/lib/context';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/sections/Dashboard';
import Proyectos from '@/sections/Proyectos';
import Repos from '@/sections/Repos';
import Tareas from '@/sections/Tareas';
import Actividades from '@/sections/Actividades';
import Contratos from '@/sections/Contratos';
import Contactos from '@/sections/Contactos';
import Usuarios from '@/sections/Usuarios';
import Notas from '@/sections/Notas';

const PAGE_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  proyectos: 'Proyectos',
  repos: 'Repos',
  tareas: 'Tareas',
  actividades: 'Actividades',
  contratos: 'Contratos',
  contactos: 'Contactos',
};

function WorkspaceApp() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard': return <Dashboard onNavigate={setActiveSection} />;
      case 'proyectos': return <Proyectos />;
      case 'repos': return <Repos />;
      case 'tareas': return <Tareas />;
      case 'actividades': return <Actividades />;
      case 'contratos': return <Contratos />;
      case 'contactos': return <Contactos />;
      case 'usuarios': return <Usuarios />;
      case 'notas': return <Notas />;
      default: return <Dashboard onNavigate={setActiveSection} />;
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {!isMobile && <Sidebar activeSection={activeSection} onNavigate={setActiveSection} />}
      <main
        key={activeSection}
        style={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--app-bg)',
          paddingBottom: isMobile ? 88 : 0,
        }}
      >
        {renderSection()}
      </main>
      {isMobile && <Sidebar activeSection={activeSection} onNavigate={setActiveSection} />}
    </div>
  );
}

export default function Home() {
  return (
    <AppProvider>
      <WorkspaceApp />
    </AppProvider>
  );
}
