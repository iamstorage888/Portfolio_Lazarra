import React, { useEffect, useRef, useState } from 'react';
import { StatusBar as RNStatusBar, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Linking,
  Animated,
  useWindowDimensions,
  Image,
  Modal,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Asset } from 'expo-asset';

// ─── RESPONSIVE HELPERS ───────────────────────────────────────────────────────
function useResponsive() {
  const { width } = useWindowDimensions();
  const isSmall  = width <= 360;
  const isMedium = width <= 390;

  const px    = isSmall ? 16 : 20;
  const gap   = isSmall ? 8  : 12;
  const cardW = (width - px * 2 - gap) / 2;
  const fs    = {
    navLogo:      isSmall ? 14 : 16,
    heroName:     isSmall ? 21 : isMedium ? 23 : 26,
    heroRole:     isSmall ? 12 : 14,
    heroSub:      isSmall ? 12 : 14,
    statNum:      isSmall ? 13 : 16,
    statLabel:    isSmall ? 7  : 9,
    sectionTitle: isSmall ? 18 : 22,
    skillName:    isSmall ? 11 : 13,
    skillLevel:   isSmall ? 8  : 10,
    expRole:      isSmall ? 13 : 14,
    expDesc:      isSmall ? 12 : 13,
    projName:     isSmall ? 13 : 15,
    contactBtn:   isSmall ? 13 : 14,
    body:         isSmall ? 12 : 13,
    tag:          isSmall ? 9  : 10,
  };

  return { width, isSmall, isMedium, px, gap, cardW, fs };
}

type R = ReturnType<typeof useResponsive>;

// ─── DATA ────────────────────────────────────────────────────────────────────
const SKILLS = [
  { name: 'React Native', level: 'Frontend',       color: '#60a5fa', bg: 'rgba(96,165,250,0.12)',   icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg'           },
  { name: 'JavaScript',   level: 'Scripting',       color: '#fbbf24', bg: 'rgba(251,191,36,0.12)',  icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg' },
  { name: 'HTML & CSS',   level: 'Markup / Style',  color: '#34d399', bg: 'rgba(52,211,153,0.12)',  icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg'            },
  { name: 'Expo',         level: 'Mobile Dev',      color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/expo/expo-original.svg'              },
  { name: 'Firebase',     level: 'Backend / DB',    color: '#f87171', bg: 'rgba(248,113,113,0.12)', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-plain.svg'         },
  { name: 'Git & GitHub', level: 'Version Control', color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg'          },
  { name: 'Node.js',      level: 'Runtime',         color: '#86efac', bg: 'rgba(134,239,172,0.12)', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg'          },
  { name: 'Python',       level: 'Programming',     color: '#60a5fa', bg: 'rgba(96,165,250,0.12)',   icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg'          },
  { name: 'C++',          level: 'Programming',     color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg'    },
  { name: 'Arduino IDE',  level: 'Embedded Dev',    color: '#34d399', bg: 'rgba(52,211,153,0.12)',  icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/arduino/arduino-original.svg'        },
  { name: 'ESP32',        level: 'IoT / Hardware',  color: '#f87171', bg: 'rgba(248,113,113,0.12)', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/embeddedc/embeddedc-original.svg'    },
];

const EXPERIENCE = [
  {
    year: '2025',
    role: 'Freelance Developer — Capstone & Commission Projects',
    org: 'Self-Employed · June – August 2025',
    desc: 'Independently sourced and worked with clients to build capstone projects on a commission basis. Handled the full client lifecycle — from finding leads and scoping requirements to delivering finished software — entirely on my own initiative over three months.',
  },
  {
    year: '2025',
    role: 'IT Intern — Government Internship Program',
    org: 'Local Government Unit (DILG) · Internship',
    desc: 'Provided administrative and technical support within the local government office under DILG. Delivered hands-on IT support including computer troubleshooting, printer maintenance, and data recovery from a corrupted USB drive.',
  },
  {
    year: '2023',
    role: 'Hackathon Participant — Hack 4 Gov',
    org: 'DICT Region VI · Seda Hotel, Iloilo City',
    desc: 'Competed in Hack 4 Gov, solving cybersecurity challenges in a PicoCTF activity covering cryptography, reverse engineering, and web exploitation.',
  },
];

const EDUCATION = [
  { years: '2021 – 2025', degree: 'BS Information Technology',   school: 'University of Antique\nSibalom Main Campus',    highlight: true  },
  { years: '2015 – 2021', degree: 'Junior & Senior High School', school: "St. Augustine's Academy\nof Patnongon Inc.",    highlight: false },
  { years: '2009 – 2015', degree: 'Primary Education',           school: 'Col. Ruperto Abellon\nSenior Memorial School', highlight: false },
];

const CERTS = [
  { name: 'Hack 4 Gov — Certificate of Participation', org: 'DICT Region VI · August 18, 2023' },
  { name: 'Academic Award', org: 'Univ. of Antique — College of Computer Studies · 2023–2024' },
];

const PROJECTS = [
  {
    type: 'website' as const,
    emoji: '🏛️',
    name: 'Barangay Profiling System',
    subtitle: 'Barangay Caridad, Antique',
    status: 'Prototype (Completed)' as const,
    desc: 'A web-based profiling system for Barangay Caridad that digitizes resident records, household data, and community statistics — replacing manual paper-based processes for barangay officials.',
    tech: ['React', 'Firebase', 'JavaScript', 'HTML & CSS'],
    bannerColors: ['#1e3a5f', '#2563eb'] as const,
    url: 'https://caridad-bps-final-1-2z2h.vercel.app/',
    githubUrl: 'https://github.com/iamstorage888/Caridad-BPS-Final-1.git',
    isGitHub: false,
  },
  {
    type: 'app' as const,
    emoji: '🗑️',
    name: 'Trash Application',
    subtitle: 'Waste Management Mobile App',
    status: 'Under Development' as const,
    desc: 'A mobile application for waste and trash management, designed to help users track garbage schedules, report waste issues, and promote proper waste disposal in their community.',
    tech: ['React Native', 'Expo', 'Firebase', 'JavaScript'],
    bannerColors: ['#1a2e1a', '#2d5a27'] as const,
    url: 'https://github.com/iamstorage888/Trash-Application-.git',
    isGitHub: true,
  },
  {
    type: 'app' as const,
    emoji: '💼',
    name: 'HustleHub Admin',
    subtitle: 'Local Job Searching App — Admin Panel',
    status: 'Under Development' as const,
    desc: 'Admin dashboard for HustleHub, a local job searching platform. Manages job listings, applicant tracking, employer accounts, and overall platform moderation for local employment opportunities.',
    tech: ['React Native', 'Expo', 'Firebase', 'JavaScript'],
    bannerColors: ['#1a1a2e', '#3b2f6b'] as const,
    url: 'https://github.com/jrylgaming12345/AdminHustleHub.git',
    isGitHub: true,
  },
];

// ─── COLOUR TOKENS ────────────────────────────────────────────────────────────
const C = {
  grad1: '#0b0f1a' as const,
  grad2: '#111827' as const,
  grad3: '#1e2a3a' as const,
  grad4: '#243447' as const,
  surface: 'rgba(255,255,255,0.06)',
  surfaceDark: 'rgba(0,0,0,0.30)',
  border: 'rgba(255,255,255,0.09)',
  borderMid: 'rgba(255,255,255,0.18)',
  text: '#e2e8f0',
  muted: '#94a3b8',
  hint: '#64748b',
  accent: '#38bdf8',
  accentDim: 'rgba(56,189,248,0.15)',
  accentBorder: 'rgba(56,189,248,0.28)',
  accentDark: '#0c1a27',
  github: '#94a3b8',
  githubDim: 'rgba(148,163,184,0.15)',
  githubBorder: 'rgba(148,163,184,0.28)',
  termGreen: '#00ff88',
  termGreenDim: 'rgba(0,255,136,0.12)',
  termGreenBorder: 'rgba(0,255,136,0.25)',
  termAmber: '#ffb800',
};

// ─── CV HELPERS ───────────────────────────────────────────────────────────────
const CV_FILENAME = 'Jhon_Rey_Lazarra_CV.docx';

async function shareResume(): Promise<void> {
  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    Alert.alert('Not supported', 'Sharing is not available on this device.');
    return;
  }

  const dest = `${FileSystem.documentDirectory}${CV_FILENAME}`;
  const info = await FileSystem.getInfoAsync(dest);

  if (!info.exists) {
    const asset = Asset.fromModule(require('./assets/cv-base64.txt'));
    await asset.downloadAsync();
    const localUri = asset.localUri ?? asset.uri;
    if (!localUri) {
      throw new Error('Could not load cv-base64.txt asset.');
    }
    const b64 = (await FileSystem.readAsStringAsync(localUri, {
      encoding: 'utf8',
    })).trim();
    await FileSystem.writeAsStringAsync(dest, b64, {
      encoding: 'base64',
    });
  }

  await Sharing.shareAsync(dest, {
    mimeType:    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    dialogTitle: 'Save or Share CV — Jhon Rey Lazarra',
    UTI:         'com.microsoft.word.docx',
  });
}

const COVER_IMAGE: any = null;

// ─── TYPING ANIMATIONS ───────────────────────────────────────────────────────
const TYPING_TEXT    = "Hi I'm Jhon Rey, Welcome to my Website :]";
const TYPING_SPEED   = 70;
const DELETING_SPEED = 35;
const PAUSE_AFTER    = 2500;
const PAUSE_BEFORE   = 500;

function useTypingAnimation() {
  const [displayed, setDisplayed] = useState('');
  const phaseRef = useRef<'typing' | 'pausing' | 'deleting' | 'waiting'>('typing');
  const charRef  = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const tick = () => {
      const phase = phaseRef.current;
      if (phase === 'typing') {
        if (charRef.current < TYPING_TEXT.length) {
          charRef.current += 1;
          setDisplayed(TYPING_TEXT.slice(0, charRef.current));
          timerRef.current = setTimeout(tick, TYPING_SPEED);
        } else {
          phaseRef.current = 'pausing';
          timerRef.current = setTimeout(tick, PAUSE_AFTER);
        }
      } else if (phase === 'pausing') {
        phaseRef.current = 'deleting';
        timerRef.current = setTimeout(tick, DELETING_SPEED);
      } else if (phase === 'deleting') {
        if (charRef.current > 0) {
          charRef.current -= 1;
          setDisplayed(TYPING_TEXT.slice(0, charRef.current));
          timerRef.current = setTimeout(tick, DELETING_SPEED);
        } else {
          phaseRef.current = 'waiting';
          timerRef.current = setTimeout(tick, PAUSE_BEFORE);
        }
      } else {
        phaseRef.current = 'typing';
        timerRef.current = setTimeout(tick, TYPING_SPEED);
      }
    };
    timerRef.current = setTimeout(tick, TYPING_SPEED);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  return displayed;
}

const BIO_TEXT =
  'Aspiring IT graduate with a strong foundation in frontend development, focused on building clean and user-friendly interfaces. Experienced in hardware troubleshooting and maintenance, with a practical, hands-on approach to solving technical issues. Currently learning and actively working on backend development and API integrations, building full-stack capabilities through real projects. A collaborative "vibe coder" who enjoys creating with creativity, flow, and problem-solving energy.';

const BIO_TYPING_SPEED = 18;

function useOneShotTyping(text: string, speed = BIO_TYPING_SPEED) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone]           = useState(false);
  const charRef  = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const tick = () => {
      if (charRef.current < text.length) {
        charRef.current += 1;
        setDisplayed(text.slice(0, charRef.current));
        timerRef.current = setTimeout(tick, speed);
      } else {
        setDone(true);
      }
    };
    timerRef.current = setTimeout(tick, speed);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [text, speed]);

  return { displayed, done };
}

function useCursorBlink(speed = 530) {
  const opacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0, duration: speed, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: speed, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return opacity;
}

function useGlitch() {
  const x = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const runGlitch = () => {
      Animated.sequence([
        Animated.timing(x, { toValue: 2,  duration: 60,  useNativeDriver: true }),
        Animated.timing(x, { toValue: -2, duration: 60,  useNativeDriver: true }),
        Animated.timing(x, { toValue: 1,  duration: 40,  useNativeDriver: true }),
        Animated.timing(x, { toValue: 0,  duration: 40,  useNativeDriver: true }),
      ]).start();
    };
    const schedule = () => {
      const delay = 4000 + Math.random() * 3000;
      return setTimeout(() => { runGlitch(); schedule(); }, delay);
    };
    const id = schedule();
    return () => clearTimeout(id);
  }, []);
  return x;
}

// ─── PRIMITIVE ANIMATED COMPONENTS ───────────────────────────────────────────
const AnimatedGradientBg = () => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 7000, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 7000, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={[C.grad1, C.grad2, C.grad3, C.grad4]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: anim }]}>
        <LinearGradient
          colors={[C.grad4, C.grad1, C.grad3, C.grad2]}
          start={{ x: 1, y: 1 }} end={{ x: 0, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
};

const PulseDot = () => {
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.4, duration: 800, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1,   duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View style={{
      width: 6, height: 6, borderRadius: 3,
      backgroundColor: C.accent, transform: [{ scale }],
    }} />
  );
};

// ─── SHARED UI COMPONENTS ─────────────────────────────────────────────────────
const Divider = () => (
  <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: C.border }} />
);

const Tag = ({ label, r }: { label: string; r: R }) => (
  <View style={{
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20,
    backgroundColor: C.accentDim, borderWidth: 1, borderColor: C.accentBorder,
  }}>
    <Text style={{ fontSize: r.fs.tag, fontWeight: '600', letterSpacing: 0.5, color: C.accent }}>
      {label.toUpperCase()}
    </Text>
  </View>
);

const SectionHeader = ({ title, r }: { title: string; r: R }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }}>
    <Text style={{ fontFamily: 'serif', fontSize: r.fs.sectionTitle, fontWeight: '500', color: C.text }}>
      {title}
    </Text>
    <View style={{ flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: C.border }} />
  </View>
);

// ─── MINI CV BUTTON (must be before CoverHero) ───────────────────────────────
const MiniCvButton = ({ r }: { r: R }) => {
  const [loading, setLoading] = useState(false);

  const handlePress = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await shareResume();
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Failed to share CV.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      disabled={loading}
      style={{
        flexDirection: 'row', alignItems: 'center', gap: 5,
        backgroundColor: 'rgba(0,255,136,0.10)',
        borderWidth: 1, borderColor: 'rgba(0,255,136,0.30)',
        paddingHorizontal: 10, paddingVertical: 5,
        borderRadius: 20, marginBottom: 4,
      }}
    >
      <Ionicons
        name={loading ? 'hourglass-outline' : 'download-outline'}
        size={11}
        color={C.termGreen}
      />
      <Text style={{ fontSize: r.isSmall ? 9 : 11, fontWeight: '500', color: C.termGreen, letterSpacing: 0.4 }}>
        {loading ? '…' : 'Get CV'}
      </Text>
    </TouchableOpacity>
  );
};

// ─── RESUME DOWNLOAD BUTTON (must be before contact section render) ───────────
const ResumeDownloadButton = ({ r }: { r: R }) => {
  const [loading, setLoading] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.10, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handlePress = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await shareResume();
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Failed to share CV. Make sure cv-base64.txt exists in ./assets/.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.82}
      disabled={loading}
      style={{
        marginBottom: 10,
        borderRadius: 14,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(56,189,248,0.35)',
      }}
    >
      <LinearGradient
        colors={['rgba(56,189,248,0.18)', 'rgba(56,189,248,0.07)']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={{
          flexDirection: 'row', alignItems: 'center',
          paddingVertical: r.isSmall ? 13 : 15,
          paddingHorizontal: r.isSmall ? 14 : 16,
          gap: 14,
        }}
      >
        <Animated.View style={{
          width: 40, height: 40, borderRadius: 20,
          backgroundColor: 'rgba(56,189,248,0.18)',
          borderWidth: 1, borderColor: 'rgba(56,189,248,0.38)',
          alignItems: 'center', justifyContent: 'center',
          transform: [{ scale: pulseAnim }],
        }}>
          <Ionicons name={loading ? 'hourglass-outline' : 'document-text-outline'} size={20} color={C.accent} />
        </Animated.View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: r.isSmall ? 13 : 14, fontWeight: '600', color: C.text, marginBottom: 2 }}>
            {loading ? 'Preparing CV…' : 'Download My CV / Résumé'}
          </Text>
          <Text style={{ fontSize: r.isSmall ? 10 : 11, color: C.hint }}>
            {CV_FILENAME}
          </Text>
        </View>
        <Ionicons name={loading ? 'ellipsis-horizontal' : 'download-outline'} size={18} color={C.accent} />
      </LinearGradient>
    </TouchableOpacity>
  );
};

// ─── TERMINAL COVER ───────────────────────────────────────────────────────────
const TerminalCover = ({ r, height }: { r: R; height: number }) => {
  const displayed     = useTypingAnimation();
  const cursorOpacity = useCursorBlink(480);
  const glitchX       = useGlitch();
  const scanAnim      = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(scanAnim, { toValue: 1, duration: 3200, useNativeDriver: true })
    ).start();
  }, []);

  const scanTranslateY = scanAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: [-height, height * 1.5],
  });

  const activeColor = C.termGreen;
  const monoFont    = Platform.OS === 'ios' ? 'Courier New' : 'monospace';

  return (
    <View style={{ height, width: '100%', overflow: 'hidden' }}>
      <LinearGradient
        colors={['#020a04', '#040d10', '#060c18', '#03080f']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={[StyleSheet.absoluteFill, { opacity: 0.07 }]}>
        {Array.from({ length: Math.ceil(height / 12) }).map((_, row) =>
          Array.from({ length: 40 }).map((__, col) => (
            <View key={`${row}-${col}`} style={{
              position: 'absolute', top: row * 12 + 5, left: col * 9 + 4,
              width: 1, height: 1, borderRadius: 0.5, backgroundColor: C.termGreen,
            }} />
          ))
        )}
      </View>
      <View style={[StyleSheet.absoluteFill, { opacity: 0.06 }]}>
        {Array.from({ length: Math.ceil(height / 3) }).map((_, i) => (
          <View key={`scan${i}`} style={{
            position: 'absolute', left: 0, right: 0, top: i * 3, height: 1, backgroundColor: '#00ff88',
          }} />
        ))}
      </View>
      <Animated.View style={{
        position: 'absolute', left: 0, right: 0, height: 40,
        transform: [{ translateY: scanTranslateY }], opacity: 0.06,
      }} pointerEvents="none">
        <LinearGradient
          colors={['transparent', C.termGreen, 'transparent']}
          start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
          style={{ flex: 1 }}
        />
      </Animated.View>

      {/* Corner brackets */}
      <View style={{ position: 'absolute', top: 10, left: 12, opacity: 0.5 }}>
        <View style={{ width: 14, height: 2, backgroundColor: C.termGreen }} />
        <View style={{ width: 2, height: 14, backgroundColor: C.termGreen, marginTop: -2 }} />
      </View>
      <View style={{ position: 'absolute', top: 10, right: 12, opacity: 0.5, alignItems: 'flex-end' }}>
        <View style={{ width: 14, height: 2, backgroundColor: C.termGreen }} />
        <View style={{ width: 2, height: 14, backgroundColor: C.termGreen, marginTop: -2, alignSelf: 'flex-end' }} />
      </View>
      <View style={{ position: 'absolute', bottom: 16, left: 12, opacity: 0.5, justifyContent: 'flex-end' }}>
        <View style={{ width: 2, height: 14, backgroundColor: C.termGreen }} />
        <View style={{ width: 14, height: 2, backgroundColor: C.termGreen, marginTop: -2 }} />
      </View>
      <View style={{ position: 'absolute', bottom: 16, right: 12, opacity: 0.5, alignItems: 'flex-end', justifyContent: 'flex-end' }}>
        <View style={{ width: 2, height: 14, backgroundColor: C.termGreen, alignSelf: 'flex-end' }} />
        <View style={{ width: 14, height: 2, backgroundColor: C.termGreen, marginTop: -2 }} />
      </View>

      <View style={{
        position: 'absolute', top: 10, right: 32,
        flexDirection: 'row', alignItems: 'center', gap: 6, opacity: 0.55,
      }}>
        <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: C.termGreen }} />
        <Text style={{ fontFamily: monoFont, fontSize: r.isSmall ? 7 : 8, color: C.termGreen, letterSpacing: 1 }}>
          ONLINE
        </Text>
      </View>

      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: r.isSmall ? 16 : 22, paddingBottom: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: r.isSmall ? 8 : 12, opacity: 0.45 }}>
          <View style={{ flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: C.termGreen }} />
          <Text style={{ fontFamily: monoFont, fontSize: r.isSmall ? 7 : 8, color: C.termGreen, letterSpacing: 2 }}>
            PORTFOLIO v1.0
          </Text>
          <View style={{ flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: C.termGreen }} />
        </View>
        <Text style={{ fontFamily: monoFont, fontSize: r.isSmall ? 9 : 11, color: 'rgba(0,255,136,0.5)', letterSpacing: 0.8, marginBottom: r.isSmall ? 4 : 6 }}>
          {'jhon@portfolio:~/home $ echo --welcome'}
        </Text>
        <Animated.View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', transform: [{ translateX: glitchX }] }}>
          <Text style={{
            fontFamily: monoFont,
            fontSize: r.isSmall ? 18 : r.isMedium ? 21 : 24,
            color: activeColor, fontWeight: '700', letterSpacing: 0.5,
            lineHeight: r.isSmall ? 26 : 32, flexShrink: 1,
            textShadowColor: activeColor, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 8,
          }}>
            {displayed}
          </Text>
          <Animated.View style={{
            width: r.isSmall ? 10 : 13, height: r.isSmall ? 18 : 22,
            backgroundColor: activeColor, marginLeft: 2, borderRadius: 1,
            opacity: cursorOpacity,
            shadowColor: activeColor, shadowOffset: { width: 0, height: 0 }, shadowRadius: 6, shadowOpacity: 0.9,
          }} />
        </Animated.View>
        <View style={{ flexDirection: 'row', gap: 5, marginTop: r.isSmall ? 10 : 14, alignItems: 'center', opacity: 0.4 }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <View key={i} style={{ height: 2, width: 6, borderRadius: 1, backgroundColor: activeColor }} />
          ))}
        </View>
      </View>
      <LinearGradient
        colors={['transparent', 'rgba(11,15,26,0.85)']}
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60 }}
      />
    </View>
  );
};

// ─── BIO TYPING TEXT ──────────────────────────────────────────────────────────
const BioTypingText = ({ r }: { r: R }) => {
  const { displayed, done } = useOneShotTyping(BIO_TEXT, BIO_TYPING_SPEED);
  const cursorOpacity = useRef(new Animated.Value(1)).current;
  const loopRef       = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (done) return;
    loopRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(cursorOpacity, { toValue: 0, duration: 530, useNativeDriver: true }),
        Animated.timing(cursorOpacity, { toValue: 1, duration: 530, useNativeDriver: true }),
      ])
    );
    loopRef.current.start();
    return () => loopRef.current?.stop();
  }, [done]);

  useEffect(() => {
    if (!done) return;
    loopRef.current?.stop();
    cursorOpacity.setValue(1);
    Animated.sequence([
      Animated.timing(cursorOpacity, { toValue: 0, duration: 380, useNativeDriver: true }),
      Animated.timing(cursorOpacity, { toValue: 1, duration: 380, useNativeDriver: true }),
      Animated.timing(cursorOpacity, { toValue: 0, duration: 380, useNativeDriver: true }),
      Animated.timing(cursorOpacity, { toValue: 1, duration: 380, useNativeDriver: true }),
      Animated.timing(cursorOpacity, { toValue: 0, duration: 380, useNativeDriver: true }),
      Animated.timing(cursorOpacity, { toValue: 1, duration: 380, useNativeDriver: true }),
      Animated.timing(cursorOpacity, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, [done]);

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: r.isSmall ? 16 : 20 }}>
      <Text style={{
        fontSize: r.fs.heroSub,
        color: C.muted,
        lineHeight: r.isSmall ? 19 : 22,
        fontWeight: '300',
      }}>
        {displayed}
      </Text>
      <Animated.View style={{
        width: 2,
        height: r.fs.heroSub + 2,
        backgroundColor: C.accent,
        marginLeft: 1,
        marginTop: r.isSmall ? 2 : 3,
        borderRadius: 1,
        opacity: cursorOpacity,
        alignSelf: 'flex-start',
      }} />
    </View>
  );
};

// ─── COVER HERO ───────────────────────────────────────────────────────────────
// NOTE: MiniCvButton must be defined above this component.
const CoverHero = ({ r }: { r: R }) => {
  const COVER_H       = r.isSmall ? 160 : 195;
  const AVATAR_SIZE   = r.isSmall ? 95  : 112;
  const AVATAR_BORDER = 3;
  const AVATAR_OFFSET = -(AVATAR_SIZE / 2 + AVATAR_BORDER);

  return (
    <View>
      {COVER_IMAGE ? (
        <View style={{ height: COVER_H, width: '100%', overflow: 'hidden' }}>
          <Image source={COVER_IMAGE} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          <LinearGradient
            colors={['transparent', 'rgba(11,15,26,0.7)']}
            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 52 }}
          />
        </View>
      ) : (
        <TerminalCover r={r} height={COVER_H} />
      )}

      <View style={{
        paddingHorizontal: r.px, marginTop: AVATAR_OFFSET,
        flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between',
      }}>
        <View style={{
          width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2,
          borderWidth: AVATAR_BORDER, borderColor: C.grad1, overflow: 'hidden', backgroundColor: C.accentDim,
        }}>
          <Image source={require('./assets/prof.png')} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6 }}>
          <MiniCvButton r={r} />
          <View style={{
            flexDirection: 'row', alignItems: 'center', gap: 5,
            backgroundColor: C.accentDim, borderWidth: 1, borderColor: C.accentBorder,
            paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, marginBottom: 4,
          }}>
            <PulseDot />
            <Text style={{ fontSize: r.isSmall ? 9 : 11, fontWeight: '500', color: C.accent, letterSpacing: 0.4 }}>
              Open to Work
            </Text>
          </View>
        </View>
      </View>

      <View style={{ paddingHorizontal: r.px, paddingTop: 12, paddingBottom: r.isSmall ? 20 : 24 }}>
        <Text style={{ fontFamily: 'serif', fontSize: r.fs.heroName, fontWeight: '600', color: C.text, letterSpacing: -0.4, marginBottom: 3 }}>
          Jhon Rey Y. Lazarra
        </Text>
        <Text style={{ fontSize: r.fs.heroRole, fontWeight: '500', color: C.accent, marginBottom: 10, letterSpacing: 0.2 }}>
          Frontend &amp; UI Developer
        </Text>

        <BioTypingText r={r} />

        <View style={{ flexDirection: 'row', gap: r.isSmall ? 6 : 8, marginBottom: r.isSmall ? 16 : 18 }}>
          {[
            { num: '2025', label: 'Graduate'     },
            { num: '6+',   label: 'Technologies' },
            { num: 'Gov.', label: 'Internship'   },
            { num: 'CTF',  label: 'Hackathon'    },
          ].map((s) => (
            <View key={s.label} style={{
              flex: 1, backgroundColor: C.surfaceDark, borderRadius: 10,
              borderWidth: StyleSheet.hairlineWidth, borderColor: C.border,
              paddingVertical: r.isSmall ? 8 : 10, alignItems: 'center',
            }}>
              <Text style={{ fontFamily: 'serif', fontSize: r.fs.statNum, fontWeight: '600', color: C.accent }}>{s.num}</Text>
              <Text style={{ fontSize: r.fs.statLabel, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.3, marginTop: 2 }}>{s.label}</Text>
            </View>
          ))}
        </View>

        <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
          {['React Native', 'Expo', 'Firebase', 'JavaScript'].map((t) => (
            <View key={t} style={{
              paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20,
              backgroundColor: C.accentDim, borderWidth: 1, borderColor: C.accentBorder,
            }}>
              <Text style={{ fontSize: r.fs.tag, fontWeight: '600', letterSpacing: 0.5, color: C.accent }}>
                {t.toUpperCase()}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

// ─── SKILL / EXP / EDU / CERT CARDS ──────────────────────────────────────────
const SkillCard = ({ skill, r }: { skill: typeof SKILLS[0]; r: R }) => (
  <View style={{
    width: r.cardW, backgroundColor: C.surface, borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth, borderColor: C.border,
    padding: r.isSmall ? 10 : 14, alignItems: 'center',
  }}>
    <View style={{
      width: r.isSmall ? 44 : 52, height: r.isSmall ? 44 : 52, borderRadius: 12,
      backgroundColor: skill.bg, alignItems: 'center', justifyContent: 'center', marginBottom: 10,
    }}>
      <Image source={{ uri: skill.icon }} style={{ width: r.isSmall ? 30 : 36, height: r.isSmall ? 30 : 36 }} resizeMode="contain" />
    </View>
    <Text style={{ fontSize: r.fs.skillName, fontWeight: '600', color: C.text, marginBottom: 3, textAlign: 'center' }}>{skill.name}</Text>
    <Text style={{ fontSize: r.fs.skillLevel, color: C.hint, textTransform: 'uppercase', letterSpacing: 0.4, textAlign: 'center' }}>{skill.level}</Text>
  </View>
);

const ExpCard = ({ item, r }: { item: typeof EXPERIENCE[0]; r: R }) => (
  <View style={{
    backgroundColor: C.surface, borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth, borderColor: C.border,
    padding: r.isSmall ? 12 : 16, marginBottom: 12,
  }}>
    <Text style={{ fontSize: 10, color: C.accent, fontWeight: '600', letterSpacing: 0.5, marginBottom: 4 }}>{item.year}</Text>
    <Text style={{ fontSize: r.fs.expRole, fontWeight: '500', color: C.text, marginBottom: 3 }}>{item.role}</Text>
    <Text style={{ fontSize: r.isSmall ? 11 : 12, color: C.muted, marginBottom: 8, fontWeight: '500' }}>{item.org}</Text>
    <Text style={{ fontSize: r.fs.expDesc, color: C.hint, lineHeight: r.isSmall ? 18 : 20 }}>{item.desc}</Text>
  </View>
);

const EduCard = ({ item, r }: { item: typeof EDUCATION[0]; r: R }) => (
  <View style={{
    width: r.isSmall ? 170 : 200, backgroundColor: C.surface, borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth, borderColor: C.border,
    padding: r.isSmall ? 12 : 16,
  }}>
    <Text style={{ fontSize: 10, color: C.hint, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 5, fontWeight: '500' }}>{item.years}</Text>
    <Text style={{ fontSize: r.isSmall ? 12 : 14, fontWeight: '500', color: C.text, marginBottom: 4 }}>{item.degree}</Text>
    <Text style={{ fontSize: r.isSmall ? 11 : 12, color: C.muted, lineHeight: 17 }}>{item.school}</Text>
    {item.highlight && (<View style={{ marginTop: 10 }}><Tag label="Graduate 2025" r={r} /></View>)}
  </View>
);

const CertCard = ({ cert, r }: { cert: typeof CERTS[0]; r: R }) => (
  <View style={{
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: C.surface, borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth, borderColor: C.border,
    padding: r.isSmall ? 12 : 14, marginBottom: 10,
  }}>
    <View style={{
      width: 42, height: 42, borderRadius: 10,
      backgroundColor: C.accentDim, borderWidth: 1, borderColor: C.accentBorder,
      alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <Ionicons name="ribbon-outline" size={22} color={C.accent} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: r.fs.body, fontWeight: '500', color: C.text, marginBottom: 3, lineHeight: 17 }}>{cert.name}</Text>
      <Text style={{ fontSize: r.isSmall ? 10 : 11, color: C.hint, lineHeight: 15 }}>{cert.org}</Text>
    </View>
  </View>
);

// ─── PROJECT CARDS ────────────────────────────────────────────────────────────
const ProjectCard = ({ project, r }: { project: typeof PROJECTS[0]; r: R }) => {
  const handleOpen = () => { if (project.url) Linking.openURL(project.url); };
  const isGitHub  = project.isGitHub;
  const btnBg     = isGitHub ? C.githubDim   : C.accentDim;
  const btnBorder = isGitHub ? C.githubBorder : C.accentBorder;
  const btnColor  = isGitHub ? C.github       : C.accent;
  const btnLabel  = isGitHub ? 'View on GitHub →' : 'View Live Project →';

  return (
    <View style={{
      backgroundColor: C.surface, borderRadius: 16,
      borderWidth: StyleSheet.hairlineWidth, borderColor: C.border,
      overflow: 'hidden', marginBottom: 14,
    }}>
      <LinearGradient
        colors={project.bannerColors}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={{ height: r.isSmall ? 72 : 90, alignItems: 'center', justifyContent: 'center' }}
      >
        <Text style={{ fontSize: r.isSmall ? 28 : 34 }}>{project.emoji}</Text>
        {isGitHub && (
          <View style={{
            position: 'absolute', top: 8, right: 10,
            backgroundColor: 'rgba(0,0,0,0.45)',
            paddingHorizontal: 7, paddingVertical: 3,
            borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
            flexDirection: 'row', alignItems: 'center', gap: 4,
          }}>
            <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#94a3b8' }} />
            <Text style={{ fontSize: 8, color: '#94a3b8', fontWeight: '600', letterSpacing: 0.3 }}>GITHUB</Text>
          </View>
        )}
      </LinearGradient>

      <View style={{ padding: r.isSmall ? 12 : 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={{ fontSize: r.fs.projName, fontWeight: '600', color: C.text, marginBottom: 2 }}>{project.name}</Text>
            <Text style={{ fontSize: r.isSmall ? 10 : 11, color: C.hint }}>{project.subtitle}</Text>
          </View>
          <View style={[
            { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 20, borderWidth: 1 },
            project.status === 'Prototype (Completed)'
              ? { backgroundColor: 'rgba(52,211,153,0.12)', borderColor: 'rgba(52,211,153,0.30)' }
              : { backgroundColor: 'rgba(251,191,36,0.12)', borderColor: 'rgba(251,191,36,0.28)' },
          ]}>
            <Text style={[
              { fontSize: r.isSmall ? 7 : 9, fontWeight: '600', letterSpacing: 0.4 },
              project.status === 'Prototype (Completed)' ? { color: '#34d399' } : { color: '#fbbf24' },
            ]}>
              {project.status.toUpperCase()}
            </Text>
          </View>
        </View>

        <Text style={{ fontSize: r.isSmall ? 11 : 12, color: C.muted, lineHeight: r.isSmall ? 17 : 18, marginBottom: 10, marginTop: 2 }}>
          {project.desc}
        </Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5 }}>
          {project.tech.map((t) => (
            <View key={t} style={{
              backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: C.border,
              borderRadius: 20, paddingHorizontal: 7, paddingVertical: 3,
            }}>
              <Text style={{ fontSize: r.isSmall ? 8 : 9, fontWeight: '600', color: C.hint, letterSpacing: 0.3 }}>{t.toUpperCase()}</Text>
            </View>
          ))}
        </View>

        {project.url && (
          <TouchableOpacity
            style={{
              marginTop: 12, backgroundColor: btnBg, borderWidth: 1, borderColor: btnBorder,
              borderRadius: 8, paddingVertical: r.isSmall ? 8 : 10, alignItems: 'center',
            }}
            onPress={handleOpen} activeOpacity={0.8}
          >
            <Text style={{ fontSize: r.isSmall ? 12 : 13, fontWeight: '600', color: btnColor }}>{btnLabel}</Text>
          </TouchableOpacity>
        )}

        {'githubUrl' in project && (project as any).githubUrl && (
          <TouchableOpacity
            style={{
              marginTop: 8, backgroundColor: C.githubDim, borderWidth: 1, borderColor: C.githubBorder,
              borderRadius: 8, paddingVertical: r.isSmall ? 8 : 10,
              alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6,
            }}
            onPress={() => Linking.openURL((project as any).githubUrl)} activeOpacity={0.8}
          >
            <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: C.github }} />
            <Text style={{ fontSize: r.isSmall ? 12 : 13, fontWeight: '600', color: C.github }}>View on GitHub →</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const GitHubComingSoon = ({ r }: { r: R }) => (
  <View style={{
    backgroundColor: C.surface, borderRadius: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', borderStyle: 'dashed',
    padding: r.isSmall ? 20 : 28, alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  }}>
    <Text style={{ fontSize: r.isSmall ? 30 : 36, marginBottom: 12 }}>🐙</Text>
    <Text style={{ fontSize: r.isSmall ? 13 : 15, fontWeight: '600', color: C.muted, marginBottom: 6, textAlign: 'center' }}>
      More projects coming soon
    </Text>
    <Text style={{ fontSize: r.isSmall ? 11 : 12, color: C.hint, textAlign: 'center', lineHeight: 18 }}>
      More GitHub repositories will be added here. Stay tuned!
    </Text>
  </View>
);

// ─── FULLSCREEN VIDEO PLAYER (must be before HardwareTab) ────────────────────
const FullscreenVideoPlayer = ({ onClose }: { onClose: () => void }) => {
  const { width, height } = useWindowDimensions();

  // Portrait video is 9:16. Fit it inside the screen without cropping.
  const videoAspect  = 9 / 16;
  const screenAspect = width / height;

  let videoW: number;
  let videoH: number;

  if (screenAspect < videoAspect) {
    // Screen is narrower than video aspect → constrain by width
    videoW = width;
    videoH = width / videoAspect;
  } else {
    // Screen is wider → constrain by height
    videoH = height;
    videoW = height * videoAspect;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ width: videoW, height: videoH }}>
        <Video
          source={require('./assets/1000035985.mp4')}
          style={{ width: '100%', height: '100%' }}
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay
          isLooping
          isMuted={false}
          useNativeControls={true}
        />
      </View>

      <TouchableOpacity
        onPress={onClose}
        style={{
          position: 'absolute',
          top: Platform.OS === 'ios' ? 54 : (RNStatusBar.currentHeight ?? 24) + 12,
          right: 20,
          backgroundColor: 'rgba(0,0,0,0.70)',
          borderRadius: 22, padding: 10,
          borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)',
        }}
      >
        <Ionicons name="close" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

// ─── HARDWARE TAB (FullscreenVideoPlayer must be defined above) ───────────────
const HardwareTab = ({ r }: { r: R }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const maxPreviewH = r.width * 0.9;
  const PORTRAIT_W  = Math.min(r.width * 0.58, 240);
  const PORTRAIT_H  = Math.min(PORTRAIT_W * (16 / 9), maxPreviewH);
  const FINAL_W     = PORTRAIT_H * (9 / 16);

  return (
    <View style={{ paddingHorizontal: r.px, paddingTop: r.isSmall ? 20 : 28 }}>

      {/* Header Card */}
      <View style={{
        backgroundColor: C.surface, borderRadius: 16,
        borderWidth: StyleSheet.hairlineWidth, borderColor: C.border,
        padding: r.isSmall ? 14 : 20, marginBottom: 16,
      }}>
        <Text style={{ fontSize: 10, color: C.termGreen, fontWeight: '600', letterSpacing: 1, marginBottom: 5 }}>
          HARDWARE
        </Text>
        <Text style={{ fontFamily: 'serif', fontSize: r.isSmall ? 19 : 22, fontWeight: '600', color: C.text, marginBottom: 8 }}>
          Physical Projects
        </Text>
        <Text style={{ fontSize: r.isSmall ? 12 : 13, color: C.muted, lineHeight: 19 }}>
          Real-world hardware builds paired with custom software I built from scratch.
        </Text>
      </View>

      {/* Smart Trash Card */}
      <View style={{
        backgroundColor: C.surface, borderRadius: 16,
        borderWidth: StyleSheet.hairlineWidth, borderColor: C.border,
        overflow: 'hidden', marginBottom: 14,
      }}>
        <TouchableOpacity onPress={() => setIsFullscreen(true)} activeOpacity={0.92}>
          <View style={{ backgroundColor: '#000', alignItems: 'center', justifyContent: 'center', paddingVertical: 20 }}>
            <View style={{ width: FINAL_W, height: PORTRAIT_H, borderRadius: 12, overflow: 'hidden', backgroundColor: '#000' }}>
              <Video
                source={require('./assets/1000035985.mp4')}
                style={{ width: '100%', height: '100%' }}
                resizeMode={ResizeMode.COVER}
                shouldPlay
                isLooping
                isMuted={true}
                useNativeControls={false}
              />
            </View>

            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.50)']}
              style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60 }}
            />

            <View style={{
              position: 'absolute', top: 28, left: 16,
              backgroundColor: 'rgba(0,0,0,0.65)',
              borderRadius: 20, paddingHorizontal: 9, paddingVertical: 4,
              flexDirection: 'row', alignItems: 'center', gap: 5,
              borderWidth: 1, borderColor: 'rgba(255,255,255,0.14)',
            }}>
              <Ionicons name="volume-mute-outline" size={11} color={C.muted} />
              <Text style={{ fontSize: 9, color: C.muted, fontWeight: '600', letterSpacing: 0.4 }}>MUTED</Text>
            </View>

            <View style={{
              position: 'absolute', top: 28, right: 16,
              backgroundColor: 'rgba(0,255,136,0.12)',
              borderRadius: 20, paddingHorizontal: 9, paddingVertical: 4,
              borderWidth: 1, borderColor: C.termGreenBorder,
              flexDirection: 'row', alignItems: 'center', gap: 5,
            }}>
              <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: C.termGreen }} />
              <Text style={{ fontSize: 9, color: C.termGreen, fontWeight: '600', letterSpacing: 0.4 }}>HARDWARE</Text>
            </View>

            <View style={{
              position: 'absolute', bottom: 26, right: 16,
              backgroundColor: 'rgba(0,0,0,0.65)',
              borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5,
              flexDirection: 'row', alignItems: 'center', gap: 5,
              borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)',
            }}>
              <Ionicons name="expand-outline" size={13} color="#fff" />
              <Text style={{ fontSize: 10, color: '#fff', fontWeight: '600' }}>Tap for fullscreen</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Info Section */}
        <View style={{ padding: r.isSmall ? 12 : 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={{ fontSize: r.fs.projName, fontWeight: '600', color: C.text, marginBottom: 2 }}>🗑️ Smart Trash</Text>
              <Text style={{ fontSize: r.isSmall ? 10 : 11, color: C.hint }}>IoT Hardware + Mobile App</Text>
            </View>
            <View style={{
              backgroundColor: 'rgba(52,211,153,0.12)', borderWidth: 1,
              borderColor: 'rgba(52,211,153,0.30)', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 20,
            }}>
              <Text style={{ fontSize: r.isSmall ? 7 : 9, fontWeight: '600', letterSpacing: 0.4, color: '#34d399' }}>COMPLETED</Text>
            </View>
          </View>

          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: r.isSmall ? 10 : 11, fontWeight: '700', color: C.termGreen, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 5 }}>
              Introduction
            </Text>
            <Text style={{ fontSize: r.isSmall ? 11 : 12, color: C.muted, lineHeight: r.isSmall ? 18 : 20 }}>
              An IoT-based smart physical trash bin system integrated with a custom mobile application for real-time waste monitoring and management. The project combines multiple ESP32 microcontrollers, wireless communication, computer vision, sensors, and Firebase cloud integration to automate waste segregation and remotely monitor trash storage levels through an internet-connected application. Developed using Arduino IDE with C++ programming for embedded system control, sensor integration, and communication between hardware components.
            </Text>
          </View>

          <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: C.border, marginBottom: 12 }} />

          <View style={{ marginBottom: 14 }}>
            <Text style={{ fontSize: r.isSmall ? 10 : 11, fontWeight: '700', color: C.termGreen, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 5 }}>
              Description
            </Text>
            <Text style={{ fontSize: r.isSmall ? 11 : 12, color: C.muted, lineHeight: r.isSmall ? 18 : 20, marginBottom: 10 }}>
              The system is powered by 4 ESP32 boards that communicate with each other wirelessly to perform different tasks within the smart trash bin environment.
            </Text>
            <Text style={{ fontSize: r.isSmall ? 11 : 12, color: C.muted, lineHeight: r.isSmall ? 18 : 20, marginBottom: 10 }}>
              One ESP32 board is connected to a camera module responsible for identifying different types of waste such as paper, plastic, metal, and unknown/random trash. After detecting the trash category, the camera module wirelessly communicates with another ESP32 board that controls the servo motors connected to a 4-way trap door mechanism. This mechanism automatically directs the detected trash into its designated storage compartment.
            </Text>
            <Text style={{ fontSize: r.isSmall ? 11 : 12, color: C.muted, lineHeight: r.isSmall ? 18 : 20, marginBottom: 10 }}>
              Inside the trash storage section, ultrasonic sensors connected to another dedicated ESP32 board continuously monitor how full each of the four storage compartments is. The collected fill-level data is then sent wirelessly to a separate ESP32 board connected to a TFT display screen, which visually shows the real-time storage status of all trash categories.
            </Text>
            <Text style={{ fontSize: r.isSmall ? 11 : 12, color: C.muted, lineHeight: r.isSmall ? 18 : 20 }}>
              The TFT display ESP32 also serves as the main communication bridge between the hardware system and the custom mobile application. Using Firebase for cloud synchronization, this board sends real-time monitoring data to the mobile app, allowing users and administrators to remotely check the status of the trash bins. This is the only ESP32 board that requires an internet connection in order to communicate with the application and enable remote monitoring functionality.
            </Text>
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5 }}>
            {['React Native', 'Expo', 'Firebase', 'IoT', 'Hardware', 'C++', 'Arduino IDE'].map((t) => (
              <View key={t} style={{
                backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: C.border,
                borderRadius: 20, paddingHorizontal: 7, paddingVertical: 3,
              }}>
                <Text style={{ fontSize: r.isSmall ? 8 : 9, fontWeight: '600', color: C.hint, letterSpacing: 0.3 }}>
                  {t.toUpperCase()}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Fullscreen Modal */}
      <Modal
        visible={isFullscreen}
        animationType="fade"
        statusBarTranslucent
        supportedOrientations={['portrait', 'landscape']}
        onRequestClose={() => setIsFullscreen(false)}
      >
        <FullscreenVideoPlayer onClose={() => setIsFullscreen(false)} />
      </Modal>
    </View>
  );
};

// ─── PROJECTS PAGE ────────────────────────────────────────────────────────────
type ProjectFilter = 'all' | 'website' | 'app' | 'hardware';

const ProjectsPage = ({ r, scrollRef }: { r: R; scrollRef: React.RefObject<ScrollView> }) => {
  const [filter, setFilter] = useState<ProjectFilter>('all');
  const websiteCount = PROJECTS.filter(p => p.type === 'website').length;
  const appCount     = PROJECTS.filter(p => p.type === 'app').length;
  const filtered     = filter === 'all' ? PROJECTS : PROJECTS.filter(p => p.type === filter);

  const FILTER_TABS: { key: ProjectFilter; label: string; count: number }[] = [
    { key: 'all',      label: 'All',      count: PROJECTS.length + 1 },
    { key: 'website',  label: 'Websites', count: websiteCount         },
    { key: 'app',      label: 'Apps',     count: appCount             },
    { key: 'hardware', label: 'Hardware', count: 1                    },
  ];

  return (
    <ScrollView
      ref={scrollRef}
      style={{ flex: 1 }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: Platform.OS === 'android' ? 20 : 0 }}
    >
      <View style={{ paddingHorizontal: r.px, paddingTop: r.isSmall ? 20 : 28 }}>
        <View style={{
          backgroundColor: C.surface, borderRadius: 16,
          borderWidth: StyleSheet.hairlineWidth, borderColor: C.border,
          padding: r.isSmall ? 14 : 20, marginBottom: 16,
        }}>
          <Text style={{ fontSize: 10, color: C.accent, fontWeight: '600', letterSpacing: 1, marginBottom: 5 }}>MY WORK</Text>
          <Text style={{ fontFamily: 'serif', fontSize: r.isSmall ? 19 : 22, fontWeight: '600', color: C.text, marginBottom: 8 }}>
            Projects Showcase
          </Text>
          <Text style={{ fontSize: r.isSmall ? 12 : 13, color: C.muted, lineHeight: 19, marginBottom: 12 }}>
            Live deployments, open-source work on GitHub, and hardware builds.
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            <View style={{ backgroundColor: 'rgba(52,211,153,0.12)', borderWidth: 1, borderColor: 'rgba(52,211,153,0.30)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
              <Text style={{ fontSize: 10, color: '#34d399', fontWeight: '600' }}>🌐 {websiteCount} Website</Text>
            </View>
            <View style={{ backgroundColor: C.githubDim, borderWidth: 1, borderColor: C.githubBorder, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
              <Text style={{ fontSize: 10, color: C.github, fontWeight: '600' }}>📱 {appCount} Apps</Text>
            </View>
            <View style={{ backgroundColor: C.termGreenDim, borderWidth: 1, borderColor: C.termGreenBorder, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
              <Text style={{ fontSize: 10, color: C.termGreen, fontWeight: '600' }}>🔧 1 Hardware</Text>
            </View>
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={{
          flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.25)',
          borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: C.border,
          padding: 4, marginBottom: 20, gap: 4,
        }}>
          {FILTER_TABS.map((tab) => {
            const isActive   = filter === tab.key;
            const isHardware = tab.key === 'hardware';
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setFilter(tab.key)}
                activeOpacity={0.75}
                style={{
                  flex: 1, paddingVertical: r.isSmall ? 8 : 10, borderRadius: 9,
                  alignItems: 'center',
                  backgroundColor: isActive ? (isHardware ? C.termGreen : C.accent) : 'transparent',
                }}
              >
                <Text style={{
                  fontSize: r.isSmall ? 10 : 12, fontWeight: '600',
                  color: isActive ? (isHardware ? '#001a0d' : C.accentDark) : C.hint,
                  letterSpacing: 0.3,
                }}>
                  {tab.label}
                </Text>
                <Text style={{
                  fontSize: r.isSmall ? 8 : 10, fontWeight: '500',
                  color: isActive ? (isHardware ? '#001a0d' : C.accentDark) : C.hint,
                  opacity: isActive ? 0.7 : 0.5, marginTop: 1,
                }}>
                  {tab.count} {tab.count === 1 ? 'project' : 'projects'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {filter !== 'all' && filter !== 'hardware' && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Text style={{ fontSize: r.isSmall ? 11 : 12, color: C.hint, fontWeight: '500', letterSpacing: 0.4, textTransform: 'uppercase' }}>
              {filter === 'website' ? '🌐 Website Projects' : '📱 App Projects'}
            </Text>
            <View style={{ flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: C.border }} />
          </View>
        )}

        {filter !== 'hardware' && filtered.map((p) => <ProjectCard key={p.name} project={p} r={r} />)}
        {(filter === 'hardware' || filter === 'all') && <HardwareTab r={r} />}
        {filter !== 'hardware' && <GitHubComingSoon r={r} />}
      </View>

      <View style={{ paddingHorizontal: r.px, paddingVertical: 20, alignItems: 'center', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.border }}>
        <Text style={{ fontSize: 10, color: C.hint, textAlign: 'center' }}>
          © 2026 Jhon Rey Y. Lazarra · BS Information Technology
        </Text>
      </View>
    </ScrollView>
  );
};

// ─── CONTACT ROW ─────────────────────────────────────────────────────────────
type ContactRowProps = {
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  iconColor: string;
  iconBg: string;
  iconBorder: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  r: R;
};

const ContactRow = ({ iconName, iconColor, iconBg, iconBorder, title, subtitle, onPress, r }: ContactRowProps) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}
    style={{
      flexDirection: 'row', alignItems: 'center', gap: 14,
      backgroundColor: C.surface,
      borderWidth: StyleSheet.hairlineWidth, borderColor: C.border,
      borderRadius: 14,
      paddingVertical: r.isSmall ? 12 : 14, paddingHorizontal: r.isSmall ? 14 : 16,
      marginBottom: 10,
    }}
  >
    <View style={{
      width: 40, height: 40, borderRadius: 20,
      backgroundColor: iconBg, borderWidth: 1, borderColor: iconBorder,
      alignItems: 'center', justifyContent: 'center',
    }}>
      <Ionicons name={iconName} size={20} color={iconColor} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: r.isSmall ? 13 : 14, fontWeight: '600', color: C.text }}>{title}</Text>
      <Text style={{ fontSize: r.isSmall ? 11 : 12, color: C.hint, marginTop: 1 }}>{subtitle}</Text>
    </View>
    <Text style={{ fontSize: 12, color: C.hint }}>→</Text>
  </TouchableOpacity>
);

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
type Tab = 'home' | 'projects' | 'contact';

const STATUS_BAR_H    = Platform.OS === 'android' ? (RNStatusBar.currentHeight ?? 24) : 0;
const NAV_PADDING_TOP = Platform.OS === 'ios' ? 54 : STATUS_BAR_H + 10;

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const r = useResponsive();

  const handleEmail = () => Linking.openURL('https://mail.google.com/mail/?view=cm&to=iamstorage24@gmail.com');
  const handlePhone = () => Linking.openURL('tel:09480681543');

  const homeRef           = useRef<ScrollView>(null);
  const projectRef        = useRef<ScrollView>(null);
  const contactSectionRef = useRef<View>(null);

  const switchTab = (tab: Tab) => {
    if (tab === 'contact') {
      setActiveTab('home');
      setTimeout(() => {
        contactSectionRef.current?.measureLayout(
          homeRef.current as any,
          (_x, y) => { homeRef.current?.scrollTo({ y, animated: true }); },
          ()      => { homeRef.current?.scrollToEnd({ animated: true }); }
        );
      }, 80);
    } else {
      setActiveTab(tab);
      if (tab === 'home')     homeRef.current?.scrollTo({ y: 0, animated: false });
      if (tab === 'projects') projectRef.current?.scrollTo({ y: 0, animated: false });
    }
  };

  const NAV_TABS: { key: Tab; label: string }[] = [
    { key: 'home',     label: 'Portfolio' },
    { key: 'projects', label: 'Projects'  },
    { key: 'contact',  label: 'Contact'   },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: C.grad1 }}>
      <StatusBar style="light" />
      <AnimatedGradientBg />

      {/* ── NAV BAR ── */}
      <View style={{
        backgroundColor: 'rgba(11,15,26,0.90)',
        borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.border,
        paddingTop: NAV_PADDING_TOP, paddingHorizontal: r.px,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 10 }}>
          <Text style={{ fontFamily: 'serif', fontSize: r.fs.navLogo, fontWeight: '600', color: C.text, letterSpacing: -0.3 }}>
            Jhon Rey Lazarra
          </Text>
        </View>
        <View style={{ flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.border }}>
          {NAV_TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={{ flex: 1, paddingVertical: 11, alignItems: 'center', position: 'relative' }}
                onPress={() => switchTab(tab.key)}
                activeOpacity={0.7}
              >
                <Text style={{
                  fontSize: r.isSmall ? 11 : 12, fontWeight: '500',
                  color: isActive ? C.accent : C.hint,
                  letterSpacing: 0.5, textTransform: 'uppercase',
                }}>
                  {tab.label}
                </Text>
                {isActive && (
                  <View style={{
                    position: 'absolute', bottom: 0, left: '20%', right: '20%',
                    height: 2, backgroundColor: C.accent, borderRadius: 2,
                  }} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ── HOME PAGE ── */}
      {activeTab === 'home' && (
        <ScrollView
          ref={homeRef}
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: Platform.OS === 'android' ? 20 : 0 }}
        >
          <CoverHero r={r} />
          <Divider />

          <View style={{ paddingHorizontal: r.px, paddingVertical: r.isSmall ? 20 : 28 }}>
            <SectionHeader title="Technical Skills" r={r} />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: r.gap }}>
              {SKILLS.map((s) => <SkillCard key={s.name} skill={s} r={r} />)}
            </View>
          </View>
          <Divider />

          <View style={{ paddingHorizontal: r.px, paddingVertical: r.isSmall ? 20 : 28 }}>
            <SectionHeader title="Experience" r={r} />
            {EXPERIENCE.map((item) => <ExpCard key={item.role} item={item} r={r} />)}
          </View>
          <Divider />

          <View style={{ paddingVertical: r.isSmall ? 20 : 28 }}>
            <View style={{ paddingHorizontal: r.px, marginBottom: 16 }}>
              <SectionHeader title="Education" r={r} />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: r.px, gap: r.gap }}>
              {EDUCATION.map((e) => <EduCard key={e.years} item={e} r={r} />)}
            </ScrollView>
          </View>
          <Divider />

          <View style={{ paddingHorizontal: r.px, paddingVertical: r.isSmall ? 20 : 28 }}>
            <SectionHeader title="Certificates & Awards" r={r} />
            {CERTS.map((c) => <CertCard key={c.name} cert={c} r={r} />)}
          </View>
          <Divider />

          {/* ── CONTACT SECTION ── */}
          <View
            ref={contactSectionRef}
            style={{ paddingHorizontal: r.px, paddingVertical: r.isSmall ? 20 : 28 }}
          >
            <Text style={{ fontFamily: 'serif', fontSize: r.isSmall ? 20 : 24, fontWeight: '500', color: C.text, marginBottom: 6 }}>
              Let's work together
            </Text>
            <Text style={{ fontSize: r.fs.heroSub, color: C.muted, fontWeight: '300', lineHeight: 20, marginBottom: 20 }}>
              Looking for a dedicated IT graduate ready to contribute and grow? Reach out.
            </Text>

            <Text style={{ fontSize: 10, color: C.hint, fontWeight: '600', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10 }}>
              Résumé
            </Text>
            <ResumeDownloadButton r={r} />

            <View style={{ height: 16 }} />

            <Text style={{ fontSize: 10, color: C.hint, fontWeight: '600', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10 }}>
              Contact
            </Text>
            <ContactRow
              iconName="call-outline"
              iconColor="#34d399"
              iconBg="rgba(52,211,153,0.12)"
              iconBorder="rgba(52,211,153,0.25)"
              title="Call Me"
              subtitle="09480681543"
              onPress={handlePhone}
              r={r}
            />
            <ContactRow
              iconName="mail-outline"
              iconColor={C.accent}
              iconBg={C.accentDim}
              iconBorder={C.accentBorder}
              title="Email"
              subtitle="iamstorage24@gmail.com"
              onPress={handleEmail}
              r={r}
            />

            <Text style={{ fontSize: 10, color: C.hint, fontWeight: '600', letterSpacing: 1.2, textTransform: 'uppercase', marginTop: 10, marginBottom: 10 }}>
              Socials
            </Text>
            <ContactRow
              iconName="logo-facebook"
              iconColor="#6b8cdb"
              iconBg="rgba(59,89,152,0.18)"
              iconBorder="rgba(59,89,152,0.35)"
              title="Facebook"
              subtitle="View Profile"
              onPress={() => Linking.openURL('https://www.facebook.com/share/1Fwrk22X5Q/')}
              r={r}
            />
            <ContactRow
              iconName="logo-instagram"
              iconColor="#e1306c"
              iconBg="rgba(193,53,132,0.14)"
              iconBorder="rgba(193,53,132,0.30)"
              title="Instagram"
              subtitle="@youmightknowmefrm"
              onPress={() => Linking.openURL('https://www.instagram.com/youmightknowmefrm?igsh=MWhremF0MDc0ZnEyeA==')}
              r={r}
            />
          </View>

          <View style={{ paddingHorizontal: r.px, paddingVertical: 20, alignItems: 'center', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.border }}>
            <Text style={{ fontSize: 10, color: C.hint, textAlign: 'center' }}>
              © 2026 Jhon Rey Y. Lazarra · BS Information Technology
            </Text>
          </View>
        </ScrollView>
      )}

      {/* ── PROJECTS PAGE ── */}
      {activeTab === 'projects' && (
        <ProjectsPage r={r} scrollRef={projectRef} />
      )}
    </View>
  );
}