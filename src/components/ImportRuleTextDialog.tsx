'use client';

import { useState } from 'react';
import {
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Info } from 'lucide-react';
import { toast } from 'sonner';
import { parseRuleText } from '@/app/actions/generate-rules';
import { RuleProject } from '@/lib/types';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface ImportRuleTextDialogProps {
  onClose: () => void;
  onImport: (project: RuleProject) => void;
}

export default function ImportRuleTextDialog({ onClose, onImport }: ImportRuleTextDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [ruleText, setRuleText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showExample, setShowExample] = useState(false);

  const exampleRuleText = `This project follows the React Best Practices for our team.

Technologies:
- React 18+ with TypeScript
- Next.js for server components and routing
- TailwindCSS for styling
- React Query for data fetching

Coding Standards:
1. Use functional components with hooks instead of class components
2. Prefer named exports over default exports
3. Use React.memo for performance optimization when needed
4. Keep component files under 300 lines, extract larger components into smaller ones
5. Use TypeScript interfaces for props and state

File Organization:
- Components should be in the /components directory
- Pages should be in the /app directory following Next.js app router conventions
- Utility functions should be in the /utils directory
- Reusable hooks should be in the /hooks directory

API Patterns:
- Use React Query for API calls with proper caching
- Handle loading and error states consistently across the app
- All API calls should be in separate files in the /api directory`;

  const handleImport = async () => {
    try {
      if (!ruleText.trim()) {
        toast.error('Please enter rule text');
        return;
      }

      if (!name.trim()) {
        toast.error('Project name is required');
        return;
      }

      setIsProcessing(true);
      setError(null);

      const result = await parseRuleText(ruleText, name, description);
      
      if (result.success) {
        // Create a complete project object
        const projectData: RuleProject = {
          id: `project-${Date.now()}`,
          name: result.projectName || name,
          description: result.projectDescription || description,
          lastModified: Date.now(),
          nodes: result.nodes || [],
          edges: result.edges || []
        };
        
        onImport(projectData);
        toast.success('Rules imported and converted successfully');
        onClose();
      } else {
        setError(result.error || 'Failed to convert rules');
        toast.error('Failed to convert rules');
      }
    } catch (err) {
      console.error('Error importing rules from text:', err);
      setError('An unexpected error occurred');
      toast.error('Failed to process rule text');
    } finally {
      setIsProcessing(false);
    }
  };

  const useExample = () => {
    setRuleText(exampleRuleText);
    setShowExample(false);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Project Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My Rule Project"
          disabled={isProcessing}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Project Description</Label>
        <Input
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="A brief description of this project"
          disabled={isProcessing}
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="ruleText">Paste .cursorrule Text</Label>
          <Collapsible
            open={showExample}
            onOpenChange={setShowExample}
            className="w-full max-w-[350px]"
          >
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-1 p-1 h-auto">
                <Info className="h-3 w-3" />
                <span className="text-xs">See Example</span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="overflow-hidden rounded-md border mt-2 p-3 bg-muted text-xs">
              <div className="flex justify-between mb-2">
                <span className="font-medium">Example .cursorrule Format</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2 text-xs"
                  onClick={useExample}
                >
                  Use This Example
                </Button>
              </div>
              <pre className="whitespace-pre-wrap text-[10px] overflow-auto max-h-[150px]">
                {exampleRuleText}
              </pre>
            </CollapsibleContent>
          </Collapsible>
        </div>
        <ScrollArea className="h-[300px] w-full">
          <Textarea
            id="ruleText"
            value={ruleText}
            onChange={(e) => {
              setRuleText(e.target.value);
              setError(null);
            }}
            placeholder="Paste your .cursorrule text here. Describe your project rules, coding standards, technologies, and best practices in natural language. The AI will convert this into structured rule nodes."
            rows={10}
            className={error ? 'border-red-500' : ''}
            disabled={isProcessing}
          />
        </ScrollArea>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
      
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose} disabled={isProcessing}>
          Cancel
        </Button>
        <Button 
          type="button" 
          onClick={handleImport} 
          disabled={isProcessing || !ruleText.trim() || !name.trim()}
          className="relative"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing
            </>
          ) : (
            'Import & Convert'
          )}
        </Button>
      </DialogFooter>
    </div>
  );
} 