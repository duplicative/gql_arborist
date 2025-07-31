import * as go from 'gojs';
import { ReactDiagram } from 'gojs-react';
import type { ParsedGraphQLData } from '@/react-app/types/graphql';

interface GoJsDiagramProps {
  data: ParsedGraphQLData | null;
  onUpdate: (data: ParsedGraphQLData) => void;
}

function initDiagram() {
  const $ = go.GraphObject.make;
  const diagram = $(go.Diagram, {
    'undoManager.isEnabled': true,
    'animationManager.isEnabled': false,
    layout: $(go.TreeLayout, {
      angle: 90,
      layerSpacing: 50,
      nodeSpacing: 20,
    }),
  });

  // Tell the model to use the 'key' property to identify links
  diagram.model = new go.GraphLinksModel({
    linkKeyProperty: 'key'
  });

  diagram.nodeTemplate = $(
    go.Node,
    'Auto',
    {
      selectionChanged: (node) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (node.isSelected) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
          node.layerName = 'Foreground';
        } else {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
          node.layerName = '';
        }
      },
    },
    $(go.Shape, 'RoundedRectangle', {
      fill: 'white', // Default color
      stroke: '#ddd',
      strokeWidth: 1,
    },
    new go.Binding('fill', 'type', (type) => {
      if (type === 'fragment') {
        return '#2ec27eb2';
      }
      if (type === 'variable') {
        return '#f8e45c99';
      }
      return 'white';
    })
  ),
    $(
      go.Panel,
      'Vertical',
      { margin: 10 },
      $(
        go.TextBlock,
        {
          font: 'bold 14px sans-serif',
          margin: new go.Margin(0, 0, 5, 0),
          stroke: '#333',
          editable: true, // Allow text editing
        },
        new go.Binding('text', 'label').makeTwoWay() // Two-way binding
      ),
      $(
        go.TextBlock,
        {
          font: '12px sans-serif',
          stroke: '#666',
        },
        new go.Binding('text', 'type', (type) => `Type: ${type}`)
      )
    )
  );

  diagram.linkTemplate = $(
    go.Link,
    { routing: go.Link.Orthogonal, corner: 10 },
    $(go.Shape, { strokeWidth: 2, stroke: '#62a0eacc' }),
    $(go.Shape, { toArrow: 'Standard', stroke: '#bbb', fill: '#bbb' })
  );

  return diagram;
}

export default function GoJsDiagram({ data, onUpdate }: GoJsDiagramProps) {
  if (!data) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-slate-500">
          <h3 className="text-lg font-medium mb-2">No Query Loaded</h3>
          <p className="text-sm">
            Paste a GraphQL request in the input panel to get started
          </p>
        </div>
      </div>
    );
  }

  const handleModelChange = (e: go.IncrementalData) => {
    if (!data) return;

    const modifiedNodeData = e.modifiedNodeData;
    if (!modifiedNodeData) return;

    const newNodes = data.nodes.map(n => {
      const modified = modifiedNodeData.find(m => m.key === n.id);
      if (modified) {
        return { ...n, label: modified.label };
      }
      return n;
    });

    const updatedData = { ...data, nodes: newNodes };
    onUpdate(updatedData);
  };

  const nodes = data.nodes.map((node) => ({
    key: node.id,
    label: node.label,
    type: node.data.fieldType,
  }));

  const links = data.edges.map((edge) => ({
    key: edge.id,
    from: edge.source,
    to: edge.target,
  }));

  return (
    <ReactDiagram
      initDiagram={initDiagram}
      divClassName="w-full h-full bg-slate-50"
      nodeDataArray={nodes}
      linkDataArray={links}
      onModelChange={handleModelChange}
    />
  );
}
