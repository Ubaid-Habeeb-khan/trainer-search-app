// App.js
import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StatusBar,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import {
  Ionicons,
  MaterialCommunityIcons,
  Feather,
  MaterialIcons,
} from '@expo/vector-icons';

// ---------- THEME SETUP ----------

const lightColors = {
  bg: '#f3f4f6',
  bgSecondary: 'rgba(255,255,255,0.92)',
  card: 'rgba(255,255,255,0.98)',
  border: 'rgba(15,23,42,0.12)',
  text: '#020617',
  textMuted: '#6b7280',
  accent: '#6366f1',
  accentSoft: 'rgba(99,102,241,0.14)',
  danger: '#fb7185',
  success: '#22c55e',
  neonCyan: '#22d3ee',
  neonPink: '#fb37ff',
};

const darkColors = {
  bg: '#020617',
  bgSecondary: 'rgba(15,23,42,0.96)',
  card: 'rgba(15,23,42,0.92)',
  border: 'rgba(148,163,184,0.28)',
  text: '#e5e7eb',
  textMuted: '#9ca3af',
  accent: '#6366f1',
  accentSoft: 'rgba(99,102,241,0.28)',
  danger: '#fb7185',
  success: '#22c55e',
  neonCyan: '#22d3ee',
  neonPink: '#fb37ff',
};

const STORAGE_KEY = 'student-companion-v1';

const Tab = createBottomTabNavigator();

// ---------- SMALL UTILITIES ----------

const GlassCard = ({ colors, children, style }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.94)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
        style,
      ]}
    >
      <LinearGradient
        colors={[
          colors.bgSecondary,
          Platform.OS === 'ios'
            ? 'rgba(148,163,184,0.18)'
            : 'rgba(15,23,42,0.85)',
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 28,
          padding: 20,
          borderWidth: 1,
          borderColor: colors.border,
          shadowColor: colors.neonCyan,
          shadowOpacity: 0.35,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 10 },
          elevation: 10,
        }}
      >
        {children}
      </LinearGradient>
    </Animated.View>
  );
};

const SectionTitle = ({ colors, icon, label }) => (
  <View
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
      gap: 8,
    }}
  >
    {icon}
    <Text
      style={{
        color: colors.text,
        fontSize: 18,
        fontWeight: '700',
      }}
    >
      {label}
    </Text>
  </View>
);

// small helper
const appBackgroundForInput = (secondary, bg) => {
  return Platform.OS === 'ios' ? secondary : bg;
};

// ---------- DATA MODELS (IN STATE) ----------

const defaultState = {
  theme: 'dark', // 'dark' | 'light'
  subjects: [
    { id: '1', name: 'DSA', attended: 18, total: 22 },
    { id: '2', name: 'OS', attended: 15, total: 20 },
    { id: '3', name: 'DBMS', attended: 12, total: 18 },
  ],
  tasks: [
    { id: '1', title: 'Finish DSA assignment', due: 'Today', done: false },
    { id: '2', title: 'Revise OS Unit 2', due: 'Tomorrow', done: false },
  ],
  docs: [],
  timetable: {
    Monday: ['9–10 DSA', '10–11 DBMS', '2–3 OS'],
    Tuesday: ['9–10 Maths', '11–12 DBMS Lab'],
    Wednesday: ['10–11 DAA', '2–4 Mini Project'],
    Thursday: ['9–10 OS', '3–4 Sports'],
    Friday: ['9–10 DBMS', '11–12 DSA'],
  },
  profile: {
    name: 'Nandhu',
    usn: '4NI24IS161',
    college: 'The National Institute of Engineering',
    branch: 'ISE',
    semester: '3rd Sem',
  },
  // CGPA: only semester-wise + overall
  cgpaData: {
    semesters: [
      { id: '1', name: 'Sem 1', sgpa: '8.2', credits: '20' },
      { id: '2', name: 'Sem 2', sgpa: '8.5', credits: '22' },
    ],
  },
};

// ---------- ROOT APP (STATE + STORAGE) ----------

const App = () => {
  const [appState, setAppState] = useState(defaultState);
  const [loading, setLoading] = useState(true);

  const colors = appState.theme === 'dark' ? darkColors : lightColors;

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          setAppState({ ...defaultState, ...parsed });
        }
      } catch (e) {
        console.log('Failed to load state', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (loading) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(appState)).catch((e) =>
      console.log('Failed to save', e)
    );
  }, [appState, loading]);

  const setPart = (key, value) => {
    setAppState((prev) => ({ ...prev, [key]: value }));
  };

  const toggleTheme = () => {
    setAppState((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));
  };

  if (loading) {
    return (
      <LinearGradient
        colors={[colors.bg, colors.bgSecondary]}
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <StatusBar
          barStyle={appState.theme === 'dark' ? 'light-content' : 'dark-content'}
        />
        <Text
          style={{
            color: colors.neonCyan,
            fontSize: 26,
            fontWeight: '800',
          }}
        >
          Student Companion
        </Text>
        <Text
          style={{
            color: colors.textMuted,
            marginTop: 6,
            fontSize: 14,
          }}
        >
          Loading your campus chaos...
        </Text>
      </LinearGradient>
    );
  }

  return (
    <NavigationContainer>
      <LinearGradient
        colors={
          appState.theme === 'dark'
            ? ['#020617', '#020617', '#0b1120']
            : ['#e0f2fe', '#f5f3ff', '#f9fafb']
        }
        style={{ flex: 1 }}
      >
        <StatusBar
          barStyle={appState.theme === 'dark' ? 'light-content' : 'dark-content'}
        />
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarShowLabel: false,
            tabBarStyle: {
              backgroundColor:
                appState.theme === 'dark'
                  ? 'rgba(15,23,42,0.98)'
                  : 'rgba(255,255,255,0.98)',
              borderTopWidth: 0,
              elevation: 14,
              shadowColor: colors.neonPink,
              shadowOpacity: 0.35,
              shadowRadius: 18,
              shadowOffset: { width: 0, height: -6 },
              height: 72,
            },
            tabBarIcon: ({ focused }) => {
              let icon;
              if (route.name === 'Home') {
                icon = (
                  <Ionicons
                    name="home"
                    size={26}
                    color={focused ? colors.neonCyan : colors.textMuted}
                  />
                );
              } else if (route.name === 'Attendance') {
                icon = (
                  <MaterialCommunityIcons
                    name="calendar-check"
                    size={26}
                    color={focused ? colors.neonCyan : colors.textMuted}
                  />
                );
              } else if (route.name === 'Tasks') {
                icon = (
                  <Feather
                    name="check-square"
                    size={26}
                    color={focused ? colors.neonCyan : colors.textMuted}
                  />
                );
              } else if (route.name === 'Timetable') {
                icon = (
                  <Ionicons
                    name="calendar"
                    size={26}
                    color={focused ? colors.neonCyan : colors.textMuted}
                  />
                );
              } else if (route.name === 'Profile') {
                icon = (
                  <Ionicons
                    name="person-circle"
                    size={28}
                    color={focused ? colors.neonCyan : colors.textMuted}
                  />
                );
              }
              return (
                <View
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: 10,
                    paddingVertical: 8,
                    borderRadius: 999,
                    backgroundColor: focused ? colors.accentSoft : 'transparent',
                  }}
                >
                  {icon}
                </View>
              );
            },
          })}
        >
          <Tab.Screen name="Home">
            {(props) => (
              <HomeScreen
                {...props}
                colors={colors}
                appState={appState}
                setPart={setPart}
                toggleTheme={toggleTheme}
              />
            )}
          </Tab.Screen>

          <Tab.Screen name="Attendance">
            {(props) => (
              <AttendanceScreen
                {...props}
                colors={colors}
                subjects={appState.subjects}
                setSubjects={(v) => setPart('subjects', v)}
              />
            )}
          </Tab.Screen>

          <Tab.Screen name="Tasks">
            {(props) => (
              <TasksScreen
                {...props}
                colors={colors}
                tasks={appState.tasks}
                setTasks={(v) => setPart('tasks', v)}
                cgpaData={appState.cgpaData}
                setCgpaData={(v) => setPart('cgpaData', v)}
              />
            )}
          </Tab.Screen>

          <Tab.Screen name="Timetable">
            {(props) => (
              <TimetableScreen
                {...props}
                colors={colors}
                timetable={appState.timetable}
                setTimetable={(v) => setPart('timetable', v)}
              />
            )}
          </Tab.Screen>

          <Tab.Screen name="Profile">
            {(props) => (
              <ProfileScreen
                {...props}
                colors={colors}
                profile={appState.profile}
                setProfile={(v) => setPart('profile', v)}
                docs={appState.docs}
                setDocs={(v) => setPart('docs', v)}
                theme={appState.theme}
                toggleTheme={toggleTheme}
              />
            )}
          </Tab.Screen>
        </Tab.Navigator>
      </LinearGradient>
    </NavigationContainer>
  );
};

// ---------- ATTENDANCE & ANALYTICS ----------

const calcOverall = (subjects) => {
  let attended = 0;
  let total = 0;
  subjects.forEach((s) => {
    attended += s.attended;
    total += s.total;
  });
  return total === 0 ? 0 : Math.round((attended / total) * 100);
};

const classesYouCanBunk = (subject, target = 75) => {
  let a = subject.attended;
  let t = subject.total;
  let bunk = 0;

  // classes you can skip and still stay >= target
  while (t > 0) {
    const pct = Math.round((a / t) * 100);
    if (pct < target) break;
    bunk += 1;
    t += 1; // total increases, attended same
    const newPct = Math.round((a / t) * 100);
    if (newPct < target) {
      bunk -= 1;
      break;
    }
  }
  return Math.max(0, bunk);
};

const classesYouMustAttend = (subject, target = 75) => {
  let a = subject.attended;
  let t = subject.total;
  let need = 0;

  if (t === 0) return 3; // just a default "attend 3 classes" joke

  while (need < 200) {
    const pct = Math.round(((a + need) / (t + need)) * 100);
    if (pct >= target) break;
    need += 1;
  }
  return need;
};

const getAttendanceInsights = (subjects) => {
  if (!subjects.length) return null;
  const sorted = [...subjects].sort(
    (a, b) => (a.attended / (a.total || 1)) - (b.attended / (b.total || 1))
  );
  const lowest = sorted[0];
  const need = classesYouMustAttend(lowest, 75);
  return { lowest, need };
};

const AttendanceScreen = ({ colors, subjects, setSubjects }) => {
  const [newSub, setNewSub] = useState('');
  const overall = calcOverall(subjects);
  const insights = useMemo(() => getAttendanceInsights(subjects), [subjects]);

  const addSubject = () => {
    if (!newSub.trim()) return;
    setSubjects([
      ...subjects,
      { id: Date.now().toString(), name: newSub.trim(), attended: 0, total: 0 },
    ]);
    setNewSub('');
  };

  const mark = (id, present) => {
    setSubjects(
      subjects.map((s) =>
        s.id === id
          ? {
              ...s,
              total: s.total + 1,
              attended: s.attended + (present ? 1 : 0),
            }
          : s
      )
    );
  };

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 18, paddingBottom: 100, gap: 16 }}
    >
      <GlassCard colors={colors}>
        <SectionTitle
          colors={colors}
          label="Attendance Dashboard"
          icon={
            <MaterialCommunityIcons
              name="calendar-check"
              size={22}
              color={colors.neonCyan}
            />
          }
        />
        <Text style={{ color: colors.textMuted, fontSize: 14, marginBottom: 10 }}>
          Tap <Text style={{ color: colors.success }}>Present</Text> or
          <Text style={{ color: colors.danger }}> Absent</Text> after each class.
          We&apos;ll tell you if you can chill or need to become &quot;first bencher
          mode&quot; 😅.
        </Text>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 12,
            gap: 12,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: colors.textMuted,
                fontSize: 13,
              }}
            >
              Overall Attendance
            </Text>
            <Text
              style={{
                color: overall < 75 ? colors.danger : colors.success,
                fontSize: 30,
                fontWeight: '800',
              }}
            >
              {overall}%
            </Text>
            <Text
              style={{
                color: colors.textMuted,
                fontSize: 12,
                marginTop: 2,
              }}
            >
              {overall >= 85
                ? 'You are the teacher’s favourite 📚'
                : overall >= 75
                ? 'You are safe, but don’t get too excited 😏'
                : 'Shortage bhai shortage! Time to attend classes 🥲'}
            </Text>
          </View>
          {insights && (
            <View
              style={{
                flex: 1,
                padding: 10,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: 'rgba(15,23,42,0.4)',
              }}
            >
              <Text
                style={{
                  color: colors.textMuted,
                  fontSize: 12,
                  marginBottom: 4,
                }}
              >
                Most risky subject
              </Text>
              <Text
                style={{
                  color: colors.neonPink,
                  fontWeight: '700',
                  fontSize: 15,
                }}
              >
                {insights.lowest.name}
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 4 }}>
                Attend next{' '}
                <Text style={{ color: colors.neonCyan, fontWeight: '700' }}>
                  {insights.need}
                </Text>{' '}
                class(es) of this or attendance will roast you in internal memos 🔥
              </Text>
            </View>
          )}
        </View>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
          <TextInput
            placeholder="Add subject (e.g. DAA)"
            placeholderTextColor={colors.textMuted}
            value={newSub}
            onChangeText={setNewSub}
            style={[
              styles.input,
              {
                flex: 1,
                borderColor: colors.border,
                color: colors.text,
                backgroundColor: appBackgroundForInput(
                  colors.bgSecondary,
                  colors.bg
                ),
                fontSize: 14,
              },
            ]}
          />
          <TouchableOpacity
            onPress={addSubject}
            style={[
              styles.button,
              { backgroundColor: colors.accent, paddingHorizontal: 18 },
            ]}
          >
            <Text style={{ color: 'white', fontWeight: '700', fontSize: 14 }}>
              Add
            </Text>
          </TouchableOpacity>
        </View>
      </GlassCard>

      <GlassCard colors={colors}>
        <SectionTitle
          colors={colors}
          label="Subjects"
          icon={<Ionicons name="book" size={22} color={colors.neonCyan} />}
        />
        {subjects.length === 0 ? (
          <Text style={{ color: colors.textMuted, fontSize: 14 }}>
            No subjects yet. Add one above and start your attendance era.
          </Text>
        ) : (
          subjects.map((s) => {
            const pct = s.total ? Math.round((s.attended / s.total) * 100) : 0;
            const isLow = s.total > 0 && pct < 75;
            const bunk = classesYouCanBunk(s, 75);
            const need = classesYouMustAttend(s, 75);

            let funnyMsg = '';
            if (s.total === 0) {
              funnyMsg = 'No classes marked yet — are you even in this course? 😭';
            } else if (pct >= 90) {
              funnyMsg = `You can bunk like a boss. Approx ${bunk} class(es) spare 😎`;
            } else if (pct >= 75) {
              funnyMsg = bunk > 0
                ? `Chill. You can bunk around ${bunk} class(es) & still be safe 😌`
                : 'One more bunk and you enter danger zone, tread carefully 🤏';
            } else {
              funnyMsg = `Attend next ${need} class(es) like it’s compulsory attendance viva 💀`;
            }

            return (
              <View
                key={s.id}
                style={{
                  padding: 14,
                  borderRadius: 22,
                  borderWidth: 1,
                  borderColor: colors.border,
                  marginBottom: 12,
                  backgroundColor: 'rgba(15,23,42,0.4)',
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginBottom: 6,
                  }}
                >
                  <Text
                    style={{
                      color: colors.text,
                      fontWeight: '700',
                      fontSize: 16,
                    }}
                  >
                    {s.name}
                  </Text>
                  <Text style={{ color: colors.textMuted, fontSize: 13 }}>
                    {s.attended}/{s.total} classes
                  </Text>
                </View>
                <View
                  style={{
                    height: 8,
                    borderRadius: 999,
                    backgroundColor: 'rgba(148,163,184,0.35)',
                    marginTop: 4,
                    overflow: 'hidden',
                  }}
                >
                  <View
                    style={{
                      width: `${pct}%`,
                      height: '100%',
                      borderRadius: 999,
                      backgroundColor: isLow ? colors.danger : colors.success,
                    }}
                  />
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 8,
                  }}
                >
                  <Text
                    style={{
                      color: isLow ? colors.danger : colors.success,
                      fontSize: 13,
                    }}
                  >
                    {pct}% attendance
                  </Text>
                  <Text style={{ color: colors.textMuted, fontSize: 13 }}>
                    {funnyMsg}
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    marginTop: 10,
                    gap: 10,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => mark(s.id, true)}
                    style={[
                      styles.button,
                      { flex: 1, backgroundColor: colors.success },
                    ]}
                  >
                    <Text
                      style={{
                        color: 'black',
                        fontWeight: '700',
                        fontSize: 14,
                      }}
                    >
                      Present
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => mark(s.id, false)}
                    style={[
                      styles.button,
                      {
                        flex: 1,
                        borderWidth: 1,
                        borderColor: colors.danger,
                        backgroundColor: 'transparent',
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: colors.danger,
                        fontWeight: '700',
                        fontSize: 14,
                      }}
                    >
                      Absent
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </GlassCard>
    </ScrollView>
  );
};

// ---------- TASKS + TIMER + CGPA + SMART ASSISTANT ----------

const FocusTimerCard = ({ colors }) => {
  const [minutes, setMinutes] = useState(30);
  const [secondsLeft, setSecondsLeft] = useState(30 * 60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (!running) setSecondsLeft(minutes * 60);
  }, [minutes, running]);

  const m = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const s = String(secondsLeft % 60).padStart(2, '0');
  const total = Math.max(minutes * 60, 1);
  const progress = Math.min(100, Math.max(0, ((total - secondsLeft) / total) * 100));

  return (
    <GlassCard colors={colors}>
      <SectionTitle
        colors={colors}
        label="Focus Timer"
        icon={<Feather name="target" size={22} color={colors.neonCyan} />}
      />
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 10,
        }}
      >
        <Text style={{ color: colors.textMuted, fontSize: 14 }}>
          Session length (min)
        </Text>
        <TextInput
          keyboardType="numeric"
          value={String(minutes)}
          onChangeText={(v) => setMinutes(Number(v || '1'))}
          style={[
            styles.input,
            {
              width: 80,
              textAlign: 'right',
              borderColor: colors.border,
              color: colors.text,
              backgroundColor: appBackgroundForInput(
                colors.bgSecondary,
                colors.bg
              ),
              fontSize: 15,
            },
          ]}
          placeholderTextColor={colors.textMuted}
        />
      </View>
      <View style={{ alignItems: 'center', marginVertical: 8 }}>
        <Text
          style={{
            fontSize: 34,
            fontWeight: '800',
            color: colors.text,
          }}
        >
          {m}:{s}
        </Text>
        <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 4 }}>
          Put phone face-down, pretend exam is tomorrow 🤫
        </Text>
      </View>
      <View
        style={{
          height: 8,
          borderRadius: 999,
          backgroundColor: 'rgba(148,163,184,0.35)',
          overflow: 'hidden',
          marginBottom: 12,
        }}
      >
        <View
          style={{
            width: `${progress}%`,
            height: '100%',
            backgroundColor: colors.neonCyan,
          }}
        />
      </View>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <TouchableOpacity
          onPress={() => setRunning((v) => !v)}
          style={[
            styles.button,
            { flex: 1, backgroundColor: colors.accent },
          ]}
        >
          <Text style={{ color: 'white', fontWeight: '700', fontSize: 14 }}>
            {running ? 'Pause' : 'Start'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setRunning(false);
            setSecondsLeft(minutes * 60);
          }}
          style={[
            styles.button,
            {
              flex: 1,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: 'transparent',
            },
          ]}
        >
          <Text
            style={{ color: colors.text, fontWeight: '700', fontSize: 14 }}
          >
            Reset
          </Text>
        </TouchableOpacity>
      </View>
    </GlassCard>
  );
};

// CGPA: semester-wise + overall CGPA
const CGPACard = ({ colors, cgpaData, setCgpaData }) => {
  const semesters = Array.isArray(cgpaData.semesters)
    ? cgpaData.semesters
    : [];

  const [semName, setSemName] = useState('');
  const [sgpaInput, setSgpaInput] = useState('');
  const [creditsInput, setCreditsInput] = useState('');
  const [overallCgpa, setOverallCgpa] = useState(null);

  useEffect(() => {
    calculateOverall(semesters);
  }, []);

  const calculateOverall = (list) => {
    if (!list.length) {
      setOverallCgpa(null);
      return;
    }
    let totalPoints = 0;
    let totalCredits = 0;
    list.forEach((sem) => {
      const sgpa = parseFloat(sem.sgpa || '0');
      const credits = parseFloat(sem.credits || '0');
      totalPoints += sgpa * credits;
      totalCredits += credits;
    });
    if (totalCredits === 0) {
      setOverallCgpa(null);
      return;
    }
    const val = totalPoints / totalCredits;
    setOverallCgpa(val.toFixed(2));
  };

  const addSemester = () => {
    if (!semName.trim() || !sgpaInput.trim() || !creditsInput.trim()) return;
    const newSem = {
      id: Date.now().toString(),
      name: semName.trim(),
      sgpa: sgpaInput.trim(),
      credits: creditsInput.trim(),
    };
    const updated = [...semesters, newSem];
    setCgpaData({ ...cgpaData, semesters: updated });
    calculateOverall(updated);
    setSemName('');
    setSgpaInput('');
    setCreditsInput('');
  };

  return (
    <GlassCard colors={colors}>
      <SectionTitle
        colors={colors}
        label="CGPA Calculator (Semester-wise)"
        icon={<MaterialIcons name="calculate" size={22} color={colors.neonCyan} />}
      />
      <Text style={{ color: colors.textMuted, fontSize: 13, marginBottom: 10 }}>
        Add each semester with SGPA and credits. We&apos;ll calculate your{' '}
        <Text style={{ fontWeight: '700', color: colors.neonCyan }}>
          overall CGPA
        </Text>{' '}
        automatically.
      </Text>

      <View style={{ gap: 8, marginBottom: 12 }}>
        <Text style={{ color: colors.textMuted, fontSize: 13 }}>Semester name</Text>
        <TextInput
          placeholder="e.g. 3rd Sem"
          placeholderTextColor={colors.textMuted}
          value={semName}
          onChangeText={setSemName}
          style={[
            styles.input,
            {
              borderColor: colors.border,
              color: colors.text,
              backgroundColor: appBackgroundForInput(
                colors.bgSecondary,
                colors.bg
              ),
              fontSize: 14,
            },
          ]}
        />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.textMuted, fontSize: 13 }}>
              SGPA (this sem)
            </Text>
            <TextInput
              placeholder="e.g. 8.6"
              placeholderTextColor={colors.textMuted}
              value={sgpaInput}
              onChangeText={setSgpaInput}
              keyboardType="numeric"
              style={[
                styles.input,
                {
                  borderColor: colors.border,
                  color: colors.text,
                  backgroundColor: appBackgroundForInput(
                    colors.bgSecondary,
                    colors.bg
                  ),
                  fontSize: 14,
                },
              ]}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.textMuted, fontSize: 13 }}>
              Credits (this sem)
            </Text>
            <TextInput
              placeholder="e.g. 24"
              placeholderTextColor={colors.textMuted}
              value={creditsInput}
              onChangeText={setCreditsInput}
              keyboardType="numeric"
              style={[
                styles.input,
                {
                  borderColor: colors.border,
                  color: colors.text,
                  backgroundColor: appBackgroundForInput(
                    colors.bgSecondary,
                    colors.bg
                  ),
                  fontSize: 14,
                },
              ]}
            />
          </View>
        </View>
        <TouchableOpacity
          onPress={addSemester}
          style={[
            styles.button,
            { backgroundColor: colors.accent, marginTop: 4 },
          ]}
        >
          <Text style={{ color: 'white', fontWeight: '700', fontSize: 14 }}>
            Add Semester
          </Text>
        </TouchableOpacity>
      </View>

      {semesters.length > 0 && (
        <>
          <Text
            style={{
              color: colors.textMuted,
              fontSize: 13,
              marginBottom: 6,
              marginTop: 4,
            }}
          >
            Semesters added
          </Text>
          {semesters.map((sem) => (
            <View
              key={sem.id}
              style={{
                padding: 10,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: 'rgba(15,23,42,0.4)',
                marginBottom: 6,
              }}
            >
              <Text
                style={{
                  color: colors.text,
                  fontSize: 14,
                  fontWeight: '600',
                }}
              >
                {sem.name}
              </Text>
              <Text
                style={{
                  color: colors.textMuted,
                  fontSize: 12,
                  marginTop: 2,
                }}
              >
                SGPA: {sem.sgpa} • Credits: {sem.credits}
              </Text>
            </View>
          ))}
        </>
      )}

      <TouchableOpacity
        onPress={() => calculateOverall(semesters)}
        style={[
          styles.button,
          {
            backgroundColor: colors.accentSoft,
            marginTop: 10,
          },
        ]}
      >
        <Text style={{ color: colors.text, fontWeight: '700', fontSize: 14 }}>
          Recalculate Overall CGPA
        </Text>
      </TouchableOpacity>

      {overallCgpa && (
        <View
          style={{
            marginTop: 10,
            padding: 12,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: colors.accent,
            backgroundColor: colors.accentSoft,
          }}
        >
          <Text style={{ color: colors.textMuted, fontSize: 13 }}>
            Overall CGPA
          </Text>
          <Text
            style={{
              color: colors.neonCyan,
              fontSize: 26,
              fontWeight: '800',
              marginTop: 2,
            }}
          >
            {overallCgpa}
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 4 }}>
            Now flex this CGPA on LinkedIn (and also to your relatives 😌).
          </Text>
        </View>
      )}
    </GlassCard>
  );
};

const AIHintCard = ({ colors, subjects, tasks }) => {
  const overall = calcOverall(subjects);
  const insights = getAttendanceInsights(subjects);
  const pendingTasks = tasks.filter((t) => !t.done);

  const mainSubject =
    insights && insights.lowest ? insights.lowest.name : 'your core subject';

  return (
    <GlassCard colors={colors}>
      <SectionTitle
        colors={colors}
        label="Smart Study Assistant (pseudo-AI)"
        icon={<Ionicons name="sparkles" size={22} color={colors.neonCyan} />}
      />
      <Text style={{ color: colors.textMuted, fontSize: 13, marginBottom: 6 }}>
        This is a simple logic-based assistant. Later you can replace this box with
        a real AI API, sending attendance + tasks + timetable to get a custom plan.
      </Text>
      <Text style={{ color: colors.text, fontSize: 14, marginTop: 4 }}>
        📊 Attendance overall is{' '}
        <Text
          style={{
            color: overall < 75 ? colors.danger : colors.success,
            fontWeight: '700',
          }}
        >
          {overall}%
        </Text>
        . Focus more on{' '}
        <Text style={{ color: colors.neonPink, fontWeight: '700' }}>
          {mainSubject}
        </Text>
        .
      </Text>
      <Text style={{ color: colors.text, fontSize: 14, marginTop: 4 }}>
        ✅ You have{' '}
        <Text style={{ color: colors.neonCyan, fontWeight: '700' }}>
          {pendingTasks.length}
        </Text>{' '}
        pending task(s). Try to finish{' '}
        <Text style={{ fontWeight: '700' }}>one tough task</Text> in your next
        focus session.
      </Text>
      <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 6 }}>
        Tip: Pick 1 subject with low attendance + 1 tough task daily. Tiny progress
        zero progress.
      </Text>
    </GlassCard>
  );
};

const TasksScreen = ({ colors, tasks, setTasks, cgpaData, setCgpaData }) => {
  const [input, setInput] = useState('');

  const addTask = () => {
    if (!input.trim()) return;
    setTasks([
      {
        id: Date.now().toString(),
        title: input.trim(),
        due: 'Custom',
        done: false,
      },
      ...tasks,
    ]);
    setInput('');
  };

  const toggleTask = (id) => {
    setTasks(
      tasks.map((t) =>
        t.id === id ? { ...t, done: !t.done } : t
      )
    );
  };

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 18, paddingBottom: 100, gap: 18 }}
    >
      <GlassCard colors={colors}>
        <SectionTitle
          colors={colors}
          label="Tasks & Deadlines"
          icon={<Feather name="check-square" size={22} color={colors.neonCyan} />}
        />
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
          <TextInput
            placeholder="Add task (e.g. DBMS mini project)"
            placeholderTextColor={colors.textMuted}
            value={input}
            onChangeText={setInput}
            style={[
              styles.input,
              {
                flex: 1,
                borderColor: colors.border,
                color: colors.text,
                backgroundColor: appBackgroundForInput(
                  colors.bgSecondary,
                  colors.bg
                ),
                fontSize: 14,
              },
            ]}
          />
          <TouchableOpacity
            onPress={addTask}
            style={[
              styles.button,
              { backgroundColor: colors.accent, paddingHorizontal: 18 },
            ]}
          >
            <Text style={{ color: 'white', fontWeight: '700', fontSize: 14 }}>
              Add
            </Text>
          </TouchableOpacity>
        </View>
        {tasks.length === 0 ? (
          <Text style={{ color: colors.textMuted, fontSize: 14 }}>
            No tasks yet. Add your first one above.
          </Text>
        ) : (
          <FlatList
            data={tasks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => toggleTask(item.id)}
                style={{
                  padding: 12,
                  borderRadius: 20,
                  borderWidth: 1,
                  marginBottom: 8,
                  borderColor: item.done ? colors.success : colors.border,
                  backgroundColor: item.done
                    ? 'rgba(34,197,94,0.12)'
                    : 'rgba(15,23,42,0.45)',
                }}
              >
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 15,
                    textDecorationLine: item.done ? 'line-through' : 'none',
                    opacity: item.done ? 0.7 : 1,
                  }}
                >
                  {item.title}
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>
                  Due: {item.due} • {item.done ? '✅ Completed' : 'Pending'}
                </Text>
              </TouchableOpacity>
            )}
          />
        )}
      </GlassCard>

      <FocusTimerCard colors={colors} />
      <CGPACard colors={colors} cgpaData={cgpaData} setCgpaData={setCgpaData} />
      <AIHintCard colors={colors} subjects={[]} tasks={tasks} />
    </ScrollView>
  );
};

// ---------- HOME (OVERVIEW + SMART HINT + MINI TIMETABLE) ----------

const HomeScreen = ({ colors, appState, toggleTheme }) => {
  const overall = calcOverall(appState.subjects);

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 18, paddingBottom: 100, gap: 18 }}
    >
      <GlassCard colors={colors}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: colors.textMuted,
                fontSize: 13,
                letterSpacing: 2,
              }}
            >
              STUDENT COMPANION
            </Text>
            <Text
              style={{
                color: colors.text,
                fontSize: 24,
                fontWeight: '800',
                marginTop: 6,
              }}
            >
              Hi, {appState.profile.name}
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 14, marginTop: 4 }}>
              One place for attendance, tasks, focus, CGPA, docs & timetable.
            </Text>
          </View>
          <TouchableOpacity
            onPress={toggleTheme}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 9,
              borderRadius: 999,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              backgroundColor: colors.accentSoft,
            }}
          >
            <Ionicons
              name={appState.theme === 'dark' ? 'moon' : 'sunny'}
              size={18}
              color={colors.neonCyan}
            />
            <Text style={{ color: colors.text, fontSize: 13, fontWeight: '600' }}>
              {appState.theme === 'dark' ? 'Dark' : 'Light'}
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={{
            flexDirection: 'row',
            marginTop: 18,
            gap: 12,
          }}
        >
          <View
            style={{
              flex: 1,
              padding: 14,
              borderRadius: 22,
              backgroundColor: 'rgba(15,23,42,0.5)',
            }}
          >
            <Text style={{ color: colors.textMuted, fontSize: 13 }}>
              Overall Attendance
            </Text>
            <Text
              style={{
                color: overall < 75 ? colors.danger : colors.success,
                fontSize: 28,
                fontWeight: '800',
              }}
            >
              {overall}%
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              padding: 14,
              borderRadius: 22,
              backgroundColor: 'rgba(15,23,42,0.5)',
            }}
          >
            <Text style={{ color: colors.textMuted, fontSize: 13 }}>
              Pending Tasks
            </Text>
            <Text
              style={{
                color: colors.neonCyan,
                fontSize: 28,
                fontWeight: '800',
              }}
            >
              {appState.tasks.filter((t) => !t.done).length}
            </Text>
          </View>
        </View>
      </GlassCard>

      <AIHintCard
        colors={colors}
        subjects={appState.subjects}
        tasks={appState.tasks}
      />

      <GlassCard colors={colors}>
        <SectionTitle
          colors={colors}
          label="Quick Timetable Glance"
          icon={<Ionicons name="calendar" size={22} color={colors.neonCyan} />}
        />
        <Text style={{ color: colors.textMuted, fontSize: 13, marginBottom: 10 }}>
          First two slots from each day. Edit full timetable in the Timetable tab.
        </Text>
        {Object.entries(appState.timetable).map(([day, slots]) => (
          <View
            key={day}
            style={{
              marginBottom: 8,
            }}
          >
            <Text
              style={{
                color: colors.text,
                fontWeight: '700',
                fontSize: 15,
              }}
            >
              {day}
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 13 }}>
              {slots.length === 0
                ? 'No classes saved.'
                : slots.slice(0, 2).join(' • ')}
            </Text>
          </View>
        ))}
      </GlassCard>
    </ScrollView>
  );
};

// ---------- TIMETABLE ----------

const TimetableScreen = ({ colors, timetable, setTimetable }) => {
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [newSlot, setNewSlot] = useState('');

  const days = Object.keys(timetable);

  const addSlot = () => {
    if (!newSlot.trim()) return;
    setTimetable({
      ...timetable,
      [selectedDay]: [...timetable[selectedDay], newSlot.trim()],
    });
    setNewSlot('');
  };

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 18, paddingBottom: 100, gap: 18 }}
    >
      <GlassCard colors={colors}>
        <SectionTitle
          colors={colors}
          label="Timetable"
          icon={<Ionicons name="calendar" size={22} color={colors.neonCyan} />}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 12 }}
        >
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {days.map((d) => (
              <TouchableOpacity
                key={d}
                onPress={() => setSelectedDay(d)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 9,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor:
                    selectedDay === d ? colors.neonCyan : colors.border,
                  backgroundColor:
                    selectedDay === d
                      ? 'rgba(34,211,238,0.15)'
                      : 'rgba(15,23,42,0.6)',
                }}
              >
                <Text
                  style={{
                    color:
                      selectedDay === d ? colors.neonCyan : colors.textMuted,
                    fontSize: 13,
                    fontWeight: '600',
                  }}
                >
                  {d}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <Text style={{ color: colors.textMuted, fontSize: 13, marginBottom: 8 }}>
          Add class slots like &quot;9–10 DSA&quot;, &quot;10–11 DBMS&quot;.
        </Text>
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
          <TextInput
            placeholder="e.g. 9–10 DSA"
            placeholderTextColor={colors.textMuted}
            value={newSlot}
            onChangeText={setNewSlot}
            style={[
              styles.input,
              {
                flex: 1,
                borderColor: colors.border,
                color: colors.text,
                backgroundColor: appBackgroundForInput(
                  colors.bgSecondary,
                  colors.bg
                ),
                fontSize: 14,
              },
            ]}
          />
          <TouchableOpacity
            onPress={addSlot}
            style={[
              styles.button,
              { backgroundColor: colors.accent, paddingHorizontal: 18 },
            ]}
          >
            <Text style={{ color: 'white', fontWeight: '700', fontSize: 14 }}>
              Add
            </Text>
          </TouchableOpacity>
        </View>

        {timetable[selectedDay].length === 0 ? (
          <Text style={{ color: colors.textMuted, fontSize: 14 }}>
            No slots yet. Add above.
          </Text>
        ) : (
          timetable[selectedDay].map((slot, idx) => (
            <View
              key={idx.toString()}
              style={{
                padding: 12,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: 'rgba(15,23,42,0.6)',
                marginBottom: 8,
              }}
            >
              <Text style={{ color: colors.text, fontSize: 15 }}>{slot}</Text>
            </View>
          ))
        )}
      </GlassCard>
    </ScrollView>
  );
};

// ---------- PROFILE + DOCS + CLOUD SYNC PLACEHOLDER ----------

const ProfileScreen = ({
  colors,
  profile,
  setProfile,
  docs,
  setDocs,
  theme,
  toggleTheme,
}) => {
  const [syncStatus, setSyncStatus] = useState('Not synced');

  const pickDocs = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        multiple: true,
        type: '*/*',
      });

      if (!res) return;

      // handle both new/old API shapes
      let files = [];
      if (Array.isArray(res.assets)) {
        files = res.assets;
      } else if (Array.isArray(res)) {
        files = res;
      } else if (res.uri) {
        files = [res];
      }

      const now = new Date().toLocaleString();
      const newDocs = files.map((file) => ({
        id: `${file.name}-${file.size || 0}-${Math.random()
          .toString(36)
          .slice(2)}`,
        name: file.name,
        size: file.size || 0,
        uploadedAt: now,
        tag: 'General',
      }));
      setDocs([...newDocs, ...docs]);
    } catch (e) {
      console.log('Document pick error', e);
    }
  };

  const removeDoc = (id) => {
    setDocs(docs.filter((d) => d.id !== id));
  };

  const fakeCloudSync = async () => {
    setSyncStatus('Syncing...');
    setTimeout(() => {
      setSyncStatus('Last sync: just now (demo only)');
    }, 900);
  };

  const onChangeProfileField = (field, value) => {
    setProfile({ ...profile, [field]: value });
  };

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 18, paddingBottom: 100, gap: 18 }}
    >
      <GlassCard colors={colors}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <LinearGradient
            colors={[colors.neonCyan, colors.neonPink]}
            style={{
              width: 74,
              height: 74,
              borderRadius: 37,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="person" size={38} color="white" />
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: colors.text,
                fontSize: 22,
                fontWeight: '800',
              }}
            >
              {profile.name}
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 13 }}>
              {profile.usn} • {profile.branch} • {profile.semester}
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 13 }}>
              {profile.college}
            </Text>
          </View>
        </View>

        <View style={{ marginTop: 18, gap: 10 }}>
          {[
            ['name', 'Name'],
            ['usn', 'USN'],
            ['branch', 'Branch'],
            ['semester', 'Semester'],
            ['college', 'College'],
          ].map(([field, label]) => (
            <View key={field}>
              <Text style={{ color: colors.textMuted, fontSize: 13 }}>
                {label}
              </Text>
              <TextInput
                value={profile[field]}
                onChangeText={(v) => onChangeProfileField(field, v)}
                style={[
                  styles.input,
                  {
                    borderColor: colors.border,
                    color: colors.text,
                    backgroundColor: appBackgroundForInput(
                      colors.bgSecondary,
                      colors.bg
                    ),
                    fontSize: 14,
                  },
                ]}
                placeholderTextColor={colors.textMuted}
              />
            </View>
          ))}
        </View>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
          <TouchableOpacity
            onPress={toggleTheme}
            style={[
              styles.button,
              {
                flex: 1,
                backgroundColor: colors.accentSoft,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              },
            ]}
          >
            <Ionicons
              name={theme === 'dark' ? 'moon' : 'sunny'}
              size={18}
              color={colors.neonCyan}
            />
            <Text
              style={{ color: colors.text, fontWeight: '700', fontSize: 14 }}
            >
              Theme: {theme === 'dark' ? 'Dark' : 'Light'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={fakeCloudSync}
            style={[
              styles.button,
              {
                flex: 1,
                backgroundColor: colors.accent,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              },
            ]}
          >
            <Ionicons name="cloud-upload" size={18} color="white" />
            <Text
              style={{ color: 'white', fontWeight: '700', fontSize: 14 }}
            >
              Cloud Sync (demo)
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 6 }}>
          {syncStatus}
        </Text>
      </GlassCard>

      <GlassCard colors={colors}>
        <SectionTitle
          colors={colors}
          label="Documents Manager"
          icon={<Feather name="folder" size={22} color={colors.neonCyan} />}
        />
        <Text style={{ color: colors.textMuted, fontSize: 13, marginBottom: 10 }}>
          Upload notes, PDFs, question papers. This demo stores only file metadata
          locally. Real app: store files in Firebase Storage + Firestore.
        </Text>
        <TouchableOpacity
          onPress={pickDocs}
          style={[
            styles.button,
            {
              backgroundColor: colors.accentSoft,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              marginBottom: 12,
            },
          ]}
        >
          <Ionicons name="document-text" size={18} color={colors.neonCyan} />
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 14 }}>
            Pick Documents
          </Text>
        </TouchableOpacity>

        {docs.length === 0 ? (
          <Text style={{ color: colors.textMuted, fontSize: 14 }}>
            No documents yet. Upload your first PDF / file.
          </Text>
        ) : (
          docs.map((doc) => (
            <View
              key={doc.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 10,
                borderRadius: 18,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: 'rgba(15,23,42,0.6)',
                marginBottom: 8,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 14,
                    fontWeight: '500',
                  }}
                >
                  {doc.name}
                </Text>
                <Text
                  style={{
                    color: colors.textMuted,
                    fontSize: 12,
                    marginTop: 2,
                  }}
                >
                  {doc.tag} • {Math.round(doc.size / 1024) || 0} KB •{' '}
                  {doc.uploadedAt}
                </Text>
              </View>
              <TouchableOpacity onPress={() => removeDoc(doc.id)}>
                <Ionicons
                  name="trash"
                  size={20}
                  color={colors.danger}
                  style={{ padding: 4 }}
                />
              </TouchableOpacity>
            </View>
          ))
        )}
      </GlassCard>
    </ScrollView>
  );
};

// ---------- STYLES ----------

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  button: {
    borderRadius: 999,
    paddingVertical: 11,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default App;
