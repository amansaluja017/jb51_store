import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  brandBox: {
    alignItems: 'center',
    marginBottom: 44,
  },
  brandLogo: {
    fontFamily: Platform.OS === 'ios' ? 'Didot' : 'serif',
    fontSize: 52,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: 8,
  },
  brandSubLogo: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FF5E36',
    textAlign: 'center',
    letterSpacing: 6,
    marginTop: 6,
  },
  loaderBox: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  spinner: {
    transform: [{ scale: 1.15 }],
  },
  loadingText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#a1a1aa',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginTop: 6,
  },
});

export default styles;

