import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import InputPanel from '@/react-app/components/InputPanel';
import GoJsDiagram from '@/react-app/components/GoJsDiagram';
import OutputPanel from '@/react-app/components/OutputPanel';
import { parseGraphQLInput } from '@/react-app/utils/graphql-parser';
import type { ParsedGraphQLData } from '@/react-app/types/graphql';

export default function Home() {
  const [parsedData, setParsedData] = useState<ParsedGraphQLData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [outputJSON, setOutputJSON] = useState<string>('');
  const [isOutputPanelCollapsed, setIsOutputPanelCollapsed] = useState<boolean>(false);

  const handleInputSubmit = (input: string) => {
    try {
      const parsed = parseGraphQLInput(input);
      setParsedData(parsed);
      setError(null);
      if (parsed) {
        const output = {
          operationName: parsed.operationName,
          variables: parsed.variables,
          query: parsed.query
        };
        setOutputJSON(JSON.stringify(output, null, 2));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse GraphQL input');
      setParsedData(null);
    }
  };

  const handleDiagramUpdate = (updatedData: ParsedGraphQLData) => {
    setParsedData(updatedData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-slate-800">GraphQL Canvas</h1>
          <p className="text-sm text-slate-600 mt-1">Visual GraphQL query builder and editor</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Input Panel */}
        <div className="w-1/3 border-r border-slate-200 bg-white">
          <InputPanel onSubmit={handleInputSubmit} error={error} />
        </div>

        {/* Diagram Canvas */}
        <div className={`flex-1 bg-slate-50 ${isOutputPanelCollapsed ? '' : 'border-r border-slate-200'}`}>
          <GoJsDiagram 
            data={parsedData}
            onUpdate={handleDiagramUpdate}
          />
        </div>

        {/* Output Panel Toggle Button */}
        {isOutputPanelCollapsed && (
          <div className="flex items-center bg-white border-l border-slate-200">
            <button
              onClick={() => setIsOutputPanelCollapsed(false)}
              className="h-full w-10 flex items-center justify-center bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800 transition-colors border-r border-slate-200"
              title="Show Output Panel"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Output Panel */}
        {!isOutputPanelCollapsed && (
          <div className="w-1/3 border-l border-slate-200 bg-white relative">
            <button
              onClick={() => setIsOutputPanelCollapsed(true)}
              className="absolute top-4 right-4 z-10 p-1.5 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800 rounded border border-slate-200 shadow-sm transition-colors"
              title="Hide Output Panel"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <OutputPanel output={outputJSON} />
          </div>
        )}
      </div>
    </div>
  );
}
