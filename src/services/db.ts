import {
  collection,
  getDocs,
  doc,
  setDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { Project, Task } from '../types';
import { MOCK_PROJECTS, MOCK_TASKS, INITIAL_DESIGNERS } from '../constants';

// Collection Names
const PROJECTS_COLLECTION = 'projects';
const TASKS_COLLECTION = 'tasks';

// ==========================================
// 🏗 PROJECTS
// ==========================================

export const getProjects = async (): Promise<Project[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, PROJECTS_COLLECTION));

    if (querySnapshot.empty) {
      console.log('DB: No projects found. Seeding initial data...');
      for (const p of MOCK_PROJECTS) {
        await setDoc(doc(db, PROJECTS_COLLECTION, p.id), p);
      }
      return MOCK_PROJECTS;
    }

    return querySnapshot.docs.map(d => ({
      ...d.data(),
      id: d.id,
      archived: !!d.data().archived
    } as Project));
  } catch (error) {
    console.error("DB: Error fetching projects:", error);
    throw error; // Let the caller handle the connection failure
  }
};

export const saveProject = async (project: Project): Promise<void> => {
  try {
    await setDoc(doc(db, PROJECTS_COLLECTION, project.id), project);
  } catch (error) {
    console.error("DB: Error saving project:", error);
    throw error;
  }
};

// ==========================================
// ✅ TASKS
// ==========================================

export const getTasks = async (): Promise<Task[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, TASKS_COLLECTION));

    if (querySnapshot.empty) {
      console.log('DB: No tasks found. Seeding initial data...');
      for (const t of MOCK_TASKS) {
        await setDoc(doc(db, TASKS_COLLECTION, t.id), t);
      }
      return MOCK_TASKS;
    }

    return querySnapshot.docs.map(d => ({
      ...d.data(),
      id: d.id,
      archived: !!d.data().archived
    } as Task));
  } catch (error) {
    console.error("DB: Error fetching tasks:", error);
    throw error;
  }
};

export const saveTask = async (task: Task): Promise<void> => {
  try {
    await setDoc(doc(db, TASKS_COLLECTION, task.id), task);
  } catch (error) {
    console.error("DB: Error saving task:", error);
    throw error;
  }
};

// ==========================================
// 🎨 HELPERS
// ==========================================

export const getDesigners = (projects: Project[]): string[] => {
  const projectDesigners = projects.map(p => p.designer);
  const uniqueDesigners = Array.from(new Set([...INITIAL_DESIGNERS, ...projectDesigners]));
  return uniqueDesigners.sort();
};
