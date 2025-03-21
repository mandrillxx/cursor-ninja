'use client';

import { useState, useEffect, useCallback } from 'react';
import { useProjectStore } from '@/lib/project-store';
import { useRuleStore } from '@/lib/store';
import { RuleProject } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FolderPlus, 
  FolderOpen, 
  Download, 
  Upload,
  Trash2, 
  FileText,
  ChevronDown,
  FileJson,
  FileType
} from 'lucide-react';
import { toast } from 'sonner';
import { useReactFlow } from 'reactflow';
import ImportRuleTextDialog from './ImportRuleTextDialog';

interface NewProjectDialogProps {
  onClose: () => void;
  onCreateProject: (name: string, description: string) => void;
}

const NewProjectDialog = ({ onClose, onCreateProject }: NewProjectDialogProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Project name is required');
      return;
    }

    onCreateProject(name, description);
    toast.success('Project created successfully');
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Project Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My Rule Project"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a description of this rule project..."
          rows={3}
        />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">Create Project</Button>
      </DialogFooter>
    </form>
  );
};

interface ImportProjectDialogProps {
  onClose: () => void;
  onImport: (project: RuleProject) => void;
}

const ImportProjectDialog = ({ onClose, onImport }: ImportProjectDialogProps) => {
  const [jsonContent, setJsonContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleImport = () => {
    try {
      if (!jsonContent.trim()) {
        toast.error('Please enter JSON content');
        return;
      }

      const projectData = JSON.parse(jsonContent);
      
      // Basic validation
      if (!projectData.id || !projectData.name) {
        toast.error('Invalid project data: missing required fields');
        return;
      }

      onImport(projectData);
      toast.success('Project imported successfully');
      onClose();
    } catch {
      setError('Invalid JSON format');
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="json">Paste Project JSON</Label>
        <ScrollArea className="h-[300px] w-full">
          <Textarea
            id="json"
            value={jsonContent}
            onChange={(e) => {
              setJsonContent(e.target.value);
              setError(null);
            }}
            placeholder="Paste your project JSON here..."
            rows={10}
            className={error ? 'border-red-500' : ''}
          />
        </ScrollArea>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="button" onClick={handleImport}>
          Import
        </Button>
      </DialogFooter>
    </div>
  );
};

const ProjectSelector = () => {
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [importJsonOpen, setImportJsonOpen] = useState(false);
  const [importRuleTextOpen, setImportRuleTextOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showImportDropdown, setShowImportDropdown] = useState(false);
  
  const {
    projects,
    activeProjectId,
    createProject,
    deleteProject,
    setActiveProject,
    getProject,
    getActiveProject,
    exportProject,
    importProject,
    updateProject,
  } = useProjectStore();
  const reactFlowInstance = useReactFlow();
  
  const { setStoreData, saveCurrentState } = useRuleStore();
  
  const activeProject = getActiveProject();
  
  // Sync the current flow state to the active project whenever it changes
  useEffect(() => {
    if (activeProjectId) {
      // Get the current state
      const currentState = saveCurrentState();
      
      // Save it to the active project
      updateProject(activeProjectId, {
        nodes: currentState.nodes,
        edges: currentState.edges,
      });
    }
  }, [activeProjectId, updateProject, saveCurrentState]);
  
  // Safely create a project without directly accessing the store getter
  const handleCreateProject = (name: string, description: string) => {
    try {
      const id = createProject(name, description);
      if (id) {
        const newProject = getProject(id);
        if (newProject) {
          // Make sure the default hub node is created
          const defaultNodes = [
            {
              id: "hub",
              type: "hub",
              position: { x: 0, y: 0 },
              data: {
                label: "Hub",
                description: "Central hub for all rules",
                ruleData: {},
              },
            },
          ];
          
          const nodes = newProject.nodes?.length ? newProject.nodes : defaultNodes;
          const edges = newProject.edges || [];
          
          setStoreData(nodes, edges);
        }
      }
    } catch (err) {
      console.error('Error creating project:', err);
      toast.error('Failed to create project');
    } finally {
      zoomToFit();
    }
  };
	
  const zoomToFit = useCallback(() => {
    reactFlowInstance.fitView({ padding: 0.2 });
  }, [reactFlowInstance]);
  
  
  // Handle importing project from JSON
  const handleImportProject = (project: RuleProject) => {
    try {
      // First import the project into the store
      importProject(project);
      
      // Then explicitly load the nodes and edges
      if (project && project.id) {
        // Get the fresh copy from the store
        const freshProject = getProject(project.id);
        if (freshProject) {
          // Make sure there's at least a hub node
          const defaultNodes = [
            {
              id: "hub",
              type: "hub",
              position: { x: 0, y: 0 },
              data: {
                label: "Hub",
                description: "Central hub for all rules",
                ruleData: {},
              },
            },
          ];
          
          const nodes = freshProject.nodes?.length ? freshProject.nodes : defaultNodes;
          const edges = freshProject.edges || [];
          
          // Set the active data
          setStoreData(nodes, edges);
          
          // Center the view
          zoomToFit();
          
          toast.success(`Project "${project.name}" imported successfully`);
        }
      }
    } catch (err) {
      console.error('Error importing project:', err);
      toast.error('Failed to import project');
    }
  };
  
  // Create a default project if none exists
  useEffect(() => {
    if (projects.length === 0) {
      handleCreateProject('Default Project', 'My first rules project');
      zoomToFit();
    } else if (activeProjectId && projects.length > 0) {
      // Load active project
      const project = getProject(activeProjectId);
      if (project) {
        // Make sure there's at least a hub node
        const defaultNodes = [
          {
            id: "hub",
            type: "hub",
            position: { x: 0, y: 0 },
            data: {
              label: "Hub",
              description: "Central hub for all rules",
              ruleData: {},
            },
          },
        ];
        
        const nodes = project.nodes?.length ? project.nodes : defaultNodes;
        const edges = project.edges || [];
        
        setStoreData(nodes, edges);
        
        // Center the view on initial load
        zoomToFit();
      }
    }
  }, [projects.length, activeProjectId, getProject, setStoreData, zoomToFit]);
  
  const handleSelectProject = (project: RuleProject) => {
    // Save current project state before switching
    if (activeProjectId) {
      const currentState = saveCurrentState();
      updateProject(activeProjectId, {
        nodes: currentState.nodes,
        edges: currentState.edges,
      });
    }
    
    // Then switch to new project
    setActiveProject(project.id);
    setStoreData(project.nodes || [], project.edges || []);
    
    // Center the view
    zoomToFit();
    
    toast.success(`Switched to project: ${project.name}`);
    setShowDropdown(false);
  };
  
  const handleDeleteProject = (id: string) => {
    if (projects.length <= 1) {
      toast.error('Cannot delete the only project');
      return;
    }
    
    deleteProject(id);
    toast.success('Project deleted');
    setShowDropdown(false);
  };
  
  const handleExportProject = (id: string) => {
    // If we're exporting the active project, make sure to save it first
    if (id === activeProjectId) {
      const currentState = saveCurrentState();
      updateProject(id, {
        nodes: currentState.nodes,
        edges: currentState.edges,
      });
    }
    
    const project = exportProject(id);
    if (!project) {
      toast.error('Failed to export project');
      return;
    }
    
    const jsonString = JSON.stringify(project, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.replace(/\s+/g, '-').toLowerCase()}-cursor-rules.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Project exported successfully');
    setShowDropdown(false);
  };
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };
  
  return (
    <div className="flex items-center space-x-2">
      <DropdownMenu open={showDropdown} onOpenChange={setShowDropdown}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center space-x-2">
            <FolderOpen className="h-4 w-4" />
            <span className="max-w-[150px] truncate">
              {activeProject?.name || 'Select Project'}
            </span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[300px]">
          <DropdownMenuLabel>Your Projects</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {projects.map((project) => (
            <div key={project.id} className="px-2 py-1 hover:bg-accent rounded-sm">
              <div className="flex justify-between items-center">
                <button
                  className={`flex-1 text-left py-1 ${
                    project.id === activeProjectId ? 'font-bold' : ''
                  }`}
                  onClick={() => handleSelectProject(project)}
                >
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span className="truncate">{project.name}</span>
                  </div>
                  <div className="text-xs text-muted-foreground ml-6">
                    {formatDate(project.lastModified)}
                  </div>
                </button>
                
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleExportProject(project.id)}
                    className="h-6 w-6"
                    title="Export Project"
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteProject(project.id)}
                    className="h-6 w-6 text-destructive"
                    title="Delete Project"
                    disabled={projects.length <= 1}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          
          <DropdownMenuSeparator />
          
          <div className="p-2 flex space-x-2">
            <Dialog open={newProjectOpen} onOpenChange={setNewProjectOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1">
                  <FolderPlus className="h-4 w-4 mr-2" />
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                  <DialogDescription>
                    Create a new rule project to organize your rules.
                  </DialogDescription>
                </DialogHeader>
                <NewProjectDialog onClose={() => setNewProjectOpen(false)} onCreateProject={handleCreateProject} />
              </DialogContent>
            </Dialog>
            
            <DropdownMenu open={showImportDropdown} onOpenChange={setShowImportDropdown}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1">
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => {
                  setShowImportDropdown(false);
                  setImportJsonOpen(true);
                }}>
                  <FileJson className="h-4 w-4 mr-2" />
                  Import from JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  setShowImportDropdown(false);
                  setImportRuleTextOpen(true);
                }}>
                  <FileType className="h-4 w-4 mr-2" />
                  Import from .cursorrule
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Import JSON Dialog */}
            <Dialog open={importJsonOpen} onOpenChange={setImportJsonOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Import Project from JSON</DialogTitle>
                  <DialogDescription>
                    Import a rule project from JSON format.
                  </DialogDescription>
                </DialogHeader>
                <ImportProjectDialog onClose={() => setImportJsonOpen(false)} onImport={handleImportProject} />
              </DialogContent>
            </Dialog>
            
            {/* Import Rule Text Dialog */}
            <Dialog open={importRuleTextOpen} onOpenChange={setImportRuleTextOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Import from .cursorrule Text</DialogTitle>
                  <DialogDescription>
                    Import rules from natural language and convert them to structured rule nodes using AI.
                  </DialogDescription>
                </DialogHeader>
                <ImportRuleTextDialog onClose={() => setImportRuleTextOpen(false)} onImport={handleImportProject} />
              </DialogContent>
            </Dialog>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ProjectSelector; 