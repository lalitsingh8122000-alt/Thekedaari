import React, { useState, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
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
  const { verifyPayment } = useSubscription();
  const [verifying, setVerifying] = useState(false);
  const [webViewLoading, setWebViewLoading] = useState(true);
  const webViewRef = useRef(null);

  if (!visible || !order) return null;

  const plan = order.plan;
  const displayName = planName(plan, lang) || order.planCode;
  const displayPrice = order.amount ? formatRupees(order.amount) : formatRupees((order.amountInPaise || 0) / 100);

  const safeKeyId = JSON.stringify(order.keyId || '');
  const safeOrderId = JSON.stringify(order.razorpayOrderId || '');
  const safeAmount = Number(order.amountInPaise || 0);
  const safeCurrency = JSON.stringify(order.currency || 'INR');
  const safeDescription = JSON.stringify(`${displayName} — ${displayPrice}`);
  const safeName = JSON.stringify(order.prefill?.name || user?.name || '');
  const safeContact = JSON.stringify(order.prefill?.contact || user?.phone || '');

  // Generate HTML containing Razorpay Checkout script and auto-triggering modal
  const checkoutHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
        <style>
          body {
            margin: 0;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            background-color: #f8fafc;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            color: #334155;
          }
          .loader {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
          }
          .spinner {
            width: 38px;
            height: 38px;
            border: 4px solid #e2e8f0;
            border-top: 4px solid #2563eb;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .text {
            font-size: 14px;
            font-weight: 600;
            color: #475569;
          }
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
                sendToApp('ERROR', { message: 'Razorpay script failed to load. Check your internet connection.' });
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
                prefill: {
                  name: ${safeName},
                  contact: ${safeContact}
                },
                theme: {
                  color: "#2563eb"
                },
                modal: {
                  ondismiss: function() {
                    sendToApp('DISMISS', {});
                  },
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

  // Intercept UPI links (e.g. upi://pay, phonepe://, tez://, paytmmp://) and open installed UPI apps
  const handleShouldStartLoad = (request) => {
    const url = request.url;
    if (
      url.startsWith('upi:') ||
      url.startsWith('phonepe:') ||
      url.startsWith('tez:') ||
      url.startsWith('paytmmp:') ||
      url.startsWith('bhim:')
    ) {
      Linking.openURL(url).catch((err) => {
        console.warn('[RazorpayCheckoutModal] Could not open UPI app:', err);
      });
      return false;
    }
    return true;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={() => {
        if (!verifying) onClose();
      }}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Header Bar */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.badge}>
              <Ionicons name="shield-checkmark" size={14} color="#16a34a" />
              <Text style={styles.badgeText}>
                {lang === 'hi' ? 'सुरक्षित Razorpay' : 'Razorpay Secure'}
              </Text>
            </View>
            <Text style={styles.planTitle}>
              {displayName} • <Text style={styles.planPrice}>{displayPrice}</Text>
            </Text>
          </View>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            disabled={verifying}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={22} color="#475569" />
          </TouchableOpacity>
        </View>

        {/* WebView for Razorpay Checkout */}
        <View style={styles.webViewWrap}>
          {verifying ? (
            <View style={styles.verifyingOverlay}>
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
          ) : (
            <WebView
              ref={webViewRef}
              originWhitelist={['*']}
              source={{ html: checkoutHtml, baseUrl: 'https://thekedaari.com' }}
              onMessage={handleMessage}
              onShouldStartLoadWithRequest={handleShouldStartLoad}
              onLoadEnd={() => setWebViewLoading(false)}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              thirdPartyCookiesEnabled={true}
              sharedCookiesEnabled={true}
              allowsInlineMediaPlayback={true}
              style={styles.webView}
            />
          )}

          {webViewLoading && !verifying && (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="large" color="#2563eb" />
              <Text style={styles.loadingText}>
                {lang === 'hi' ? 'गेटवे से कनेक्ट किया जा रहा है...' : 'Connecting to gateway...'}
              </Text>
            </View>
          )}
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
    gap: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
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
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  planPrice: {
    color: '#2563eb',
    fontWeight: '900',
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
    gap: 12,
    backgroundColor: '#fff',
  },
  verifyingTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 8,
  },
  verifyingSubtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
  },
});
