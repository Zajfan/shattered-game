import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{
          background: '#0a0a08', color: '#c8922a', fontFamily: 'monospace',
          padding: '40px', minHeight: '100vh', display: 'flex',
          flexDirection: 'column', gap: '16px',
        }}>
          <div style={{ fontSize: '1.4em', letterSpacing: '0.2em' }}>SHATTERED — SYSTEM ERROR</div>
          <div style={{ color: '#c0392b', fontSize: '0.9em' }}>{this.state.error.message}</div>
          <div style={{ color: '#5a5248', fontSize: '0.8em', whiteSpace: 'pre-wrap' }}>
            {this.state.error.stack}
          </div>
          <button
            onClick={() => { localStorage.clear(); window.location.reload(); }}
            style={{ marginTop: '24px', background: '#c0392b', color: '#fff', border: 'none', padding: '12px 24px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '0.9em', width: 'fit-content' }}
          >
            CLEAR SAVE DATA &amp; RELOAD
          </button>
          <button
            onClick={() => window.location.reload()}
            style={{ background: 'transparent', color: '#c8922a', border: '1px solid #c8922a', padding: '10px 24px', cursor: 'pointer', fontFamily: 'monospace', fontSize: '0.9em', width: 'fit-content' }}
          >
            RELOAD WITHOUT CLEARING
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
