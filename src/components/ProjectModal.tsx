import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Trash2, Download, Archive, Calendar, User, Package, Truck, FileText, ChevronDown, Users } from 'lucide-react';
import { Project, ProjectStage, JobType, Task, FileAttachment, TaskStatus } from '../types';
import { getDesigners } from '../services/db';
import { TEAM_MEMBERS } from '../constants';
import TaskModal from './TaskModal';
import { useNotification } from '../contexts/NotificationContext';

const generateId = () => Math.random().toString(36).substr(2, 9);

interface ProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Project) => void;
  allTasks: Task[];
  onSaveTask: (task: Task) => void;
  projects: Project[];
}

const ProjectModal: React.FC<ProjectModalProps> = ({ project, isOpen, onClose, onSave, allTasks, onSaveTask, projects }) => {
  const { addNotification } = useNotification();
  const deadlineInputRef = useRef<HTMLInputElement>(null);

  const [designers, setDesigners] = useState<string[]>([]);
  const [isDesignerDropdownOpen, setIsDesignerDropdownOpen] = useState(false);
  
  const [formData, setFormData] = useState<Project>({
    id: '',
    name: '',
    deadline: '',
    designer: '',
    accountable: TEAM_MEMBERS[0],
    stage: ProjectStage.NEW,
    description: '',
    jobType: JobType.LOOSE_ITEM,
    delivery: false,
    files: [],
    notes: '',
    dateLoaded: new Date().toISOString().split('T')[0],
    archived: false
  });

  const [activeTab, setActiveTab] = useState<'details' | 'tasks'>('details');
  const [projectTasks, setProjectTasks] = useState<Task[]>([]);
  
  // Task Editing State for Nested Modal
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDesigners(getDesigners(projects));
      if (project) {
        setFormData(project);
        setProjectTasks(allTasks.filter(t => t.projectId === project.id && !t.archived));
      } else {
        // New Project Default
        const defaultDesigner = '';
        setFormData({
          id: generateId(),
          name: '',
          deadline: '',
          designer: defaultDesigner,
          accountable: TEAM_MEMBERS[0],
          stage: ProjectStage.NEW,
          description: '',
          jobType: JobType.LOOSE_ITEM,
          delivery: false,
          files: [],
          notes: '',
          dateLoaded: new Date().toISOString().split('T')[0],
          archived: false
        });
        setProjectTasks([]);
      }
      setActiveTab('details');
      setIsDesignerDropdownOpen(false);
    }
  }, [isOpen, project, allTasks, projects]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newFile: FileAttachment = {
        id: generateId(),
        name: file.name,
        size: `${(file.size / 1024).toFixed(2)} KB`,
        url: '#' // Mock URL
      };
      setFormData(prev => ({ ...prev, files: [...prev.files, newFile] }));
    }
  };

  const removeFile = (fileId: string) => {
    setFormData(prev => ({ ...prev, files: prev.files.filter(f => f.id !== fileId) }));
  };

  const handleArchive = (e: React.MouseEvent) => {
    e.preventDefault(); 
    onSave({ ...formData, archived: true });
    addNotification('info', `Project "${formData.name}" archived.`);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    addNotification('success', `Project "${formData.name}" saved successfully.`);
    onClose();
  };
  
  const handleTaskClick = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };
  
  const handleTaskSave = (updatedTask: Task) => {
    onSaveTask(updatedTask);
    setIsTaskModalOpen(false);
    // projectTasks will update via the useEffect dependency on allTasks
  };

  // Filter designers based on input
  const filteredDesigners = designers.filter(d => 
    d.toLowerCase().includes(formData.designer.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm sm:p-4">
      {/* Modal Container: Full screen on mobile, Rounded card on desktop */}
      <div className="bg-white w-full h-full md:h-auto md:max-h-[90vh] md:w-full md:max-w-4xl md:rounded-xl shadow-2xl overflow-hidden flex flex-col transform transition-all">
        
        {/* Header */}
        <div className="px-4 md:px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-800">{project ? 'Edit Job Card' : 'New Job Card'}</h2>
            <p className="text-xs md:text-sm text-slate-500">Manage project details and tasks</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={24} className="text-slate-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 bg-white shrink-0">
          <button
            onClick={() => setActiveTab('details')}
            className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors ${
              activeTab === 'details' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Project Details
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors ${
              activeTab === 'tasks' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Tasks ({projectTasks.length})
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-white">
          {activeTab === 'details' ? (
            <form id="project-form" onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Project Name */}
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Project Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 text-base md:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white text-slate-900 placeholder-slate-400"
                      placeholder="e.g., Oak Dining Table"
                    />
                    <Package className="absolute left-3 top-2.5 text-slate-400" size={18} />
                  </div>
                </div>

                {/* Deadline */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Deadline Date</label>
                  <div className="relative group">
                    <input
                      ref={deadlineInputRef}
                      type="date"
                      name="deadline"
                      required
                      value={formData.deadline}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 text-base md:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white text-slate-900 cursor-pointer peer"
                    />
                    <Calendar 
                      onClick={() => deadlineInputRef.current?.showPicker()}
                      className="absolute left-3 top-2.5 text-slate-400 cursor-pointer peer-hover:text-orange-500 transition-colors pointer-events-none" 
                      size={18} 
                    />
                  </div>
                </div>

                {/* Project Lead (Accountable) */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Project Lead</label>
                  <div className="relative">
                    <select
                      name="accountable"
                      value={formData.accountable}
                      onChange={handleChange}
                      className="w-full pl-10 pr-10 py-2 text-base md:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white text-slate-900 appearance-none"
                    >
                      {TEAM_MEMBERS.map(member => (
                        <option key={member} value={member}>{member}</option>
                      ))}
                    </select>
                    <Users className="absolute left-3 top-2.5 text-slate-400" size={18} />
                    <ChevronDown className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" size={18} />
                  </div>
                </div>

                {/* Designer - Custom Combobox */}
                <div className="relative">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Designer</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="designer"
                      value={formData.designer}
                      onChange={(e) => {
                        handleChange(e);
                        setIsDesignerDropdownOpen(true);
                      }}
                      onFocus={() => setIsDesignerDropdownOpen(true)}
                      onBlur={() => setTimeout(() => setIsDesignerDropdownOpen(false), 200)} // Delay to allow click
                      required
                      className="w-full pl-10 pr-10 py-2 text-base md:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white text-slate-900 placeholder-slate-400"
                      placeholder="Select or create new..."
                      autoComplete="off"
                    />
                    <User className="absolute left-3 top-2.5 text-slate-400" size={18} />
                    <ChevronDown className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" size={18} />
                  </div>
                  
                  {isDesignerDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                      {filteredDesigners.map(d => (
                        <div
                          key={d}
                          className="px-4 py-3 md:py-2 hover:bg-orange-50 cursor-pointer text-slate-800 text-sm"
                          onMouseDown={() => {
                            setFormData(prev => ({ ...prev, designer: d }));
                            setIsDesignerDropdownOpen(false);
                          }}
                        >
                          {d}
                        </div>
                      ))}
                      {formData.designer && !filteredDesigners.includes(formData.designer) && (
                         <div className="px-4 py-3 md:py-2 bg-slate-50 text-slate-500 text-sm italic border-t border-slate-100">
                           Create new: "{formData.designer}"
                         </div>
                      )}
                      {designers.length === 0 && (
                        <div className="px-4 py-3 text-slate-400 text-sm">No previous designers found.</div>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-slate-500 mt-1 hidden md:block">Type to add a new designer or select from the list.</p>
                </div>

                {/* Job Type */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Job Type</label>
                  <div className="relative">
                    <select
                      name="jobType"
                      value={formData.jobType}
                      onChange={handleChange}
                      className="w-full pl-4 pr-10 py-2 text-base md:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white text-slate-900 appearance-none"
                    >
                      {Object.values(JobType).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" size={18} />
                  </div>
                </div>

                 {/* Stage */}
                 <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Production Stage</label>
                  <div className="relative">
                    <select
                      name="stage"
                      value={formData.stage}
                      onChange={handleChange}
                      className="w-full pl-4 pr-10 py-2 text-base md:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white text-slate-900 appearance-none"
                    >
                      {Object.values(ProjectStage).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" size={18} />
                  </div>
                </div>

                {/* Delivery */}
                <div className="flex items-center gap-3 py-2">
                  <div className="flex items-center h-5">
                    <input
                      id="delivery"
                      name="delivery"
                      type="checkbox"
                      checked={formData.delivery}
                      onChange={handleCheckboxChange}
                      className="w-5 h-5 text-orange-600 border-slate-300 rounded focus:ring-orange-500 bg-white"
                    />
                  </div>
                  <label htmlFor="delivery" className="font-medium text-slate-700 flex items-center gap-2">
                    <Truck size={18} /> Delivery Required
                  </label>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Job Description</label>
                <textarea
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-2 text-base md:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white text-slate-900 placeholder-slate-400"
                  placeholder="Describe the scope of work..."
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <textarea
                  name="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full px-4 py-2 text-base md:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white text-slate-900 placeholder-slate-400"
                  placeholder="Additional notes, issues, or comments..."
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Attachments</label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center hover:bg-slate-50 transition-colors relative bg-white">
                  <Upload className="text-slate-400 mb-2" size={32} />
                  <p className="text-sm text-slate-500">Click to upload files</p>
                  <input 
                    type="file" 
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleFileUpload}
                  />
                </div>

                {/* File List */}
                {formData.files.length > 0 && (
                  <ul className="mt-4 space-y-2">
                    {formData.files.map(file => (
                      <li key={file.id} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded shadow-sm">
                            <FileText size={20} className="text-indigo-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-700">{file.name}</p>
                            <p className="text-xs text-slate-500">{file.size}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button type="button" className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                            <Download size={18} />
                          </button>
                          <button 
                            type="button" 
                            onClick={() => removeFile(file.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </form>
          ) : (
            // Tasks Tab Content
            <div className="space-y-4">
               <div className="flex justify-between items-center mb-4">
                 <h3 className="font-medium text-slate-700">Associated Tasks</h3>
               </div>
               
               {projectTasks.length === 0 ? (
                 <div className="text-center py-10 text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                   No active tasks linked to this project yet.
                 </div>
               ) : (
                 <div className="space-y-2">
                   {projectTasks.map(task => (
                     <div 
                       key={task.id} 
                       onClick={() => handleTaskClick(task)}
                       className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg hover:shadow-sm hover:border-orange-300 transition-all cursor-pointer"
                     >
                       <div>
                         <div className="flex items-center gap-2">
                           <h4 className="font-semibold text-slate-800">{task.name}</h4>
                           <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                             task.status === TaskStatus.DONE ? 'bg-green-100 text-green-700' :
                             task.status === TaskStatus.IN_PROGRESS ? 'bg-blue-100 text-blue-700' :
                             'bg-slate-100 text-slate-600'
                           }`}>{task.status}</span>
                         </div>
                         <p className="text-sm text-slate-500 mt-1">Assigned: {task.accountable} • Due: {task.deadline}</p>
                       </div>
                     </div>
                   ))}
                 </div>
               )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 md:px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-between gap-3 shrink-0 pb-8 md:pb-4">
          <div>
             {project && !project.archived && (
               <button
                 type="button"
                 onClick={handleArchive}
                 className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
               >
                 <Archive size={16} />
                 <span className="hidden md:inline">Archive</span>
               </button>
             )}
          </div>
          <div className="flex gap-3">
             <button
               type="button"
               onClick={onClose}
               className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
             >
               Cancel
             </button>
             {activeTab === 'details' && (
               <button
                 type="submit"
                 form="project-form"
                 className="px-6 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 focus:ring-4 focus:ring-orange-200 transition-all shadow-lg shadow-orange-500/30"
               >
                 Save Job Card
               </button>
             )}
          </div>
        </div>
      </div>

      {/* Nested Task Modal */}
      <TaskModal
        task={editingTask}
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleTaskSave}
        projects={projects}
        zIndex={60} // Ensure it stacks above the project modal
      />
    </div>
  );
};

export default ProjectModal;