import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
} from 'expo-audio';
import { fetch as expoFetch } from 'expo/fetch';
import { File, Paths } from 'expo-file-system';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const API_BASE = 'https://piphex-ai.onrender.com';
const OPENING_LINE = "Well, look what the gates of Hell let back in. Welcome—the books have lowered their expectations accordingly.";
const HISTORY_KEY = 'piphex-orb-history-v1';

type OrbState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';
type Message = { role: 'user' | 'assistant'; content: string };

async function errorMessage(response: Response, fallback: string) {
  try {
    const body = await response.json();
    return typeof body?.error === 'string' ? body.error : fallback;
  } catch {
    return fallback;
  }
}

export default function PiphexOrbScreen() {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const player = useAudioPlayer(null, { updateInterval: 100 });
  const playerStatus = useAudioPlayerStatus(player);
  const pulse = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0.35)).current;
  const [orbState, setOrbState] = useState<OrbState>('idle');
  const [history, setHistory] = useState<Message[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [statusText, setStatusText] = useState('Tap the orb and speak');
  const [soundOn, setSoundOn] = useState(true);
  const hasGreeted = useRef(false);

  const stateColor = useMemo(() => ({
    idle: '#71f5b1', listening: '#50e8ff', thinking: '#c183ff', speaking: '#ffd364', error: '#ff6b66',
  }[orbState]), [orbState]);

  useEffect(() => {
    SecureStore.getItemAsync(HISTORY_KEY).then((value) => {
      if (!value) return;
      try { setHistory(JSON.parse(value).slice(-12)); } catch { /* Ignore damaged local history. */ }
    });
    setAudioModeAsync({
      playsInSilentMode: true,
      allowsRecording: true,
      shouldPlayInBackground: false,
      allowsBackgroundRecording: false,
    }).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (hasGreeted.current) return;
    hasGreeted.current = true;
    const timer = setTimeout(() => speak(OPENING_LINE, false), 450);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (playerStatus.didJustFinish && orbState === 'speaking') {
      setOrbState('idle');
      setStatusText('Tap the orb and speak');
    }
  }, [playerStatus.didJustFinish, orbState]);

  useEffect(() => {
    const animation = Animated.loop(Animated.sequence([
      Animated.parallel([
        Animated.timing(pulse, { toValue: orbState === 'idle' ? 1.035 : 1.09, duration: orbState === 'thinking' ? 420 : 720, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 1, duration: 650, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(pulse, { toValue: 1, duration: orbState === 'thinking' ? 420 : 720, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0.35, duration: 650, useNativeDriver: true }),
      ]),
    ]));
    animation.start();
    return () => animation.stop();
  }, [orbState, glow, pulse]);

  async function saveHistory(next: Message[]) {
    const trimmed = next.slice(-12);
    setHistory(trimmed);
    await SecureStore.setItemAsync(HISTORY_KEY, JSON.stringify(trimmed));
  }

  async function speak(text: string, addToHistory = true, sourceHistory = history) {
    if (addToHistory) await saveHistory([...sourceHistory, { role: 'assistant', content: text }]);
    if (!soundOn) {
      setOrbState('idle');
      setStatusText(text);
      return;
    }
    setOrbState('speaking');
    setStatusText(text);
    try {
      const response = await expoFetch(`${API_BASE}/api/speech`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }),
      });
      if (!response.ok) throw new Error(await errorMessage(response, 'Piphex lost his voice for a moment.'));
      const audioFile = new File(Paths.cache, `piphex-${Date.now()}.mp3`);
      audioFile.create({ overwrite: true });
      audioFile.write(new Uint8Array(await response.arrayBuffer()));
      player.replace(audioFile.uri);
      player.play();
    } catch (error) {
      setOrbState('error');
      setStatusText(error instanceof Error ? error.message : 'Piphex lost his voice for a moment.');
    }
  }

  async function askPiphex(message: string, sourceHistory = history) {
    const clean = message.trim();
    if (!clean) return;
    const withUser: Message[] = [...sourceHistory, { role: 'user' as const, content: clean }].slice(-12);
    await saveHistory(withUser);
    setOrbState('thinking');
    setStatusText('Piphex is considering the damage…');
    try {
      const response = await expoFetch(`${API_BASE}/api/chat`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: clean, history: sourceHistory.slice(-10), memory: { enabled: true } }),
      });
      if (!response.ok) throw new Error(await errorMessage(response, 'Piphex needs a moment.'));
      const body = await response.json();
      const answer = String(body.answer || body.reply || '').trim();
      if (!answer) throw new Error('Piphex returned an empty answer. Suspicious, even for Hell.');
      await speak(answer, true, withUser);
    } catch (error) {
      setOrbState('error');
      setStatusText(error instanceof Error ? error.message : 'Piphex needs a moment.');
    }
  }

  async function startListening() {
    player.pause();
    const permission = await requestRecordingPermissionsAsync();
    if (!permission.granted) {
      setOrbState('error');
      setStatusText('Microphone permission is needed so Piphex can hear you.');
      return;
    }
    await recorder.prepareToRecordAsync();
    recorder.record({ forDuration: 60 });
    setOrbState('listening');
    setStatusText('Listening… tap again when finished');
  }

  async function finishListening() {
    setOrbState('thinking');
    setStatusText('Piphex is translating mortal noises…');
    await recorder.stop();
    const uri = recorder.uri;
    if (!uri) throw new Error('The recording could not be saved.');
    const recording = new File(uri);
    const contentType = Platform.OS === 'web' ? 'audio/webm' : 'audio/m4a';
    const response = await expoFetch(`${API_BASE}/api/transcribe`, {
      method: 'POST', headers: { 'Content-Type': contentType }, body: recording,
    });
    if (!response.ok) throw new Error(await errorMessage(response, 'Piphex could not hear that clearly.'));
    const body = await response.json();
    await askPiphex(String(body.text || ''));
  }

  async function pressOrb() {
    try {
      if (orbState === 'speaking') {
        player.pause();
        setOrbState('idle');
        setStatusText('Interrupted. How delightfully rude. Tap to speak.');
      } else if (orbState === 'listening') {
        await finishListening();
      } else if (orbState !== 'thinking') {
        await startListening();
      }
    } catch (error) {
      setOrbState('error');
      setStatusText(error instanceof Error ? error.message : 'Something infernal went sideways.');
    }
  }

  async function sendTyped() {
    const message = draft.trim();
    if (!message) return;
    setDraft('');
    setSheetOpen(false);
    await askPiphex(message);
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.embersTop} />
      <Text style={styles.eyebrow}>PIPHEX</Text>
      <Text style={styles.title}>THE INFERNAL ORB</Text>

      <Pressable accessibilityRole="button" accessibilityLabel="Talk to Piphex" onPress={pressOrb} style={styles.orbButton}>
        <Animated.View style={[styles.glow, { backgroundColor: stateColor, opacity: glow, transform: [{ scale: pulse }] }]} />
        <Animated.View style={{ transform: [{ scale: pulse }] }}>
          <Image source={require('../../assets/images/piphex-orb-icon.png')} style={styles.orb} />
        </Animated.View>
      </Pressable>

      <View style={styles.stateRow}><View style={[styles.stateDot, { backgroundColor: stateColor }]} /><Text style={styles.state}>{orbState.toUpperCase()}</Text></View>
      <Text style={styles.status} numberOfLines={4}>{statusText}</Text>

      <View style={styles.controls}>
        <Pressable style={styles.control} onPress={() => setSheetOpen(true)}><Text style={styles.controlIcon}>⌨</Text><Text style={styles.controlText}>TYPE</Text></Pressable>
        <Pressable style={styles.control} onPress={() => { player.pause(); setSoundOn((value) => !value); }}><Text style={styles.controlIcon}>{soundOn ? '◉' : '○'}</Text><Text style={styles.controlText}>{soundOn ? 'VOICE ON' : 'VOICE OFF'}</Text></Pressable>
      </View>

      <Text style={styles.footer}>Tap once to listen · tap again to answer</Text>

      <Modal transparent visible={sheetOpen} animationType="slide" onRequestClose={() => setSheetOpen(false)}>
        <KeyboardAvoidingView style={styles.modalBackdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}><Text style={styles.sheetTitle}>A PRIVATE WORD WITH PIPHEX</Text><Pressable onPress={() => setSheetOpen(false)}><Text style={styles.close}>×</Text></Pressable></View>
            <ScrollView style={styles.history} contentContainerStyle={styles.historyContent}>
              {history.length === 0 ? <Text style={styles.empty}>No conversation yet. A rare moment of peace.</Text> : history.map((item, index) => (
                <View key={`${item.role}-${index}`} style={[styles.bubble, item.role === 'user' ? styles.userBubble : styles.piphexBubble]}><Text style={styles.bubbleLabel}>{item.role === 'user' ? 'YOU' : 'PIPHEX'}</Text><Text style={styles.bubbleText}>{item.content}</Text></View>
              ))}
            </ScrollView>
            <View style={styles.inputRow}><TextInput value={draft} onChangeText={setDraft} placeholder="Ask Piphex…" placeholderTextColor="#8d817c" style={styles.input} multiline returnKeyType="send" onSubmitEditing={sendTyped} /><Pressable style={styles.send} onPress={sendTyped}><Text style={styles.sendText}>SEND</Text></Pressable></View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#070506', paddingHorizontal: 24 },
  embersTop: { position: 'absolute', top: -120, width: 420, height: 260, borderRadius: 210, backgroundColor: '#4b1013', opacity: 0.35 },
  eyebrow: { color: '#d7a14c', fontSize: 14, fontWeight: '800', letterSpacing: 7, marginBottom: 7 },
  title: { color: '#f8ead7', fontSize: 22, fontWeight: '700', letterSpacing: 2.5, marginBottom: 34 },
  orbButton: { width: 310, height: 310, alignItems: 'center', justifyContent: 'center' },
  glow: { position: 'absolute', width: 245, height: 245, borderRadius: 123, shadowColor: '#6ffff0', shadowOpacity: 0.9, shadowRadius: 34, shadowOffset: { width: 0, height: 0 } },
  orb: { width: 292, height: 292, borderRadius: 146 },
  stateRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 24 },
  stateDot: { width: 7, height: 7, borderRadius: 4 },
  state: { color: '#baa99e', fontSize: 11, fontWeight: '800', letterSpacing: 2.6 },
  status: { color: '#f2e3d2', fontSize: 17, lineHeight: 24, textAlign: 'center', minHeight: 76, maxWidth: 360, marginTop: 13 },
  controls: { flexDirection: 'row', gap: 12, marginTop: 18 },
  control: { minWidth: 112, height: 54, paddingHorizontal: 15, borderWidth: 1, borderColor: '#6c4924', borderRadius: 27, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#160d0d' },
  controlIcon: { color: '#f2c56e', fontSize: 18 }, controlText: { color: '#d6b77d', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  footer: { position: 'absolute', bottom: 28, color: '#6f625d', fontSize: 11, letterSpacing: 0.7 },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.64)' },
  sheet: { maxHeight: '78%', backgroundColor: '#10090a', borderTopLeftRadius: 28, borderTopRightRadius: 28, borderWidth: 1, borderColor: '#6f4622', padding: 20, paddingBottom: 32 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sheetTitle: { color: '#deb35e', fontWeight: '800', letterSpacing: 1.4, fontSize: 12 }, close: { color: '#f7ead9', fontSize: 32, lineHeight: 32, paddingHorizontal: 5 },
  history: { maxHeight: 390 }, historyContent: { gap: 10, paddingBottom: 12 }, empty: { color: '#8e7e74', textAlign: 'center', paddingVertical: 30 },
  bubble: { padding: 13, borderRadius: 15, maxWidth: '90%' }, userBubble: { alignSelf: 'flex-end', backgroundColor: '#273b36' }, piphexBubble: { alignSelf: 'flex-start', backgroundColor: '#2a1110', borderWidth: 1, borderColor: '#5d2d1c' },
  bubbleLabel: { color: '#ca9851', fontSize: 9, fontWeight: '900', letterSpacing: 1.4, marginBottom: 5 }, bubbleText: { color: '#f0e4d7', fontSize: 15, lineHeight: 20 },
  inputRow: { flexDirection: 'row', gap: 9, alignItems: 'flex-end', marginTop: 12 }, input: { flex: 1, minHeight: 48, maxHeight: 110, borderWidth: 1, borderColor: '#5d4430', borderRadius: 15, color: '#fff4e6', backgroundColor: '#090606', paddingHorizontal: 14, paddingVertical: 12, fontSize: 16 },
  send: { height: 48, paddingHorizontal: 18, borderRadius: 15, backgroundColor: '#9f351e', alignItems: 'center', justifyContent: 'center' }, sendText: { color: '#fff2dd', fontSize: 11, fontWeight: '900', letterSpacing: 1 },
});
