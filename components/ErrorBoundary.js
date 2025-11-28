import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AmharicText from '../src/components/AmharicText';
import { getColors } from '../src/theme/colors';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0,
    };
    this.maxRetries = 3;
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });

    // Log to console for debugging
    if (__DEV__) {
      console.group('🚨 Error Details');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Component Stack:', errorInfo?.componentStack);
      console.groupEnd();
    }
  }

  handleReset = () => {
    const { retryCount } = this.state;
    
    if (retryCount >= this.maxRetries) {
      // After max retries, try a full app reload
      if (this.props.onMaxRetries) {
        this.props.onMaxRetries();
      }
      return;
    }

    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: retryCount + 1,
    });
  };

  handleReload = () => {
    // Force app reload
    if (this.props.onReload) {
      this.props.onReload();
    } else {
      // Fallback: try to reset
      this.handleReset();
    }
  };

  render() {
    if (this.state.hasError) {
      const colors = getColors(false); // Default to light mode for error screen
      
      return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.iconContainer}>
              <Ionicons 
                name="alert-circle" 
                size={64} 
                color="#EF4444" 
              />
            </View>
            
            <AmharicText
              variant="largeTitle"
              color={colors.textPrimary}
              bold
              style={styles.title}
            >
              ስህተት ተፈጥሯል
            </AmharicText>
            
            <AmharicText
              variant="body"
              color={colors.textSecondary}
              style={styles.message}
            >
              መተግበሪያው በስህተት ተጋግሏል። እባክዎ መተግበሪያውን እንደገና ይጀምሩ።
            </AmharicText>

            {__DEV__ && this.state.error && (
              <View style={[styles.errorContainer, { backgroundColor: colors.surface }]}>
                <AmharicText
                  variant="caption"
                  color={colors.textSecondary}
                  style={styles.errorText}
                >
                  {this.state.error.toString()}
                </AmharicText>
                {this.state.errorInfo && (
                  <AmharicText
                    variant="small"
                    color={colors.textTertiary}
                    style={styles.errorStack}
                  >
                    {this.state.errorInfo.componentStack}
                  </AmharicText>
                )}
              </View>
            )}

            <View className="flex-row gap-3">
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#2563EB', flex: 1 }]}
                onPress={this.handleReset}
              >
                <Ionicons name="refresh" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                <AmharicText
                  variant="body"
                  color="#FFFFFF"
                  bold
                  style={styles.buttonText}
                >
                  {this.state.retryCount >= this.maxRetries ? 'እንደገና ይጀምሩ' : 'እንደገና ሞክር'}
                </AmharicText>
              </TouchableOpacity>

              {this.state.retryCount >= this.maxRetries && (
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: '#10B981', flex: 1 }]}
                  onPress={this.handleReload}
                >
                  <Ionicons name="reload" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                  <AmharicText
                    variant="body"
                    color="#FFFFFF"
                    bold
                    style={styles.buttonText}
                  >
                    አፕ እንደገና ይጀምሩ
                  </AmharicText>
                </TouchableOpacity>
              )}
            </View>

            {this.state.retryCount > 0 && (
              <AmharicText
                variant="caption"
                color={colors.textTertiary}
                style={styles.retryInfo}
              >
                ሞክሮ: {this.state.retryCount} / {this.maxRetries}
              </AmharicText>
            )}
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  errorContainer: {
    width: '100%',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    maxHeight: 200,
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  errorStack: {
    fontSize: 10,
    fontFamily: 'monospace',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    minWidth: 200,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    fontSize: 16,
  },
  retryInfo: {
    marginTop: 12,
    textAlign: 'center',
    fontSize: 12,
  },
});

export default ErrorBoundary;

