import React, { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Project, Task, ProjectStage, TaskStatus } from '../types';
import { Package, CheckSquare, Mail, RefreshCw, Loader2 } from 'lucide-react';
import { generateDailyReport } from '../services/geminiService';
import { useNotification } from '../contexts/NotificationContext';

interface DashboardProps {
  projects: Project[];
  tasks: Task[];
}

const Dashboard: React.FC<DashboardProps> = ({ projects, tasks }) => {
  const { addNotification } = useNotification();
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportResult, setReportResult] = useState<string | null>(null);

  const activeProjects = projects.filter(p => !p.archived);
  const activeTasks = tasks.filter(t => !t.archived);

  const openTaskCount = activeTasks.filter(t => t.status !== TaskStatus.DONE).length;
  const projectCount = activeProjects.length;

  const stageData = [
    { name: 'New', value: activeProjects.filter(p => p.stage === ProjectStage.NEW).length, color: '#3b82f6' },
    { name: 'In Prod', value: activeProjects.filter(p => p.stage === ProjectStage.IN_PRODUCTION).length, color: '#f59e0b' },
    { name: 'Completed', value: activeProjects.filter(p => p.stage === ProjectStage.COMPLETED).length, color: '#10b981' },
  ];

  const taskData = [
    { name: 'Pending', value: activeTasks.filter(t => t.status === TaskStatus.PENDING).length },
    { name: 'In Progress', value: activeTasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length },
    { name: 'Done', value: activeTasks.filter(t => t.status === TaskStatus.DONE).length },
  ];

  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    setReportResult(null);
    const result = await generateDailyReport(activeProjects, activeTasks);
    setReportResult(result);
    setGeneratingReport(false);
    if (result && !result.includes('Failed')) {
        addNotification('success', 'Daily report generated successfully!');
    } else {
        addNotification('error', 'Failed to generate report.');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-500 mt-1">Welcome back, here's what's happening today.</p>
        </div>
        <button 
          onClick={handleGenerateReport}
          disabled={generatingReport}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 shadow-sm transition-colors"
        >
          {generatingReport ? <Loader2 className="animate-spin" size={18} /> : <Mail size={18} />}
          <span>{generatingReport ? 'Thinking...' : 'Generate Admin Report'}</span>
        </button>
      </div>

      {reportResult && (
         <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-xl shadow-inner">
            <div className="flex justify-between items-start mb-2">
               <h3 className="text-indigo-900 font-bold flex items-center gap-2">
                 <span className="text-xl">✨</span> Generated Daily Summary
               </h3>
               <button onClick={() => setReportResult(null)} className="text-indigo-400 hover:text-indigo-600"><RefreshCw size={16}/></button>
            </div>
            <div className="prose prose-sm max-w-none text-indigo-800 whitespace-pre-wrap font-mono text-xs md:text-sm bg-white/50 p-4 rounded border border-indigo-100">
              {reportResult}
            </div>
         </div>
      )}

      {/* KPI Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-4 bg-orange-100 text-orange-600 rounded-full">
            <Package size={28} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Active Projects</p>
            <h2 className="text-3xl font-bold text-slate-800">{projectCount}</h2>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-4 bg-indigo-100 text-indigo-600 rounded-full">
            <CheckSquare size={28} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Open Tasks</p>
            <h2 className="text-3xl font-bold text-slate-800">{openTaskCount}</h2>
          </div>
        </div>
        
        {/* Placeholder stats for visual balance */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4 lg:col-span-2 bg-white text-slate-800 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-50 to-indigo-50 opacity-50"></div>
            <div className="flex-1 relative z-10">
              <h3 className="text-lg font-semibold text-slate-800">Eager Beaver Production</h3>
              <p className="text-slate-500 text-sm mt-1">Efficiency up by 12% this week.</p>
            </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Active Project Stages</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stageData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {stageData.map(item => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm text-slate-600">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Active Task Status Overview</h3>
           <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={taskData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f1f5f9'}} />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;