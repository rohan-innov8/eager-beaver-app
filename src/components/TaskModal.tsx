import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, User, AlignLeft, Link as LinkIcon, CheckCircle, Archive, ChevronDown } from 'lucide-react';
import { Task, TaskStatus, Project } from '../types';
import { TEAM_MEMBERS } from '../constants';
import { useNotification } from '../contexts/NotificationContext';

const generateId = () => Math.random().toString(36).substr(2, 9);

interface TaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  projects: Project[];
  zIndex?: number;
}

const TaskModal: React.FC<TaskModalProps> = ({ task, isOpen, onClose, onSave, projects, zIndex = 50 }) => {
  const { addNotification } = useNotification();
  const deadlineInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<Task>({
    id: '',
    name: '',
    dateLoaded: new Date().toISOString().split('T')[0],
    deadline: '',
    accountable: TEAM_MEMBERS[0],
    projectId: 'OTHER',
    details: '',
    fileLinks: [],
    status: TaskStatus.PENDING,
    archived: false
  });

  useEffect(() => {
    if (isOpen) {
      if (task) {
        setFormData(task);
      } else {
        setFormData({
          id: generateId(),
          name: '',
          dateLoaded: new Date().toISOString().split('T')[0],
          deadline: '',
          accountable: TEAM_MEMBERS[0],
          projectId: 'OTHER',
          details: '',
          fileLinks: [],
          status: TaskStatus.PENDING,
          archived: false
        });
      }
    }
  }, [isOpen, task]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArchive = (e: React.MouseEvent) => {
    e.preventDefault(); 
    onSave({ ...formData, archived: true });
    addNotification('info', `Task "${formData.name}" archived.`);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate sending email to admins on new task load
    if (!task) {
      console.log(`[MOCK EMAIL] Sending email to admins: New Task Loaded "${formData.name}"`);
    }
    onSave(formData);
    addNotification('success', `Task "${formData.name}" saved successfully.`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm sm:p-4"
      style={{ zIndex }}
    >
      <div className="bg-white w-full h-full md:h-auto md:max-h-[90vh] md:w-full md:max-w-2xl md:rounded-xl shadow-2xl transform transition-all flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-4 md:px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
          <h2 className="text-xl font-bold text-slate-800">{task ? 'Edit Task' : 'Add New Task'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Task Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Task Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 text-base md:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white text-slate-900 placeholder-slate-400"
                placeholder="What needs to be done?"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Accountable */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Accountable (Team Member)</label>
                <div className="relative">
                  <select
                    name="accountable"
                    value={formData.accountable}
                    onChange={handleChange}
                    className="w-full pl-10 pr-10 py-2 text-base md:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white text-slate-900 appearance-none"
                  >
                    {TEAM_MEMBERS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                  <User className="absolute left-3 top-2.5 text-slate-400" size={18} />
                  <ChevronDown className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" size={18} />
                </div>
              </div>

               {/* Deadline */}
               <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Deadline</label>
                <div className="relative group">
                  <input
                    ref={deadlineInputRef}
                    type="date"
                    name="deadline"
                    required
                    value={formData.deadline}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 text-base md:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white text-slate-900 cursor-pointer peer"
                  />
                  <Calendar 
                    onClick={() => deadlineInputRef.current?.showPicker()}
                    className="absolute left-3 top-2.5 text-slate-400 cursor-pointer peer-hover:text-indigo-500 transition-colors pointer-events-none" 
                    size={18} 
                  />
                </div>
              </div>

              {/* Project Association */}
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Project</label>
                <div className="relative">
                  <select
                    name="projectId"
                    value={formData.projectId}
                    onChange={handleChange}
                    className="w-full pl-4 pr-10 py-2 text-base md:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white text-slate-900 appearance-none"
                  >
                    <option value="OTHER">Other (No Project)</option>
                    {projects.filter(p => !p.archived).map(p => (
                       <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" size={18} />
                </div>
              </div>
            </div>

            {/* Details */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Task Details</label>
              <div className="relative">
                <textarea
                  name="details"
                  rows={4}
                  value={formData.details}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 text-base md:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white text-slate-900 placeholder-slate-400"
                  placeholder="Provide detailed instructions..."
                />
                <AlignLeft className="absolute left-3 top-3 text-slate-400" size={18} />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
               <div className="flex gap-4 mt-2">
                  {Object.values(TaskStatus).map((status) => (
                    <label key={status} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value={status}
                        checked={formData.status === status}
                        onChange={handleChange}
                        className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500 bg-white"
                      />
                      <span className="ml-2 text-sm text-slate-700">{status}</span>
                    </label>
                  ))}
               </div>
            </div>

            {/* Hidden Submit for form logic */}
            <button type="submit" className="hidden" />
          </form>
        </div>

        {/* Footer */}
        <div className="px-4 md:px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center shrink-0 pb-8 md:pb-4">
            <div>
              {task && !task.archived && (
                <button
                  type="button"
                  onClick={handleArchive}
                  className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1"
                >
                  <Archive size={16} /> <span className="hidden md:inline">Archive Task</span>
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-md shadow-indigo-500/20"
              >
                Save Task
              </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;