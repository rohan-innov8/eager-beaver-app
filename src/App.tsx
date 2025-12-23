import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Projects from './components/Projects';
import Tasks from './components/Tasks';
import Archives from './components/Archives';
import Login from './components/Login';
import DataManagement from './components/DataManagement';
import { getProjects, getTasks, saveProject, saveTask } from './services/db';
import { Project, Task } from './types';
import { NotificationProvider } from './contexts/NotificationContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Loader2 } from 'lucide-react';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50 text-slate-400">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Layout>{children}</Layout>;
};

const AppContent: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("App: Initializing Data...");
        const [p, t] = await Promise.all([getProjects(), getTasks()]);
        setProjects(p);
        setTasks(t);
      } catch (error) {
        console.error("App: Sync Error", error);
      } finally {
        setDataLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSaveProject = async (updatedProject: Project) => {
    setProjects(prev => {
        const index = prev.findIndex(p => p.id === updatedProject.id);
        if (index >= 0) {
            const newArr = [...prev];
            newArr[index] = updatedProject;
            return newArr;
        }
        return [...prev, updatedProject];
    });
    await saveProject(updatedProject);
  };

  const handleSaveTask = async (updatedTask: Task) => {
    setTasks(prev => {
        const index = prev.findIndex(t => t.id === updatedTask.id);
        if (index >= 0) {
            const newArr = [...prev];
            newArr[index] = updatedTask;
            return newArr;
        }
        return [...prev, updatedTask];
    });
    await saveTask(updatedTask);
  };

  if (dataLoading) {
    return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 gap-4">
          <Loader2 className="animate-spin text-orange-600" size={48} />
          <p className="font-medium text-slate-600">Initializing Eager Beaver...</p>
        </div>
      );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/" element={
        <ProtectedRoute>
          <Dashboard projects={projects} tasks={tasks} />
        </ProtectedRoute>
      } />

      <Route path="/projects" element={
        <ProtectedRoute>
          <Projects 
            projects={projects} 
            onSaveProject={handleSaveProject} 
            allTasks={tasks}
            onSaveTask={handleSaveTask}
          />
        </ProtectedRoute>
      } />

      <Route path="/tasks" element={
        <ProtectedRoute>
          <Tasks 
            tasks={tasks} 
            projects={projects}
            onSaveTask={handleSaveTask} 
          />
        </ProtectedRoute>
      } />

      <Route path="/archives" element={
        <ProtectedRoute>
          <Archives
            projects={projects}
            tasks={tasks}
            onRestoreProject={handleSaveProject}
            onRestoreTask={handleSaveTask}
          />
        </ProtectedRoute>
      } />

      <Route path="/data" element={
        <ProtectedRoute>
          <DataManagement />
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <AppContent />
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;