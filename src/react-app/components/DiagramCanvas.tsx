import { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Background,
  Controls,
  MiniMap,
  Panel
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { RefreshCw, Download } from 'lucide-react';
import GraphQLNode from './GraphQLNode';
import type { ParsedGraphQLData } from '@/react-app/types/graphql';

interface DiagramCanvasProps {
  data: ParsedGraphQLData | null;
  onUpdate: (data: ParsedGraphQLData) => void;
  onGenerateOutput: () => void;
}

const nodeTypes = {
  graphqlNode: GraphQLNode,
};

export default function DiagramCanvas({ data, onUpdate, onGenerateOutput }: DiagramCanvasProps) {
  const initialNodes: Node[] = useMemo(() => {
    if (!data) return [];
    
    return data.nodes.map(node => ({
      id: node.id,
      type: 'graphqlNode',
      position: node.position,
      data: {
        ...node.data,
        nodeType: node.type,
        onUpdate: (updatedData: any) => {
          // Handle node updates
          if (data) {
            const updatedNodes = data.nodes.map(n => 
              n.id === node.id ? { ...n, data: { ...n.data, ...updatedData } } : n
            );
            onUpdate({ ...data, nodes: updatedNodes });
          }
        }
      }
    }));
  }, [data, onUpdate]);

  const initialEdges: Edge[] = useMemo(() => {
    if (!data) return [];
    
    return data.edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: edge.type === 'fragment' ? 'smoothstep' : 'default',
      style: edge.type === 'fragment' ? { stroke: '#f59e0b', strokeWidth: 2, strokeDasharray: '5,5' } : undefined,
      label: edge.label
    }));
  }, [data]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Update nodes and edges when data changes
  useMemo(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  if (!data) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-slate-500">
          <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
            <RefreshCw className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-medium mb-2">No Query Loaded</h3>
          <p className="text-sm">Paste a GraphQL request in the input panel to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{
          padding: 0.2,
          minZoom: 0.1,
          maxZoom: 1.5
        }}
        className="bg-slate-50"
      >
        <Background gap={20} size={1} color="#e2e8f0" />
        <Controls className="bg-white border border-slate-200 rounded-lg shadow-sm" />
        <MiniMap 
          className="bg-white border border-slate-200 rounded-lg shadow-sm"
          nodeColor="#3b82f6"
        />
        
        <Panel position="top-right" className="bg-white border border-slate-200 rounded-lg shadow-sm p-2">
          <button
            onClick={onGenerateOutput}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Generate Output
          </button>
        </Panel>
      </ReactFlow>
    </div>
  );
}
