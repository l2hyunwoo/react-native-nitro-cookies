/**
 * Simplified Example App for React Native Nitro Cookies
 * WebView with Cookie Inspector Bottom Sheet
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Platform,
  ScrollView,
  Animated,
  Dimensions,
  PanResponder,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import NitroCookies from 'react-native-nitro-cookies';
import type { Cookie } from 'react-native-nitro-cookies';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const BOTTOM_SHEET_MIN_HEIGHT = 160;
const BOTTOM_SHEET_MAX_HEIGHT = SCREEN_HEIGHT * 0.6;

function AppContent() {
  const insets = useSafeAreaInsets();
  const [url, setUrl] = useState('https://naver.com');
  const [currentUrl, setCurrentUrl] = useState('https://naver.com');
  const [cookies, setCookies] = useState<Cookie[]>([]);
  const [loading, setLoading] = useState(false);

  // Bottom sheet animation
  const bottomSheetHeight = useRef(
    new Animated.Value(BOTTOM_SHEET_MIN_HEIGHT)
  ).current;
  const [isExpanded, setIsExpanded] = useState(false);

  // WebView ref for reload
  const webViewRef = useRef<WebView>(null);

  const toggleBottomSheet = useCallback(() => {
    const toValue = isExpanded
      ? BOTTOM_SHEET_MIN_HEIGHT
      : BOTTOM_SHEET_MAX_HEIGHT;

    Animated.spring(bottomSheetHeight, {
      toValue,
      useNativeDriver: false,
      tension: 50,
      friction: 8,
    }).start();

    setIsExpanded(!isExpanded);
  }, [isExpanded, bottomSheetHeight]);

  // Pan responder for dragging bottom sheet
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to vertical drags
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        const newHeight = isExpanded
          ? BOTTOM_SHEET_MAX_HEIGHT - gestureState.dy
          : BOTTOM_SHEET_MIN_HEIGHT - gestureState.dy;

        if (
          newHeight >= BOTTOM_SHEET_MIN_HEIGHT &&
          newHeight <= BOTTOM_SHEET_MAX_HEIGHT
        ) {
          bottomSheetHeight.setValue(newHeight);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const threshold = (BOTTOM_SHEET_MAX_HEIGHT + BOTTOM_SHEET_MIN_HEIGHT) / 2;
        const currentHeight = isExpanded
          ? BOTTOM_SHEET_MAX_HEIGHT - gestureState.dy
          : BOTTOM_SHEET_MIN_HEIGHT - gestureState.dy;

        if (currentHeight > threshold) {
          // Expand
          Animated.spring(bottomSheetHeight, {
            toValue: BOTTOM_SHEET_MAX_HEIGHT,
            useNativeDriver: false,
            tension: 50,
            friction: 8,
          }).start();
          setIsExpanded(true);
        } else {
          // Collapse
          Animated.spring(bottomSheetHeight, {
            toValue: BOTTOM_SHEET_MIN_HEIGHT,
            useNativeDriver: false,
            tension: 50,
            friction: 8,
          }).start();
          setIsExpanded(false);
        }
      },
    })
  ).current;

  // Synchronous API demo - uses getSync() for immediate cookie access
  const loadCookiesSync = useCallback(() => {
    setLoading(true);
    try {
      // Use synchronous getSync() - no await needed! Returns Cookies dictionary
      const cookiesDict = NitroCookies.getSync(currentUrl);
      const cookieArray = Object.values(cookiesDict) as Cookie[];
      console.log('[SYNC] Cookies:', JSON.stringify(cookieArray, null, 2));

      if (Platform.OS === 'ios') {
        // On iOS, filter by domain
        const domain = new URL(currentUrl).hostname;
        const filtered = cookieArray.filter(
          (cookie: Cookie) =>
            cookie.domain === domain || cookie.domain === `.${domain}`
        );
        setCookies(filtered);
      } else {
        setCookies(cookieArray || []);
      }
    } catch (error) {
      console.error('[SYNC] Failed to load cookies:', error);
      setCookies([]);
    } finally {
      setLoading(false);
    }
  }, [currentUrl]);

  // Asynchronous API - uses get() with Promise, supports WebKit on iOS
  const loadCookies = useCallback(async () => {
    setLoading(true);
    try {
      if (Platform.OS === 'ios') {
        // iOS: get all cookies from all domains, convert dictionary to array for display
        const allCookiesDict = await NitroCookies.getAll();
        const allCookies = Object.values(allCookiesDict) as Cookie[];
        console.log('[ASYNC] iOS All cookies:', JSON.stringify(allCookies, null, 2));

        // Filter cookies for current domain
        const domain = new URL(currentUrl).hostname;
        const filtered = allCookies.filter(
          (cookie: Cookie) =>
            cookie.domain === domain || cookie.domain === `.${domain}`
        );
        console.log('[ASYNC] iOS Filtered cookies:', JSON.stringify(filtered, null, 2));
        setCookies(filtered);
      } else {
        // Android: get cookies for specific URL, convert dictionary to array for display
        const cookiesDict = await NitroCookies.get(currentUrl);
        const cookieArray = Object.values(cookiesDict) as Cookie[];
        console.log('[ASYNC] Android Cookies:', JSON.stringify(cookieArray, null, 2));

        setCookies(cookieArray);
      }
    } catch (error) {
      console.error('[ASYNC] Failed to load cookies:', error);
      setCookies([]);
    } finally {
      setLoading(false);
    }
  }, [currentUrl]);

  // Demo: Test synchronous write operations
  const testSyncWrite = useCallback(() => {
    try {
      const testCookie = {
        name: 'nitro_sync_test',
        value: `sync_${Date.now()}`,
        path: '/',
        secure: false,
        httpOnly: false,
      };

      // Synchronous set - no await needed!
      const success = NitroCookies.setSync(currentUrl, testCookie);
      console.log('[SYNC] setSync result:', success);

      // Immediately read back with synchronous get
      const cookies = NitroCookies.getSync(currentUrl);
      console.log('[SYNC] getSync after setSync:', JSON.stringify(cookies, null, 2));

      // Update UI
      loadCookiesSync();
    } catch (error) {
      console.error('[SYNC] Write test failed:', error);
    }
  }, [currentUrl, loadCookiesSync]);

  const handleLoadEnd = useCallback(() => {
    loadCookies();
  }, [loadCookies]);

  const handleNavigate = useCallback(() => {
    setCurrentUrl(url);
    webViewRef.current?.reload();
  }, [url]);

  const handleRefresh = useCallback(() => {
    webViewRef.current?.reload();
    loadCookies();
  }, [loadCookies]);

  const formatCookieValue = (value: any) => {
    // Safely convert to string
    let stringValue: string;
    if (typeof value === 'string') {
      stringValue = value;
    } else if (typeof value === 'object' && value !== null) {
      stringValue = JSON.stringify(value, null, 2);
    } else {
      stringValue = String(value);
    }

    if (stringValue.length > 100) {
      return stringValue.substring(0, 97) + '...';
    }
    return stringValue;
  };

  const safeString = (value: any) => {
    if (value === null || value === undefined) {
      return 'N/A';
    }
    if (typeof value === 'string') {
      return value;
    }
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nitro Cookies</Text>
        <Text style={styles.headerSubtitle}>WebView Cookie Inspector</Text>
      </View>

        {/* URL Input */}
        <View style={styles.urlBar}>
          <TextInput
            style={styles.urlInput}
            value={url}
            onChangeText={setUrl}
            placeholder="Enter URL..."
            placeholderTextColor="#999"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            returnKeyType="go"
            onSubmitEditing={handleNavigate}
          />
          <TouchableOpacity style={styles.goButton} onPress={handleNavigate}>
            <Text style={styles.goButtonText}>Go</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
            <Text style={styles.refreshButtonText}>↻</Text>
          </TouchableOpacity>
        </View>

        {/* Sync API Demo Buttons */}
        <View style={styles.syncApiBar}>
          <TouchableOpacity style={styles.syncButton} onPress={loadCookiesSync}>
            <Text style={styles.syncButtonText}>getSync()</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.syncButton} onPress={testSyncWrite}>
            <Text style={styles.syncButtonText}>setSync() Test</Text>
          </TouchableOpacity>
          <Text style={styles.syncApiLabel}>Sync API Demo</Text>
        </View>

        {/* WebView */}
        <View style={styles.webViewContainer}>
          <WebView
            ref={webViewRef}
            style={styles.webView}
            source={{ uri: currentUrl }}
            onLoadEnd={handleLoadEnd}
            onError={(syntheticEvent) => {
              console.error('[WebView] Error:', syntheticEvent.nativeEvent);
            }}
            sharedCookiesEnabled={true}
            thirdPartyCookiesEnabled={true}
            javaScriptEnabled={true}
            domStorageEnabled={true}
          />
        </View>

        {/* Bottom Sheet */}
        <Animated.View
          style={[
            styles.bottomSheet,
            {
              height: bottomSheetHeight,
              paddingBottom: insets.bottom,
            }
          ]}
        >
          {/* Drag Handle */}
          <View style={styles.dragHandleContainer} {...panResponder.panHandlers}>
            <View style={styles.dragHandle} />
          </View>

          {/* Header */}
          <TouchableOpacity
            style={styles.bottomSheetHeader}
            onPress={toggleBottomSheet}
          >
            <Text style={styles.bottomSheetTitle}>
              Cookies ({cookies.length})
            </Text>
            <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▲'}</Text>
          </TouchableOpacity>

          {/* Cookie List */}
          {isExpanded && (
            <ScrollView
              style={styles.cookieList}
              contentContainerStyle={styles.cookieListContent}
            >
              {loading ? (
                <Text style={styles.emptyText}>Loading cookies...</Text>
              ) : cookies.length === 0 ? (
                <Text style={styles.emptyText}>No cookies for this domain</Text>
              ) : (
                cookies.map((cookie, index) => (
                  <View key={`${safeString(cookie.name)}-${index}`} style={styles.cookieItem}>
                    <View style={styles.cookieHeader}>
                      <Text style={styles.cookieName}>{safeString(cookie.name)}</Text>
                      {cookie.secure && (
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>Secure</Text>
                        </View>
                      )}
                      {cookie.httpOnly && (
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>HttpOnly</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.cookieValue}>
                      {formatCookieValue(cookie.value)}
                    </Text>
                    <View style={styles.cookieMetadata}>
                      <Text style={styles.metadataText}>
                        Domain: {safeString(cookie.domain)}
                      </Text>
                      <Text style={styles.metadataText}>
                        Path: {safeString(cookie.path)}
                      </Text>
                      {cookie.expires && (
                        <Text style={styles.metadataText}>
                          Expires: {typeof cookie.expires === 'string'
                            ? new Date(cookie.expires).toLocaleString()
                            : safeString(cookie.expires)}
                        </Text>
                      )}
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          )}
        </Animated.View>
      </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E3F2FD',
  },
  urlBar: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    gap: 8,
  },
  urlInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
  },
  goButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  refreshButton: {
    backgroundColor: '#34C759',
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  syncApiBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#FFF3E0',
    borderBottomWidth: 1,
    borderBottomColor: '#FFE0B2',
    gap: 8,
  },
  syncButton: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  syncButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  syncApiLabel: {
    marginLeft: 'auto',
    fontSize: 12,
    color: '#E65100',
    fontWeight: '500',
  },
  webViewContainer: {
    flex: 1,
    marginBottom: BOTTOM_SHEET_MIN_HEIGHT,
  },
  webView: {
    flex: 1,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  dragHandle: {
    width: 50,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 3,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  expandIcon: {
    fontSize: 16,
    color: '#007AFF',
  },
  cookieList: {
    flex: 1,
  },
  cookieListContent: {
    padding: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    paddingVertical: 20,
  },
  cookieItem: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cookieHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    flexWrap: 'wrap',
    gap: 6,
  },
  cookieName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  badge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  cookieValue: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  cookieMetadata: {
    gap: 4,
  },
  metadataText: {
    fontSize: 12,
    color: '#999',
  },
});
