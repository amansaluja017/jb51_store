import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  labelLeftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#27272a',
    letterSpacing: 0.2,
  },
  formattedBadge: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  formattedBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#C2410C',
    textTransform: 'uppercase',
  },
  openEditorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff7f5',
    borderWidth: 1,
    borderColor: '#ffd8d0',
    paddingVertical: 3.5,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  openEditorBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF5E36',
  },
  editorBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    overflow: 'hidden',
  },
  textInput: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 13,
    color: '#09090b',
    lineHeight: 20,
  },
  resizeHandleBar: {
    height: 16,
    backgroundColor: '#fafafa',
    borderTopWidth: 1,
    borderColor: '#f4f4f5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* -------------------- SAFE AREA MODAL STYLES -------------------- */
  modalRoot: {
    flex: 1,
    backgroundColor: '#f4f4f5',
  },
  modalHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#e4e4e7',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  modalCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#f4f4f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalHeaderTitleCol: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  modalHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#09090b',
  },
  modalHeaderSubtitle: {
    fontSize: 11,
    color: '#71717a',
    marginTop: 1,
  },
  modalApplyHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF5E36',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  modalApplyHeaderBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* Editor View Container */
  editorViewContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  /* Formatting Tools Bar */
  toolbarContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    paddingVertical: 7,
    paddingHorizontal: 6,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  toolbarScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  formatToolBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f4f4f5',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  formatToolBtnClear: {
    backgroundColor: '#fafafa',
  },
  formatToolBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#09090b',
  },

  /* Main Text Input Area */
  textInputWrapper: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    overflow: 'hidden',
    minHeight: 160,
    marginBottom: 10,
  },
  textInputTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: '#fafafa',
    borderBottomWidth: 1,
    borderColor: '#f4f4f5',
  },
  textInputTopHint: {
    fontSize: 10,
    fontWeight: '600',
    color: '#71717a',
    letterSpacing: 0.2,
  },
  charCounterText: {
    fontSize: 10,
    color: '#a1a1aa',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  modalTextInput: {
    flex: 1,
    fontSize: 14,
    color: '#09090b',
    lineHeight: 22,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 12,
  },

  /* Live Preview Section */
  previewContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    padding: 10,
    maxHeight: 140,
    marginBottom: 10,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderColor: '#f4f4f5',
    marginBottom: 6,
  },
  previewHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FF5E36',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  previewSubtitle: {
    fontSize: 10,
    color: '#a1a1aa',
  },
  previewScroll: {
    maxHeight: 90,
  },
  previewScrollContent: {
    paddingVertical: 2,
  },
  previewEmptyText: {
    fontSize: 12,
    color: '#a1a1aa',
    fontStyle: 'italic',
  },

  /* Bottom Primary Button */
  bottomBarContainer: {
    paddingBottom: 12,
  },
  modalApplyPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF5E36',
    borderRadius: 12,
    paddingVertical: 14,
    shadowColor: '#FF5E36',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  modalApplyPrimaryBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default styles;
