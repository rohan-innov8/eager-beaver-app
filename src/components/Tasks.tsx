import React, { useState, useMemo } from 'react';
import { CheckCircle, Circle, Clock, Plus, Search, MessageCircle } from 'lucide-react';
import { Task, Project, TaskStatus } from '../types';
import TaskModal from './TaskModal';
import { TEAM_PHONE_NUMBERS } from '../constants';

interface TasksProps {
  tasks: Task[];
  projects: Project[];
  onSaveTask: (t: Task) => void;
}

const Tasks: React.FC<TasksProps> = ({ tasks, projects, onSaveTask }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const getProjectName = (projectId: string) => {
    if (projectId === 'OTHER') return 'General';
    const proj = projects.find(p => p.id === projectId);
    return proj ? proj.name : 'Unknown Project';
  };

  const filteredTasks = useMemo(() => {
    let result = tasks.filter(t => !t.archived);

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(t => {
        const projectName = getProjectName(t.projectId).toLowerCase();
        return (
          t.name.toLowerCase().includes(lowerQuery) ||
          t.accountable.toLowerCase().includes(lowerQuery) ||
          t.details.toLowerCase().includes(lowerQuery) ||
          t.status.toLowerCase().includes(lowerQuery) ||
          projectName.includes(lowerQuery)
        );
      });
    }
    
    // Sort by deadline (closest first)
    return result.sort((a, b) => {
       if (!a.deadline) return 1;
       if (!b.deadline) return -1;
       return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });
  }, [tasks, searchQuery, projects]);

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleNewTask = () => {
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  const handleWhatsApp = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation(); // Prevent opening the edit modal
    
    const phoneNumber = TEAM_PHONE_NUMBERS[task.accountable];
    
    if (!phoneNumber) {
      alert(`No phone number configured for ${task.accountable}. Check constants.ts`);
      return;
    }

    const message = `Hi ${task.accountable}, regarding task "${task.name}": \n${task.details || 'Please check the details.'}`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="p-4 md:p-8 overflow-y-auto h-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Tasks</h1>
          <p className="text-slate-500">Track deliverables across the factory.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
           {/* Search */}
           <div className="relative group w-full sm:w-auto">
             <input
               type="text"
               placeholder="Search tasks..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="pl-10 pr-4 py-2 w-full sm:w-64 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm md:text-base bg-white text-slate-900"
             />
             <Search className="absolute left-3 top-2.5 text-slate-400 group-focus-within:text-indigo-500" size={18} />
           </div>

           {/* New Task Button */}
           <button
            onClick={handleNewTask}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20 whitespace-nowrap"
          >
            <Plus size={20} />
            <span className="font-medium">New Task</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {/* Empty State / Add New Card */}
        <button 
          onClick={handleNewTask}
          className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 hover:text-indigo-500 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all min-h-[200px]"
        >
          <Plus size={40} className="mb-2 opacity-50" />
          <span className="font-medium">Add New Task</span>
        </button>

        {filteredTasks.map(task => (
          <div 
            key={task.id}
            onClick={() => handleEditTask(task)}
            className={`bg-white p-5 rounded-xl border cursor-pointer transition-all hover:shadow-md group flex flex-col h-full min-h-[200px] ${
              task.status === TaskStatus.DONE ? 'border-green-200 opacity-75' : 'border-slate-200 hover:border-indigo-300'
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                task.status === TaskStatus.DONE ? 'bg-green-100 text-green-700' :
                task.status === TaskStatus.IN_PROGRESS ? 'bg-blue-100 text-blue-700' :
                'bg-slate-100 text-slate-600'
              }`}>
                {task.status}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock size={12} /> {task.deadline}
              </span>
            </div>

            <h3 className={`font-bold text-lg text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2 ${task.status === TaskStatus.DONE ? 'line-through text-slate-400' : ''}`}>
              {task.name}
            </h3>

            <p className="text-sm text-slate-500 mb-4 line-clamp-2 flex-1">
              {task.details || "No details provided."}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-auto">
              <div className="flex flex-col">
                 <span className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold">Project</span>
                 <span className="text-xs font-medium text-slate-700 truncate max-w-[120px]">{getProjectName(task.projectId)}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end">
                   <span className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold">Assigned</span>
                   <span className="text-xs font-medium text-slate-700">{task.accountable}</span>
                </div>
                
                <button
                  onClick={(e) => handleWhatsApp(e, task)}
                  className="p-2 bg-green-50 text-green-600 rounded-full hover:bg-green-100 transition-colors"
                  title={`WhatsApp ${task.accountable}`}
                >
                  <MessageCircle size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {filteredTasks.length === 0 && searchQuery && (
             <div className="col-span-full py-12 text-center text-slate-400">
                No tasks found matching "{searchQuery}"
             </div>
        )}
      </div>

      <TaskModal
        task={selectedTask}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onSaveTask}
        projects={projects}
      />
    </div>
  );
};

export default Tasks;