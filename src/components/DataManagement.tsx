import React, { useRef } from 'react';
import { Download, Upload, Database, AlertTriangle, CheckCircle, RefreshCcw } from 'lucide-react';
import { getProjects, getTasks } from '../services/db';
import { useNotification } from '../contexts/NotificationContext';

const DataManagement: React.FC = () => {
  const { addNotification } = useNotification();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadBackup = () => {
    const data = {
      projects: getProjects(),
      tasks: getTasks(),
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eager-beaver-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    addNotification('success', 'System backup downloaded successfully.');
  };

  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        
        if (json.projects && Array.isArray(json.projects)) {
          localStorage.setItem('eager_beaver_projects', JSON.stringify(json.projects));
        }
        if (json.tasks && Array.isArray(json.tasks)) {
          localStorage.setItem('eager_beaver_tasks', JSON.stringify(json.tasks));
        }

        addNotification('success', 'System restored successfully. Reloading...');
        setTimeout(() => window.location.reload(), 1500);
      } catch (err) {
        addNotification('error', 'Invalid backup file. Restoration failed.');
        console.error(err);
      }
    };
    reader.readAsText(file);
  };

  const handleResetSystem = () => {
    if (window.confirm('Are you sure? This will delete ALL projects and tasks permanently. This cannot be undone.')) {
        localStorage.removeItem('eager_beaver_projects');
        localStorage.removeItem('eager_beaver_tasks');
        addNotification('info', 'System reset to factory defaults. Reloading...');
        setTimeout(() => window.location.reload(), 1500);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto overflow-y-auto h-full">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 flex items-center gap-3">
          <Database size={32} className="text-indigo-600" />
          System Data Management
        </h1>
        <p className="text-slate-500 mt-2">
            Since your app is currently running in a preview environment, use this panel to save your work to your local computer.
            This ensures you never lose your Job Cards or Tasks.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Backup Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 mb-4">
            <Download size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Backup Data</h3>
          <p className="text-sm text-slate-500 mb-6">
            Download a copy of all current Projects and Tasks to your computer as a JSON file. Do this regularly.
          </p>
          <button 
            onClick={handleDownloadBackup}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Download size={18} /> Download Backup
          </button>
        </div>

        {/* Restore Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center text-green-600 mb-4">
            <Upload size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Restore Data</h3>
          <p className="text-sm text-slate-500 mb-6">
            Upload a previously saved backup file to restore your Job Cards. This will overwrite current data.
          </p>
          <div className="relative">
            <input 
                type="file" 
                ref={fileInputRef}
                accept=".json"
                onChange={handleRestoreBackup}
                className="hidden"
            />
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 px-4 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
                <Upload size={18} /> Select Backup File
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="md:col-span-2 bg-red-50 p-6 rounded-xl border border-red-100 mt-4">
          <div className="flex items-start gap-4">
             <div className="mt-1 text-red-500">
                <AlertTriangle size={24} />
             </div>
             <div>
                <h3 className="text-lg font-bold text-red-900 mb-1">Danger Zone</h3>
                <p className="text-sm text-red-700 mb-4">
                    Resetting the system will delete all projects and tasks and return the app to its initial demo state.
                </p>
                <button 
                    onClick={handleResetSystem}
                    className="px-4 py-2 bg-white border border-red-200 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2 text-sm"
                >
                    <RefreshCcw size={16} /> Reset to Factory Settings
                </button>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DataManagement;