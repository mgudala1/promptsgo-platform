import React from 'react';

function App() {
  return (
    <div style={{
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <header style={{
        textAlign: 'center',
        marginBottom: '40px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px'
      }}>
        <h1 style={{ color: '#0969da', margin: '0 0 10px 0' }}>
          🎉 PromptsGo is Working!
        </h1>
        <p style={{ color: '#656d76', margin: '0' }}>
          React and Vite are properly configured
        </p>
      </header>

      <main>
        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#24292f' }}>✅ What's Working:</h2>
          <ul style={{ lineHeight: '1.6' }}>
            <li>✅ Vite development server</li>
            <li>✅ React rendering</li>
            <li>✅ TypeScript compilation</li>
            <li>✅ CSS styling</li>
            <li>✅ Hot module replacement</li>
          </ul>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ color: '#24292f' }}>🔄 Next Steps:</h2>
          <ol style={{ lineHeight: '1.6' }}>
            <li>Run the database schema in Supabase</li>
            <li>Configure authentication</li>
            <li>Test full application features</li>
          </ol>
        </section>

        <section style={{
          padding: '20px',
          backgroundColor: '#f6f8fa',
          borderRadius: '8px',
          border: '1px solid #d1d9e0'
        }}>
          <h3 style={{ color: '#24292f', margin: '0 0 15px 0' }}>
            🚀 Ready to Continue?
          </h3>
          <p style={{ margin: '0 0 15px 0', color: '#656d76' }}>
            Once you run the database schema in Supabase, the full application will load.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#0969da',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🔄 Check Again
          </button>
        </section>
      </main>

      <footer style={{
        marginTop: '40px',
        padding: '20px',
        textAlign: 'center',
        color: '#656d76',
        borderTop: '1px solid #d1d9e0'
      }}>
        <p>PromptsGo - Professional AI Prompt Management</p>
      </footer>
    </div>
  );
}

export default App;