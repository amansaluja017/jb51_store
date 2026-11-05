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
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';
import {
  ProductAiInput,
  generateDescriptions,
  AiDescriptionItem,
} from '../../utils/ai';
import { copyOrShareText } from '../../utils/clipboardHelper';
import { AiGarmentSpecsEditor } from './ai/AiGarmentSpecsEditor';
import { AiDescriptionCard } from './ai/AiDescriptionCard';
import { styles } from './AiDescriptionModal.styles';

export interface AiDescriptionModalProps {
  visible: boolean;
  onClose: () => void;
  productData: ProductAiInput;
  onSelectDescription: (descText: string) => void;
  onUpdateProductData: (updated: Partial<ProductAiInput>) => void;
}

export const AiDescriptionModal: React.FC<AiDescriptionModalProps> = ({
  visible,
  onClose,
  productData,
  onSelectDescription,
  onUpdateProductData,
}) => {
  const insets = useSafeAreaInsets();

  // Local state for missing details
  const [localName, setLocalName] = useState(productData.name || '');
  const [localColor, setLocalColor] = useState(productData.variantColor || '');
  const [localFabric, setLocalFabric] = useState(productData.fabric || '');
  const [localFit, setLocalFit] = useState(productData.fit || '');
  const [localDesc, setLocalDesc] = useState(productData.description || '');

  // Active description tab index (0 to 4)
  const [activeDescIndex, setActiveDescIndex] = useState(0);

  // Toggle edit parameters panel
  const [showEditSpecs, setShowEditSpecs] = useState(false);

  // Toggle view of master prompt
  const [showMasterPrompt, setShowMasterPrompt] = useState(false);

  // Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setLocalName(productData.name || '');
      setLocalColor(productData.variantColor || '');
      setLocalFabric(productData.fabric || '');
      setLocalFit(productData.fit || '');
      setLocalDesc(productData.description || '');
      setActiveDescIndex(0);
      setShowMasterPrompt(false);
    }
  }, [visible, productData]);

  // Compute merged data
  const currentMergedData: ProductAiInput = {
    ...productData,
    name: localName || productData.name,
    variantColor: localColor || productData.variantColor,
    fabric: localFabric || productData.fabric,
    fit: localFit || productData.fit,
    description: localDesc || productData.description,
  };

  const isMissingInfo =
    !currentMergedData.fabric ||
    currentMergedData.fabric.trim().length < 3 ||
    !currentMergedData.fit ||
    currentMergedData.fit.trim().length < 3 ||
    !currentMergedData.name ||
    currentMergedData.name.trim().length < 3;

  const { items: descItems, masterAiPrompt } = generateDescriptions(currentMergedData);
  const activeItem: AiDescriptionItem = descItems[activeDescIndex] || descItems[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2200);
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
    showToast('Product specifications updated!');
  };

  const handleCopyText = async (text: string) => {
    const res = await copyOrShareText(text, 'JB51 Product Description');
    if (res.success) {
      showToast(res.message || 'Description copied to clipboard!');
    }
  };

  const handleCopyPrompt = async () => {
    const res = await copyOrShareText(masterAiPrompt, 'JB51 Luxury Copywriting AI Prompt');
    if (res.success) {
      showToast('AI prompt copied for ChatGPT / Claude!');
    }
  };

  const handleApplyDescription = (text: string) => {
    onSelectDescription(text);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalShell} edges={['top', 'bottom', 'left', 'right']}>
        {/* Header */}
        <View style={styles.modalHeader}>
          <View style={styles.headerLeft}>
            <Text style={styles.modalTitle}>Editorial Narration Studio</Text>
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>100+ WORDS</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeHeaderBtn} activeOpacity={0.7}>
            <X size={20} color="#09090b" />
          </TouchableOpacity>
        </View>

        {/* Toast */}
        {toastMessage && (
          <View style={styles.toastBanner}>
            <Check size={14} color="#ffffff" />
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        )}

        {/* Tab Pills Bar */}
        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
            {descItems.map((item, idx) => {
              const isSelected = idx === activeDescIndex;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.tabPill, isSelected && styles.activeTabPill]}
                  onPress={() => setActiveDescIndex(idx)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.tabPillText, isSelected && styles.activeTabPillText]}>
                    {idx + 1}. {item.title}
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
            applyButtonLabel="Apply Details & Generate Descriptions"
            currentData={currentMergedData}
          />

          {/* Active Description Card */}
          {activeItem && <AiDescriptionCard item={activeItem} />}

          {/* Master Prompt Accordion */}
          {activeItem && (
            <View style={styles.sectionCard}>
              <TouchableOpacity
                style={styles.promptToggleBtn}
                onPress={() => setShowMasterPrompt(prev => !prev)}
                activeOpacity={0.7}
              >
                <Text style={styles.promptToggleBtnText}>
                  {showMasterPrompt ? 'Hide Copywriting AI Prompt' : 'View Master Copywriting Prompt for External AI'}
                </Text>
                {showMasterPrompt ? (
                  <ChevronUp size={14} color="#64748b" />
                ) : (
                  <ChevronDown size={14} color="#64748b" />
                )}
              </TouchableOpacity>

              {showMasterPrompt && (
                <View style={styles.promptContainer}>
                  <Text style={styles.promptTextMonospace} selectable={true}>
                    {masterAiPrompt}
                  </Text>
                  <TouchableOpacity
                    style={styles.copyPromptBtn}
                    onPress={handleCopyPrompt}
                    activeOpacity={0.8}
                  >
                    <Copy size={12} color="#f8fafc" />
                    <Text style={styles.copyPromptBtnText}>Copy AI Prompt for ChatGPT / Claude</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {/* Persistent Bottom Action Bar */}
        {activeItem && (
          <View style={[styles.bottomActionBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <TouchableOpacity
              style={styles.copyBtnSecondary}
              onPress={() => handleCopyText(activeItem.descriptionText)}
              activeOpacity={0.7}
            >
              <Copy size={15} color="#71717a" />
              <Text style={styles.copyBtnSecondaryText}>Copy Text</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.applyBtnPrimary}
              onPress={() => handleApplyDescription(activeItem.descriptionText)}
              activeOpacity={0.8}
            >
              <Check size={16} color="#ffffff" />
              <Text style={styles.applyBtnPrimaryText}>Apply to Description</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

export default AiDescriptionModal;
