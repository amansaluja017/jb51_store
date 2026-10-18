import { StyleSheet, Platform } from 'react-native';
import { colors } from '../theme/colors';

export const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: colors.background.app,
  },
  appHeader: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 16,
    paddingBottom: 14,
    backgroundColor: colors.background.surface,
    borderBottomWidth: 1,
    borderColor: colors.border.DEFAULT,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitleWrapper: {
    flex: 1,
    marginRight: 10,
    justifyContent: 'center',
  },
  headerSubtitle: {
    fontSize: 8,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 3,
    color: colors.primary.DEFAULT,
    marginBottom: 2,
  },
  headerTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Didot' : 'serif',
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  headerActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  headerActionBtnActive: {
    backgroundColor: colors.primary.light,
    borderColor: colors.primary.border,
  },
  headerBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: colors.background.surface,
  },
  headerBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.text.inverse,
  },
  logoutBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenView: {
    flex: 1,
    paddingBottom: Platform.OS === 'ios' ? 88 : 78,
  },
});

export default styles;
