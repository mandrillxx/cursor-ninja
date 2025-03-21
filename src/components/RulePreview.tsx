'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRuleStore } from '@/lib/store';
import { generateRules } from '@/actions/generate-rules';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Loader2, FileDown, FileText, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { CursorRule, NodeType } from '@/lib/types';

export default function RulePreview() {
  // Get all the necessary state from the store
  const nodes = useRuleStore((state) => state.nodes);
  const edges = useRuleStore((state) => state.edges);
  
  const [rulePreview, setRulePreview] = useState('');
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [dialogMarkdown, setDialogMarkdown] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Generate rules starting from the hub node
  const generateRulesFromHub = useCallback(() => {
    // Create a mapping of node IDs to their connected nodes
    const nodeConnections: Record<string, string[]> = {};

    edges.forEach((edge) => {
      if (!nodeConnections[edge.source]) {
        nodeConnections[edge.source] = [];
      }
      nodeConnections[edge.source].push(edge.target);
    });

    // Helper function to build the rule tree recursively
    const buildRuleTree = (
      nodeId: string,
      visited = new Set<string>()
    ): CursorRule | null => {
      // Prevent infinite recursion
      if (visited.has(nodeId)) return null;
      visited.add(nodeId);

      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return null;

      // Handle hub node specially - it's the root but doesn't become a rule itself
      if (node.type === "hub") {
        // Find all children of the hub and process them
        const hubChildren = nodeConnections[nodeId] || [];
        const childRules = hubChildren
          .map((childId) => buildRuleTree(childId, new Set(visited)))
          .filter(Boolean) as CursorRule[];
          
        return childRules.length > 0 ? { 
          type: "root" as NodeType,
          description: "Generated rules",
          children: childRules
        } : null;
      }

      // Create the base rule with the common properties
      const rule: CursorRule = {
        type: node.type as NodeType,
        description: node.data.description || "",
        ...node.data.ruleData,
      };

      // Find any connected child nodes and add them as children
      const children = nodeConnections[nodeId] || [];
      if (children.length > 0) {
        const childRules = children
          .map((childId) => buildRuleTree(childId, new Set(visited)))
          .filter(Boolean) as CursorRule[];

        if (childRules.length > 0) {
          rule.children = childRules;
        }
      }

      return rule;
    };

    // Start traversal from the hub node
    const hubNode = nodes.find(node => node.id === "hub");
    if (!hubNode) {
      return { rules: [] as CursorRule[] };
    }
    
    const rootRule = buildRuleTree("hub");
    const rules = rootRule?.children as CursorRule[] || [] as CursorRule[];
    
    return { rules };
  }, [nodes, edges]);

  // Update the preview whenever any relevant state changes
  useEffect(() => {
    try {
      const ruleFile = generateRulesFromHub();
      setRulePreview(JSON.stringify(ruleFile, null, 2));
    } catch (error) {
      console.error('Error generating rule preview:', error);
    }
  }, [nodes, edges, generateRulesFromHub]);

  // Generate markdown using AI
  const handleGenerateMarkdown = async () => {
    setIsGenerating(true);
    setDialogMarkdown(null);
    
    const ruleFile = generateRulesFromHub();
    const result = await generateRules(ruleFile);
    
    if (result && result.data && result.data.success && !result.serverError) {
      console.log('Generated Markdown:', JSON.stringify(result.data.success));
      setDialogMarkdown(result.data.success);
      setMarkdown(result.data.success);
      toast.success('Markdown generated successfully');
    } else {
      toast.error(result?.serverError?.message || 'Failed to generate markdown');
    }
    
    setIsGenerating(false);
    setIsDialogOpen(false);
  };

  // Download markdown
  const handleDownloadMarkdown = () => {
    if (!markdown) return;
    
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cursor-rules.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Markdown file downloaded');
  };

  // Close dialog and clear dialog markdown
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setDialogMarkdown(null);
  };

  return (
    <div className="border rounded-lg bg-gray-950 text-white shadow-sm relative overflow-hidden">
      {/* Header with controls */}
      <div className="flex items-center justify-between p-2 border-b border-gray-800">
        <h3 className="text-sm font-medium">Rule Preview</h3>
        
        <div className="flex items-center gap-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent side="top" align="end" className="w-48 p-2">
              <div className="flex flex-col gap-1">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="justify-start font-normal"
                    >
                      Generate Markdown
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[80vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                      <DialogTitle>Generate Markdown Documentation</DialogTitle>
                      <DialogDescription>
                        This will use AI to convert your rules into a well-structured markdown document.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="flex-1 overflow-hidden my-4">
                      {isGenerating ? (
                        <div className="flex items-center justify-center p-8">
                          <Loader2 className="h-8 w-8 animate-spin mr-2" />
                          <p>Generating markdown documentation...</p>
                        </div>
                      ) : dialogMarkdown ? (
                        <ScrollArea className="h-[400px]">
                          <pre className="p-4 bg-gray-100 dark:bg-gray-900 rounded-md text-sm whitespace-pre-wrap">
                            {dialogMarkdown}
                          </pre>
                        </ScrollArea>
                      ) : (
                        <p className="text-center p-4">
                          Click &quot;Generate&quot; to create markdown documentation from your rules.
                        </p>
                      )}
                    </div>
                    
                    <DialogFooter>
                      <Button 
                        variant="secondary" 
                        onClick={handleCloseDialog}
                      >
                        Close
                      </Button>
                      {!isGenerating && !dialogMarkdown && (
                        <Button
                          onClick={handleGenerateMarkdown}
                          disabled={isGenerating}
                        >
                          Generate
                        </Button>
                      )}
                      {dialogMarkdown && (
                        <Button 
                          variant="outline"
                          onClick={handleDownloadMarkdown}
                          className="ml-2"
                        >
                          <FileDown className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      )}
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                {markdown && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleDownloadMarkdown}
                    className="justify-start font-normal"
                  >
                    <FileDown className="h-4 w-4 mr-2" /> 
                    Download Markdown
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Content area */}
      <ScrollArea className="h-[300px]">
        {rulePreview ? (
          <pre className="p-3 text-xs text-gray-300 font-mono">
            {rulePreview}
          </pre>
        ) : (
          <div className="p-3 text-center text-gray-500 text-sm">
            No rules to preview
          </div>
        )}
      </ScrollArea>
      
      {/* Optional floating action button for markdown */}
      {markdown && (
        <Button 
          variant="secondary" 
          size="sm" 
          className="absolute bottom-3 right-3 shadow-md"
          onClick={handleDownloadMarkdown}
        >
          <FileText className="h-4 w-4 mr-2" />
          Markdown
        </Button>
      )}
    </div>
  );
} 