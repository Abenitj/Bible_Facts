import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * Safe wrapper for context providers that catches errors
 * and provides fallback UI if provider fails
 */
export function SafeProvider({ children, provider: Provider, fallback, name }) {
  const [hasError, setHasError] = React.useState(false);
  const [error, setError] = React.useState(null);

  if (hasError) {
    console.error(`Error in ${name} provider:`, error);
    if (fallback) {
      return fallback;
    }
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {name} provider error. App will continue with limited functionality.
        </Text>
      </View>
    );
  }

  try {
    return (
      <ErrorBoundary
        onError={(error) => {
          setHasError(true);
          setError(error);
        }}
        fallback={fallback}
      >
        <Provider>{children}</Provider>
      </ErrorBoundary>
    );
  } catch (error) {
    setHasError(true);
    setError(error);
    if (fallback) {
      return fallback;
    }
    return <View style={styles.errorContainer}>{children}</View>;
  }
}

// Simple ErrorBoundary for providers
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    if (this.props.onError) {
      this.props.onError(error);
    }
    console.error('Provider ErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || this.props.children;
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
  },
});

export default SafeProvider;

