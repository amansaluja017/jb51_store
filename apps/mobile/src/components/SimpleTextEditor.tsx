import React, { useState, useRef, useEffect } from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading,
  RotateCcw,
  ExternalLink,
  Eye,
  X,
  Check,
  GripHorizontal,
} from 'lucide-react-native';
import FormattedRichText from './FormattedRichText';
import styles from './SimpleTextEditor.styles';
import { countWords } from '../utils/text';

interface SimpleTextEditorProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  multiline?: boolean;
  numberOfLines?: number;
  minWords?: number;
}

/**
 * Resizable Field with dedicated "Open Editor" modal
 * Built using React Native Safe Area Context and styled according
 * to the application's luxury boutique theme.
 */
export default function SimpleTextEditor({
  label,
  value,
  onChangeText,
  onBlur,
  placeholder,
  multiline = false,
  numberOfLines = 3,
  minWords,
}: SimpleTextEditorProps) {
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDraft, setModalDraft] = useState(value || '');
  const [modalSelection, setModalSelection] = useState<{ start: number; end: number }>({ start: 0, end: 0 });
  const modalInputRef = useRef<TextInput | null>(null);

  // Height state for resizable inline text field
  const minHeight = multiline ? Math.max(70, numberOfLines * 26) : 44;
  const [fieldHeight, setFieldHeight] = useState<number>(minHeight);
  const startDragHeightRef = useRef<number>(minHeight);

  // Sync draft when value changes externally
  useEffect(() => {
    setModalDraft(value || '');
  }, [value]);

  // Auto-expand height as content grows
  const handleContentSizeChange = (e: { nativeEvent: { contentSize: { height: number } } }) => {
    if (multiline) {
      const contentH = e.nativeEvent.contentSize.height;
      setFieldHeight(prev => Math.max(prev, Math.max(minHeight, contentH + 20)));
    }
  };

  // Draggable handle to resize field height manually
  const resizePan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        startDragHeightRef.current = fieldHeight;
      },
      onPanResponderMove: (_, gestureState) => {
        const newH = Math.max(minHeight, Math.min(600, startDragHeightRef.current + gestureState.dy));
        setFieldHeight(newH);
      },
    })
  ).current;

  // Open modal
  const handleOpenModal = () => {
    setModalDraft(value || '');
    setIsModalOpen(true);
  };

  // Save modal draft back to field
  const handleSaveModal = () => {
    onChangeText(modalDraft);
    setIsModalOpen(false);
  };

  // Cancel / close modal
  const handleCloseModal = () => {
    setModalDraft(value || '');
    setIsModalOpen(false);
  };

  // Formatting operations inside the modal
  const applyModalFormat = (tag: 'b' | 'i' | 'u' | 'h2') => {
    const text = modalDraft || '';
    const { start, end } = modalSelection;
    const openTag = `<${tag}>`;
    const closeTag = `</${tag}>`;

    // 1. Text is selected
    if (start !== end && start >= 0 && end <= text.length) {
      const selected = text.substring(start, end);
      let newText: string;
      if (selected.startsWith(openTag) && selected.endsWith(closeTag)) {
        // Toggle off
        const unwrapped = selected.substring(openTag.length, selected.length - closeTag.length);
        newText = text.substring(0, start) + unwrapped + text.substring(end);
      } else {
        // Wrap
        const wrapped = `${openTag}${selected}${closeTag}`;
        newText = text.substring(0, start) + wrapped + text.substring(end);
      }
      setModalDraft(newText);
      return;
    }

    // 2. No text selected: for headings, apply to current line
    if (tag === 'h2') {
      const lineStartIndex = text.lastIndexOf('\n', start - 1) + 1;
      let lineEndIndex = text.indexOf('\n', start);
      if (lineEndIndex === -1) lineEndIndex = text.length;

      const before = text.substring(0, lineStartIndex);
      const currentLine = text.substring(lineStartIndex, lineEndIndex);
      const after = text.substring(lineEndIndex);

      if (currentLine.startsWith('<h2>') && currentLine.endsWith('</h2>')) {
        // Toggle off heading
        const unwrapped = currentLine.substring(4, currentLine.length - 5);
        setModalDraft(before + unwrapped + after);
      } else {
        const trimmed = currentLine.trim();
        const wrapped = `<h2>${trimmed || 'Heading Title'}</h2>`;
        setModalDraft(before + wrapped + after);
      }
      return;
    }

    // 3. For bold/italic/underline with no selection, insert sample tag
    if (!text.trim()) {
      setModalDraft(`${openTag}Sample text${closeTag}`);
    } else {
      const prefix = text.substring(0, start);
      const suffix = text.substring(start);
      const insertText = `${openTag}sample${closeTag}`;
      setModalDraft(prefix + insertText + suffix);
    }
  };

  // Bullets: Apply ONLY to selected lines, or current line if no selection
  const applyModalBullets = () => {
    const text = modalDraft || '';
    if (!text.trim()) {
      setModalDraft('• ');
      return;
    }

    const { start, end } = modalSelection;
    if (start !== end && start >= 0 && end <= text.length) {
      // Find boundary lines of the selection
      const lineStartIndex = text.lastIndexOf('\n', start - 1) + 1;
      let lineEndIndex = text.indexOf('\n', end);
      if (lineEndIndex === -1) lineEndIndex = text.length;

      const before = text.substring(0, lineStartIndex);
      const selectedBlock = text.substring(lineStartIndex, lineEndIndex);
      const after = text.substring(lineEndIndex);

      const lines = selectedBlock.split('\n');
      const allBulleted = lines.every(l => l.trim().startsWith('• '));

      let modifiedLines: string;
      if (allBulleted) {
        // Toggle off bullets
        modifiedLines = lines.map(l => l.replace(/^•\s*/, '')).join('\n');
      } else {
        // Add bullets to selected lines
        modifiedLines = lines
          .map(line => (line.trim().startsWith('• ') ? line : `• ${line.replace(/^[-*]\s*/, '').replace(/^\d+\.\s*/, '')}`))
          .join('\n');
      }

      setModalDraft(before + modifiedLines + after);
    } else {
      // No text selected: format only the current line
      const lineStartIndex = text.lastIndexOf('\n', start - 1) + 1;
      let lineEndIndex = text.indexOf('\n', start);
      if (lineEndIndex === -1) lineEndIndex = text.length;

      const before = text.substring(0, lineStartIndex);
      const currentLine = text.substring(lineStartIndex, lineEndIndex);
      const after = text.substring(lineEndIndex);

      let modifiedLine: string;
      if (currentLine.trim().startsWith('• ')) {
        modifiedLine = currentLine.replace(/^•\s*/, '');
      } else {
        modifiedLine = `• ${currentLine.replace(/^[-*]\s*/, '').replace(/^\d+\.\s*/, '')}`;
      }

      setModalDraft(before + modifiedLine + after);
    }
  };

  // Numbered: Apply ONLY to selected lines, or current line if no selection
  const applyModalNumbered = () => {
    const text = modalDraft || '';
    if (!text.trim()) {
      setModalDraft('1. ');
      return;
    }

    const { start, end } = modalSelection;
    if (start !== end && start >= 0 && end <= text.length) {
      // Find boundary lines of the selection
      const lineStartIndex = text.lastIndexOf('\n', start - 1) + 1;
      let lineEndIndex = text.indexOf('\n', end);
      if (lineEndIndex === -1) lineEndIndex = text.length;

      const before = text.substring(0, lineStartIndex);
      const selectedBlock = text.substring(lineStartIndex, lineEndIndex);
      const after = text.substring(lineEndIndex);

      const lines = selectedBlock.split('\n');
      const isNumbered = lines.some(l => /^\d+\.\s*/.test(l.trim()));

      let modifiedLines: string;
      if (isNumbered) {
        // Toggle off numbering
        modifiedLines = lines.map(l => l.replace(/^\d+\.\s*/, '')).join('\n');
      } else {
        // Add numbering to selected lines
        modifiedLines = lines
          .map((line, idx) => `${idx + 1}. ${line.replace(/^[-*•]\s*/, '').replace(/^\d+\.\s*/, '')}`)
          .join('\n');
      }

      setModalDraft(before + modifiedLines + after);
    } else {
      // No text selected: format only the current line
      const lineStartIndex = text.lastIndexOf('\n', start - 1) + 1;
      let lineEndIndex = text.indexOf('\n', start);
      if (lineEndIndex === -1) lineEndIndex = text.length;

      const before = text.substring(0, lineStartIndex);
      const currentLine = text.substring(lineStartIndex, lineEndIndex);
      const after = text.substring(lineEndIndex);

      let modifiedLine: string;
      if (/^\d+\.\s*/.test(currentLine.trim())) {
        modifiedLine = currentLine.replace(/^\d+\.\s*/, '');
      } else {
        modifiedLine = `1. ${currentLine.replace(/^[-*•]\s*/, '')}`;
      }

      setModalDraft(before + modifiedLine + after);
    }
  };

  const applyModalClear = () => {
    const text = modalDraft || '';
    const clean = text
      .replace(/<[^>]*>?/gm, '')
      .replace(/^[•\-\*]\s*/gm, '')
      .replace(/^\d+\.\s*/gm, '')
      .trim();
    setModalDraft(clean);
  };

  const hasFormatting = (value || '').includes('<') || (value || '').includes('•');
  const inlineWordCount = countWords(value);
  const wordCount = countWords(modalDraft);
  const charCount = (modalDraft || '').length;

  return (
    <View style={styles.container}>
      {/* Field Header: Label & "Open Editor" button */}
      <View style={styles.labelRow}>
        <View style={styles.labelLeftCol}>
          <Text style={styles.fieldLabel}>{label}</Text>
          {hasFormatting && (
            <View style={styles.formattedBadge}>
              <Text style={styles.formattedBadgeText}>Rich Text</Text>
            </View>
          )}
          {minWords !== undefined && (
            <View
              style={{
                paddingHorizontal: 6,
                paddingVertical: 1.5,
                borderRadius: 4,
                backgroundColor: inlineWordCount >= minWords ? '#DCFCE7' : '#FFE4E6',
                borderWidth: 1,
                borderColor: inlineWordCount >= minWords ? '#86EFAC' : '#FECDD3',
              }}
            >
              <Text
                style={{
                  fontSize: 9,
                  fontWeight: '700',
                  color: inlineWordCount >= minWords ? '#15803D' : '#BE123C',
                  textTransform: 'uppercase',
                }}
              >
                {inlineWordCount >= minWords
                  ? `${inlineWordCount} words ✓`
                  : `${inlineWordCount}/${minWords} words`}
              </Text>
            </View>
          )}
        </View>

        {/* Open Editor Button */}
        <TouchableOpacity
          onPress={handleOpenModal}
          style={styles.openEditorBtn}
          activeOpacity={0.7}
        >
          <ExternalLink size={12} color="#FF5E36" style={{ marginRight: 4 }} />
          <Text style={styles.openEditorBtnText}>Open Editor</Text>
        </TouchableOpacity>
      </View>

      {/* Resizable Text Field Box */}
      <View style={[styles.editorBox, multiline && { minHeight: fieldHeight }]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          onContentSizeChange={handleContentSizeChange}
          placeholder={placeholder}
          placeholderTextColor="#a1a1aa"
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          style={[
            styles.textInput,
            {
              minHeight: fieldHeight,
              textAlignVertical: multiline ? 'top' : 'center',
            },
          ]}
        />

        {/* Draggable bottom handle for manual resizing */}
        {multiline && (
          <View {...resizePan.panHandlers} style={styles.resizeHandleBar}>
            <GripHorizontal size={14} color="#a1a1aa" />
          </View>
        )}
      </View>

      {/* -------------------- FULL EDITOR MODAL -------------------- */}
      <Modal
        visible={isModalOpen}
        animationType="slide"
        transparent={false}
        onRequestClose={handleCloseModal}
      >
        <SafeAreaView style={styles.modalRoot} edges={['top', 'bottom', 'left', 'right']}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1 }}
          >
            {/* Modal Header Bar */}
            <View style={styles.modalHeaderBar}>
              <TouchableOpacity
                onPress={handleCloseModal}
                style={styles.modalCloseBtn}
                activeOpacity={0.7}
              >
                <X size={18} color="#71717a" />
              </TouchableOpacity>

              <View style={styles.modalHeaderTitleCol}>
                <Text style={styles.modalHeaderTitle}>Text Editor</Text>
                <Text style={styles.modalHeaderSubtitle} numberOfLines={1}>{label}</Text>
              </View>

              <TouchableOpacity
                onPress={handleSaveModal}
                style={styles.modalApplyHeaderBtn}
                activeOpacity={0.7}
              >
                <Check size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
                <Text style={styles.modalApplyHeaderBtnText}>Apply</Text>
              </TouchableOpacity>
            </View>

            {/* Editor Workspace Container */}
            <View style={styles.editorViewContainer}>
              {/* Formatting Tools Bar with Dedicated Elevated Island */}
              <View style={styles.toolbarContainer}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.toolbarScroll}
                  keyboardShouldPersistTaps="always"
                >
                  <TouchableOpacity
                    onPress={() => applyModalFormat('b')}
                    style={styles.formatToolBtn}
                    activeOpacity={0.7}
                  >
                    <Bold size={13} color="#09090b" />
                    <Text style={styles.formatToolBtnText}>Bold</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => applyModalFormat('i')}
                    style={styles.formatToolBtn}
                    activeOpacity={0.7}
                  >
                    <Italic size={13} color="#09090b" />
                    <Text style={styles.formatToolBtnText}>Italic</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => applyModalFormat('u')}
                    style={styles.formatToolBtn}
                    activeOpacity={0.7}
                  >
                    <Underline size={13} color="#09090b" />
                    <Text style={styles.formatToolBtnText}>Underline</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => applyModalFormat('h2')}
                    style={styles.formatToolBtn}
                    activeOpacity={0.7}
                  >
                    <Heading size={13} color="#09090b" />
                    <Text style={styles.formatToolBtnText}>Heading</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={applyModalBullets}
                    style={styles.formatToolBtn}
                    activeOpacity={0.7}
                  >
                    <List size={13} color="#09090b" />
                    <Text style={styles.formatToolBtnText}>Bullet List</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={applyModalNumbered}
                    style={styles.formatToolBtn}
                    activeOpacity={0.7}
                  >
                    <ListOrdered size={13} color="#09090b" />
                    <Text style={styles.formatToolBtnText}>Numbered</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={applyModalClear}
                    style={[styles.formatToolBtn, styles.formatToolBtnClear]}
                    activeOpacity={0.7}
                  >
                    <RotateCcw size={12} color="#71717a" />
                    <Text style={[styles.formatToolBtnText, { color: '#71717a' }]}>Clear</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>

              {/* Main Text Input Area with Top Header Buffer to Prevent Context Menu Overlap */}
              <View style={styles.textInputWrapper}>
                {/* Top Bar acts as a protective buffer between toolbar and OS selection context menu */}
                <View style={styles.textInputTopBar}>
                  <Text style={styles.textInputTopHint}>Select text then tap a format button</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    {minWords !== undefined && (
                      <View
                        style={{
                          paddingHorizontal: 6,
                          paddingVertical: 2,
                          borderRadius: 4,
                          backgroundColor: wordCount >= minWords ? '#DCFCE7' : '#FFE4E6',
                          borderWidth: 1,
                          borderColor: wordCount >= minWords ? '#86EFAC' : '#FECDD3',
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 10,
                            fontWeight: '700',
                            color: wordCount >= minWords ? '#15803D' : '#BE123C',
                          }}
                        >
                          {wordCount >= minWords
                            ? `${wordCount} words (Met ✓)`
                            : `${wordCount}/${minWords} words (${minWords - wordCount} needed)`}
                        </Text>
                      </View>
                    )}
                    <Text style={styles.charCounterText}>
                      {wordCount} words • {charCount} chars
                    </Text>
                  </View>
                </View>

                <TextInput
                  ref={modalInputRef}
                  value={modalDraft}
                  onChangeText={setModalDraft}
                  onSelectionChange={(e) => setModalSelection(e.nativeEvent.selection)}
                  placeholder={placeholder || 'Type rich content here...'}
                  placeholderTextColor="#a1a1aa"
                  multiline
                  style={styles.modalTextInput}
                  textAlignVertical="top"
                  autoFocus
                />
              </View>

              {/* Live Preview Section */}
              <View style={styles.previewContainer}>
                <View style={styles.previewHeader}>
                  <View style={styles.previewHeaderLeft}>
                    <Eye size={12} color="#FF5E36" style={{ marginRight: 5 }} />
                    <Text style={styles.previewTitle}>Live Preview</Text>
                  </View>
                  <Text style={styles.previewSubtitle}>Formatted Output</Text>
                </View>
                <ScrollView
                  style={styles.previewScroll}
                  contentContainerStyle={styles.previewScrollContent}
                  nestedScrollEnabled
                  showsVerticalScrollIndicator={false}
                >
                  {modalDraft?.trim() ? (
                    <FormattedRichText text={modalDraft} baseFontSize={13} textColor="#18181b" />
                  ) : (
                    <Text style={styles.previewEmptyText}>Live preview will appear here as you type...</Text>
                  )}
                </ScrollView>
              </View>

              {/* Bottom Primary Action Bar */}
              <View style={styles.bottomBarContainer}>
                <TouchableOpacity
                  onPress={handleSaveModal}
                  style={styles.modalApplyPrimaryBtn}
                  activeOpacity={0.8}
                >
                  <Check size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.modalApplyPrimaryBtnText}>Apply to {label}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

