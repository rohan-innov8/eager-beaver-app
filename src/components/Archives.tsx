import React, { useState } from 'react';
import { Project, Task } from '../types';
import { Archive, RotateCcw, Package, CheckSquare, Trash2 } from 'lucide-react';

interface ArchivesProps {
  projects: Project[];
  tasks: Task[];
  onRestoreProject: (p: Project) => void;
  onRestoreTask: (t: Task) => void;
}

const Archives: React.FC<ArchivesProps> = ({ projects, tasks, onRestoreProject, onRestoreTask }) => {
  const [activeTab, setActiveTab] = useState<'projects' | 'tasks'>('projects');

  // Explicitly filter for archived === true
  const archivedProjects = projects.filter(p => p.archived === true);
  const archivedTasks = tasks.filter(t => t.archived === true);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto overflow-y-auto h-full">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-3">
          <Archive size={32} className="text-slate-400" />
          Archives
        </h1>
        <p className="text-slate-500 mt-1">View and restore previously archived items.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('projects')}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'projects' 
              ? 'border-orange-500 text-orange-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Package size={16} />
          Archived Projects ({archivedProjects.length})
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'tasks' 
              ? 'border-indigo-500 text-indigo-600' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <CheckSquare size={16} />
          Archived Tasks ({archivedTasks.length})
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {activeTab === 'projects' && (
          <div className="overflow-x-auto">
            {archivedProjects.length === 0 ? (
               <div className="flex flex-col items-center justify-center p-12 text-slate-400">
                 <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <Package size={32} className="opacity-40" />
                 </div>
                 <p className="font-medium">No archived projects found.</p>
                 <p className="text-sm mt-1 opacity-60 text-center max-w-xs">When you archive a project from the edit screen, it will appear here.</p>
               </div>
            ) : (
              <table className="w-full min-w-[600px] text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="p-4 text-sm font-semibold text-slate-600">Project Name</th>
                    <th className="p-4 text-sm font-semibold text-slate-600">Designer</th>
                    <th className="p-4 text-sm font-semibold text-slate-600">Date Loaded</th>
                    <th className="p-4 text-sm font-semibold text-slate-600 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {archivedProjects.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="p-4 font-medium text-slate-800">{p.name}</td>
                      <td className="p-4 text-slate-600">{p.designer}</td>
                      <td className="p-4 text-slate-500 text-sm">{p.dateLoaded}</td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => onRestoreProject({...p, archived: false})}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 rounded text-sm text-slate-600 hover:text-green-600 hover:border-green-200 transition-colors shadow-sm"
                        >
                          <RotateCcw size={14} /> Restore
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="overflow-x-auto">
             {archivedTasks.length === 0 ? (
               <div className="flex flex-col items-center justify-center p-12 text-slate-400">
                 <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <CheckSquare size={32} className="opacity-40" />
                 </div>
                 <p className="font-medium">No archived tasks found.</p>
                 <p className="text-sm mt-1 opacity-60 text-center max-w-xs">When you archive a task from the edit screen, it will appear here.</p>
               </div>
            ) : (
              <table className="w-full min-w-[600px] text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="p-4 text-sm font-semibold text-slate-600">Task Name</th>
                    <th className="p-4 text-sm font-semibold text-slate-600">Accountable</th>
                    <th className="p-4 text-sm font-semibold text-slate-600">Status</th>
                    <th className="p-4 text-sm font-semibold text-slate-600 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {archivedTasks.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="p-4 font-medium text-slate-800">{t.name}</td>
                      <td className="p-4 text-slate-600">{t.accountable}</td>
                      <td className="p-4 text-slate-500 text-sm">{t.status}</td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => onRestoreTask({...t, archived: false})}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 rounded text-sm text-slate-600 hover:text-green-600 hover:border-green-200 transition-colors shadow-sm"
                        >
                          <RotateCcw size={14} /> Restore
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Archives;