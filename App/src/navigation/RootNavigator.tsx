import React from 'react';
import { createNativeStackNavigator, NativeStackNavigationProp } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ChevronLeft } from 'lucide-react-native';
import { TouchableOpacity, StyleSheet } from 'react-native';

import { Colors } from '../theme/colors';
import { TAB_ICON } from '../constants/navigation';
import type { RootStackParamList, MainTabParamList, LearnStackParamList } from './types';

import HobbyScreen from '../screens/HobbyScreen';
import LevelScreen from '../screens/LevelScreen';
import TimeCommitmentScreen from '../screens/TimeCommitmentScreen';

import HomeScreen from '../screens/HomeScreen';
import CourseScreen from '../screens/CourseScreen';
import CourseDetailScreen from '../screens/CourseDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';

import ChapterDetailScreen from '../screens/ChapterDetailScreen';
import ChapterFlowScreen from '../screens/ChapterFlowScreen';
import ChapterCompleteScreen from '../screens/ChapterCompleteScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const LearnStackNav = createNativeStackNavigator<LearnStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Standalone Components to satisfy react/no-unstable-nested-components
interface TabBarIconProps {
  routeName: string;
  color: string;
  size: number;
}
const TabBarIcon = ({ routeName, color, size }: TabBarIconProps) => {
  const Icon = TAB_ICON[routeName];
  return Icon ? <Icon color={color} size={size} /> : null;
};

interface HeaderLeftProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CourseDetail'>;
  tintColor?: string;
}
const CourseHeaderLeft = ({ navigation, tintColor }: HeaderLeftProps) => (
  <TouchableOpacity 
    onPress={() => navigation.navigate('MainTabs', { screen: 'Course' })} 
    style={styles.headerLeftBtn}
  >
    <ChevronLeft color={tintColor} size={28} />
  </TouchableOpacity>
);

function LearnStack() {
  return (
    <LearnStackNav.Navigator screenOptions={{ headerShown: false }}>
      <LearnStackNav.Screen name="Hobby" component={HobbyScreen} />
      <LearnStackNav.Screen name="Level" component={LevelScreen} />
      <LearnStackNav.Screen name="TimeCommitment" component={TimeCommitmentScreen} />
    </LearnStackNav.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        // eslint-disable-next-line react/no-unstable-nested-components
        tabBarIcon: ({ color, size }) => <TabBarIcon routeName={route.name} color={color} size={size} />,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.gray,
        tabBarHideOnKeyboard: true,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Learn" component={LearnStack} />
      <Tab.Screen name="Course" component={CourseScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      
      {/* Independent Full Screens (Hides Tab Bar) */}
      <Stack.Screen 
        name="CourseDetail" 
        component={CourseDetailScreen} 
        options={({ navigation }) => ({ 
          headerShown: true, 
          title: 'Your Course', 
          headerStyle: { backgroundColor: Colors.white }, 
          headerTintColor: Colors.dark,
          // eslint-disable-next-line react/no-unstable-nested-components
          headerLeft: ({ tintColor }) => <CourseHeaderLeft navigation={navigation} tintColor={tintColor} />
        })} 
      />
      <Stack.Screen name="ChapterDetail" component={ChapterDetailScreen} options={{ headerShown: true, title: 'Chapter Overview', headerStyle: { backgroundColor: Colors.white }, headerTintColor: Colors.dark }} />
      <Stack.Screen name="ChapterFlow" component={ChapterFlowScreen} options={{ presentation: 'fullScreenModal' }} />
      <Stack.Screen name="ChapterComplete" component={ChapterCompleteScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  headerLeftBtn: { marginLeft: -8, marginRight: 16, padding: 8 },
  tabBar: { borderTopColor: Colors.grayLight, backgroundColor: Colors.white },
  tabBarLabel: { fontSize: 11, fontWeight: '700' },
});
