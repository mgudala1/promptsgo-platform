import React, { useState, useEffect } from 'react';
import { AppProvider } from "./contexts/AppContext";

function DebugApp() {
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    const runDebug = async () => {
      addLog("🚀 Debug App Started");
      addLog("📦 Checking imports...");

      try {
        // Test basic React functionality
        addLog("✅ React is working");

        // Test if we can import components
        addLog("🔍 Testing component imports...");

        // Test Supabase import (using dynamic import for ES modules)
        try {
          const supabaseModule = await import('./lib/supabase');
          if (supabaseModule.supabase) {
            addLog("✅ Supabase client imported successfully");
          }
        } catch (err) {
          addLog(`❌ Supabase import failed: ${err}`);
        }

        // Test environment variables
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

        if (supabaseUrl && supabaseKey) {
          addLog("✅ Environment variables are set");
          addLog(`📍 Supabase URL: ${supabaseUrl.substring(0, 30)}...`);
        } else {
          addLog("❌ Environment variables missing");
          setError("Environment variables not configured");
        }

      } catch (err) {
        addLog(`❌ Error during initialization: ${err}`);
        setError(`Initialization error: ${err}`);
      }
    };

    runDebug();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">🔧 PromptsGo Debug Mode</h1>
          <p className="text-gray-600 mb-4">
            This debug version helps identify what's preventing the main app from loading.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
              <h2 className="text-red-800 font-semibold">❌ Error Detected</h2>
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
            <h2 className="text-green-800 font-semibold">✅ What's Working</h2>
            <ul className="text-green-700 list-disc list-inside">
              <li>React is rendering</li>
              <li>Vite dev server is running</li>
              <li>Tailwind CSS is loaded</li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">📋 Debug Logs</h2>
          <div className="bg-gray-50 rounded-md p-4 max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500">Loading logs...</p>
            ) : (
              <div className="space-y-1 font-mono text-sm">
                {logs.map((log, index) => (
                  <div key={index} className="text-gray-700">{log}</div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
          <h3 className="text-blue-800 font-semibold mb-2">🔄 Next Steps</h3>
          <p className="text-blue-700 mb-2">
            If you see this page, the basic setup is working. The issue is likely in:
          </p>
          <ul className="text-blue-700 list-disc list-inside text-sm">
            <li>AppProvider/AppContext initialization</li>
            <li>Component imports or dependencies</li>
            <li>Supabase connection issues</li>
          </ul>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
          >
            🔄 Reload Page
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <DebugApp />
    </AppProvider>
  );
}