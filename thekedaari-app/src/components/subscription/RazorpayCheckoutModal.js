import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
  AppState,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import client from '../../api/client';
import { useSubscription } from '../../context/SubscriptionContext';
import { formatRupees, planName } from '../../theme/subscription';

export default function RazorpayCheckoutModal({
  visible,
  order,
  user,
  lang = 'hi',
  onSuccess,
  onError,
  onClose,
}) {
  const { verifyPayment, refresh } = useSubscription();
  const [verifying, setVerifying] = useState(false);
  const [webViewLoading, setWebViewLoading] = useState(true);
  const [webViewError, setWebViewError] = useState(null);
  const [checkingManual, setCheckingManual] = useState(false);
  const webViewRef = useRef(null);
  const verifyingRef = useRef(false);

  // Reset states when modal visibility changes
  useEffect(() => {
    if (visible) {
      setVerifying(false);
      setWebViewLoading(true);
      setWebViewError(null);
      setCheckingManual(false);
      verifyingRef.current = false;
    }
  }, [visible]);

  const plan = order?.plan;
  const displayName = planName(plan, lang) || order?.planCode || 'Plan';
  const displayPrice = order?.amount
    ? formatRupees(order.amount)
    : formatRupees((order?.amountInPaise || 0) / 100);

  const handlePaymentSuccess = useCallback(async () => {
    if (verifyingRef.current) return;
    verifyingRef.current = true;
    setVerifying(true);

    try {
      // 1. Explicitly sync order with server so backend marks it paid & activates plan
      await client
        .post('/subscription/sync-order', {
          orderId: order?.orderId || order?.id,
        })
        .catch(() => {});

      // 2. Fetch fresh active status
      const fresh = await refresh();
      setVerifying(false);
      if (onSuccess) {
        onSuccess({
          plan: order?.plan || plan,
          order,
          subscription: fresh?.currentSubscription,
          expiresAt: fresh?.expiresAt,
        });
      }
    } catch {
      setVerifying(false);
      if (onSuccess) {
        onSuccess({ plan: order?.plan || plan, order });
      }
    }
  }, [order, plan, refresh, onSuccess]);

  // Background polling while modal is open (e.g. user paid in UPI app and returned)
  useEffect(() => {
    if (!visible || !order) return;

    let pollCount = 0;
    const maxPolls = 100; // ~5 minutes

    const checkBackendStatus = async () => {
      if (verifyingRef.current) return;
      try {
        // Check order sync directly
        if (order?.orderId || order?.id) {
          const syncRes = await client
            .post('/subscription/sync-order', {
              orderId: order.orderId || order.id,
            })
            .catch(() => null);

          if (syncRes?.data?.isActive) {
            handlePaymentSuccess();
            return;
          }
        }

        const res = await client.get('/subscription/status');
        const data = res.data;
        if (data?.isActive) {
          handlePaymentSuccess();
        }
      } catch {
        // Silently ignore polling errors
      }
    };

    const interval = setInterval(() => {
      pollCount++;
      if (pollCount > maxPolls) {
        clearInterval(interval);
        return;
      }
      checkBackendStatus();
    }, 3000);

    const appStateSub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        checkBackendStatus();
      }
    });

    return () => {
      clearInterval(interval);
      appStateSub.remove();
    };
  }, [visible, order, handlePaymentSuccess]);

  if (!visible || !order) return null;

  // Open external UPI schemes (phonepe, gpay, paytm, etc.)
  const openExternalScheme = async (rawUrl) => {
    try {
      let targetUrl = rawUrl;
      // Handle Android intent URLs (intent://pay?...#Intent;scheme=upi;...)
      if (targetUrl.startsWith('intent:')) {
        const schemeMatch = targetUrl.match(/scheme=([^;]+)/i);
        if (schemeMatch && schemeMatch[1]) {
          const scheme = schemeMatch[1];
          targetUrl = targetUrl.replace(/^intent:\/\//i, `${scheme}://`).split('#Intent')[0];
        }
      }

      const supported = await Linking.canOpenURL(targetUrl).catch(() => true);
      if (supported) {
        await Linking.openURL(targetUrl);
      } else {
        await Linking.openURL(rawUrl).catch(() => {});
      }
    } catch (err) {
      console.warn('[RazorpayCheckoutModal] Could not open external app:', err);
    }
  };

  // Inspect incoming navigation requests
  const handleShouldStartLoad = (request) => {
    const url = request.url || '';

    // Handle deep link redirect back to app (thekedaari://subscription...)
    if (url.startsWith('thekedaari://')) {
      const outcomeMatch = url.match(/[?&]payment=([^&]+)/);
      const outcome = outcomeMatch ? decodeURIComponent(outcomeMatch[1]) : 'success';
      if (outcome === 'success') {
        handlePaymentSuccess();
      } else if (outcome === 'cancelled') {
        if (onError) onError(lang === 'hi' ? 'भुगतान रद्द कर दिया गया।' : 'Payment was cancelled.');
        onClose();
      } else {
        if (onError) onError(lang === 'hi' ? 'भुगतान पूरा नहीं हो पाया।' : 'Payment failed.');
        onClose();
      }
      return false;
    }

    // Intercept backend callback redirects
    if (url.includes('/subscription/payment-link/callback') || url.includes('/payment-link/callback')) {
      const queryIdx = url.indexOf('?');
      const queryString = queryIdx !== -1 ? url.slice(queryIdx) : '';

      if (url.includes('razorpay_payment_link_status=paid') || url.includes('payment=success')) {
        // Relay callback parameters directly to our server so server updates DB immediately
        client
          .get('/subscription/payment-link/callback' + queryString + (queryString ? '&json=1' : '?json=1'))
          .catch(() => {});
        handlePaymentSuccess();
        return false;
      }
      if (url.includes('razorpay_payment_link_status=cancelled') || url.includes('payment=cancelled')) {
        if (onError) onError(lang === 'hi' ? 'भुगतान रद्द कर दिया गया।' : 'Payment was cancelled.');
        onClose();
        return false;
      }
      if (url.includes('payment=failed')) {
        if (onError) onError(lang === 'hi' ? 'भुगतान पूरा नहीं हो पाया।' : 'Payment failed.');
        onClose();
        return false;
      }
    }

    // Intercept UPI or external custom scheme URLs
    if (
      url.startsWith('upi:') ||
      url.startsWith('phonepe:') ||
      url.startsWith('tez:') ||
      url.startsWith('gpay:') ||
      url.startsWith('paytmmp:') ||
      url.startsWith('paytm:') ||
      url.startsWith('bhim:') ||
      url.startsWith('credpay:') ||
      url.startsWith('cred:') ||
      url.startsWith('mobikwik:') ||
      url.startsWith('whatsapp:') ||
      url.startsWith('intent:')
    ) {
      openExternalScheme(url);
      return false;
    }

    // Allow normal HTTP/HTTPS inside WebView
    return true;
  };

  const handleNavigationStateChange = (navState) => {
    const url = navState.url || '';
    if (url.startsWith('thekedaari://')) {
      handleShouldStartLoad({ url });
      return;
    }
    if (url.includes('/subscription/payment-link/callback') || url.includes('/payment-link/callback')) {
      if (url.includes('razorpay_payment_link_status=paid') || url.includes('payment=success')) {
        handlePaymentSuccess();
      } else if (url.includes('razorpay_payment_link_status=cancelled') || url.includes('payment=cancelled')) {
        if (onError) onError(lang === 'hi' ? 'भुगतान रद्द कर दिया गया।' : 'Payment was cancelled.');
        onClose();
      }
    }
  };

  const handleMessage = async (event) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      if (message.type === 'DISMISS') {
        onClose();
      } else if (message.type === 'SUCCESS') {
        setVerifying(true);
        try {
          const verified = await verifyPayment(message.data);
          setVerifying(false);
          onSuccess({ ...verified, plan });
        } catch (err) {
          setVerifying(false);
          const msg =
            err.response?.data?.error ||
            (lang === 'hi'
              ? 'भुगतान हो गया है पर पुष्टि नहीं हो पाई। ऐप दोबारा खोलें।'
              : 'Payment received but confirmation failed. Please refresh the app.');
          Alert.alert(lang === 'hi' ? 'पुष्टि त्रुटि' : 'Verification Issue', msg);
          if (onError) onError(msg);
        }
      } else if (message.type === 'FAILED') {
        const errorMsg =
          message.data?.description ||
          (lang === 'hi' ? 'भुगतान पूरा नहीं हुआ।' : 'Payment could not be completed.');
        if (onError) onError(errorMsg);
        onClose();
      } else if (message.type === 'ERROR') {
        const errorMsg = message.data?.message || 'Checkout failed to load.';
        if (onError) onError(errorMsg);
        onClose();
      }
    } catch (e) {
      console.error('[RazorpayCheckoutModal] Failed to parse message from WebView:', e);
    }
  };

  const handleManualCheck = async () => {
    if (checkingManual || verifying) return;
    setCheckingManual(true);
    try {
      if (order?.orderId || order?.id) {
        await client
          .post('/subscription/sync-order', {
            orderId: order.orderId || order.id,
          })
          .catch(() => null);
      }
      const res = await client.get('/subscription/status');
      if (res.data?.isActive) {
        handlePaymentSuccess();
      } else {
        Alert.alert(
          lang === 'hi' ? 'भुगतान प्रक्रियाधीन है' : 'Payment Processing',
          lang === 'hi'
            ? 'बैंक या UPI से अभी पुष्टि की प्रतीक्षा है। अगर आपने भुगतान कर दिया है, तो कुछ सेकंड बाद दोबारा जांचें।'
            : 'Awaiting confirmation from bank/UPI. If you have completed payment, please check again in a few moments.'
        );
      }
    } catch {
      Alert.alert(
        lang === 'hi' ? 'त्रुटि' : 'Error',
        lang === 'hi'
          ? 'स्टेटस चेक नहीं हो पाया। इंटरनेट कनेक्शन जांचें।'
          : 'Could not check status. Please check connection.'
      );
    } finally {
      setCheckingManual(false);
    }
  };

  const handleClose = () => {
    if (verifying) return;
    Alert.alert(
      lang === 'hi' ? 'भुगतान स्क्रीन बंद करें?' : 'Exit Payment Screen?',
      lang === 'hi'
        ? 'क्या आप वाकई पेमेंट पेज बंद करना चाहते हैं?'
        : 'Are you sure you want to close the payment screen?',
      [
        {
          text: lang === 'hi' ? 'भुगतान जारी रखें' : 'Continue Payment',
          style: 'cancel',
        },
        {
          text: lang === 'hi' ? 'स्क्रीन बंद करें' : 'Close',
          style: 'destructive',
          onPress: onClose,
        },
      ]
    );
  };

  // Fallback HTML if mode is checkout popup
  const safeKeyId = JSON.stringify(order.keyId || '');
  const safeOrderId = JSON.stringify(order.razorpayOrderId || '');
  const safeAmount = Number(order.amountInPaise || 0);
  const safeCurrency = JSON.stringify(order.currency || 'INR');
  const safeDescription = JSON.stringify(`${displayName} — ${displayPrice}`);
  const safeName = JSON.stringify(order.prefill?.name || user?.name || '');
  const safeContact = JSON.stringify(order.prefill?.contact || user?.phone || '');

  const checkoutHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
        <style>
          body { margin: 0; padding: 0; display: flex; align-items: center; justify-content: center; height: 100vh; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #334155; }
          .loader { display: flex; flex-direction: column; align-items: center; gap: 12px; }
          .spinner { width: 38px; height: 38px; border: 4px solid #e2e8f0; border-top: 4px solid #2563eb; border-radius: 50%; animation: spin 0.8s linear infinite; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          .text { font-size: 14px; font-weight: 600; color: #475569; }
        </style>
      </head>
      <body>
        <div class="loader">
          <div class="spinner"></div>
          <div class="text">${lang === 'hi' ? 'सुरक्षित पेमेंट लोड हो रहा है...' : 'Loading secure payment...'}</div>
        </div>
        <script>
          function sendToApp(type, data) {
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: type, data: data }));
            }
          }
          var retries = 0;
          function startCheckout() {
            if (typeof Razorpay === 'undefined') {
              retries++;
              if (retries > 30) {
                sendToApp('ERROR', { message: 'Razorpay failed to load. Check internet connection.' });
                return;
              }
              setTimeout(startCheckout, 200);
              return;
            }
            try {
              var options = {
                key: ${safeKeyId},
                amount: ${safeAmount},
                currency: ${safeCurrency},
                name: "Thekedaari",
                description: ${safeDescription},
                image: "https://thekedaari.com/thekedaari-logo.png",
                order_id: ${safeOrderId},
                prefill: { name: ${safeName}, contact: ${safeContact} },
                theme: { color: "#2563eb" },
                modal: {
                  ondismiss: function() { sendToApp('DISMISS', {}); },
                  confirm_close: true,
                  escape: false
                },
                handler: function(response) {
                  sendToApp('SUCCESS', {
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature
                  });
                }
              };
              var rzp = new Razorpay(options);
              rzp.on('payment.failed', function(response) {
                sendToApp('FAILED', {
                  code: response?.error?.code,
                  description: response?.error?.description,
                  reason: response?.error?.reason
                });
              });
              rzp.open();
            } catch (err) {
              sendToApp('ERROR', { message: err.message });
            }
          }
          if (document.readyState === 'complete' || document.readyState === 'interactive') {
            startCheckout();
          } else {
            window.addEventListener('load', startCheckout);
          }
        </script>
      </body>
    </html>
  `;

  const webViewSource = order.paymentUrl
    ? { uri: order.paymentUrl }
    : { html: checkoutHtml, baseUrl: 'https://thekedaari.com' };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* In-App Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.badge}>
              <Ionicons name="shield-checkmark" size={14} color="#16a34a" />
              <Text style={styles.badgeText}>
                {lang === 'hi' ? '100% सुरक्षित भुगतान' : '100% Secure Payment'}
              </Text>
            </View>
            <Text style={styles.planTitle} numberOfLines={1}>
              {displayName} • <Text style={styles.planPrice}>{displayPrice}</Text>
            </Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => {
                setWebViewError(null);
                setWebViewLoading(true);
                webViewRef.current?.reload();
              }}
              disabled={verifying}
              activeOpacity={0.7}
            >
              <Ionicons name="refresh" size={20} color="#475569" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={handleClose}
              disabled={verifying}
              activeOpacity={0.8}
            >
              <Ionicons name="close" size={22} color="#0f172a" />
            </TouchableOpacity>
          </View>
        </View>

        {/* WebView Container */}
        <View style={styles.webViewWrap}>
          {verifying ? (
            <View style={styles.verifyingOverlay}>
              <View style={styles.verifyingCard}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={styles.verifyingTitle}>
                  {lang === 'hi' ? 'भुगतान की पुष्टि की जा रही है...' : 'Verifying your payment...'}
                </Text>
                <Text style={styles.verifyingSubtitle}>
                  {lang === 'hi'
                    ? 'कृपया इंतज़ार करें, आपका सब्सक्रिप्शन एक्टिवेट हो रहा है।'
                    : 'Please wait while we activate your subscription.'}
                </Text>
              </View>
            </View>
          ) : webViewError ? (
            <View style={styles.errorOverlay}>
              <Ionicons name="cloud-offline-outline" size={48} color="#dc2626" />
              <Text style={styles.errorTitle}>
                {lang === 'hi' ? 'पेमेंट पेज लोड नहीं हो सका' : 'Failed to load payment'}
              </Text>
              <Text style={styles.errorSub}>
                {lang === 'hi'
                  ? 'कृपया अपना इंटरनेट कनेक्शन जांचें और पुनः प्रयास करें।'
                  : 'Please check your internet connection and try again.'}
              </Text>
              <TouchableOpacity
                style={styles.retryBtn}
                onPress={() => {
                  setWebViewError(null);
                  setWebViewLoading(true);
                  webViewRef.current?.reload();
                }}
              >
                <Ionicons name="reload" size={16} color="#fff" />
                <Text style={styles.retryBtnText}>
                  {lang === 'hi' ? 'दोबारा कोशिश करें' : 'Retry'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <WebView
              ref={webViewRef}
              originWhitelist={['*']}
              source={webViewSource}
              onMessage={handleMessage}
              onShouldStartLoadWithRequest={handleShouldStartLoad}
              onNavigationStateChange={handleNavigationStateChange}
              onLoadStart={() => setWebViewLoading(true)}
              onLoadEnd={() => setWebViewLoading(false)}
              onError={(e) => {
                setWebViewLoading(false);
                setWebViewError(e.nativeEvent.description || 'Load error');
              }}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              thirdPartyCookiesEnabled={true}
              sharedCookiesEnabled={true}
              allowsInlineMediaPlayback={true}
              style={styles.webView}
            />
          )}

          {webViewLoading && !verifying && !webViewError && (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="large" color="#2563eb" />
              <Text style={styles.loadingText}>
                {lang === 'hi' ? 'सुरक्षित पेमेंट लोड हो रहा है...' : 'Connecting to secure payment...'}
              </Text>
            </View>
          )}
        </View>

        {/* Bottom Helper Bar */}
        <View style={styles.bottomBar}>
          <View style={styles.bottomBarLeft}>
            <Ionicons name="wallet-outline" size={16} color="#64748b" />
            <Text style={styles.bottomBarText}>
              {lang === 'hi' ? 'UPI, Card, NetBanking' : 'UPI, Cards, NetBanking'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.checkStatusBtn}
            onPress={handleManualCheck}
            disabled={checkingManual || verifying}
            activeOpacity={0.8}
          >
            {checkingManual ? (
              <ActivityIndicator size="small" color="#2563eb" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={15} color="#2563eb" />
                <Text style={styles.checkStatusText}>
                  {lang === 'hi' ? 'स्टेटस चेक करें' : 'Check Status'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  headerLeft: {
    flex: 1,
    gap: 3,
    paddingRight: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#dcfce7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803d',
  },
  planTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  planPrice: {
    color: '#2563eb',
    fontWeight: '900',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  webViewWrap: {
    flex: 1,
    position: 'relative',
  },
  webView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingWrap: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  verifyingOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f8fafc',
  },
  verifyingCard: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 18,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
    maxWidth: 320,
    width: '100%',
  },
  verifyingTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 6,
    textAlign: 'center',
  },
  verifyingSubtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
  },
  errorOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
    gap: 10,
  },
  errorTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
  },
  errorSub: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 8,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2563eb',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f8fafc',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  bottomBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bottomBarText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  checkStatusBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#eff6ff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  checkStatusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563eb',
  },
});
