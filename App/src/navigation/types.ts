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
  ChapterComplete: { chapter: ChapterMeta; levelUp?: boolean; newLevel?: number };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

// Screens nested inside the Learn stack (Hobby/Level/TimeCommitment) can navigate to their
// stack siblings as well as up to root-level screens like CourseDetail.
export type LearnScreenNavigationProp<T extends keyof LearnStackParamList> = CompositeNavigationProp<
  NativeStackNavigationProp<LearnStackParamList, T>,
  NativeStackNavigationProp<RootStackParamList>
>;

// Screens nested inside the bottom tab bar (Home/Course) can navigate to their tab
// siblings as well as up to root-level screens like ChapterFlow.
export type MainTabScreenNavigationProp<T extends keyof MainTabParamList> = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, T>,
  NativeStackNavigationProp<RootStackParamList>
>;
