import { GoogleGenAI } from "@google/genai";
import { Project, Task } from "../types";

export const generateDailyReport = async (projects: Project[], tasks: Task[]): Promise<string> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    console.error("API Key missing. Checked import.meta.env.VITE_GEMINI_API_KEY");
    return "Error: Gemini API Key not configured in .env.local.";
  }

  const ai = new GoogleGenAI({ apiKey });

  // Prepare data summary for the prompt
  const totalProjects = projects.length;
  const newProjects = projects.filter(p => p.stage === 'New').length; // Simplified "New" logic
  const totalTasks = tasks.length;

  const projectSummaries = projects.map(p => {
    const daysLeft = Math.ceil((new Date(p.deadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
    return `- Project: ${p.name} (${p.stage}). Designer: ${p.designer}. Days Left: ${daysLeft}. Notes: ${p.notes.substring(0, 50)}...`;
  }).join('\n');

  const prompt = `
    You are an administrative assistant for "Eager Beaver", a furniture manufacturing company.
    Generate a daily summary email for the admins (Bram, Jacques, et al.).
    
    Data Snapshot:
    - Total Projects: ${totalProjects}
    - New Projects Recently: ${newProjects}
    - Total Tasks Loaded: ${totalTasks}
    
    Project Details:
    ${projectSummaries}
    
    The email should cover:
    1. Number of movements on Kanban (Estimate this based on project stages).
    2. Number of new Projects.
    3. Number of tasks loaded.
    4. List of notes made per project.
    5. List of days left to deadline per project.
    
    Keep the tone professional but eager. Format it as a clean text email.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Could not generate report.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Failed to generate report. Please check API key or try again later.";
  }
};