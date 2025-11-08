import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    this.setState({ error, info });
    // Log to console as well
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, fontFamily: "sans-serif" }}>
          <h1>Something went wrong</h1>
          <pre style={{ whiteSpace: "pre-wrap", background: "#fee", padding: 12, borderRadius: 6 }}>
            {String(this.state.error)}
            {this.state.info?.componentStack ? "\n\n" + this.state.info.componentStack : ""}
          </pre>
          <p>Please open the devtools console for more details.</p>
        </div>
      );
    }

    return this.props.children;
  }
}
