import { Handle, Position } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useRuleStore } from '@/lib/store';
import { NodeType } from '@/lib/types';
import { 
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger
} from '@/components/ui/context-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface BaseRuleNodeProps {
  id: string;
  data: {
    label: string;
    description?: string;
    ruleData: Record<string, unknown>;
    onEdit?: () => void;
  };
  type: NodeType;
  isConnectable: boolean;
}

const nodeColors: Record<NodeType, { bg: string; border: string; text: string }> = {
  'hub': { bg: 'bg-blue-500', border: 'border-blue-500', text: 'text-blue-500' },
  'framework': { bg: 'bg-green-500', border: 'border-green-500', text: 'text-green-500' },
  'file-pattern': { bg: 'bg-purple-500', border: 'border-purple-500', text: 'text-purple-500' },
  'semantic': { bg: 'bg-amber-500', border: 'border-amber-500', text: 'text-amber-500' },
  'reference': { bg: 'bg-cyan-500', border: 'border-cyan-500', text: 'text-cyan-500' },
  'custom': { bg: 'bg-rose-500', border: 'border-rose-500', text: 'text-rose-500' },
};

// Helper function to truncate text while preserving words
const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text;
  
  // Find the last space within the maxLength
  const lastSpaceIndex = text.substring(0, maxLength).lastIndexOf(' ');
  
  // If no space found, just cut at maxLength
  if (lastSpaceIndex === -1) return text.substring(0, maxLength) + '...';
  
  // Otherwise cut at the last space
  return text.substring(0, lastSpaceIndex) + '...';
};

// Helper function to truncate object values
const truncateObjectValues = (obj: Record<string, unknown>, maxLength: number = 50): Record<string, unknown> => {
  const result: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string' && value.length > maxLength) {
      result[key] = truncateText(value, maxLength);
    } else {
      result[key] = value;
    }
  }
  
  return result;
};

export default function BaseRuleNode({ id, data, type, isConnectable }: BaseRuleNodeProps) {
  const removeNode = useRuleStore((state) => state.removeNode);
  const colors = nodeColors[type];
  
  // Truncate description if it's too long
  const truncatedDescription = data.description ? truncateText(data.description, 100) : undefined;
  
  // Truncate rule data values
  const truncatedRuleData = truncateObjectValues(data.ruleData);
  
  const getNodeLabel = (type: NodeType): string => {
    switch (type) {
      case 'framework': return 'Framework';
      case 'file-pattern': return 'File Pattern';
      case 'semantic': return 'Semantic';
      case 'reference': return 'Reference';
      case 'custom': return 'Custom';
      default: return type;
    }
  };

  const handleEdit = () => {
    if (data.onEdit) {
      data.onEdit();
    }
  };
  
  const handleDelete = () => {
    removeNode(id);
  };
  
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Card className={`w-64 min-h-36 shadow-lg border-2 ${colors.border}`}>
          <CardHeader className={`p-3 ${colors.bg} text-white`}>
            <CardTitle className="text-lg font-bold flex items-center justify-between">
              <span className="truncate">{data.label}</span>
              <Badge variant="outline" className={`bg-white ${colors.text}`}>
                {getNodeLabel(type)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 relative">
            {truncatedDescription && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-sm mb-2 truncate">{truncatedDescription}</p>
                  </TooltipTrigger>
                  {data.description !== truncatedDescription && (
                    <TooltipContent className="max-w-xs">
                      <p className="text-sm">{data.description}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            )}
            
            <div className="text-xs">
              {Object.entries(truncatedRuleData).map(([key, value]) => (
                <div key={key} className="mb-1">
                  <span className="font-medium">{key}: </span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="italic">{String(value)}</span>
                      </TooltipTrigger>
                      {typeof data.ruleData[key] === 'string' && 
                      String(data.ruleData[key]).length > String(value).length && (
                        <TooltipContent className="max-w-xs">
                          <p className="text-sm">{String(data.ruleData[key])}</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </div>
              ))}
            </div>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-2 right-2 h-6 w-6" 
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardContent>
          
          {/* Left edge target handle */}
          <Handle
            type="target"
            position={Position.Left}
            id="target-left"
            isConnectable={isConnectable}
            className={`w-3 h-3 ${colors.bg}`}
          />
          
          {/* Top edge target handle */}
          <Handle
            type="target"
            position={Position.Top}
            id="target-top"
            isConnectable={isConnectable}
            className={`w-3 h-3 ${colors.bg}`}
          />
          
          {/* For framework nodes, add source handles to connect to semantic nodes etc */}
          {type === 'framework' && (
            <>
              <Handle
                type="source"
                position={Position.Right}
                id="source-right"
                isConnectable={isConnectable}
                className={`w-3 h-3 ${colors.bg}`}
              />
              <Handle
                type="source"
                position={Position.Bottom}
                id="source-bottom"
                isConnectable={isConnectable}
                className={`w-3 h-3 ${colors.bg}`}
              />
            </>
          )}
        </Card>
      </ContextMenuTrigger>
      
      <ContextMenuContent>
        <ContextMenuItem onClick={handleEdit}>
          Edit Rule
        </ContextMenuItem>
        <ContextMenuItem onClick={handleDelete}>
          Delete Rule
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
} 