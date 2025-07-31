import { useState } from 'react';
import { Play, AlertCircle } from 'lucide-react';

interface InputPanelProps {
  onSubmit: (input: string) => void;
  error: string | null;
}

const EXAMPLE_INPUT = `{
  "operationName": "getUsers",
  "variables": {
    "orgId": "812ddf56-2fbc-4996-9279-3b12421026f9"
  },
  "query": "query getUsers($orgId: ID!) {\\n  organization(orgId: $orgId) {\\n    name\\n    description\\n    id\\n    ...fieldsOnOrganizationWithUsers\\n    __typename\\n  }\\n}\\n\\nfragment fieldsOnOrganizationWithUsers on Organization {\\n  users {\\n    orgId\\n    orgName\\n    usersList {\\n      email\\n      userId\\n      status\\n      roles {\\n        id\\n        name\\n        __typename\\n      }\\n      __typename\\n    }\\n    __typename\\n  }\\n  __typename\\n}"
}`;

export default function InputPanel({ onSubmit, error }: InputPanelProps) {
  const [input, setInput] = useState('');

  const handleSubmit = () => {
    if (input.trim()) {
      onSubmit(input.trim());
    }
  };

  const handleLoadExample = () => {
    setInput(EXAMPLE_INPUT);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800 mb-2">GraphQL Input</h2>
        <p className="text-sm text-slate-600">
          Paste your GraphQL HTTP request body (JSON format)
        </p>
      </div>

      <div className="flex-1 p-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste your GraphQL request JSON here..."
          className="w-full h-full resize-none border border-slate-300 rounded-lg p-3 text-sm font-mono bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
        />
      </div>

      {error && (
        <div className="mx-4 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      <div className="p-4 border-t border-slate-200 space-y-2">
        <button
          onClick={handleSubmit}
          disabled={!input.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Play className="w-4 h-4" />
          Visualize Query
        </button>
        
        <button
          onClick={handleLoadExample}
          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Load Example
        </button>
      </div>
    </div>
  );
}
