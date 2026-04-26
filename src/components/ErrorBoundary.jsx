import { Component } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="section container">
          <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={20} />
            <span>Something went wrong. Please try again.</span>
          </div>
          <button className="btn btn-primary" onClick={this.handleRetry} style={{ marginTop: '1rem' }}>
            Try Again
          </button>
          <Link to="/" className="btn btn-outline" style={{ marginTop: '1rem', marginLeft: '0.5rem' }}>
            Go Home
          </Link>
        </div>
      );
    }

    return this.props.children;
  }
}