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

/**
 * Helper to prevent Firebase calls from hanging indefinitely
 */
const withTimeout = <T>(promise: Promise<T>, timeoutMs: number, fallbackValue: T): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => 
      setTimeout(() => {
        console.warn(`Firestore call timed out after ${timeoutMs}ms. Using fallback.`);
        resolve(fallbackValue);
      }, timeoutMs)
    )
  ]);
};

// ==========================================
// 🏗 PROJECTS
// ==========================================

export const getProjects = async (): Promise<Project[]> => {
  try {
    const fetchPromise = (async () => {
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
    })();

    // Try cloud for 3 seconds, then fallback to MOCK
    return await withTimeout(fetchPromise, 3000, MOCK_PROJECTS);
  } catch (error) {
    console.error("DB: Error fetching projects:", error);
    return MOCK_PROJECTS;
  }
};

export const saveProject = async (project: Project): Promise<void> => {
  try {
    await setDoc(doc(db, PROJECTS_COLLECTION, project.id), project);
  } catch (error) {
    console.error("DB: Error saving project:", error);
  }
};

// ==========================================
// ✅ TASKS
// ==========================================

export const getTasks = async (): Promise<Task[]> => {
  try {
    const fetchPromise = (async () => {
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
    })();

    return await withTimeout(fetchPromise, 3000, MOCK_TASKS);
  } catch (error) {
    console.error("DB: Error fetching tasks:", error);
    return MOCK_TASKS;
  }
};

export const saveTask = async (task: Task): Promise<void> => {
  try {
    await setDoc(doc(db, TASKS_COLLECTION, task.id), task);
  } catch (error) {
    console.error("DB: Error saving task:", error);
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
