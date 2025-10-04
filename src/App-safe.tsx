import React from 'react';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🚀</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">PromptsGo</h1>
        <p className="text-gray-600 mb-4">React is working! The app is loading successfully.</p>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Status: ✅ Working</h2>
          <p className="text-sm text-gray-500">
            If you see this, React and Vite are functioning correctly.
            The issue is likely with the main App.tsx and Supabase integration.
          </p>
        </div>
      </div>
    </div>
  );
}