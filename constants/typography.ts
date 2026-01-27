import { StyleSheet } from 'react-native';

export const typography = StyleSheet.create({
  displayLarge: {
    fontSize: 32,
    fontWeight: '300' as const,
    letterSpacing: 1,
    lineHeight: 40,
  },
  displayMedium: {
    fontSize: 24,
    fontWeight: '300' as const,
    letterSpacing: 0.5,
    lineHeight: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: '500' as const,
    letterSpacing: 0.3,
    lineHeight: 28,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500' as const,
    letterSpacing: 0.2,
    lineHeight: 24,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    letterSpacing: 0.1,
    lineHeight: 22,
  },
  bodySmall: {
    fontSize: 13,
    fontWeight: '400' as const,
    letterSpacing: 0.1,
    lineHeight: 18,
  },
  caption: {
    fontSize: 11,
    fontWeight: '500' as const,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
    lineHeight: 16,
  },
});
