import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { NodeType } from '@/lib/types';
import { 
  LayoutGrid, 
  FileCode, 
  FileSearch, 
  FileText, 
  Settings 
} from 'lucide-react';

interface NodeTypeSelectorProps {
  onSelectNodeType: (type: NodeType) => void;
}

interface NodeTypeOption {
  type: NodeType;
  label: string;
  icon: React.ReactNode;
  color: string;
}

const nodeOptions: NodeTypeOption[] = [
  {
    type: 'framework',
    label: 'Framework',
    icon: <LayoutGrid className="h-5 w-5" />,
    color: 'border-green-500 text-green-500 hover:bg-green-50',
  },
  {
    type: 'file-pattern',
    label: 'File Pattern',
    icon: <FileCode className="h-5 w-5" />,
    color: 'border-purple-500 text-purple-500 hover:bg-purple-50',
  },
  {
    type: 'semantic',
    label: 'Semantic',
    icon: <FileSearch className="h-5 w-5" />,
    color: 'border-amber-500 text-amber-500 hover:bg-amber-50',
  },
  {
    type: 'reference',
    label: 'Reference',
    icon: <FileText className="h-5 w-5" />,
    color: 'border-cyan-500 text-cyan-500 hover:bg-cyan-50',
  },
  {
    type: 'custom',
    label: 'Custom',
    icon: <Settings className="h-5 w-5" />,
    color: 'border-rose-500 text-rose-500 hover:bg-rose-50',
  },
];

const DraggableNodeType = ({ type, label, icon, color, onSelect }: NodeTypeOption & { onSelect: () => void }) => {
  // Use ReactFlow's default drag behavior (HTML5)
  const onDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    event.dataTransfer.setData('application/reactflow', type);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="cursor-grab"
      onClick={onSelect}
    >
      <Card className={`border-l-4 ${color} transition-colors duration-200`}>
        <CardContent className="p-3 flex items-center gap-2">
          {icon}
          <span className="font-medium">{label}</span>
        </CardContent>
      </Card>
    </div>
  );
};

export default function NodeTypeSelector({ onSelectNodeType }: NodeTypeSelectorProps) {
  return (
    <div className="p-3 border rounded-lg bg-background shadow-sm">
      <h3 className="font-semibold mb-2">Rule Types</h3>
      <p className="text-sm text-muted-foreground mb-3">
        Drag and drop or click to add a new rule
      </p>
      <div className="space-y-2">
        {nodeOptions.map((option) => (
          <DraggableNodeType 
            key={option.type}
            {...option} 
            onSelect={() => onSelectNodeType(option.type)} 
          />
        ))}
      </div>
    </div>
  );
} 