import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function AdminLayout() {
  return (
    <div className="flex bg-zinc-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-zinc-200 bg-white flex items-center px-8 sticky top-0 z-10">
          <div className="flex-1 flex items-center gap-4">
             <h1 className="text-sm font-medium text-zinc-500 uppercase tracking-widest">Administrator Control Panel</h1>
          </div>
          <div className="flex items-center gap-4">
            {/* Top right actions if any */}
          </div>
        </header>
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
