'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  Panel,
  Background,
  Controls,
  ConnectionLineType,
  useReactFlow,
  NodeTypes,
  NodeProps,
  Node,
  Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useRuleStore } from '@/lib/store';
import { NodeType, RuleNode } from '@/lib/types';
import HubNode from '@/components/rule-nodes/HubNode';
import BaseRuleNode from '@/components/rule-nodes/RuleNode';
import NodeTypeSelector from '@/components/NodeTypeSelector';
import RuleDialogSelector from '@/components/rule-dialogs/RuleDialogSelector';
import RulePreview from '@/components/RulePreview';
import { Button } from '@/components/ui/button';
import { Undo2, Redo2, Download, ZoomIn } from 'lucide-react';
import { Toaster } from 'sonner';
import { toast } from 'sonner';
import ProjectSelector from '@/components/ProjectSelector';

// Extended node type for editing
interface EditableNode extends Node {
  data: {
    onEdit?: () => void;
    [key: string]: unknown;
  };
}

// Define nodeTypes outside of the component to prevent unnecessary re-renders
const nodeTypes: NodeTypes = {
  hub: HubNode,
  framework: BaseRuleNode as React.ComponentType<NodeProps>,
  'file-pattern': BaseRuleNode as React.ComponentType<NodeProps>,
  semantic: BaseRuleNode as React.ComponentType<NodeProps>,
  reference: BaseRuleNode as React.ComponentType<NodeProps>,
  custom: BaseRuleNode as React.ComponentType<NodeProps>,
};

function RuleEditor() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [selectedNodeType, setSelectedNodeType] = useState<NodeType | null>(null);
  const [nodeToEdit, setNodeToEdit] = useState<string | null>(null);
  const reactFlowInstance = useReactFlow();
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);
  
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    undo,
    redo,
    updateNodeData,
  } = useRuleStore();

  // Edge deletion handler
  const handleEdgeDelete = useCallback((edgeId: string) => {
    onEdgesChange([
      {
        id: edgeId,
        type: 'remove',
      },
    ]);
    toast.success('Connection removed');
    setSelectedEdge(null);
  }, [onEdgesChange]);

  // Handle edge selection
  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.stopPropagation();
    setSelectedEdge(edge.id);
    // Add visual feedback for selected edge - can be customized as needed
    toast.info('Connection selected. Press Delete to remove it', { duration: 2000 });
  }, []);

  // Handle key press
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if ((event.key === 'Delete' || event.key === 'Backspace') && selectedEdge) {
      handleEdgeDelete(selectedEdge);
    }
  }, [selectedEdge, handleEdgeDelete]);

  // Add and remove event listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  // Add onEdit handler to each node's data
  const nodesWithEditHandler = nodes.map((node: Node) => {
    if (node.type === 'hub') return node;
    
    return {
      ...node,
      data: {
        ...node.data,
        onEdit: () => {
          setNodeToEdit(node.id);
          setSelectedNodeType(node.type as NodeType);
        },
      },
    } as EditableNode;
  });

  // Register node types
  // nodeTypes is now defined outside the component
  
  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow') as NodeType;
      
      if (!type || !reactFlowWrapper.current) return;

      // We don't need to use the position since we'll use a centered position when creating the node
      setSelectedNodeType(type);
    },
    [reactFlowInstance]
  );

  const handleNodeTypeSelect = (type: NodeType) => {
    setSelectedNodeType(type);
  };

  const getNodeData = (nodeId: string) => {
    const node = nodes.find((n: Node) => n.id === nodeId);
    return node?.data || null;
  };

  const handleAddRule = useCallback((rule: Omit<RuleNode, 'id' | 'position'>) => {
    if (nodeToEdit) {
      // Update existing node
      updateNodeData(nodeToEdit, {
        label: rule.data.label,
        description: rule.data.description,
        ruleData: rule.data.ruleData,
      });
      
      setNodeToEdit(null);
    } else {
      // Add new node
      // Get the center of the viewport for positioning
      const viewport = reactFlowInstance.getViewport();
      const { x, y, zoom } = viewport;
      
      // Center of the viewport
      const centerX = -x / zoom + window.innerWidth / (2 * zoom);
      const centerY = -y / zoom + window.innerHeight / (2 * zoom);
      
      // Place node at the center with small offset from the hub node
      const position = { x: centerX + 250, y: centerY };
      
      // Only automatically connect framework nodes to the hub
      const connectToHub = rule.type === 'framework';
      
      addNode({
        ...rule,
        id: `node-${Date.now()}`,
        position,
      }, connectToHub);
    }
    
    setSelectedNodeType(null);
  }, [addNode, nodeToEdit, updateNodeData, reactFlowInstance]);

  const handleDialogClose = () => {
    setSelectedNodeType(null);
    setNodeToEdit(null);
  };

  const zoomToFit = useCallback(() => {
    reactFlowInstance.fitView({ padding: 0.2 });
  }, [reactFlowInstance]);
  
  const downloadRules = useCallback(() => {
    const ruleFile = useRuleStore.getState().generateRuleFile();
    const jsonString = JSON.stringify(ruleFile, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cursor-rules.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  return (
    <div 
      className="w-full h-screen" 
      ref={reactFlowWrapper}
      tabIndex={0}
    >
      <ReactFlow
        nodes={nodesWithEditHandler}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgeClick={onEdgeClick}
        nodeTypes={nodeTypes}
        onDragOver={onDragOver}
        onDrop={onDrop}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={1.5}
        connectOnClick={true}
      >
        <Background />
        <Controls />
        
        <Panel position="top-right" className="space-x-2">
          <Button variant="outline" size="icon" onClick={undo} title="Undo">
            <Undo2 className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="icon" onClick={redo} title="Redo">
            <Redo2 className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="icon" onClick={zoomToFit} title="Zoom to Fit">
            <ZoomIn className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="icon" onClick={downloadRules} title="Download Rules">
            <Download className="h-5 w-5" />
          </Button>
        </Panel>
        
        <Panel position="top-left" className="w-64">
          <ProjectSelector />
          <div className="mt-2">
            <NodeTypeSelector onSelectNodeType={handleNodeTypeSelect} />
          </div>
        </Panel>
        
        <Panel position="bottom-left" className="w-64 max-h-80 overflow-auto">
          <RulePreview />
        </Panel>
      </ReactFlow>
      
      <RuleDialogSelector
        selectedNodeType={selectedNodeType}
        onClose={handleDialogClose}
        onSave={handleAddRule}
        nodeData={nodeToEdit ? getNodeData(nodeToEdit) : null}
      />
      
      <Toaster position="top-right" />
    </div>
  );
}

export default function Home() {
  return (
    <ReactFlowProvider>
      <RuleEditor />
    </ReactFlowProvider>
  );
}
