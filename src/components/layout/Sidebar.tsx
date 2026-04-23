import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Hospital, 
  Users, 
  MapPin, 
  Star, 
  LogOut,
  HeartPlus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'motion/react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Hospital, label: 'Hospitals', path: '/hospitals' },
  { icon: Users, label: 'Customers', path: '/customers' },
  { icon: MapPin, label: 'Trips', path: '/trips' },
  { icon: Star, label: 'Reviews', path: '/reviews' },
];

export function Sidebar() {
  const location = useLocation();
  const { logout, user } = useAuth();

  return (
    <aside className="w-64 border-r border-zinc-200 bg-zinc-900 text-zinc-400 flex flex-col sticky top-0 h-screen">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-primary/20 p-2 rounded-xl">
            <HeartPlus className="text-primary w-6 h-6" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">HospEase</span>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "group flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                  isActive 
                    ? "bg-zinc-800 text-white" 
                    : "hover:bg-zinc-800/50 hover:text-zinc-200"
                )}
              >
                <item.icon className={cn(
                  "w-4 h-4 transition-colors",
                  isActive ? "text-primary" : "group-hover:text-zinc-200"
                )} />
                {item.label}
                {isActive && (
                  <motion.div 
                    layoutId="sidebar-active"
                    className="ml-auto w-1 h-4 bg-primary rounded-full"
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-zinc-800">
        <div className="flex items-center gap-3 px-3 py-4 mb-2">
          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden">
             <div className="w-full h-full flex items-center justify-center text-xs text-zinc-500 uppercase font-bold">
                {user?.username?.[0] || 'A'}
             </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate capitalize">{user?.username || 'Admin'}</p>
            <p className="text-[10px] text-zinc-500 truncate uppercase tracking-widest font-bold">System {user?.role || 'Admin'}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
