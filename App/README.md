# Hobby Hub - Mobile Client

This is the mobile application client for **Hobby Hub**, a gamified learning and customized roadmap generator built with React Native.

## 📱 Features

- **AI-Powered Learning Plans**: Displays customized roadmaps for learning hobbies.
- **Gamified UI**: Includes an RPG-style leveling system, daily streaks, and engaging animations using React Native Reanimated.
- **Interactive Modules**: Provides flashcards, short quizzes, and integrated YouTube lessons (`react-native-youtube-iframe`).

## 🛠 Tech Stack & In-Depth Architecture

### State Management & Persistence
The app heavily relies on an optimized state management architecture for offline persistence and high performance:

- **Zustand (`zustand`)**: Used as the primary state management library for managing global application state, avoiding the complex boilerplate of Redux. It handles everything from user XP, daily streaks, active hobbies, to chapter completion statuses.
- **AsyncStorage (`@react-native-async-storage/async-storage`)**: Integrated seamlessly via Zustand's `persist` middleware. This ensures that a user's progress, generated plans, streaks, and accumulated XP are securely persisted locally on the device across app restarts.
- **Versioned Storage**: The Zustand store is equipped with a `STORE_VERSION` configuration (`onRehydrateStorage`). If the state structure undergoes breaking changes in a newer app version, it safely clears outdated `async-storage` data to prevent crashes while preserving a clean initial state.

### Navigation & UI
- **Framework**: React Native (Bare CLI)
- **Language**: TypeScript
- **Navigation**: React Navigation (`@react-navigation/native-stack` & `@react-navigation/bottom-tabs`)
- **Animations & Gestures**: React Native Reanimated (`react-native-reanimated`) and Gesture Handler (`react-native-gesture-handler`) for smooth 60FPS UI transitions.
- **Bottom Sheets**: `@gorhom/bottom-sheet` used for fluid, interactive modals.

### Data Validation
- **Zod (`zod`)**: Ensures runtime type safety for data received from the backend API, bridging the gap between TypeScript types and actual network payloads.

## 🚀 Getting Started

### Prerequisites
- Node.js (v22.11.0 or higher)
- React Native development environment (Android Studio / Xcode)

### Installation & Commands

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **iOS Specific Setup (macOS only):**
   ```bash
   cd ios
   bundle install
   bundle exec pod install
   cd ..
   ```

3. **Available Scripts:**

   - **Start Metro Bundler:**
     ```bash
     npx react-native start
     ```
     Starts the `react-native` Metro bundler.

   - **Run on Android:**
     ```bash
     npx react-native run-android
     ```
     Builds and installs the app on a connected Android device or emulator.

   - **Run on iOS:**
     ```bash
     npx react-native run-ios
     ```
     Builds and installs the app on an iOS simulator or connected device.

   - **Run Linter:**
     ```bash
     npm run lint
     ```
     Runs ESLint to check for code issues.

## 📂 Project Structure
- `src/screens`: One file per screen (Home, Hobby, Level, TimeCommitment, Course, CourseDetail, ChapterDetail, ChapterFlow, ChapterComplete, Profile).
- `src/components`: Shared UI components, including `stepRenderers/` (one renderer per chapter step type).
- `src/navigation`: `RootNavigator.tsx` — the stack + bottom-tab navigator.
- `src/store`: `planStore.ts` — the Zustand store (hobbies, chapter progress, XP/streak, onboarding draft fields), persisted via AsyncStorage.
- `src/services`: `api.ts` — fetch calls to the backend. In development it auto-detects the backend host from the Metro bundle's own URL (`NativeModules.SourceCode.scriptURL`), assuming the server runs on port `5000` (the `API_PORT` constant) — no manual IP editing needed. Release builds use a fixed production `BASE_URL` in the same file.
- `src/hooks`: `useAsyncTask` (shared loading/error/success state for async calls), `useThinkingAnimation` (pulsing "thinking" loading indicator).
- `src/constants`: Static config data (badges, hobby lists/emoji, levels, chapter-status labels/colors, rank thresholds, tab icons).
- `src/theme`: `colors.ts` — the app's single design-token color palette.
- `src/schemas`: Zod schemas matching the backend's response shapes.
- `src/utils`: Pure helper functions (XP/level math, streak-date math).
