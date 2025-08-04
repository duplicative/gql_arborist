import { useState } from 'react';
import { Copy, Check, Download } from 'lucide-react';

interface OutputPanelProps {
  output: string;
}

export default function OutputPanel({ output }: OutputPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-slate-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-gray-100 mb-2">Generated Output</h2>
        <p className="text-sm text-slate-600 dark:text-gray-400">
          GraphQL HTTP request body (JSON)
        </p>
      </div>

      <div className="flex-1 p-4">
        {output ? (
          <div className="h-full relative">
            <textarea
              value={output}
              readOnly
              className="w-full h-full resize-none border border-slate-300 rounded-lg p-3 text-sm font-mono bg-slate-50 focus:outline-none dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300"
            />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-slate-500 dark:text-gray-500">
              <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center dark:bg-gray-800">
                <Download className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-medium mb-2">No Output Generated</h3>
              <p className="text-sm">Click "Generate Output" to create the JSON</p>
            </div>
          </div>
        )}
      </div>

      {output && (
        <div className="p-4 border-t border-slate-200 dark:border-gray-700">
          <button 
            onClick={handleCopy}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-600" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy to Clipboard
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
