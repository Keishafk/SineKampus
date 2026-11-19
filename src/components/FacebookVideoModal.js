import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Platform, Pressable, SafeAreaView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { colors, fonts } from '../theme';

function isFacebookUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && /(^|\.)facebook\.com$/i.test(url.hostname);
  } catch {
    return false;
  }
}

function escapeHtml(value) {
  // Prevent a URL from accidentally breaking the HTML document inserted in WebView.
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

function playerHtml(videoUrl) {
  // Native apps load Facebook's official JavaScript player inside a WebView.
  const safeUrl = escapeHtml(videoUrl);
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"><style>html,body{margin:0;width:100%;height:100%;background:#050707;overflow:hidden}.player{width:100%;height:100%;display:flex;align-items:center;justify-content:center}</style></head><body><div id="fb-root"></div><script async defer crossorigin="anonymous" src="https://connect.facebook.net/tl_PH/sdk.js#xfbml=1&amp;version=v27.0"></script><div class="player"><div class="fb-video" data-href="${safeUrl}" data-width="900" data-allowfullscreen="true" data-autoplay="false" data-show-text="false"></div></div></body></html>`;
}

function playerUrl(videoUrl) {
  // Web browsers use Facebook's official iframe endpoint instead of WebView.
  const params = new URLSearchParams({ height: '506', href: videoUrl, show_text: 'false', width: '900', t: '0' });
  return `https://www.facebook.com/plugins/video.php?${params.toString()}`;
}

function staysInsideFacebook(request) {
  // Reject non-Facebook navigation so the embedded player cannot leave the modal.
  if (!request.url || request.url === 'about:blank') return true;
  try {
    const url = new URL(request.url);
    return /(^|\.)(facebook\.com|facebook\.net)$/i.test(url.hostname);
  } catch {
    return false;
  }
}

export default function FacebookVideoModal({ visible, videoUrl, onClose }) {
  const { width, height } = useWindowDimensions();
  const supported = isFacebookUrl(videoUrl);
  const [status, setStatus] = useState(supported ? 'loading' : 'unsupported');
  const html = useMemo(() => (supported ? playerHtml(videoUrl) : ''), [supported, videoUrl]);
  const embedUrl = useMemo(() => (supported ? playerUrl(videoUrl) : ''), [supported, videoUrl]);
  // Fit a 16:9 player inside the current phone, tablet, or browser window.
  const playerWidth = Math.max(280, Math.min(width - 32, 900, (height - 170) * (16 / 9)));
  const playerHeight = playerWidth * (9 / 16);

  useEffect(() => {
    if (!visible || !supported) return undefined;
    // Stop showing an endless spinner if Facebook never finishes loading.
    const timer = setTimeout(() => setStatus((value) => (value === 'ready' ? value : 'unavailable')), 15000);
    return () => clearTimeout(timer);
  }, [visible, supported]);

  // One overlay handles loading, invalid URLs, and Facebook embed failures.
  const statusOverlay = status !== 'ready' && (
    <View style={styles.overlay}>
      <View style={styles.statusIcon}>
        {status === 'loading'
          ? <ActivityIndicator size="large" color={colors.accentLight} />
          : <Ionicons name="alert-circle-outline" size={32} color={colors.accentLight} />}
      </View>
      <Text style={styles.statusTitle}>{status === 'loading' ? 'Preparing your film' : 'Video unavailable'}</Text>
      <Text style={styles.message}>
        {status === 'loading'
          ? 'Loading the Facebook video player…'
          : status === 'unsupported'
            ? 'This film does not have a supported Facebook video link.'
            : 'Facebook could not embed this video. It may be private, restricted, removed, or blocked from embedded playback.'}
      </Text>
    </View>
  );

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onClose}>
      <SafeAreaView style={styles.screen}>
        <View style={styles.header}>
          <View style={styles.heading}>
            <Text style={styles.eyebrow}>NOW PLAYING</Text>
            <Text style={styles.title}>Watch film</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Close video player" style={({ pressed }) => [styles.closeButton, pressed && styles.buttonPressed]} onPress={onClose} hitSlop={8}>
            <Ionicons name="close" size={22} color={colors.text} />
          </Pressable>
        </View>

        <View style={styles.content}>
          <View style={[styles.playerFrame, { width: playerWidth, height: playerHeight }]}> 
            {supported && Platform.OS === 'web' && (
              <iframe src={embedUrl} title="Facebook video player" width="100%" height="100%" scrolling="no" frameBorder="0" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen sandbox="allow-scripts allow-same-origin allow-forms allow-presentation" onLoad={() => setStatus('ready')} style={styles.webPlayer} />
            )}
            {supported && Platform.OS !== 'web' && (
              <WebView source={{ html, baseUrl: 'https://www.facebook.com' }} style={styles.player} originWhitelist={['https://*']} javaScriptEnabled domStorageEnabled allowsFullscreenVideo mediaPlaybackRequiresUserAction setSupportMultipleWindows={false} onShouldStartLoadWithRequest={staysInsideFacebook} onLoadEnd={() => setStatus('ready')} onError={() => setStatus('unavailable')} onHttpError={() => setStatus('unavailable')} />
            )}
            {statusOverlay}
          </View>

          <View style={styles.meta}>
            <Ionicons name="shield-checkmark-outline" size={16} color={colors.accentLight} />
            <Text style={styles.metaText}>Playback stays inside SineKampus</Text>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { minHeight: 76, paddingHorizontal: 20, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: colors.border },
  heading: { gap: 2 },
  eyebrow: { fontFamily: fonts.bodyBold, fontSize: 10, letterSpacing: 1.8, color: colors.accentLight },
  title: { fontFamily: fonts.title, fontSize: 22, color: colors.text },
  closeButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  buttonPressed: { opacity: 0.65 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16, gap: 18 },
  playerFrame: { overflow: 'hidden', borderRadius: 16, backgroundColor: '#050707', borderWidth: 1, borderColor: colors.border },
  player: { flex: 1, backgroundColor: '#050707' },
  webPlayer: { width: '100%', height: '100%', borderWidth: 0, backgroundColor: '#050707' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: '#0F1416', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 10 },
  statusIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, marginBottom: 4 },
  statusTitle: { fontFamily: fonts.bodyBold, fontSize: 17, color: colors.text, textAlign: 'center' },
  message: { maxWidth: 430, fontFamily: fonts.body, fontSize: 14, lineHeight: 21, color: colors.textMuted, textAlign: 'center' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  metaText: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted },
});
