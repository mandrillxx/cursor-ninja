import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import { RuleProject } from "./types";

interface ProjectState {
  projects: RuleProject[];
  activeProjectId: string | null;

  // Project management
  createProject: (name: string, description: string) => string;
  deleteProject: (id: string) => void;
  updateProject: (id: string, data: Partial<Omit<RuleProject, "id">>) => void;
  setActiveProject: (id: string) => void;

  // Data access
  getProject: (id: string) => RuleProject | undefined;
  getActiveProject: () => RuleProject | undefined;

  // Import/Export
  importProject: (project: RuleProject) => void;
  exportProject: (id: string) => RuleProject | undefined;
}

// Helper function to deep clone objects without causing proxy issues
const deepClone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],
      activeProjectId: null,

      createProject: (name, description) => {
        const newId = uuidv4();
        const newProject: RuleProject = {
          id: newId,
          name,
          description,
          lastModified: Date.now(),
          nodes: [],
          edges: [],
        };

        set((state) => ({
          projects: [...state.projects, newProject],
          activeProjectId: newId,
        }));

        return newId;
      },

      deleteProject: (id) => {
        set((state) => {
          const newProjects = state.projects.filter((p) => p.id !== id);

          // If the active project is deleted, set the first project as active or null
          const newActiveProjectId =
            state.activeProjectId === id
              ? newProjects[0]?.id || null
              : state.activeProjectId;

          return {
            projects: newProjects,
            activeProjectId: newActiveProjectId,
          };
        });
      },

      updateProject: (id, data) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === id
              ? {
                  ...project,
                  ...data,
                  lastModified: Date.now(),
                }
              : project
          ),
        }));
      },

      setActiveProject: (id) => {
        set({ activeProjectId: id });
      },

      getProject: (id) => {
        // Make a safe copy of the project to avoid proxy issues
        const project = get().projects.find((p) => p.id === id);
        return project ? deepClone(project) : undefined;
      },

      getActiveProject: () => {
        const { activeProjectId, projects } = get();

        if (!activeProjectId) return undefined;

        const project = projects.find((p) => p.id === activeProjectId);
        return project ? deepClone(project) : undefined;
      },

      importProject: (project) => {
        // Check if project with the same ID already exists
        const existingProject = get().projects.find((p) => p.id === project.id);

        if (existingProject) {
          // Update existing project
          set((state) => ({
            projects: state.projects.map((p) =>
              p.id === project.id ? { ...project, lastModified: Date.now() } : p
            ),
            activeProjectId: project.id,
          }));
        } else {
          // Add new project
          set((state) => ({
            projects: [
              ...state.projects,
              { ...project, lastModified: Date.now() },
            ],
            activeProjectId: project.id,
          }));
        }
      },

      exportProject: (id) => {
        const project = get().projects.find((p) => p.id === id);
        return project ? deepClone(project) : undefined;
      },
    }),
    {
      name: "cursor-rule-projects",
    }
  )
);
