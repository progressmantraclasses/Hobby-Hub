import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, BookOpen, GraduationCap, User, ChevronLeft } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';

import { usePlanStore } from '../store/planStore';
import { Colors } from '../theme/colors';

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

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_ICON: Record<string, any> = {
  Home: Home, Learn: BookOpen, Course: GraduationCap, Profile: User,
};

function LearnStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Hobby" component={HobbyScreen} />
      <Stack.Screen name="Level" component={LevelScreen} />
      <Stack.Screen name="TimeCommitment" component={TimeCommitmentScreen} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  const { hobbies } = usePlanStore();
  const hasHobbies = Object.keys(hobbies).length > 0;

  return (
    <Tab.Navigator
      initialRouteName={hasHobbies ? "Course" : "Learn"}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          const Icon = TAB_ICON[route.name];
          return Icon ? <Icon color={color} size={size} /> : null;
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.gray,
        tabBarStyle: { borderTopColor: Colors.grayLight, backgroundColor: Colors.white },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
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
          headerLeft: ({ tintColor }) => (
            <TouchableOpacity onPress={() => navigation.navigate('MainTabs', { screen: 'Course' })} style={{ marginLeft: -8, marginRight: 16, padding: 8 }}>
              <ChevronLeft color={tintColor} size={28} />
            </TouchableOpacity>
          )
        })} 
      />
      <Stack.Screen name="ChapterDetail" component={ChapterDetailScreen} options={{ headerShown: true, title: 'Chapter Overview', headerStyle: { backgroundColor: Colors.white }, headerTintColor: Colors.dark }} />
      <Stack.Screen name="ChapterFlow" component={ChapterFlowScreen} options={{ presentation: 'fullScreenModal' }} />
      <Stack.Screen name="ChapterComplete" component={ChapterCompleteScreen} />
    </Stack.Navigator>
  );
}
