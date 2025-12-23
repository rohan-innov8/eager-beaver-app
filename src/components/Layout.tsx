import React, { useState } from 'react';
import { LayoutDashboard, FolderKanban, CheckSquare, Archive, Menu, X, LogOut, Database, UserCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ProfileModal from './ProfileModal';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { displayName, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/projects', label: 'Projects', icon: FolderKanban },
    { path: '/tasks', label: 'Tasks', icon: CheckSquare },
    { path: '/archives', label: 'Archives', icon: Archive },
    { path: '/data', label: 'System Data', icon: Database },
  ];

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const getInitials = (name: string) => {
    return name ? name.substring(0, 2).toUpperCase() : 'EB';
  };

  return (
    <div className="flex h-[100dvh] bg-slate-50 overflow-hidden">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-slate-200 z-30 h-16 flex items-center px-4 justify-between">
        <button onClick={toggleSidebar} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
          <Menu size={24} />
        </button>
        <div className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <span className="text-2xl">🦫</span> Eager Beaver
        </div>
        <div className="w-8"></div> {/* Spacer */}
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out
        lg:static lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-slate-100 hidden lg:block">
          <h1 className="text-2xl font-bold tracking-tight text-orange-600 flex items-center gap-2">
            <span className="text-3xl">🦫</span> Eager Beaver
          </h1>
          <p className="text-xs text-slate-500 mt-1">Job Card System</p>
        </div>

        {/* Mobile sidebar header with close button */}
        <div className="lg:hidden p-4 border-b border-slate-100 flex justify-between items-center">
           <span className="font-bold text-lg text-slate-800">Menu</span>
           <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full">
             <X size={20} />
           </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)} // Close on mobile nav
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'bg-orange-50 text-orange-600 border border-orange-100'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* System Status Indicator */}
        <div className="px-6 py-2">
            <div className="bg-slate-50 rounded-md border border-slate-100 p-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">System Live</span>
                </div>
                <span className="text-[10px] text-slate-400">v1.5</span>
            </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between gap-2 px-2 py-2 mb-2">
            <div 
              className="flex items-center gap-3 cursor-pointer hover:bg-slate-100 rounded-lg p-1 transition-colors flex-1"
              onClick={() => setIsProfileOpen(true)}
              title="Edit Profile"
            >
              <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold border border-orange-200">
                {getInitials(displayName)}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-slate-800 truncate">{displayName}</p>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                   Edit Profile
                </p>
              </div>
            </div>
            <button 
              onClick={logout}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative pt-16 lg:pt-0">
        {children}
      </main>

      {/* Profile Modal */}
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </div>
  );
};

export default Layout;