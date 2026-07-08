import { useWindowDimensions } from 'react-native';

export function useIsWideScreen() {
  const { width } = useWindowDimensions();
  return width >= 768; // standard tablet/desktop breakpoint
}
