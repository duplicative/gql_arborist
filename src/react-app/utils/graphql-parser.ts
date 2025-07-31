import { parse, visit, OperationDefinitionNode, FragmentDefinitionNode } from 'graphql';
import type { ParsedGraphQLData, GraphQLNode, GraphQLEdge, GraphQLInputData } from '@/react-app/types/graphql';

export function parseGraphQLInput(input: string): ParsedGraphQLData {
  let inputData: GraphQLInputData;
  
  try {
    inputData = JSON.parse(input);
  } catch (err) {
    throw new Error('Invalid JSON format');
  }

  if (!inputData.query || typeof inputData.query !== 'string') {
    throw new Error('Missing or invalid "query" field');
  }

  let ast;
  try {
    ast = parse(inputData.query);
  } catch (err) {
    throw new Error(`Invalid GraphQL query: ${err instanceof Error ? err.message : 'Parse error'}`);
  }

  const nodes: GraphQLNode[] = [];
  const edges: GraphQLEdge[] = [];
  const nodeIdRef = { value: 0 };

  // Track fragments
  const fragments = new Map<string, FragmentDefinitionNode>();

  // First pass: collect fragments
  visit(ast, {
    FragmentDefinition(node) {
      fragments.set(node.name.value, node);
    }
  });

  // Second pass: build the graph
  visit(ast, {
    OperationDefinition(node: OperationDefinitionNode) {
      const operationName = node.name?.value || 'Anonymous';
      const rootId = `node-${nodeIdRef.value++}`;
      
      nodes.push({
        id: rootId,
        type: 'operation',
        label: `${node.operation}: ${operationName}`,
        position: { x: 250, y: 50 },
        data: {
          name: operationName,
          isRoot: true,
          fieldType: node.operation
        }
      });

      // Process selection set
      if (node.selectionSet) {
        processSelectionSet(node.selectionSet, rootId, nodes, edges, fragments, nodeIdRef, 0, 100);
      }
    }
  });

  // Add variable nodes
  const variables = inputData.variables || {};
  Object.entries(variables).forEach(([key, value], index) => {
    const varId = `var-${key}`;
    nodes.push({
      id: varId,
      type: 'variable',
      label: `$${key}`,
      position: { x: 50, y: 100 + index * 60 },
      data: {
        name: key,
        value: value,
        fieldType: 'variable'
      }
    });
  });

  return {
    operationName: inputData.operationName || null,
    variables: variables,
    query: inputData.query,
    ast,
    nodes,
    edges
  };
}

// Tree layout configuration
const TREE_CONFIG = {
  levelWidth: 300,    // Horizontal spacing between levels
  nodeHeight: 120,    // Vertical spacing between nodes
  nodeWidth: 200,     // Average node width for centering
  startX: 150,        // Starting X position
  startY: 100         // Starting Y position
};



function calculateTreeLayout(
  selectionSet: any,
  level: number,
  fragments: Map<string, FragmentDefinitionNode>
): { nodes: any[], totalWidth: number } {
  const nodes: any[] = [];
  let totalWidth = 0;
  
  // Group selections by type
  const fieldsWithSelections: any[] = [];
  const leafFields: string[] = [];
  const fragmentSpreads: any[] = [];
  
  selectionSet.selections.forEach((selection: any) => {
    if (selection.kind === 'Field') {
      if (selection.selectionSet) {
        fieldsWithSelections.push(selection);
      } else {
        leafFields.push(selection.name.value);
      }
    } else if (selection.kind === 'FragmentSpread') {
      fragmentSpreads.push(selection);
    }
  });

  // Add grouped leaf fields as one node
  if (leafFields.length > 0) {
    nodes.push({
      type: 'fieldGroup',
      data: {
        name: 'Fields',
        fieldType: 'fieldGroup',
        fields: leafFields
      },
      width: Math.max(200, leafFields.length * 60),
      children: []
    });
  }

  // Add fields with selection sets
  fieldsWithSelections.forEach((selection: any) => {
    const childLayout = calculateTreeLayout(selection.selectionSet, level + 1, fragments);
    nodes.push({
      type: 'field',
      data: {
        name: selection.name.value,
        fieldType: 'field',
        arguments: selection.arguments ? 
          selection.arguments.reduce((acc: any, arg: any) => {
            acc[arg.name.value] = arg.value.value;
            return acc;
          }, {}) : undefined
      },
      width: Math.max(200, childLayout.totalWidth),
      children: childLayout.nodes
    });
  });

  // Add fragment spreads
  fragmentSpreads.forEach((selection: any) => {
    const fragmentName = selection.name.value;
    const fragment = fragments.get(fragmentName);
    
    if (fragment && fragment.selectionSet) {
      const childLayout = calculateTreeLayout(fragment.selectionSet, level + 1, fragments);
      nodes.push({
        type: 'fragment',
        data: {
          name: fragmentName,
          fieldType: 'fragment'
        },
        width: Math.max(200, childLayout.totalWidth),
        children: childLayout.nodes
      });
    } else {
      nodes.push({
        type: 'fragment',
        data: {
          name: fragmentName || 'Unknown Fragment',
          fieldType: 'fragment'
        },
        width: 200,
        children: []
      });
    }
  });

  // Calculate total width needed for this level
  totalWidth = nodes.reduce((sum, node) => sum + node.width + 50, 0);
  
  return { nodes, totalWidth: Math.max(totalWidth, 200) };
}

function positionTreeNodes(
  treeNodes: any[],
  level: number,
  centerX: number,
  startY: number,
  graphqlNodes: GraphQLNode[],
  edges: GraphQLEdge[],
  nodeIdRef: { value: number },
  parentId?: string
): number {
  if (treeNodes.length === 0) return startY;
  
  // Calculate total width of all nodes at this level
  const totalWidth = treeNodes.reduce((sum, node) => sum + node.width + 50, -50);
  
  // Starting position to center all nodes
  let currentX = centerX - totalWidth / 2;
  let maxY = startY;
  
  treeNodes.forEach((treeNode) => {
    const nodeId = `node-${nodeIdRef.value++}`;
    const nodeX = currentX + treeNode.width / 2;
    const nodeY = startY;
    
    // Create the GraphQL node
    graphqlNodes.push({
      id: nodeId,
      type: treeNode.type,
      label: treeNode.type === 'fieldGroup' ? 
        treeNode.data.fields.join(', ') : 
        treeNode.data.name,
      position: { x: nodeX, y: nodeY },
      data: treeNode.data
    });
    
    // Create edge to parent if exists
    if (parentId) {
      edges.push({
        id: `${parentId}-${nodeId}`,
        source: parentId,
        target: nodeId,
        type: treeNode.type === 'fragment' ? 'fragment' : undefined
      });
    }
    
    // Position children
    if (treeNode.children && treeNode.children.length > 0) {
      const childrenMaxY = positionTreeNodes(
        treeNode.children,
        level + 1,
        nodeX,
        nodeY + TREE_CONFIG.nodeHeight,
        graphqlNodes,
        edges,
        nodeIdRef,
        nodeId
      );
      maxY = Math.max(maxY, childrenMaxY);
    } else {
      maxY = Math.max(maxY, nodeY);
    }
    
    currentX += treeNode.width + 50;
  });
  
  return maxY;
}

function processSelectionSet(
  selectionSet: any,
  parentId: string,
  nodes: GraphQLNode[],
  edges: GraphQLEdge[],
  fragments: Map<string, FragmentDefinitionNode>,
  nodeIdRef: { value: number },
  level: number,
  yOffset: number
): number {
  // Calculate tree layout
  const treeLayout = calculateTreeLayout(selectionSet, level, fragments);
  
  // Find parent node to get its position
  const parentNode = nodes.find(n => n.id === parentId);
  const centerX = parentNode ? parentNode.position.x : TREE_CONFIG.startX;
  
  // Position nodes using tree layout
  return positionTreeNodes(
    treeLayout.nodes,
    level,
    centerX,
    yOffset,
    nodes,
    edges,
    nodeIdRef,
    parentId
  );
}
