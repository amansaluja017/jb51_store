import { Platform, Share } from 'react-native';

/**
 * Universal clipboard copy and native share helper.
 * Uses navigator.clipboard on Web, and Share dialog on native platforms (or fallback).
 */
export const copyOrShareText = async (
  text: string,
  title?: string
): Promise<{ success: boolean; method: 'clipboard' | 'share'; message?: string }> => {
  try {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return { success: true, method: 'clipboard', message: 'Copied to clipboard!' };
    }

    // On native iOS / Android, launch the native share sheet
    // which allows copying to clipboard or sending to any AI app
    const result = await Share.share({
      title: title || 'JB51 AI Prompt',
      message: text,
    });

    if (result.action === Share.sharedAction) {
      return { success: true, method: 'share', message: 'Ready to use!' };
    }
    return { success: true, method: 'share' };
  } catch (error: unknown) {
    console.warn('Clipboard/Share error:', error);
    const message = error instanceof Error ? error.message : 'Failed to copy';
    return { success: false, method: 'share', message };
  }
};

