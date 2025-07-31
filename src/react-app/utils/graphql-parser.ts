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

  const fragments = new Map<string, FragmentDefinitionNode>();

  visit(ast, {
    FragmentDefinition(node) {
      fragments.set(node.name.value, node);
    }
  });

  visit(ast, {
    OperationDefinition(node: OperationDefinitionNode) {
      const operationName = node.name?.value || 'Anonymous';
      const rootId = `node-${nodeIdRef.value++}`;
      
      nodes.push({
        id: rootId,
        type: 'operation',
        label: `${node.operation}: ${operationName}`,
        data: {
          name: operationName,
          isRoot: true,
          fieldType: node.operation
        },
        // Position is no longer needed
        position: { x: 0, y: 0 }
      });

      if (node.selectionSet) {
        processSelectionSet(node.selectionSet, rootId, nodes, edges, fragments, nodeIdRef);
      }
    }
  });

  const variables = inputData.variables || {};
  Object.entries(variables).forEach(([key, value]) => {
    const varId = `var-${key}`;
    nodes.push({
      id: varId,
      type: 'variable',
      label: `$${key}`,
      data: {
        name: key,
        value: value,
        fieldType: 'variable'
      },
      position: { x: 0, y: 0 }
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

function processSelectionSet(
  selectionSet: any,
  parentId: string,
  nodes: GraphQLNode[],
  edges: GraphQLEdge[],
  fragments: Map<string, FragmentDefinitionNode>,
  nodeIdRef: { value: number }
) {
  selectionSet.selections.forEach((selection: any) => {
    const nodeId = `node-${nodeIdRef.value++}`;

    if (selection.kind === 'Field') {
      nodes.push({
        id: nodeId,
        type: 'field',
        label: selection.name.value,
        data: {
          name: selection.name.value,
          fieldType: 'field',
          arguments: selection.arguments ? 
            selection.arguments.reduce((acc: any, arg: any) => {
              acc[arg.name.value] = arg.value.value;
              return acc;
            }, {}) : undefined
        },
        position: { x: 0, y: 0 }
      });

      edges.push({
        id: `${parentId}-${nodeId}`,
        source: parentId,
        target: nodeId,
      });

      if (selection.selectionSet) {
        processSelectionSet(selection.selectionSet, nodeId, nodes, edges, fragments, nodeIdRef);
      }
    } else if (selection.kind === 'FragmentSpread') {
      const fragmentName = selection.name.value;
      const fragment = fragments.get(fragmentName);
      
      nodes.push({
        id: nodeId,
        type: 'fragment',
        label: `...${fragmentName}`,
        data: {
          name: fragmentName,
          fieldType: 'fragment'
        },
        position: { x: 0, y: 0 }
      });

      edges.push({
        id: `${parentId}-${nodeId}`,
        source: parentId,
        target: nodeId,
        type: 'fragment'
      });

      if (fragment && fragment.selectionSet) {
        processSelectionSet(fragment.selectionSet, nodeId, nodes, edges, fragments, nodeIdRef);
      }
    }
  });
}