import AsyncStorage from '@react-native-async-storage/async-storage';

const STREAK_KEY = 'hobby_streak';
const LAST_DATE_KEY = 'hobby_last_date';

export const updateAndGetStreak = async (): Promise<number> => {
  const today = new Date().toISOString().split('T')[0];
  const lastDate = await AsyncStorage.getItem(LAST_DATE_KEY);
  let streak = parseInt((await AsyncStorage.getItem(STREAK_KEY)) || '0', 10);

  if (lastDate === today) return streak;

  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  streak = lastDate === yesterday ? streak + 1 : 1;

  await AsyncStorage.multiSet([[LAST_DATE_KEY, today], [STREAK_KEY, streak.toString()]]);
  return streak;
};
