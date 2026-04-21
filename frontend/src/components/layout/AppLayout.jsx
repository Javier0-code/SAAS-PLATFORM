import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const AppLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-surface-950 overflow-hidden">
      {/* Sidebar */}
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(p => !p)} />

      {/* Main content area */}
      <div
        className="flex flex-col flex-1 min-w-0 transition-all duration-300"
        style={{ marginLeft: 0 }}
      >
        {/* Topbar */}
        <Topbar onMenuToggle={() => setSidebarCollapsed(p => !p)} />

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-surface-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
