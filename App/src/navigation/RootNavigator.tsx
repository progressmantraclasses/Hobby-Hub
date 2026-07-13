import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ChevronLeft } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';

import { Colors } from '../theme/colors';
import { TAB_ICON } from '../constants/navigation';

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
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          const Icon = TAB_ICON[route.name];
          return Icon ? <Icon color={color} size={size} /> : null;
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.gray,
        tabBarHideOnKeyboard: true,
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
