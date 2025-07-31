import { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Edit3, X, Code, Database, FileText, Variable, Grid } from 'lucide-react';

interface NodeData {
  name: string;
  value?: any;
  arguments?: Record<string, any>;
  fieldType?: string;
  isRoot?: boolean;
  fields?: string[];
  nodeType: 'operation' | 'field' | 'fragment' | 'variable' | 'fieldGroup';
  onUpdate: (data: any) => void;
}

interface GraphQLNodeProps {
  data: NodeData;
  selected?: boolean;
}

export default function GraphQLNode({ data, selected }: GraphQLNodeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(data.value?.toString() || data.name);

  const getNodeIcon = () => {
    switch (data.nodeType) {
      case 'operation':
        return <Code className="w-4 h-4" />;
      case 'field':
        return <Database className="w-4 h-4" />;
      case 'fragment':
        return <FileText className="w-4 h-4" />;
      case 'variable':
        return <Variable className="w-4 h-4" />;
      case 'fieldGroup':
        return <Grid className="w-4 h-4" />;
      default:
        return <Code className="w-4 h-4" />;
    }
  };

  const getNodeColor = () => {
    switch (data.nodeType) {
      case 'operation':
        return 'bg-blue-500 text-white';
      case 'field':
        return 'bg-green-500 text-white';
      case 'fragment':
        return 'bg-yellow-500 text-white';
      case 'variable':
        return 'bg-purple-500 text-white';
      case 'fieldGroup':
        return 'bg-indigo-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getNodeBorder = () => {
    if (selected) return 'ring-2 ring-blue-400 ring-offset-2';
    return 'border border-slate-200';
  };

  const handleEdit = () => {
    if (isEditing) {
      data.onUpdate({ 
        [data.nodeType === 'variable' ? 'value' : 'name']: editValue 
      });
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  const handleDelete = () => {
    // TODO: Implement node deletion
    console.log('Delete node:', data.name);
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm ${getNodeBorder()} min-w-[120px] group hover:shadow-md transition-all`}>
      {/* Handles for connections */}
      {data.nodeType !== 'operation' && (
        <Handle
          type="target"
          position={Position.Top}
          className="w-2 h-2 !bg-slate-400"
        />
      )}
      
      {data.nodeType !== 'variable' && data.nodeType !== 'fieldGroup' && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="w-2 h-2 !bg-slate-400"
        />
      )}

      {/* Node Header */}
      <div className={`px-3 py-2 rounded-t-lg flex items-center gap-2 ${getNodeColor()}`}>
        {getNodeIcon()}
        <span className="font-medium text-sm">{data.nodeType}</span>
        
        {/* Action buttons */}
        <div className="ml-auto flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleEdit}
            className="p-1 hover:bg-white/20 rounded"
            title={isEditing ? 'Save' : 'Edit'}
          >
            <Edit3 className="w-3 h-3" />
          </button>
          {!data.isRoot && (
            <button
              onClick={handleDelete}
              className="p-1 hover:bg-white/20 rounded"
              title="Delete"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Node Content */}
      <div className="p-3">
        {isEditing ? (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleEdit}
            onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
            className="w-full px-2 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:border-blue-500"
            autoFocus
          />
        ) : (
          <div className="space-y-1">
            {data.nodeType === 'fieldGroup' ? (
              <div className="space-y-1">
                <div className="text-xs text-slate-500 uppercase tracking-wide">Fields</div>
                <div className="space-y-1">
                  {data.fields?.map((field, index) => (
                    <div key={index} className="text-sm text-slate-800 bg-slate-50 px-2 py-1 rounded">
                      {field}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="font-medium text-slate-800 text-sm">
                  {data.nodeType === 'variable' ? `$${data.name}` : data.name}
                </div>
                
                {data.value !== undefined && (
                  <div className="text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded">
                    {typeof data.value === 'object' ? JSON.stringify(data.value) : String(data.value)}
                  </div>
                )}
                
                {data.arguments && Object.keys(data.arguments).length > 0 && (
                  <div className="text-xs text-slate-600 space-y-1">
                    {Object.entries(data.arguments).map(([key, value]) => (
                      <div key={key} className="bg-slate-50 px-2 py-1 rounded">
                        <span className="font-medium">{key}:</span> {String(value)}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
