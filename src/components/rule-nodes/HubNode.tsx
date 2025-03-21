import { Handle, Position } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface HubNodeProps {
  data: {
    label: string;
  };
  isConnectable: boolean;
}

export default function HubNode({ data, isConnectable }: HubNodeProps) {
  return (
    <Card className="w-64 min-h-36 shadow-lg border-2 border-blue-500">
      <CardHeader className="p-3 bg-blue-500 text-white">
        <CardTitle className="text-lg font-bold flex items-center justify-between">
          {data.label}
          <Badge variant="outline" className="bg-white text-blue-500">Hub</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <p className="text-sm">Central node for connecting all rules</p>
      </CardContent>
      
      {/* Multiple source handles for different connections */}
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        isConnectable={isConnectable}
        className="w-3 h-3 bg-blue-500"
      />
      <Handle
        type="source"
        position={Position.Top}
        id="top"
        isConnectable={isConnectable}
        className="w-3 h-3 bg-blue-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        isConnectable={isConnectable}
        className="w-3 h-3 bg-blue-500"
      />
      <Handle
        type="source"
        position={Position.Left}
        id="left"
        isConnectable={isConnectable}
        className="w-3 h-3 bg-blue-500"
      />
    </Card>
  );
} 