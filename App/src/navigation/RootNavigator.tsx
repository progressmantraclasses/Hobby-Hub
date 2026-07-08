import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HobbyScreen from '../screens/HobbyScreen';
import LevelScreen from '../screens/LevelScreen';
import TimeCommitmentScreen from '../screens/TimeCommitmentScreen';
import DashboardScreen from '../screens/DashboardScreen';
import TechniqueDetailScreen from '../screens/TechniqueDetailScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName="Hobby">
      <Stack.Screen name="Hobby" component={HobbyScreen} options={{ title: 'Select Hobby' }} />
      <Stack.Screen name="Level" component={LevelScreen} options={{ title: 'Select Level' }} />
      <Stack.Screen name="TimeCommitment" component={TimeCommitmentScreen} options={{ title: 'Time Commitment' }} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Your Plan', headerBackVisible: false }} />
      <Stack.Screen name="TechniqueDetail" component={TechniqueDetailScreen} options={{ title: 'Technique Detail' }} />
    </Stack.Navigator>
  );
}
