import React, { useState, useMemo, useEffect } from 'react';
import { List, Kanban, Search, Plus, Filter, Calendar, Package, Truck, User, ChevronDown } from 'lucide-react';
import { Project, ProjectStage, Task } from '../types';
import { getDesigners } from '../services/db';
import ProjectModal from './ProjectModal';

interface ProjectsProps {
  projects: Project[];
  onSaveProject: (p: Project) => void;
  allTasks: Task[];
  onSaveTask: (t: Task) => void;
}

const Projects: React.FC<ProjectsProps> = ({ projects, onSaveProject, allTasks, onSaveTask }) => {
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [designerFilter, setDesignerFilter] = useState<string>('All');
  const [designers, setDesigners] = useState<string[]>([]);
  
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Drag and Drop State
  const [draggedProjectId, setDraggedProjectId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<ProjectStage | null>(null);

  // Refresh designers list when projects change
  useEffect(() => {
    setDesigners(getDesigners(projects));
  }, [projects]);

  const filteredProjects = useMemo(() => {
    // 0. Base filter: Active only
    let result = projects.filter(p => !p.archived);

    // 1. Search
    if (searchQuery) {
       const lowerQuery = searchQuery.toLowerCase();
       result = result.filter(p => 
          p.name.toLowerCase().includes(lowerQuery) ||
          p.designer.toLowerCase().includes(lowerQuery) ||
          (p.accountable && p.accountable.toLowerCase().includes(lowerQuery)) ||
          p.description.toLowerCase().includes(lowerQuery) ||
          p.notes.toLowerCase().includes(lowerQuery) ||
          p.jobType.toLowerCase().includes(lowerQuery)
       );
    }
    
    // 2. Filter by Designer
    if (designerFilter !== 'All') {
      result = result.filter(p => p.designer === designerFilter);
    }

    // 3. Sort (Oldest to Newest based on date loaded)
    return result.sort((a, b) => new Date(a.dateLoaded).getTime() - new Date(b.dateLoaded).getTime());
  }, [projects, searchQuery, designerFilter]);

  const handleEditClick = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleNewClick = () => {
    setSelectedProject(null);
    setIsModalOpen(true);
  };

  // Drag Handlers
  const handleDragStart = (e: React.DragEvent, projectId: string) => {
    setDraggedProjectId(projectId);
    e.dataTransfer.effectAllowed = 'move';
    const target = e.target as HTMLElement;
    setTimeout(() => {
      target.style.opacity = '0.5';
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const target = e.target as HTMLElement;
    target.style.opacity = '1';
    setDraggedProjectId(null);
    setDragOverStage(null);
  };

  const handleDragOver = (e: React.DragEvent, stage: ProjectStage) => {
    e.preventDefault(); 
    if (dragOverStage !== stage) {
      setDragOverStage(stage);
    }
  };

  const handleDrop = (e: React.DragEvent, targetStage: ProjectStage) => {
    e.preventDefault();
    const target = e.target as HTMLElement;
    target.style.opacity = '1';
    
    if (draggedProjectId) {
      const project = projects.find(p => p.id === draggedProjectId);
      if (project && project.stage !== targetStage) {
        onSaveProject({ ...project, stage: targetStage });
      }
    }
    setDraggedProjectId(null);
    setDragOverStage(null);
  };

  const getStageColorClass = (stage: ProjectStage) => {
    switch (stage) {
      case ProjectStage.NEW: return 'border-l-blue-500';
      case ProjectStage.IN_PRODUCTION: return 'border-l-amber-500';
      case ProjectStage.COMPLETED: return 'border-l-emerald-500';
      default: return 'border-l-slate-300';
    }
  };

  return (
    <div className="p-4 md:p-8 h-full flex flex-col">
      {/* Header Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 md:mb-8 shrink-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Projects</h1>
          <p className="text-slate-500">Manage your furniture builds.</p>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 w-full lg:w-auto">
           {/* Search */}
           <div className="relative group w-full sm:w-auto">
             <input
               type="text"
               placeholder="Search projects..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="pl-10 pr-4 py-2 w-full sm:w-64 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition-all text-sm md:text-base bg-white text-slate-900"
             />
             <Search className="absolute left-3 top-2.5 text-slate-400 group-focus-within:text-orange-500" size={18} />
           </div>

           <div className="flex items-center gap-3 w-full sm:w-auto">
             {/* Filter */}
             <div className="relative flex-1 sm:flex-none">
               <select
                 value={designerFilter}
                 onChange={(e) => setDesignerFilter(e.target.value)}
                 className="w-full sm:w-auto appearance-none pl-10 pr-10 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-orange-500 outline-none cursor-pointer hover:border-slate-300 text-sm md:text-base"
               >
                 <option value="All">All Designers</option>
                 {designers.map(u => <option key={u} value={u}>{u}</option>)}
               </select>
               <Filter className="absolute left-3 top-2.5 text-slate-400" size={18} />
               <ChevronDown className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" size={18} />
             </div>

             {/* View Toggle */}
             <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
               <button
                 onClick={() => setViewMode('list')}
                 className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
               >
                 <List size={20} />
               </button>
               <button
                 onClick={() => setViewMode('kanban')}
                 className={`p-2 rounded-md transition-all ${viewMode === 'kanban' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
               >
                 <Kanban size={20} />
               </button>
             </div>
           </div>

           {/* New Project Btn */}
           <button
             onClick={handleNewClick}
             className="w-full sm:w-auto flex justify-center items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors shadow-lg shadow-orange-500/20"
           >
             <Plus size={20} />
             <span className="font-medium">New Project</span>
           </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'list' ? (
          <div className="h-full flex flex-col">
             {/* Mobile Card View (Hidden on Desktop) */}
             <div className="md:hidden overflow-y-auto space-y-4 pb-20">
                {filteredProjects.map(p => (
                  <div key={p.id} onClick={() => handleEditClick(p)} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 cursor-pointer hover:border-orange-300 active:scale-[0.98] transition-all">
                     <div className="flex justify-between items-start mb-2">
                       <h3 className="font-bold text-slate-800 text-lg">{p.name}</h3>
                       <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                          p.stage === ProjectStage.COMPLETED ? 'bg-green-100 text-green-700' :
                          p.stage === ProjectStage.IN_PRODUCTION ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {p.stage}
                        </span>
                     </div>
                     <p className="text-sm text-slate-500 mb-4">{p.jobType}</p>
                     
                     <div className="grid grid-cols-2 gap-3 text-sm border-t border-slate-50 pt-3">
                       <div className="flex items-center gap-2 text-slate-600">
                          <User size={14} className="text-indigo-400"/>
                          <span>{p.designer}</span>
                       </div>
                       <div className="flex items-center gap-2 text-slate-600">
                          <Calendar size={14} className="text-orange-400"/>
                          <span>{p.deadline}</span>
                       </div>
                       {p.delivery && (
                         <div className="flex items-center gap-2 text-slate-600 col-span-2">
                            <Truck size={14} className="text-green-500"/>
                            <span>Delivery Required</span>
                         </div>
                       )}
                     </div>
                  </div>
                ))}
                {filteredProjects.length === 0 && (
                  <div className="text-center p-8 text-slate-400">No projects found.</div>
                )}
             </div>

             {/* Desktop Table View (Hidden on Mobile) */}
            <div className="hidden md:block bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm h-full flex flex-col">
              <div className="overflow-auto flex-1">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                    <tr>
                      <th className="p-4 font-semibold text-slate-600 text-sm">Project Name</th>
                      <th className="p-4 font-semibold text-slate-600 text-sm">Designer</th>
                      <th className="p-4 font-semibold text-slate-600 text-sm">Deadline</th>
                      <th className="p-4 font-semibold text-slate-600 text-sm">Stage</th>
                      <th className="p-4 font-semibold text-slate-600 text-sm">Type</th>
                      <th className="p-4 font-semibold text-slate-600 text-sm">Loaded</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProjects.map((p) => (
                      <tr 
                        key={p.id} 
                        onClick={() => handleEditClick(p)}
                        className="hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <td className="p-4 font-medium text-slate-800">{p.name}</td>
                        <td className="p-4 text-slate-600 flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                            {p.designer.charAt(0)}
                          </div>
                          {p.designer}
                        </td>
                        <td className="p-4 text-slate-600">{p.deadline}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            p.stage === ProjectStage.COMPLETED ? 'bg-green-100 text-green-700' :
                            p.stage === ProjectStage.IN_PRODUCTION ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {p.stage}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500 text-sm">{p.jobType}</td>
                        <td className="p-4 text-slate-400 text-sm">{p.dateLoaded}</td>
                      </tr>
                    ))}
                    {filteredProjects.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400">
                          No active projects match your criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          // Kanban View
          <div className="h-full overflow-x-auto pb-4">
            <div className="flex gap-4 md:gap-6 h-full min-w-[300px] md:min-w-[1024px] snap-x snap-mandatory md:snap-none px-4 md:px-0">
              {Object.values(ProjectStage).map(stage => (
                <div 
                  key={stage}
                  onDragOver={(e) => handleDragOver(e, stage)}
                  onDrop={(e) => handleDrop(e, stage)}
                  className={`flex-1 flex flex-col bg-slate-100/50 rounded-xl border transition-colors p-4 min-w-[85vw] md:min-w-0 snap-center ${
                    dragOverStage === stage ? 'border-orange-400 bg-orange-50' : 'border-slate-200'
                  }`}
                >
                  <div className="flex justify-between items-center mb-4 pointer-events-none">
                     <h3 className="font-bold text-slate-700">{stage}</h3>
                     <span className="bg-white px-2 py-1 rounded-md text-xs font-bold text-slate-500 shadow-sm">
                       {filteredProjects.filter(p => p.stage === stage).length}
                     </span>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar min-h-[200px]">
                    {filteredProjects.filter(p => p.stage === stage).map(p => (
                      <div 
                        key={p.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, p.id)}
                        onDragEnd={handleDragEnd}
                        onClick={() => handleEditClick(p)}
                        className={`
                          bg-white p-4 rounded-lg shadow-sm border-y border-r border-slate-100 cursor-grab active:cursor-grabbing 
                          hover:shadow-md transition-all group
                          border-l-4 ${getStageColorClass(p.stage)}
                        `}
                      >
                        <div className="flex justify-between items-start mb-2 pointer-events-none">
                           <h4 className="font-semibold text-slate-800 group-hover:text-orange-600 transition-colors line-clamp-1">{p.name}</h4>
                        </div>
                        <p className="text-xs text-slate-500 mb-3 line-clamp-2 pointer-events-none">{p.description || "No description provided."}</p>
                        
                        <div className="flex items-center justify-between pt-3 border-t border-slate-50 pointer-events-none">
                          <div className="flex items-center gap-2">
                             <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
                               {p.designer.charAt(0)}
                             </div>
                             <span className="text-xs text-slate-500">{p.designer}</span>
                          </div>
                          <span className="text-xs font-medium text-slate-400">{p.deadline}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <ProjectModal
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onSaveProject}
        allTasks={allTasks}
        onSaveTask={onSaveTask}
        projects={projects}
      />
    </div>
  );
};

export default Projects;