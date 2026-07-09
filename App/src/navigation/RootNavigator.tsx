import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HobbyScreen from '../screens/HobbyScreen';
import LevelScreen from '../screens/LevelScreen';
import TimeCommitmentScreen from '../screens/TimeCommitmentScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ChapterDetailScreen from '../screens/ChapterDetailScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Hobby"
      screenOptions={{
        headerBackVisible: true,
        headerStyle: { backgroundColor: '#7B2FFF' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: '800', fontSize: 17 },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="Hobby" component={HobbyScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Level" component={LevelScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TimeCommitment" component={TimeCommitmentScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Your Plan', headerBackVisible: false }} />
      <Stack.Screen name="ChapterDetail" component={ChapterDetailScreen} options={{ title: 'Chapter Detail' }} />
    </Stack.Navigator>
  );
}
