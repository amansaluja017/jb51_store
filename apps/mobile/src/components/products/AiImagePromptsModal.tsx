import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  X,
  Sparkles,
  Copy,
  Check,
  Share2,
} from 'lucide-react-native';
import {
  ProductAiInput,
  generateImagePrompts,
  getMissingProductInfo,
  AiImagePromptItem,
  MissingFieldInfo,
} from '../../utils/ai';
import { copyOrShareText } from '../../utils/clipboardHelper';
import { AiGarmentSpecsEditor } from './ai/AiGarmentSpecsEditor';
import { AiImagePromptCard } from './ai/AiImagePromptCard';
import { styles } from './AiImagePromptsModal.styles';

export interface AiImagePromptsModalProps {
  visible: boolean;
  onClose: () => void;
  productData: ProductAiInput;
  onUpdateProductData: (updated: Partial<ProductAiInput>) => void;
  activeVariantIdx?: number | null;
}

export const AiImagePromptsModal: React.FC<AiImagePromptsModalProps> = ({
  visible,
  onClose,
  productData,
  onUpdateProductData,
}) => {
  const insets = useSafeAreaInsets();

  // Local state for missing details form
  const [localName, setLocalName] = useState(productData.name || '');
  const [localColor, setLocalColor] = useState(productData.variantColor || '');
  const [localFabric, setLocalFabric] = useState(productData.fabric || '');
  const [localFit, setLocalFit] = useState(productData.fit || '');
  const [localDesc, setLocalDesc] = useState(productData.description || '');

  // Active prompt tab index (0 to 4)
  const [activePromptIndex, setActivePromptIndex] = useState(0);

  // Toggle missing details panel
  const [showEditSpecs, setShowEditSpecs] = useState(false);

  // View mode: 'prompt' or 'cli'
  const [viewCliMode, setViewCliMode] = useState(false);

  // Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Keep local fields in sync when productData changes or modal opens
  useEffect(() => {
    if (visible) {
      setLocalName(productData.name || '');
      setLocalColor(productData.variantColor || '');
      setLocalFabric(productData.fabric || '');
      setLocalFit(productData.fit || '');
      setLocalDesc(productData.description || '');
      setActivePromptIndex(0);
      setViewCliMode(false);
    }
  }, [visible, productData]);

  // Merge productData with local inputs
  const currentMergedData: ProductAiInput = {
    ...productData,
    name: localName || productData.name,
    variantColor: localColor || productData.variantColor,
    fabric: localFabric || productData.fabric,
    fit: localFit || productData.fit,
    description: localDesc || productData.description,
  };

  const missingInfoList: MissingFieldInfo[] = getMissingProductInfo(currentMergedData);
  const isMissingInfo = missingInfoList.length > 0;
  const promptsList: AiImagePromptItem[] = generateImagePrompts(currentMergedData);
  const activePrompt: AiImagePromptItem = promptsList[activePromptIndex] || promptsList[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  };

  const handleApplyMissingDetails = () => {
    onUpdateProductData({
      name: localName,
      variantColor: localColor,
      fabric: localFabric,
      fit: localFit,
      description: localDesc,
    });
    setShowEditSpecs(false);
    showToast('Garment specifications updated!');
  };

  const handleCopyPrompt = async (text: string, title?: string) => {
    const res = await copyOrShareText(text, title || 'JB51 AI Image Prompt');
    if (res.success) {
      showToast(res.message || 'Copied prompt to clipboard!');
    }
  };

  const handleSharePrompt = async (text: string) => {
    await copyOrShareText(text, 'JB51 AI Photography Prompt');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalShell} edges={['top', 'bottom', 'left', 'right']}>
        {/* Modal Header */}
        <View style={styles.modalHeader}>
          <View style={styles.headerLeft}>
            <Text style={styles.modalTitle}>AI Photography Studio</Text>
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>PROMPTS</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeHeaderBtn} activeOpacity={0.7}>
            <X size={20} color="#09090b" />
          </TouchableOpacity>
        </View>

        {/* Toast Notification */}
        {toastMessage && (
          <View style={styles.toastBanner}>
            <Check size={14} color="#ffffff" />
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        )}

        {/* Prompt Tabs Selector Bar */}
        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
            {promptsList.map((p, idx) => {
              const isSelected = idx === activePromptIndex;
              return (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.tabPill, isSelected && styles.activeTabPill]}
                  onPress={() => setActivePromptIndex(idx)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.tabPillText, isSelected && styles.activeTabPillText]}>
                    {idx + 1}. {p.title.split('(')[0].trim()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Scrollable Body */}
        <ScrollView
          style={styles.scrollBody}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Garment Details & Context Editor */}
          <AiGarmentSpecsEditor
            isMissingInfo={isMissingInfo}
            showEditSpecs={showEditSpecs}
            onToggleEditSpecs={setShowEditSpecs}
            localName={localName}
            setLocalName={setLocalName}
            localColor={localColor}
            setLocalColor={setLocalColor}
            localFabric={localFabric}
            setLocalFabric={setLocalFabric}
            localFit={localFit}
            setLocalFit={setLocalFit}
            localDesc={localDesc}
            setLocalDesc={setLocalDesc}
            onApply={handleApplyMissingDetails}
            applyButtonLabel="Apply Details & Update Prompts"
            currentData={currentMergedData}
          />

          {/* Active Prompt Card */}
          {activePrompt && (
            <AiImagePromptCard
              prompt={activePrompt}
              viewCliMode={viewCliMode}
              onToggleCliMode={setViewCliMode}
            />
          )}

          {/* Guide Tips */}
          <View style={styles.tipsCard}>
            <View style={styles.tipsHeader}>
              <Sparkles size={13} color="#FF5E36" />
              <Text style={styles.tipsTitle}>How Consistency Works</Text>
            </View>
            <Text style={styles.tipsText}>
              1. The reference suit photo above is injected into the prompt as the ground truth reference.
            </Text>
            <Text style={styles.tipsText}>
              2. For Midjourney, `--sref &lt;URL&gt; --cw 100` locks the character clothing weight to 100%, forcing the AI to clone your exact garment instead of inventing a random suit.
            </Text>
            <Text style={styles.tipsText}>
              3. For ChatGPT / DALL-E / Gemini, attach your suit image alongside this prompt in the chat.
            </Text>
          </View>
        </ScrollView>

        {/* Persistent Bottom Action Bar */}
        {activePrompt && (
          <View style={[styles.bottomActionBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <TouchableOpacity
              style={styles.shareBtn}
              onPress={() => handleSharePrompt(activePrompt.promptText)}
              activeOpacity={0.7}
            >
              <Share2 size={15} color="#71717a" />
              <Text style={styles.shareBtnText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.copyBtn}
              onPress={() =>
                handleCopyPrompt(
                  viewCliMode
                    ? activePrompt.promptText.split('MIDJOURNEY / FLUX CLI COMMAND:\n')[1] || activePrompt.promptText
                    : activePrompt.promptText,
                  activePrompt.title
                )
              }
              activeOpacity={0.8}
            >
              <Copy size={15} color="#ffffff" />
              <Text style={styles.copyBtnText}>
                {viewCliMode ? 'Copy CLI Command' : 'Copy Full Prompt'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

export default AiImagePromptsModal;
