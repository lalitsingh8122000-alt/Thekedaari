import React from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Colors } from '../theme/colors';
import { LoadingSpinner } from '../components';
import AppHeader from '../components/AppHeader';

// Auth screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Main screens
import DashboardScreen from '../screens/DashboardScreen';
import WorkersScreen from '../screens/workers/WorkersScreen';
import WorkerFormScreen from '../screens/workers/WorkerFormScreen';
import WorkerLedgerScreen from '../screens/workers/WorkerLedgerScreen';
import ProjectsScreen from '../screens/projects/ProjectsScreen';
import ProjectFormScreen from '../screens/projects/ProjectFormScreen';
import ProjectFinanceScreen from '../screens/projects/ProjectFinanceScreen';
import ProjectAttendanceScreen from '../screens/projects/ProjectAttendanceScreen';
import AttendanceScreen from '../screens/AttendanceScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import RolesScreen from '../screens/RolesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MoreMenuScreen from '../screens/MoreMenuScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const screenOpts = {
  headerShown: false,
  animation: 'slide_from_right',
  contentStyle: { backgroundColor: Colors.background },
};

function WorkersStack() {
  return (
    <Stack.Navigator screenOptions={screenOpts}>
      <Stack.Screen name="WorkersList" component={WorkersScreen} />
      <Stack.Screen name="WorkerForm" component={WorkerFormScreen} />
      <Stack.Screen name="WorkerLedger" component={WorkerLedgerScreen} />
    </Stack.Navigator>
  );
}

function ProjectsStack() {
  return (
    <Stack.Navigator screenOptions={screenOpts}>
      <Stack.Screen name="ProjectsList" component={ProjectsScreen} />
      <Stack.Screen name="ProjectForm" component={ProjectFormScreen} />
      <Stack.Screen name="ProjectFinance" component={ProjectFinanceScreen} />
      <Stack.Screen name="ProjectAttendance" component={ProjectAttendanceScreen} />
    </Stack.Navigator>
  );
}

function MoreStack() {
  return (
    <Stack.Navigator screenOptions={screenOpts}>
      <Stack.Screen name="MoreMenu" component={MoreMenuScreen} />
      <Stack.Screen name="AttendanceReport" component={AttendanceScreen} />
      <Stack.Screen name="Transactions" component={TransactionsScreen} />
      <Stack.Screen name="Roles" component={RolesScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  const tabIcon = (outlineName, filledName) =>
    ({ focused, color, size }) => (
      <Ionicons
        name={focused ? filledName : outlineName}
        size={size}
        color={color}
      />
    );

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          ...tabStyles,
          height: 64 + insets.bottom,
          paddingBottom: 6 + insets.bottom,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.gray400,
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600', marginTop: -2, marginBottom: 2 },
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardScreen}
        options={{
          tabBarLabel: t('tabDashboard'),
          tabBarIcon: tabIcon('grid-outline', 'grid'),
        }}
      />
      <Tab.Screen
        name="WorkersTab"
        component={WorkersStack}
        options={{
          tabBarLabel: t('tabWorkers'),
          tabBarIcon: tabIcon('people-outline', 'people'),
        }}
      />
      <Tab.Screen
        name="ProjectsTab"
        component={ProjectsStack}
        options={{
          tabBarLabel: t('tabProjects'),
          tabBarIcon: tabIcon('folder-outline', 'folder'),
        }}
      />
      <Tab.Screen
        name="AttendanceTab"
        component={AttendanceScreen}
        options={{
          tabBarLabel: t('tabAttendance'),
          tabBarIcon: tabIcon('calendar-outline', 'calendar'),
        }}
      />
      <Tab.Screen
        name="MoreTab"
        component={MoreStack}
        options={{
          tabBarLabel: t('tabMore'),
          tabBarIcon: tabIcon('ellipsis-horizontal-outline', 'ellipsis-horizontal'),
        }}
      />
    </Tab.Navigator>
  );
}

function MainApp() {
  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <AppHeader />
      <MainTabs />
    </View>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { token, loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  return (
    <NavigationContainer>
      {token ? <MainApp /> : <AuthStack />}
    </NavigationContainer>
  );
}

const tabStyles = {
  backgroundColor: Colors.white,
  borderTopWidth: 1,
  borderTopColor: Colors.gray100,
  paddingTop: 6,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: -2 },
  shadowOpacity: 0.06,
  shadowRadius: 8,
  elevation: 8,
};
