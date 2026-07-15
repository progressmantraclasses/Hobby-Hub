import type { CompositeNavigationProp, NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { ChapterMeta } from '../schemas/plan.schema';

export type LearnStackParamList = {
  Hobby: undefined;
  Level: undefined;
  TimeCommitment: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Learn: NavigatorScreenParams<LearnStackParamList> | undefined;
  Course: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  CourseDetail: undefined;
  ChapterDetail: { chapter: ChapterMeta; hobbyId?: string | null };
  ChapterFlow: { chapter: ChapterMeta; hobbyId?: string | null };
  ChapterComplete: { chapter: ChapterMeta; xpEarned: number; levelUp?: boolean; newLevel?: number };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export type LearnScreenNavigationProp<T extends keyof LearnStackParamList> = CompositeNavigationProp<
  NativeStackNavigationProp<LearnStackParamList, T>,
  NativeStackNavigationProp<RootStackParamList>
>;

export type MainTabScreenNavigationProp<T extends keyof MainTabParamList> = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, T>,
  NativeStackNavigationProp<RootStackParamList>
>;
