export interface ParsedGraphQLData {
  operationName: string | null;
  variables: Record<string, any>;
  query: string;
  ast: any; // GraphQL AST
  nodes: GraphQLNode[];
  edges: GraphQLEdge[];
}

export interface GraphQLNode {
  id: string;
  type: 'operation' | 'field' | 'fragment' | 'variable' | 'fieldGroup';
  label: string;
  position: { x: number; y: number };
  data: {
    name: string;
    value?: any;
    arguments?: Record<string, any>;
    fieldType?: string;
    isRoot?: boolean;
    fields?: string[]; // For grouped fields
  };
}

export interface GraphQLEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  label?: string;
}

export interface GraphQLInputData {
  operationName?: string;
  variables?: Record<string, any>;
  query: string;
}
