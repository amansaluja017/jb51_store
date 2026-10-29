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
  Keyboard,
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
  Maximize2,
  Eye,
  Edit3,
  X,
  Check,
  Sparkles,
  GripHorizontal,
} from 'lucide-react-native';
import FormattedRichText from './FormattedRichText';
import styles from './SimpleTextEditor.styles';
import { countWords } from '../utils/text';

export interface EditorTemplate {
  title: string;
  text: string;
}

export interface SimpleTextEditorProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  multiline?: boolean;
  numberOfLines?: number;
  minWords?: number;
  sectionType?: 'hero' | 'adBanner' | 'sale' | 'faq' | 'contact' | 'product' | 'promo';
  customTemplates?: EditorTemplate[];
}

const DEFAULT_TEMPLATES: Record<string, EditorTemplate[]> = {
  hero: [
    {
      title: 'Artisanal Silk Splendor',
      text: 'Handcrafted with pure chanderi silk and bespoke embroidery, celebrating royal silhouettes designed for effortless modern ease.',
    },
    {
      title: 'Timeless Festive Grace',
      text: 'Exquisite heirloom weaves with delicate zari borders, tailored to flow with supreme sophistication across celebratory evenings.',
    },
    {
      title: 'Royal Bespoke Tailoring',
      text: 'Mastercrafted ensembles tailored to your exact measurements by master artisans, complemented by private concierge service.',
    },
  ],
  adBanner: [
    {
      title: 'The Art of Custom Drape',
      text: 'Experience the pinnacle of bespoke couture. Our master craftsmen tailor each ensemble to your exact measurements, ensuring a silhouette that flows with effortless grace and timeless sophistication.',
    },
    {
      title: 'Private Atelier Heritage',
      text: 'From hand-picked silk weaves to tailored precision, our atelier creates one-of-a-kind heirlooms designed to be treasured for generations.',
    },
    {
      title: 'Bespoke Concierge Fittings',
      text: 'Enjoy an exclusive bespoke fitting session with our couture specialists, meticulously crafted to celebrate your individual poise.',
    },
  ],
  sale: [
    {
      title: 'Limited Festive Edit',
      text: 'Enjoy up to 70% off on curated traditional designs and ready-to-wear silk co-ords. Handcrafted pieces in limited quantities.',
    },
    {
      title: 'Seasonal Archive Privilege',
      text: 'A rare archival collection offered with complimentary bespoke fitting adjustments for a limited duration.',
    },
  ],
  faq: [
    {
      title: 'WhatsApp Concierge Confirmation',
      text: 'Our concierge team actively connects with each bespoke customer via WhatsApp or email to verify all measurements before cutting.',
    },
    {
      title: 'Custom Stitching Options',
      text: 'Select your desired garment and size. You can input custom proportions during standard checkout or request tailored fitting.',
    },
    {
      title: 'Pure Silk Care Instructions',
      text: 'Dry clean only. We recommend storing pure silk ensembles wrapped in breathable muslin bags in a cool, dry closet.',
    },
  ],
  contact: [
    {
      title: 'Flagship Atelier Address',
      text: 'JB51 Store, Model Town, Ludhiana, Punjab 141002, India. Private styling appointments and bespoke bridal consultations available.',
    },
  ],
  product: [
    {
      title: 'Heirloom Craftsmanship',
      text: 'Crafted from pure hand-spun silk with authentic zardozi embroidery, lined with ultra-soft breathable fabric for day-to-night luxury.',
    },
    {
      title: 'Contemporary Royal Fusion',
      text: 'A contemporary fusion of royal Punjabi aesthetics with clean minimalist lines, personalized drape, and refined artisan detailing.',
    },
  ],
};

/**
 * Supercharged Rich Text & Description Editor
 * Provides inline formatting, curated luxury templates to "write better descriptions",
 * and a distraction-free Write & Live-Preview studio that never collides with keyboards.
 */
export default function SimpleTextEditor({
  label,
  value,
  onChangeText,
  onBlur,
  placeholder,
  multiline = true,
  numberOfLines = 3,
  minWords,
  sectionType = 'product',
  customTemplates,
}: SimpleTextEditorProps) {
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'write' | 'preview'>('write');
  const [modalDraft, setModalDraft] = useState(value || '');
  const [modalSelection, setModalSelection] = useState<{ start: number; end: number }>({ start: 0, end: 0 });
  const [showTemplates, setShowTemplates] = useState(false);
  const [showInlineTemplates, setShowInlineTemplates] = useState(false);
  const [isKeyboardUp, setIsKeyboardUp] = useState(false);
  const modalInputRef = useRef<TextInput | null>(null);

  // Height state for resizable inline text field
  const minHeight = multiline ? Math.max(70, numberOfLines * 26) : 44;
  const [fieldHeight, setFieldHeight] = useState<number>(minHeight);
  const startDragHeightRef = useRef<number>(minHeight);

  // Keyboard listener inside editor
  useEffect(() => {
    const showSub = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', () => {
      setIsKeyboardUp(true);
    });
    const hideSub = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => {
      setIsKeyboardUp(false);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Sync draft when value changes externally
  useEffect(() => {
    setModalDraft(value || '');
  }, [value]);

  // Content growth auto-expansion
  const handleContentSizeChange = (e: { nativeEvent: { contentSize: { height: number } } }) => {
    if (multiline) {
      const contentH = e.nativeEvent.contentSize.height;
      setFieldHeight((prev) => Math.max(prev, Math.max(minHeight, contentH + 20)));
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

  // Open full studio modal
  const handleOpenModal = () => {
    setModalDraft(value || '');
    setModalMode('write');
    setShowTemplates(false);
    setIsModalOpen(true);
  };

  // Save modal draft back to parent field
  const handleSaveModal = () => {
    onChangeText(modalDraft);
    setIsModalOpen(false);
    Keyboard.dismiss();
  };

  // Close modal
  const handleCloseModal = () => {
    setModalDraft(value || '');
    setIsModalOpen(false);
    Keyboard.dismiss();
  };

  // Templates to offer
  const activeTemplates: EditorTemplate[] =
    customTemplates && customTemplates.length > 0
      ? customTemplates
      : DEFAULT_TEMPLATES[sectionType] || DEFAULT_TEMPLATES.product;

  // Formatting operations
  const applyFormattingToTarget = (
    currentText: string,
    selection: { start: number; end: number },
    tag: 'b' | 'i' | 'u' | 'h2'
  ): string => {
    const text = currentText || '';
    const { start, end } = selection;
    const openTag = `<${tag}>`;
    const closeTag = `</${tag}>`;

    // 1. Text is selected
    if (start !== end && start >= 0 && end <= text.length) {
      const selected = text.substring(start, end);
      if (selected.startsWith(openTag) && selected.endsWith(closeTag)) {
        const unwrapped = selected.substring(openTag.length, selected.length - closeTag.length);
        return text.substring(0, start) + unwrapped + text.substring(end);
      }
      return text.substring(0, start) + `${openTag}${selected}${closeTag}` + text.substring(end);
    }

    // 2. Heading toggle for line
    if (tag === 'h2') {
      const lineStartIndex = text.lastIndexOf('\n', start - 1) + 1;
      let lineEndIndex = text.indexOf('\n', start);
      if (lineEndIndex === -1) lineEndIndex = text.length;

      const before = text.substring(0, lineStartIndex);
      const currentLine = text.substring(lineStartIndex, lineEndIndex);
      const after = text.substring(lineEndIndex);

      if (currentLine.startsWith('<h2>') && currentLine.endsWith('</h2>')) {
        return before + currentLine.substring(4, currentLine.length - 5) + after;
      }
      const trimmed = currentLine.trim();
      return before + `<h2>${trimmed || 'Headline'}</h2>` + after;
    }

    // 3. Insert sample tag
    if (!text.trim()) {
      return `${openTag}Sample text${closeTag}`;
    }
    const prefix = text.substring(0, start);
    const suffix = text.substring(start);
    return prefix + `${openTag}sample${closeTag}` + suffix;
  };

  const applyBulletToTarget = (currentText: string, selection: { start: number; end: number }): string => {
    const text = currentText || '';
    if (!text.trim()) return '• ';

    const { start, end } = selection;
    const lineStartIndex = text.lastIndexOf('\n', start - 1) + 1;
    let lineEndIndex = start !== end ? text.indexOf('\n', end) : text.indexOf('\n', start);
    if (lineEndIndex === -1) lineEndIndex = text.length;

    const before = text.substring(0, lineStartIndex);
    const selectedBlock = text.substring(lineStartIndex, lineEndIndex);
    const after = text.substring(lineEndIndex);

    const lines = selectedBlock.split('\n');
    const allBulleted = lines.every((l) => l.trim().startsWith('• '));

    const modified = allBulleted
      ? lines.map((l) => l.replace(/^•\s*/, '')).join('\n')
      : lines.map((l) => (l.trim().startsWith('• ') ? l : `• ${l.replace(/^[-*]\s*/, '').replace(/^\d+\.\s*/, '')}`)).join('\n');

    return before + modified + after;
  };

  const applyNumberedToTarget = (currentText: string, selection: { start: number; end: number }): string => {
    const text = currentText || '';
    if (!text.trim()) return '1. ';

    const { start, end } = selection;
    const lineStartIndex = text.lastIndexOf('\n', start - 1) + 1;
    let lineEndIndex = start !== end ? text.indexOf('\n', end) : text.indexOf('\n', start);
    if (lineEndIndex === -1) lineEndIndex = text.length;

    const before = text.substring(0, lineStartIndex);
    const selectedBlock = text.substring(lineStartIndex, lineEndIndex);
    const after = text.substring(lineEndIndex);

    const lines = selectedBlock.split('\n');
    const isNumbered = lines.some((l) => /^\d+\.\s*/.test(l.trim()));

    const modified = isNumbered
      ? lines.map((l) => l.replace(/^\d+\.\s*/, '')).join('\n')
      : lines.map((l, idx) => `${idx + 1}. ${l.replace(/^[-*•]\s*/, '').replace(/^\d+\.\s*/, '')}`).join('\n');

    return before + modified + after;
  };

  const applyClearFormatting = (currentText: string): string => {
    return (currentText || '')
      .replace(/<[^>]*>?/gm, '')
      .replace(/^[•\-\*]\s*/gm, '')
      .replace(/^\d+\.\s*/gm, '')
      .trim();
  };

  // Inline formatting helper
  const handleInlineFormat = (tag: 'b' | 'i' | 'u') => {
    const updated = applyFormattingToTarget(value, { start: 0, end: (value || '').length }, tag);
    onChangeText(updated);
  };

  const handleInlineBullet = () => {
    const updated = applyBulletToTarget(value, { start: (value || '').length, end: (value || '').length });
    onChangeText(updated);
  };

  const handleInsertTemplateInline = (tplText: string) => {
    onChangeText(value ? `${value.trim()}\n\n${tplText}` : tplText);
    setShowInlineTemplates(false);
  };

  const handleInsertTemplateModal = (tplText: string) => {
    setModalDraft((prev) => (prev ? `${prev.trim()}\n\n${tplText}` : tplText));
    setShowTemplates(false);
  };

  const hasFormatting = (value || '').includes('<') || (value || '').includes('•');
  const inlineWordCount = countWords(value);
  const modalWordCount = countWords(modalDraft);
  const modalCharCount = (modalDraft || '').length;

  return (
    <View style={styles.container}>
      {/* Field Header */}
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

        {/* Open Full Studio Button */}
        <TouchableOpacity
          onPress={handleOpenModal}
          style={styles.openEditorBtn}
          activeOpacity={0.7}
        >
          <Maximize2 size={11} color="#FF5E36" />
          <Text style={styles.openEditorBtnText}>Editor Studio</Text>
        </TouchableOpacity>
      </View>

      {/* Inline Quick Action Bar (Direct one-tap formatting & templates without modal) */}
      <View style={styles.inlineToolbar}>
        <TouchableOpacity
          style={styles.inlineToolBtn}
          onPress={() => handleInlineFormat('b')}
          activeOpacity={0.7}
        >
          <Bold size={11} color="#334155" />
          <Text style={styles.inlineToolBtnText}>Bold</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.inlineToolBtn}
          onPress={() => handleInlineFormat('i')}
          activeOpacity={0.7}
        >
          <Italic size={11} color="#334155" />
          <Text style={styles.inlineToolBtnText}>Italic</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.inlineToolBtn}
          onPress={handleInlineBullet}
          activeOpacity={0.7}
        >
          <List size={11} color="#334155" />
          <Text style={styles.inlineToolBtnText}>Bullet</Text>
        </TouchableOpacity>

        {activeTemplates.length > 0 && (
          <TouchableOpacity
            style={styles.templateChipBtn}
            onPress={() => setShowInlineTemplates(!showInlineTemplates)}
            activeOpacity={0.7}
          >
            <Sparkles size={11} color="#FF5E36" />
            <Text style={styles.templateChipText}>Write Better ✨</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Inline Template Drawer if toggled */}
      {showInlineTemplates && activeTemplates.length > 0 && (
        <View style={styles.templateDrawer}>
          <View style={styles.templateDrawerHeader}>
            <Text style={styles.templateDrawerTitle}>Curated Luxury Suggestions</Text>
            <TouchableOpacity onPress={() => setShowInlineTemplates(false)}>
              <X size={14} color="#71717a" />
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.templateScroll}
          >
            {activeTemplates.map((tpl, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.templateCard}
                onPress={() => handleInsertTemplateInline(tpl.text)}
                activeOpacity={0.75}
              >
                <Text style={styles.templateCardTitle}>{tpl.title}</Text>
                <Text style={styles.templateCardText} numberOfLines={3}>
                  {tpl.text}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Resizable Text Box */}
      <View
        style={[
          styles.editorBox,
          styles.editorBoxWithInlineToolbar,
          multiline && { minHeight: fieldHeight },
        ]}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          onContentSizeChange={handleContentSizeChange}
          placeholder={placeholder || 'Write compelling description...'}
          placeholderTextColor="#94a3b8"
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

        {/* Draggable handle for manual resizing */}
        {multiline && (
          <View {...resizePan.panHandlers} style={styles.resizeHandleBar}>
            <GripHorizontal size={14} color="#a1a1aa" />
          </View>
        )}
      </View>

      {/* -------------------- DISTRACTION-FREE FULL EDITOR STUDIO -------------------- */}
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
                <X size={18} color="#64748b" />
              </TouchableOpacity>

              <View style={styles.modalHeaderTitleCol}>
                <Text style={styles.modalHeaderTitle}>Description Studio</Text>
                <Text style={styles.modalHeaderSubtitle} numberOfLines={1}>
                  {label}
                </Text>
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

            {/* Segmented Mode Switcher: [Write] vs [Live Preview] */}
            <View style={styles.segmentedBar}>
              <TouchableOpacity
                style={[styles.segmentTab, modalMode === 'write' && styles.segmentTabActive]}
                onPress={() => setModalMode('write')}
                activeOpacity={0.8}
              >
                <Edit3 size={13} color={modalMode === 'write' ? '#0f172a' : '#64748b'} />
                <Text
                  style={[
                    styles.segmentTabText,
                    modalMode === 'write' && styles.segmentTabTextActive,
                  ]}
                >
                  Write Content
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.segmentTab, modalMode === 'preview' && styles.segmentTabActive]}
                onPress={() => {
                  Keyboard.dismiss();
                  setModalMode('preview');
                }}
                activeOpacity={0.8}
              >
                <Eye size={13} color={modalMode === 'preview' ? '#0f172a' : '#64748b'} />
                <Text
                  style={[
                    styles.segmentTabText,
                    modalMode === 'preview' && styles.segmentTabTextActive,
                  ]}
                >
                  Live Web Preview
                </Text>
              </TouchableOpacity>
            </View>

            {/* Main Editor Workspace */}
            <View style={styles.editorViewContainer}>
              {modalMode === 'write' ? (
                <>
                  {/* Toolbar Row */}
                  <View style={styles.toolbarContainer}>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.toolbarScroll}
                      keyboardShouldPersistTaps="always"
                    >
                      <TouchableOpacity
                        onPress={() =>
                          setModalDraft((prev) =>
                            applyFormattingToTarget(prev, modalSelection, 'b')
                          )
                        }
                        style={styles.formatToolBtn}
                        activeOpacity={0.7}
                      >
                        <Bold size={13} color="#0f172a" />
                        <Text style={styles.formatToolBtnText}>Bold</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() =>
                          setModalDraft((prev) =>
                            applyFormattingToTarget(prev, modalSelection, 'i')
                          )
                        }
                        style={styles.formatToolBtn}
                        activeOpacity={0.7}
                      >
                        <Italic size={13} color="#0f172a" />
                        <Text style={styles.formatToolBtnText}>Italic</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() =>
                          setModalDraft((prev) =>
                            applyFormattingToTarget(prev, modalSelection, 'u')
                          )
                        }
                        style={styles.formatToolBtn}
                        activeOpacity={0.7}
                      >
                        <Underline size={13} color="#0f172a" />
                        <Text style={styles.formatToolBtnText}>Underline</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() =>
                          setModalDraft((prev) =>
                            applyFormattingToTarget(prev, modalSelection, 'h2')
                          )
                        }
                        style={styles.formatToolBtn}
                        activeOpacity={0.7}
                      >
                        <Heading size={13} color="#0f172a" />
                        <Text style={styles.formatToolBtnText}>Heading</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() =>
                          setModalDraft((prev) => applyBulletToTarget(prev, modalSelection))
                        }
                        style={styles.formatToolBtn}
                        activeOpacity={0.7}
                      >
                        <List size={13} color="#0f172a" />
                        <Text style={styles.formatToolBtnText}>Bullet List</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() =>
                          setModalDraft((prev) => applyNumberedToTarget(prev, modalSelection))
                        }
                        style={styles.formatToolBtn}
                        activeOpacity={0.7}
                      >
                        <ListOrdered size={13} color="#0f172a" />
                        <Text style={styles.formatToolBtnText}>Numbered</Text>
                      </TouchableOpacity>

                      {activeTemplates.length > 0 && (
                        <TouchableOpacity
                          onPress={() => setShowTemplates(!showTemplates)}
                          style={[styles.formatToolBtn, styles.formatToolBtnHighlight]}
                          activeOpacity={0.7}
                        >
                          <Sparkles size={12} color="#FF5E36" />
                          <Text style={[styles.formatToolBtnText, { color: '#FF5E36' }]}>
                            Templates ✨
                          </Text>
                        </TouchableOpacity>
                      )}

                      <TouchableOpacity
                        onPress={() => setModalDraft((prev) => applyClearFormatting(prev))}
                        style={[styles.formatToolBtn, styles.formatToolBtnClear]}
                        activeOpacity={0.7}
                      >
                        <RotateCcw size={12} color="#64748b" />
                        <Text style={[styles.formatToolBtnText, { color: '#64748b' }]}>Clear</Text>
                      </TouchableOpacity>
                    </ScrollView>
                  </View>

                  {/* Template Suggestions Tray */}
                  {showTemplates && activeTemplates.length > 0 && (
                    <View style={styles.templateDrawer}>
                      <View style={styles.templateDrawerHeader}>
                        <Text style={styles.templateDrawerTitle}>
                          Inspiring Luxury Phrases & Templates
                        </Text>
                        <TouchableOpacity onPress={() => setShowTemplates(false)}>
                          <X size={14} color="#71717a" />
                        </TouchableOpacity>
                      </View>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.templateScroll}
                      >
                        {activeTemplates.map((tpl, idx) => (
                          <TouchableOpacity
                            key={idx}
                            style={styles.templateCard}
                            onPress={() => handleInsertTemplateModal(tpl.text)}
                            activeOpacity={0.75}
                          >
                            <Text style={styles.templateCardTitle}>{tpl.title}</Text>
                            <Text style={styles.templateCardText} numberOfLines={3}>
                              {tpl.text}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}

                  {/* Main Full-Height Input */}
                  <View style={styles.textInputWrapper}>
                    <View style={styles.textInputTopBar}>
                      <Text style={styles.textInputTopHint}>
                        Select text then tap a format button
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        {minWords !== undefined && (
                          <View
                            style={{
                              paddingHorizontal: 6,
                              paddingVertical: 2,
                              borderRadius: 4,
                              backgroundColor:
                                modalWordCount >= minWords ? '#DCFCE7' : '#FFE4E6',
                              borderWidth: 1,
                              borderColor:
                                modalWordCount >= minWords ? '#86EFAC' : '#FECDD3',
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 10,
                                fontWeight: '700',
                                color: modalWordCount >= minWords ? '#15803D' : '#BE123C',
                              }}
                            >
                              {modalWordCount >= minWords
                                ? `${modalWordCount} words ✓`
                                : `${modalWordCount}/${minWords} words`}
                            </Text>
                          </View>
                        )}
                        <Text style={styles.charCounterText}>
                          {modalWordCount} words • {modalCharCount} chars
                        </Text>
                      </View>
                    </View>

                    <TextInput
                      ref={modalInputRef}
                      value={modalDraft}
                      onChangeText={setModalDraft}
                      onSelectionChange={(e) => setModalSelection(e.nativeEvent.selection)}
                      placeholder={placeholder || 'Type rich description here...'}
                      placeholderTextColor="#94a3b8"
                      multiline
                      style={styles.modalTextInput}
                      textAlignVertical="top"
                      autoFocus
                    />
                  </View>

                  {/* Keyboard Dismiss Bar when typing */}
                  {isKeyboardUp && (
                    <View style={styles.modalKeyboardBar}>
                      <Text style={styles.modalKeyboardBarHint}>Typing Description</Text>
                      <TouchableOpacity
                        style={styles.modalKeyboardDoneBtn}
                        onPress={() => Keyboard.dismiss()}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.modalKeyboardDoneBtnText}>Done</Text>
                        <Check size={12} color="#ffffff" />
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              ) : (
                /* Full Live Preview Mode */
                <View style={styles.fullPreviewContainer}>
                  <View style={styles.fullPreviewHeader}>
                    <Text style={styles.fullPreviewTitle}>Live Render Preview</Text>
                    <Text style={styles.fullPreviewHint}>Exact appearance on website</Text>
                  </View>
                  <ScrollView
                    style={styles.fullPreviewScroll}
                    showsVerticalScrollIndicator={false}
                  >
                    {modalDraft?.trim() ? (
                      <FormattedRichText
                        text={modalDraft}
                        baseFontSize={14}
                        textColor="#0f172a"
                      />
                    ) : (
                      <Text style={styles.previewEmptyText}>
                        Live preview will appear here as you write...
                      </Text>
                    )}
                  </ScrollView>
                </View>
              )}

              {/* Bottom Primary Apply Button */}
              {!isKeyboardUp && (
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
              )}
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}
