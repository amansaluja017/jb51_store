import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Image,
  useWindowDimensions,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  X,
  Save,
  RotateCw,
  Plus,
  Trash2,
  Edit2,
  Check,
  Megaphone,
  Image as ImageIcon,
  Sparkles,
  HelpCircle,
  Phone,
  Flame,
  Zap,
  Camera,
  Upload,
  Link as LinkIcon,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import type {
  MobileSiteConfigData,
  MobileHeroSlideItem,
  MobileFaqItem,
} from '../types';
import {
  fetchSiteConfig,
  saveSiteConfig,
  revalidateSiteConfig,
} from '../services/siteConfigService';
import { uploadProductImage } from '../services/api';
import { useKeyboardHeight } from '../hooks/useKeyboardHeight';
import SimpleTextEditor from './SimpleTextEditor';

export interface DeveloperSectionModalProps {
  visible: boolean;
  onClose: () => void;
  apiHost: string;
  token: string | null;
}

type TabType = 'promo' | 'hero' | 'adBanner' | 'sale' | 'faqs' | 'contact';

// ============================================================================
// REUSABLE IMAGE UPLOAD & PREVIEW COMPONENT (CLOUDINARY CDN INTEGRATION)
// ============================================================================
interface ImageUploadFieldProps {
  label: string;
  subLabel?: string;
  value: string;
  onChange: (url: string) => void;
  apiHost: string;
  token: string | null;
  aspectRatio?: number;
  placeholder?: string;
}

const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  label,
  subLabel,
  value,
  onChange,
  apiHost,
  token,
  aspectRatio = 16 / 9,
  placeholder,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlField, setShowUrlField] = useState(false);
  const [customUrl, setCustomUrl] = useState(value);

  useEffect(() => {
    setCustomUrl(value);
  }, [value]);

  const handleUploadUri = async (uri: string) => {
    try {
      setIsUploading(true);
      const res = await uploadProductImage(uri, {
        apiHost,
        token,
      });
      if (res && res.url) {
        onChange(res.url);
        setShowUrlField(false);
      } else {
        throw new Error('Upload server did not return a valid URL.');
      }
    } catch (err: any) {
      Alert.alert('Upload Failed', err?.message || 'Could not upload image to CDN.');
    } finally {
      setIsUploading(false);
    }
  };

  const handlePickFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Media library access is required to choose photos.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.85,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        await handleUploadUri(result.assets[0].uri);
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to select image.');
    }
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera permission is required to capture photos.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.85,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        await handleUploadUri(result.assets[0].uri);
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to capture photo.');
    }
  };

  return (
    <View style={uploadStyles.container}>
      <View style={uploadStyles.labelRow}>
        <Text style={uploadStyles.label}>{label}</Text>
        {subLabel && <Text style={uploadStyles.subLabel}>{subLabel}</Text>}
      </View>

      {isUploading ? (
        <View style={uploadStyles.uploadingBox}>
          <ActivityIndicator size="small" color="#FF5E36" />
          <Text style={uploadStyles.uploadingText}>Uploading to Cloudinary CDN...</Text>
        </View>
      ) : value ? (
        <View style={uploadStyles.previewCard}>
          <View style={[uploadStyles.imageWrapper, { aspectRatio }]}>
            <Image
              source={{ uri: value }}
              style={uploadStyles.previewImage}
              resizeMode="cover"
            />
            <View style={uploadStyles.cdnBadge}>
              <View style={uploadStyles.greenDot} />
              <Text style={uploadStyles.cdnBadgeText}>
                {value.includes('cloudinary') ? 'Cloudinary CDN' : 'Live Image'}
              </Text>
            </View>
          </View>

          <View style={uploadStyles.actionsRow}>
            <TouchableOpacity
              style={uploadStyles.actionBtn}
              onPress={handlePickFromGallery}
            >
              <ImageIcon size={14} color="#09090b" />
              <Text style={uploadStyles.actionBtnText}>Change Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={uploadStyles.actionBtn}
              onPress={handleTakePhoto}
            >
              <Camera size={14} color="#09090b" />
              <Text style={uploadStyles.actionBtnText}>Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[uploadStyles.actionBtn, uploadStyles.actionBtnDanger]}
              onPress={() => onChange('')}
            >
              <Trash2 size={14} color="#ef4444" />
            </TouchableOpacity>

            <TouchableOpacity
              style={uploadStyles.actionBtnIconOnly}
              onPress={() => setShowUrlField(!showUrlField)}
            >
              <LinkIcon size={14} color="#71717a" />
            </TouchableOpacity>
          </View>

          {showUrlField && (
            <View style={uploadStyles.urlEditBox}>
              <TextInput
                style={uploadStyles.urlInput}
                value={customUrl}
                onChangeText={setCustomUrl}
                placeholder="Enter direct image URL..."
                placeholderTextColor="#a1a1aa"
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={uploadStyles.urlApplyBtn}
                onPress={() => {
                  onChange(customUrl.trim());
                  setShowUrlField(false);
                }}
              >
                <Check size={14} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : (
        <View style={uploadStyles.dropzone}>
          <View style={uploadStyles.dropzoneIconCircle}>
            <Upload size={22} color="#FF5E36" />
          </View>
          <Text style={uploadStyles.dropzoneTitle}>Upload Image to CDN</Text>
          <Text style={uploadStyles.dropzoneSubtitle}>
            {placeholder || 'Choose a photo from your gallery or capture via camera'}
          </Text>

          <View style={uploadStyles.dropzoneBtnRow}>
            <TouchableOpacity
              style={uploadStyles.galleryUploadBtn}
              onPress={handlePickFromGallery}
            >
              <ImageIcon size={15} color="#fff" />
              <Text style={uploadStyles.galleryUploadBtnText}>Choose from Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={uploadStyles.cameraUploadBtn}
              onPress={handleTakePhoto}
            >
              <Camera size={15} color="#09090b" />
              <Text style={uploadStyles.cameraUploadBtnText}>Camera</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={uploadStyles.manualUrlToggle}
            onPress={() => setShowUrlField(!showUrlField)}
          >
            <LinkIcon size={12} color="#71717a" />
            <Text style={uploadStyles.manualUrlToggleText}>Or paste image URL directly</Text>
          </TouchableOpacity>

          {showUrlField && (
            <View style={[uploadStyles.urlEditBox, { marginTop: 10, width: '100%' }]}>
              <TextInput
                style={uploadStyles.urlInput}
                value={customUrl}
                onChangeText={setCustomUrl}
                placeholder="https://..."
                placeholderTextColor="#a1a1aa"
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={uploadStyles.urlApplyBtn}
                onPress={() => {
                  if (customUrl.trim()) {
                    onChange(customUrl.trim());
                    setShowUrlField(false);
                  }
                }}
              >
                <Check size={14} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

// ============================================================================
// MAIN DEVELOPER SECTION MODAL COMPONENT
// ============================================================================
export const DeveloperSectionModal: React.FC<DeveloperSectionModalProps> = ({
  visible,
  onClose,
  apiHost,
  token,
}) => {
  const { width: windowWidth } = useWindowDimensions();
  const isTablet = windowWidth >= 640;
  const isSmallPhone = windowWidth < 380;
  const keyboardHeight = useKeyboardHeight();
  const isKeyboardVisible = keyboardHeight > 0;
  const scrollRef = useRef<ScrollView>(null);

  const [activeTab, setActiveTab] = useState<TabType>('promo');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [revalidating, setRevalidating] = useState(false);
  const [config, setConfig] = useState<MobileSiteConfigData | null>(null);
  const [initialConfig, setInitialConfig] = useState<MobileSiteConfigData | null>(null);

  // Sub-state for editing/adding promotional message
  const [newPromoText, setNewPromoText] = useState('');

  // Sub-state for FAQ editing/adding
  const [newFaqQ, setNewFaqQ] = useState('');
  const [newFaqA, setNewFaqA] = useState('');
  const [editingFaqIndex, setEditingFaqIndex] = useState<number | null>(null);

  // Sub-state for Hero slide editing/adding
  const [editingSlideIndex, setEditingSlideIndex] = useState<number | null>(null);
  const [slideImage, setSlideImage] = useState('');
  const [slideTagline, setSlideTagline] = useState('');
  const [slideTitle, setSlideTitle] = useState('');
  const [slideSubtitle, setSlideSubtitle] = useState('');
  const [slideBadgeName, setSlideBadgeName] = useState('');
  const [slideBadgePrice, setSlideBadgePrice] = useState('');
  const [slideBadgeImg, setSlideBadgeImg] = useState('');
  const [slideBadgeSlug, setSlideBadgeSlug] = useState('');

  // Local state for flash sale timer inputs
  const [timerHours, setTimerHours] = useState('14');
  const [timerMinutes, setTimerMinutes] = useState('45');
  const [timerSeconds, setTimerSeconds] = useState('30');

  const loadConfig = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchSiteConfig(apiHost, token);
      if (data && data.saleSection) {
        if (data.saleSection.endTime) {
          const diffMs = new Date(data.saleSection.endTime).getTime() - Date.now();
          if (diffMs > 0) {
            data.saleSection.hoursLeft = Math.floor(diffMs / 3600000);
            data.saleSection.minutesLeft = Math.floor((diffMs % 3600000) / 60000);
            data.saleSection.secondsLeft = Math.floor((diffMs % 60000) / 1000);
          } else {
            data.saleSection.hoursLeft = 0;
            data.saleSection.minutesLeft = 0;
            data.saleSection.secondsLeft = 0;
          }
        } else {
          data.saleSection.minutesLeft = data.saleSection.minutesLeft || 0;
          data.saleSection.secondsLeft = data.saleSection.secondsLeft || 0;
        }
        setTimerHours(String(data.saleSection.hoursLeft ?? 0));
        setTimerMinutes(String(data.saleSection.minutesLeft ?? 0));
        setTimerSeconds(String(data.saleSection.secondsLeft ?? 0));
      }
      setConfig(data);
      setInitialConfig(JSON.parse(JSON.stringify(data)));
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to load website configuration.');
    } finally {
      setLoading(false);
    }
  }, [apiHost, token]);

  useEffect(() => {
    if (visible) {
      loadConfig();
    }
  }, [visible, loadConfig]);

  const getSectionPayload = (tab: TabType, currentConfig: MobileSiteConfigData): Partial<MobileSiteConfigData> => {
    switch (tab) {
      case 'promo':
        return { promotionalHeader: currentConfig.promotionalHeader };
      case 'hero':
        return { heroSlides: currentConfig.heroSlides };
      case 'adBanner':
        return { adBanner: currentConfig.adBanner };
      case 'sale': {
        const h = parseInt(timerHours, 10) || 0;
        const m = parseInt(timerMinutes, 10) || 0;
        const s = parseInt(timerSeconds, 10) || 0;
        const totalSecs = (h * 3600) + (m * 60) + s;
        const computedEndTime = totalSecs > 0 ? new Date(Date.now() + totalSecs * 1000).toISOString() : '';
        return {
          saleSection: {
            ...currentConfig.saleSection,
            hoursLeft: h,
            minutesLeft: m,
            secondsLeft: s,
            endTime: computedEndTime,
          },
        };
      }
      case 'faqs':
        return { faqs: currentConfig.faqs };
      case 'contact':
        return { contactInfo: currentConfig.contactInfo };
    }
  };

  const getTabTitle = (tab: TabType): string => {
    switch (tab) {
      case 'promo': return 'Promo Header';
      case 'hero': return 'Hero Slider';
      case 'adBanner': return 'Ad Banner';
      case 'sale': return 'Flash Sale';
      case 'faqs': return 'FAQs';
      case 'contact': return 'Contact Info';
    }
  };

  const getChangedPayload = (): Partial<MobileSiteConfigData> => {
    if (!config) return {};
    if (!initialConfig) return getSectionPayload(activeTab, config);

    const payload: Partial<MobileSiteConfigData> = {};
    if (JSON.stringify(config.promotionalHeader) !== JSON.stringify(initialConfig.promotionalHeader)) {
      payload.promotionalHeader = config.promotionalHeader;
    }
    if (JSON.stringify(config.heroSlides) !== JSON.stringify(initialConfig.heroSlides)) {
      payload.heroSlides = config.heroSlides;
    }
    if (JSON.stringify(config.adBanner) !== JSON.stringify(initialConfig.adBanner)) {
      payload.adBanner = config.adBanner;
    }
    if (
      JSON.stringify(config.saleSection) !== JSON.stringify(initialConfig.saleSection) ||
      (parseInt(timerHours, 10) || 0) !== (initialConfig.saleSection?.hoursLeft ?? 0) ||
      (parseInt(timerMinutes, 10) || 0) !== (initialConfig.saleSection?.minutesLeft ?? 0) ||
      (parseInt(timerSeconds, 10) || 0) !== (initialConfig.saleSection?.secondsLeft ?? 0)
    ) {
      const h = parseInt(timerHours, 10) || 0;
      const m = parseInt(timerMinutes, 10) || 0;
      const s = parseInt(timerSeconds, 10) || 0;
      const totalSecs = (h * 3600) + (m * 60) + s;
      const computedEndTime = totalSecs > 0 ? new Date(Date.now() + totalSecs * 1000).toISOString() : '';
      payload.saleSection = {
        ...config.saleSection,
        hoursLeft: h,
        minutesLeft: m,
        secondsLeft: s,
        endTime: computedEndTime,
      };
    }
    if (JSON.stringify(config.faqs) !== JSON.stringify(initialConfig.faqs)) {
      payload.faqs = config.faqs;
    }
    if (JSON.stringify(config.contactInfo) !== JSON.stringify(initialConfig.contactInfo)) {
      payload.contactInfo = config.contactInfo;
    }
    return payload;
  };

  const handleSave = async (onlyCurrentSection = true) => {
    if (!config) return;

    let payloadToSave: Partial<MobileSiteConfigData> = {};

    if (onlyCurrentSection) {
      payloadToSave = getSectionPayload(activeTab, config);
    } else {
      payloadToSave = getChangedPayload();
      if (Object.keys(payloadToSave).length === 0) {
        payloadToSave = getSectionPayload(activeTab, config);
      }
    }

    const changedKeys = Object.keys(payloadToSave);
    if (changedKeys.length === 0) {
      Alert.alert('No Changes', 'No modifications were detected to update.');
      return;
    }

    try {
      setSaving(true);
      console.log('[DeveloperSectionModal] Updating only modified section(s):', changedKeys);
      const res = await saveSiteConfig(apiHost, token, payloadToSave);
      if (res.success) {
        const updated = res.data;
        if (updated && updated.saleSection) {
          let h = 0;
          let m = 0;
          let s = 0;
          if (updated.saleSection.endTime) {
            const diffMs = new Date(updated.saleSection.endTime).getTime() - Date.now();
            if (diffMs > 0) {
              h = Math.floor(diffMs / 3600000);
              m = Math.floor((diffMs % 3600000) / 60000);
              s = Math.floor((diffMs % 60000) / 1000);
            }
          } else {
            h = updated.saleSection.hoursLeft || 0;
            m = updated.saleSection.minutesLeft || 0;
            s = updated.saleSection.secondsLeft || 0;
          }
          updated.saleSection.hoursLeft = h;
          updated.saleSection.minutesLeft = m;
          updated.saleSection.secondsLeft = s;
          setTimerHours(String(h));
          setTimerMinutes(String(m));
          setTimerSeconds(String(s));
        }
        setConfig(updated);
        setInitialConfig(JSON.parse(JSON.stringify(updated)));
        Alert.alert(
          'Saved & Published',
          `Updated [${changedKeys.join(', ')}] on web! Next.js cache has been automatically revalidated.`
        );
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to save configuration.');
    } finally {
      setSaving(false);
    }
  };

  const handlePurgeCache = async () => {
    try {
      setRevalidating(true);
      const res = await revalidateSiteConfig(apiHost, token);
      if (res.success) {
        const tag = res.tag || 'site-config';
        Alert.alert('Cache Invalidation', `Tag "${tag}" revalidated on web! Next page view will serve fresh data.`);
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to trigger web cache revalidation.');
    } finally {
      setRevalidating(false);
    }
  };

  // ---------------- PROMOTIONAL HEADER HELPERS ----------------
  const addPromoMessage = () => {
    if (!newPromoText.trim() || !config) return;
    setConfig({
      ...config,
      promotionalHeader: [...config.promotionalHeader, newPromoText.trim()],
    });
    setNewPromoText('');
  };

  const removePromoMessage = (idx: number) => {
    if (!config) return;
    const updated = config.promotionalHeader.filter((_, i) => i !== idx);
    setConfig({ ...config, promotionalHeader: updated });
  };

  // ---------------- HERO SLIDES HELPERS ----------------
  const startAddSlide = () => {
    setEditingSlideIndex(-1);
    setSlideImage('');
    setSlideTagline('NEW COLLECTION');
    setSlideTitle('');
    setSlideSubtitle('');
    setSlideBadgeName('');
    setSlideBadgePrice('');
    setSlideBadgeImg('');
    setSlideBadgeSlug('');
  };

  const startEditSlide = (idx: number) => {
    if (!config || !config.heroSlides[idx]) return;
    const s = config.heroSlides[idx];
    setEditingSlideIndex(idx);
    setSlideImage(s.image || '');
    setSlideTagline(s.tagline || '');
    setSlideTitle(s.title || '');
    setSlideSubtitle(s.subtitle || '');
    setSlideBadgeName(s.badgeProduct?.name || '');
    setSlideBadgePrice(s.badgeProduct?.price ? String(s.badgeProduct.price) : '');
    setSlideBadgeImg(s.badgeProduct?.img || '');
    setSlideBadgeSlug(s.badgeProduct?.slug || '');
  };

  const saveSlide = () => {
    if (!config || !slideTitle.trim() || !slideImage.trim()) {
      Alert.alert('Required', 'Please provide at least a title and an image for the slide.');
      return;
    }

    const slideObj: MobileHeroSlideItem = {
      image: slideImage.trim(),
      tagline: slideTagline.trim(),
      title: slideTitle.trim(),
      subtitle: slideSubtitle.trim(),
      badgeProduct: slideBadgeName.trim()
        ? {
            name: slideBadgeName.trim(),
            price: Number(slideBadgePrice) || 0,
            img: slideBadgeImg.trim() || slideImage.trim(),
            slug: slideBadgeSlug.trim(),
          }
        : undefined,
    };

    let updatedSlides = [...config.heroSlides];
    if (editingSlideIndex === -1) {
      updatedSlides.push(slideObj);
    } else if (editingSlideIndex !== null && editingSlideIndex >= 0) {
      updatedSlides[editingSlideIndex] = slideObj;
    }

    setConfig({ ...config, heroSlides: updatedSlides });
    setEditingSlideIndex(null);
  };

  const removeSlide = (idx: number) => {
    if (!config) return;
    const updated = config.heroSlides.filter((_, i) => i !== idx);
    setConfig({ ...config, heroSlides: updated });
  };

  // ---------------- FAQ HELPERS ----------------
  const startAddFaq = () => {
    setEditingFaqIndex(-1);
    setNewFaqQ('');
    setNewFaqA('');
  };

  const startEditFaq = (idx: number) => {
    if (!config || !config.faqs[idx]) return;
    setEditingFaqIndex(idx);
    setNewFaqQ(config.faqs[idx].q);
    setNewFaqA(config.faqs[idx].a);
  };

  const saveFaq = () => {
    if (!config || !newFaqQ.trim() || !newFaqA.trim()) {
      Alert.alert('Required', 'Both Question and Answer are required.');
      return;
    }

    let updatedFaqs = [...config.faqs];
    if (editingFaqIndex === -1) {
      updatedFaqs.push({ q: newFaqQ.trim(), a: newFaqA.trim() });
    } else if (editingFaqIndex !== null && editingFaqIndex >= 0) {
      updatedFaqs[editingFaqIndex] = { q: newFaqQ.trim(), a: newFaqA.trim() };
    }

    setConfig({ ...config, faqs: updatedFaqs });
    setEditingFaqIndex(null);
    setNewFaqQ('');
    setNewFaqA('');
  };

  const removeFaq = (idx: number) => {
    if (!config) return;
    const updated = config.faqs.filter((_, i) => i !== idx);
    setConfig({ ...config, faqs: updated });
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        {/* Fixed Top Header */}
        <View style={styles.header}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <View style={styles.badgeRow}>
              <View style={styles.badge}>
                <Zap size={10} color="#FF5E36" />
                <Text style={styles.badgeText}>DEVELOPER SECTION</Text>
              </View>
            </View>
            <Text style={styles.title} numberOfLines={1}>Web UI Customizer</Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              Edit banners, CDN images, promotional text & live cache
            </Text>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.revalidateBtn}
              onPress={handlePurgeCache}
              disabled={revalidating}
            >
              {revalidating ? (
                <ActivityIndicator size="small" color="#FF5E36" />
              ) : (
                <RotateCw size={14} color="#FF5E36" />
              )}
              <Text style={styles.revalidateText}>Purge</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color="#52525b" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Fixed Horizontal Navigation Tabs */}
        <View style={styles.tabsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsScroll}
          >
            <TouchableOpacity
              style={[styles.tab, activeTab === 'promo' && styles.activeTab]}
              onPress={() => setActiveTab('promo')}
            >
              <Megaphone size={13} color={activeTab === 'promo' ? '#FF5E36' : '#71717a'} />
              <Text style={[styles.tabText, activeTab === 'promo' && styles.activeTabText]}>
                Promo Bar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'hero' && styles.activeTab]}
              onPress={() => setActiveTab('hero')}
            >
              <ImageIcon size={13} color={activeTab === 'hero' ? '#FF5E36' : '#71717a'} />
              <Text style={[styles.tabText, activeTab === 'hero' && styles.activeTabText]}>
                Hero Slider
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'adBanner' && styles.activeTab]}
              onPress={() => setActiveTab('adBanner')}
            >
              <Sparkles size={13} color={activeTab === 'adBanner' ? '#FF5E36' : '#71717a'} />
              <Text style={[styles.tabText, activeTab === 'adBanner' && styles.activeTabText]}>
                Ad Banner
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'sale' && styles.activeTab]}
              onPress={() => setActiveTab('sale')}
            >
              <Flame size={13} color={activeTab === 'sale' ? '#FF5E36' : '#71717a'} />
              <Text style={[styles.tabText, activeTab === 'sale' && styles.activeTabText]}>
                Flash Sale
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'faqs' && styles.activeTab]}
              onPress={() => setActiveTab('faqs')}
            >
              <HelpCircle size={13} color={activeTab === 'faqs' ? '#FF5E36' : '#71717a'} />
              <Text style={[styles.tabText, activeTab === 'faqs' && styles.activeTabText]}>
                FAQs
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'contact' && styles.activeTab]}
              onPress={() => setActiveTab('contact')}
            >
              <Phone size={13} color={activeTab === 'contact' ? '#FF5E36' : '#71717a'} />
              <Text style={[styles.tabText, activeTab === 'contact' && styles.activeTabText]}>
                Contact Info
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Scrollable Form Content inside dedicated KeyboardAvoiding Container */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardContainer}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF5E36" />
              <Text style={styles.loadingText}>Loading site configuration...</Text>
            </View>
          ) : !config ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.errorText}>No configuration available.</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={loadConfig}>
                <Text style={styles.retryBtnText}>Retry Loading</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView
              ref={scrollRef}
              style={styles.contentScroll}
              contentContainerStyle={[
                styles.contentContainer,
                isTablet && { maxWidth: 740, alignSelf: 'center', width: '100%' },
                { paddingBottom: isKeyboardVisible ? 140 : 100 },
              ]}
              automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              showsVerticalScrollIndicator={false}
            >
              {/* TAB 1: PROMO HEADER */}
              {activeTab === 'promo' && (
                <View style={styles.sectionCard}>
                  <Text style={styles.sectionTitle}>Promotional Announcement Header</Text>
                  <Text style={styles.sectionDesc}>
                    Rotated in the top dark announcement bar across all web pages.
                  </Text>

                  {config.promotionalHeader.map((msg, idx) => (
                    <View key={idx} style={styles.itemRow}>
                      <View style={styles.itemNumber}>
                        <Text style={styles.itemNumberText}>{idx + 1}</Text>
                      </View>
                      <TextInput
                        style={styles.itemInput}
                        value={msg}
                        onChangeText={(txt) => {
                          const updated = [...config.promotionalHeader];
                          updated[idx] = txt;
                          setConfig({ ...config, promotionalHeader: updated });
                        }}
                      />
                      <TouchableOpacity
                        onPress={() => removePromoMessage(idx)}
                        style={styles.deleteIconBtn}
                      >
                        <Trash2 size={16} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  ))}

                  <View style={styles.addRow}>
                    <TextInput
                      style={[styles.itemInput, { flex: 1 }]}
                      placeholder="Add new announcement message..."
                      placeholderTextColor="#a1a1aa"
                      value={newPromoText}
                      onChangeText={setNewPromoText}
                    />
                    <TouchableOpacity style={styles.addBtn} onPress={addPromoMessage}>
                      <Plus size={15} color="#fff" />
                      <Text style={styles.addBtnText}>Add</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* TAB 2: HERO SLIDER */}
              {activeTab === 'hero' && (
                <View>
                  {editingSlideIndex !== null ? (
                    <View style={styles.sectionCard}>
                      <View style={styles.cardHeaderRow}>
                        <Text style={styles.sectionTitle}>
                          {editingSlideIndex === -1 ? 'Add New Hero Slide' : `Edit Slide #${editingSlideIndex + 1}`}
                        </Text>
                        <TouchableOpacity onPress={() => setEditingSlideIndex(null)}>
                          <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                      </View>

                      {/* CDN IMAGE UPLOAD FIELD FOR HERO SLIDE */}
                      <ImageUploadField
                        label="Hero Slide Background Image"
                        subLabel="High-resolution landscape (16:9 or editorial format)"
                        value={slideImage}
                        onChange={setSlideImage}
                        apiHost={apiHost}
                        token={token}
                        aspectRatio={16 / 9}
                        placeholder="Upload hero background photo to Cloudinary"
                      />

                      <Text style={styles.inputLabel}>Tagline</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="e.g. NEW COLLECTION"
                        placeholderTextColor="#a1a1aa"
                        value={slideTagline}
                        onChangeText={setSlideTagline}
                      />

                      <Text style={styles.inputLabel}>Title / Headline</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="e.g. Elevate Your Everyday Style"
                        placeholderTextColor="#a1a1aa"
                        value={slideTitle}
                        onChangeText={setSlideTitle}
                      />

                      {/* RICH TEXT EDITOR FOR HERO SUBTITLE */}
                      <View style={{ marginTop: 10 }}>
                        <SimpleTextEditor
                          label="Slide Description / Editorial Narrative"
                          value={slideSubtitle}
                          onChangeText={setSlideSubtitle}
                          placeholder="e.g. Discover timeless silhouettes crafted for comfort, designed for elegance..."
                          multiline
                          numberOfLines={3}
                          sectionType="hero"
                        />
                      </View>

                      <Text style={[styles.inputLabel, { marginTop: 14, fontWeight: '800' }]}>
                        Floating Badge Outfit (Optional)
                      </Text>

                      <View style={[styles.gridRow, isSmallPhone && styles.gridRowColumn]}>
                        <View style={{ flex: 1, marginRight: isSmallPhone ? 0 : 8, marginBottom: isSmallPhone ? 8 : 0 }}>
                          <Text style={styles.inputSubLabel}>Product Name</Text>
                          <TextInput
                            style={styles.input}
                            placeholder="Ivory Silk Co-ord"
                            placeholderTextColor="#a1a1aa"
                            value={slideBadgeName}
                            onChangeText={setSlideBadgeName}
                          />
                        </View>
                        <View style={{ width: isSmallPhone ? '100%' : 110 }}>
                          <Text style={styles.inputSubLabel}>Price (₹)</Text>
                          <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            placeholder="16800"
                            placeholderTextColor="#a1a1aa"
                            value={slideBadgePrice}
                            onChangeText={setSlideBadgePrice}
                          />
                        </View>
                      </View>

                      <View style={[styles.gridRow, isSmallPhone && styles.gridRowColumn]}>
                        <View style={{ flex: 1, marginRight: isSmallPhone ? 0 : 8, marginBottom: isSmallPhone ? 8 : 0 }}>
                          <Text style={styles.inputSubLabel}>Product Slug</Text>
                          <TextInput
                            style={styles.input}
                            placeholder="ivory-chanderi-silk-coord"
                            placeholderTextColor="#a1a1aa"
                            value={slideBadgeSlug}
                            onChangeText={setSlideBadgeSlug}
                          />
                        </View>
                      </View>

                      {/* CDN IMAGE UPLOAD FIELD FOR OUTFIT THUMBNAIL */}
                      <ImageUploadField
                        label="Outfit Badge Thumbnail"
                        subLabel="Square thumbnail (1:1 ratio)"
                        value={slideBadgeImg}
                        onChange={setSlideBadgeImg}
                        apiHost={apiHost}
                        token={token}
                        aspectRatio={1}
                        placeholder="Upload outfit thumbnail to CDN"
                      />

                      <TouchableOpacity style={styles.saveBtn} onPress={saveSlide}>
                        <Check size={16} color="#fff" />
                        <Text style={styles.saveBtnText}>Done with Slide</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.sectionCard}>
                      <View style={styles.cardHeaderRow}>
                        <Text style={styles.sectionTitle}>Hero Section Slides</Text>
                        <TouchableOpacity style={styles.smallAddBtn} onPress={startAddSlide}>
                          <Plus size={14} color="#fff" />
                          <Text style={styles.smallAddBtnText}>Add Slide</Text>
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.sectionDesc}>
                        The full-screen rotating slider displayed at the very top of the homepage.
                      </Text>

                      {config.heroSlides.map((slide, idx) => (
                        <View key={idx} style={styles.slideCard}>
                          {slide.image ? (
                            <Image
                              source={{ uri: slide.image }}
                              style={styles.slideThumbnail}
                              resizeMode="cover"
                            />
                          ) : (
                            <View style={[styles.slideThumbnail, styles.placeholderThumbnail]}>
                              <ImageIcon size={18} color="#a1a1aa" />
                            </View>
                          )}
                          <View style={styles.slideInfo}>
                            <View style={styles.slideBadgeRow}>
                              <Text style={styles.slideIdxText}>Slide #{idx + 1}</Text>
                              <Text style={styles.slideTaglineText} numberOfLines={1}>{slide.tagline}</Text>
                            </View>
                            <Text style={styles.slideTitleText} numberOfLines={1}>{slide.title}</Text>
                            {slide.badgeProduct?.name && (
                              <Text style={styles.slideOutfitText} numberOfLines={1}>
                                Outfit: {slide.badgeProduct.name}
                              </Text>
                            )}
                          </View>
                          <View style={styles.slideActions}>
                            <TouchableOpacity
                              style={styles.actionBtn}
                              onPress={() => startEditSlide(idx)}
                            >
                              <Edit2 size={14} color="#09090b" />
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.actionBtn}
                              onPress={() => removeSlide(idx)}
                            >
                              <Trash2 size={14} color="#ef4444" />
                            </TouchableOpacity>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              )}

              {/* TAB 3: ADVERTISEMENT BANNER */}
              {activeTab === 'adBanner' && (
                <View style={styles.sectionCard}>
                  <Text style={styles.sectionTitle}>Advertisement Banner</Text>
                  <Text style={styles.sectionDesc}>
                    Dark-themed bespoke couture editorial showcase on the homepage.
                  </Text>

                  {/* CDN IMAGE UPLOAD FIELD FOR AD BANNER */}
                  <ImageUploadField
                    label="Advertisement Banner Image"
                    subLabel="High-impact editorial image uploaded to Cloudinary"
                    value={config.adBanner.imageUrl}
                    onChange={(url) =>
                      setConfig({ ...config, adBanner: { ...config.adBanner, imageUrl: url } })
                    }
                    apiHost={apiHost}
                    token={token}
                    aspectRatio={16 / 10}
                    placeholder="Choose banner image from device gallery"
                  />

                  <Text style={styles.inputLabel}>Tagline</Text>
                  <TextInput
                    style={styles.input}
                    value={config.adBanner.tagline}
                    onChangeText={(txt) =>
                      setConfig({ ...config, adBanner: { ...config.adBanner, tagline: txt } })
                    }
                  />

                  <Text style={styles.inputLabel}>Title / Headline</Text>
                  <TextInput
                    style={styles.input}
                    value={config.adBanner.title}
                    onChangeText={(txt) =>
                      setConfig({ ...config, adBanner: { ...config.adBanner, title: txt } })
                    }
                  />

                  {/* RICH TEXT EDITOR FOR AD BANNER DESCRIPTION */}
                  <View style={{ marginTop: 10 }}>
                    <SimpleTextEditor
                      label="Banner Description / Story Narrative"
                      value={config.adBanner.subtitle}
                      onChangeText={(txt) =>
                        setConfig({ ...config, adBanner: { ...config.adBanner, subtitle: txt } })
                      }
                      placeholder="Experience the pinnacle of bespoke couture. Our master craftsmen tailor each ensemble..."
                      multiline
                      numberOfLines={4}
                      sectionType="adBanner"
                    />
                  </View>

                  <View style={[styles.gridRow, isSmallPhone && styles.gridRowColumn]}>
                    <View style={{ flex: 1, marginRight: isSmallPhone ? 0 : 8, marginBottom: isSmallPhone ? 8 : 0 }}>
                      <Text style={styles.inputSubLabel}>Primary Button Text</Text>
                      <TextInput
                        style={styles.input}
                        value={config.adBanner.buttonText}
                        onChangeText={(txt) =>
                          setConfig({
                            ...config,
                            adBanner: { ...config.adBanner, buttonText: txt },
                          })
                        }
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputSubLabel}>Primary Button Link</Text>
                      <TextInput
                        style={styles.input}
                        value={config.adBanner.buttonLink}
                        onChangeText={(txt) =>
                          setConfig({
                            ...config,
                            adBanner: { ...config.adBanner, buttonLink: txt },
                          })
                        }
                      />
                    </View>
                  </View>

                  <View style={[styles.gridRow, isSmallPhone && styles.gridRowColumn]}>
                    <View style={{ flex: 1, marginRight: isSmallPhone ? 0 : 8, marginBottom: isSmallPhone ? 8 : 0 }}>
                      <Text style={styles.inputSubLabel}>Secondary Button Text</Text>
                      <TextInput
                        style={styles.input}
                        value={config.adBanner.secondaryButtonText || ''}
                        onChangeText={(txt) =>
                          setConfig({
                            ...config,
                            adBanner: { ...config.adBanner, secondaryButtonText: txt },
                          })
                        }
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputSubLabel}>Secondary Button Link</Text>
                      <TextInput
                        style={styles.input}
                        value={config.adBanner.secondaryButtonLink || ''}
                        onChangeText={(txt) =>
                          setConfig({
                            ...config,
                            adBanner: { ...config.adBanner, secondaryButtonLink: txt },
                          })
                        }
                      />
                    </View>
                  </View>
                </View>
              )}

              {/* TAB 4: FLASH SALE */}
              {activeTab === 'sale' && (
                <View style={styles.sectionCard}>
                  <View style={styles.cardHeaderRow}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={styles.sectionTitle}>Flash Sale Banner</Text>
                      <Text style={styles.sectionDesc}>
                        Interactive countdown discount section on the web homepage.
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.toggleBtn,
                        config.saleSection.enabled ? styles.toggleOn : styles.toggleOff,
                      ]}
                      onPress={() =>
                        setConfig({
                          ...config,
                          saleSection: {
                            ...config.saleSection,
                            enabled: !config.saleSection.enabled,
                          },
                        })
                      }
                    >
                      <Text
                        style={[
                          styles.toggleText,
                          config.saleSection.enabled ? styles.toggleTextOn : styles.toggleTextOff,
                        ]}
                      >
                        {config.saleSection.enabled ? 'ACTIVE' : 'DISABLED'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* CDN IMAGE UPLOAD FIELD FOR FLASH SALE BACKGROUND */}
                  <ImageUploadField
                    label="Flash Sale Background Image (Optional)"
                    subLabel="High-res background graphic overlay"
                    value={config.saleSection.bannerImageUrl || ''}
                    onChange={(url) =>
                      setConfig({
                        ...config,
                        saleSection: { ...config.saleSection, bannerImageUrl: url },
                      })
                    }
                    apiHost={apiHost}
                    token={token}
                    aspectRatio={16 / 9}
                    placeholder="Choose flash sale background from device"
                  />

                  {/* Real-time Status Banner */}
                  <View
                    style={[
                      styles.timerStatusBanner,
                      !config.saleSection.enabled
                        ? styles.timerStatusDisabled
                        : ((parseInt(timerHours, 10) || 0) + (parseInt(timerMinutes, 10) || 0) + (parseInt(timerSeconds, 10) || 0) > 0)
                        ? styles.timerStatusActive
                        : styles.timerStatusExpired,
                    ]}
                  >
                    <View
                      style={[
                        styles.timerStatusDot,
                        !config.saleSection.enabled
                          ? { backgroundColor: '#71717a' }
                          : ((parseInt(timerHours, 10) || 0) + (parseInt(timerMinutes, 10) || 0) + (parseInt(timerSeconds, 10) || 0) > 0)
                          ? { backgroundColor: '#10b981' }
                          : { backgroundColor: '#ef4444' },
                      ]}
                    />
                    <Text style={styles.timerStatusText}>
                      {!config.saleSection.enabled
                        ? 'Status: DISABLED (Offer removed from website)'
                        : ((parseInt(timerHours, 10) || 0) + (parseInt(timerMinutes, 10) || 0) + (parseInt(timerSeconds, 10) || 0) > 0)
                        ? `Live Offer Active • ${timerHours || '0'}h ${timerMinutes || '0'}m ${timerSeconds || '0'}s remaining`
                        : 'Offer Status: TIME COMPLETED (Automatically removed from website)'}
                    </Text>
                  </View>

                  <Text style={[styles.inputLabel, { marginTop: 12 }]}>Discount Percentage (%)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    placeholder="70"
                    placeholderTextColor="#a1a1aa"
                    value={
                      config.saleSection.discountPercentage !== undefined
                        ? String(config.saleSection.discountPercentage)
                        : ''
                    }
                    onChangeText={(txt) =>
                      setConfig({
                        ...config,
                        saleSection: {
                          ...config.saleSection,
                          discountPercentage: Number(txt) || 0,
                        },
                      })
                    }
                  />

                  {/* FULL TIMER CONTROLS: HOURS, MINUTES, SECONDS */}
                  <Text style={[styles.inputLabel, { marginTop: 12 }]}>
                    Full Countdown Timer Duration
                  </Text>
                  <View style={styles.timerRow}>
                    <View style={styles.timerInputCol}>
                      <Text style={styles.timerSubLabel}>Hours</Text>
                      <TextInput
                        style={styles.timerInput}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor="#a1a1aa"
                        value={timerHours}
                        onChangeText={(txt) => {
                          const clean = txt.replace(/[^0-9]/g, '');
                          setTimerHours(clean);
                          const val = parseInt(clean, 10) || 0;
                          setConfig((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  saleSection: {
                                    ...prev.saleSection,
                                    hoursLeft: val,
                                  },
                                }
                              : null
                          );
                        }}
                      />
                    </View>

                    <Text style={styles.timerColon}>:</Text>

                    <View style={styles.timerInputCol}>
                      <Text style={styles.timerSubLabel}>Minutes</Text>
                      <TextInput
                        style={styles.timerInput}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor="#a1a1aa"
                        value={timerMinutes}
                        onChangeText={(txt) => {
                          const clean = txt.replace(/[^0-9]/g, '');
                          const num = Math.min(59, parseInt(clean, 10) || 0);
                          const finalTxt = clean === '' ? '' : String(num);
                          setTimerMinutes(finalTxt);
                          setConfig((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  saleSection: {
                                    ...prev.saleSection,
                                    minutesLeft: num,
                                  },
                                }
                              : null
                          );
                        }}
                      />
                    </View>

                    <Text style={styles.timerColon}>:</Text>

                    <View style={styles.timerInputCol}>
                      <Text style={styles.timerSubLabel}>Seconds</Text>
                      <TextInput
                        style={styles.timerInput}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor="#a1a1aa"
                        value={timerSeconds}
                        onChangeText={(txt) => {
                          const clean = txt.replace(/[^0-9]/g, '');
                          const num = Math.min(59, parseInt(clean, 10) || 0);
                          const finalTxt = clean === '' ? '' : String(num);
                          setTimerSeconds(finalTxt);
                          setConfig((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  saleSection: {
                                    ...prev.saleSection,
                                    secondsLeft: num,
                                  },
                                }
                              : null
                          );
                        }}
                      />
                    </View>
                  </View>

                  {/* QUICK PRESET BUTTONS FOR HOURS/TIMER */}
                  <View style={styles.timerPresetRow}>
                    <TouchableOpacity
                      style={styles.presetChip}
                      onPress={() => {
                        const newH = (parseInt(timerHours, 10) || 0) + 1;
                        setTimerHours(String(newH));
                        setConfig((prev) =>
                          prev
                            ? {
                                ...prev,
                                saleSection: {
                                  ...prev.saleSection,
                                  hoursLeft: newH,
                                },
                              }
                            : null
                        );
                      }}
                    >
                      <Text style={styles.presetChipText}>+1 Hour</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.presetChip}
                      onPress={() => {
                        const newH = (parseInt(timerHours, 10) || 0) + 6;
                        setTimerHours(String(newH));
                        setConfig((prev) =>
                          prev
                            ? {
                                ...prev,
                                saleSection: {
                                  ...prev.saleSection,
                                  hoursLeft: newH,
                                },
                              }
                            : null
                        );
                      }}
                    >
                      <Text style={styles.presetChipText}>+6 Hours</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.presetChip}
                      onPress={() => {
                        setTimerHours('24');
                        setTimerMinutes('0');
                        setTimerSeconds('0');
                        setConfig((prev) =>
                          prev
                            ? {
                                ...prev,
                                saleSection: {
                                  ...prev.saleSection,
                                  hoursLeft: 24,
                                  minutesLeft: 0,
                                  secondsLeft: 0,
                                },
                              }
                            : null
                        );
                      }}
                    >
                      <Text style={styles.presetChipText}>24 Hours</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.presetChip, styles.presetChipReset]}
                      onPress={() => {
                        setTimerHours('0');
                        setTimerMinutes('0');
                        setTimerSeconds('0');
                        setConfig((prev) =>
                          prev
                            ? {
                                ...prev,
                                saleSection: {
                                  ...prev.saleSection,
                                  hoursLeft: 0,
                                  minutesLeft: 0,
                                  secondsLeft: 0,
                                },
                              }
                            : null
                        );
                      }}
                    >
                      <Text style={[styles.presetChipText, { color: '#ef4444' }]}>Reset</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.inputLabel}>Tagline</Text>
                  <TextInput
                    style={styles.input}
                    value={config.saleSection.tagline}
                    onChangeText={(txt) =>
                      setConfig({
                        ...config,
                        saleSection: { ...config.saleSection, tagline: txt },
                      })
                    }
                  />

                  <Text style={styles.inputLabel}>Headline Title</Text>
                  <TextInput
                    style={styles.input}
                    value={config.saleSection.title}
                    onChangeText={(txt) =>
                      setConfig({
                        ...config,
                        saleSection: { ...config.saleSection, title: txt },
                      })
                    }
                  />

                  {/* RICH TEXT EDITOR FOR FLASH SALE SUBTITLE */}
                  <View style={{ marginTop: 10 }}>
                    <SimpleTextEditor
                      label="Flash Sale Description / Promo Details"
                      value={config.saleSection.subtitle}
                      onChangeText={(txt) =>
                        setConfig({
                          ...config,
                          saleSection: { ...config.saleSection, subtitle: txt },
                        })
                      }
                      placeholder="Enjoy up to 70% off on selected traditional designs and ready-to-wear silk co-ords..."
                      multiline
                      numberOfLines={3}
                      sectionType="sale"
                    />
                  </View>

                  <View style={[styles.gridRow, isSmallPhone && styles.gridRowColumn]}>
                    <View style={{ flex: 1, marginRight: isSmallPhone ? 0 : 8, marginBottom: isSmallPhone ? 8 : 0 }}>
                      <Text style={styles.inputSubLabel}>Button Text</Text>
                      <TextInput
                        style={styles.input}
                        value={config.saleSection.buttonText || ''}
                        onChangeText={(txt) =>
                          setConfig({
                            ...config,
                            saleSection: { ...config.saleSection, buttonText: txt },
                          })
                        }
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputSubLabel}>Button Destination Link</Text>
                      <TextInput
                        style={styles.input}
                        value={config.saleSection.buttonLink || ''}
                        onChangeText={(txt) =>
                          setConfig({
                            ...config,
                            saleSection: { ...config.saleSection, buttonLink: txt },
                          })
                        }
                      />
                    </View>
                  </View>
                </View>
              )}

              {/* TAB 5: FAQS */}
              {activeTab === 'faqs' && (
                <View>
                  {editingFaqIndex !== null ? (
                    <View style={styles.sectionCard}>
                      <View style={styles.cardHeaderRow}>
                        <Text style={styles.sectionTitle}>
                          {editingFaqIndex === -1 ? 'Add New FAQ' : `Edit FAQ #${editingFaqIndex + 1}`}
                        </Text>
                        <TouchableOpacity onPress={() => setEditingFaqIndex(null)}>
                          <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                      </View>

                      <Text style={styles.inputLabel}>Question</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="e.g. How do I order a custom suit?"
                        placeholderTextColor="#a1a1aa"
                        value={newFaqQ}
                        onChangeText={setNewFaqQ}
                      />

                      {/* RICH TEXT EDITOR FOR FAQ ANSWER */}
                      <View style={{ marginTop: 10 }}>
                        <SimpleTextEditor
                          label="FAQ Concierge Answer Details"
                          value={newFaqA}
                          onChangeText={setNewFaqA}
                          placeholder="Detailed concierge answer for customers..."
                          multiline
                          numberOfLines={4}
                          sectionType="faq"
                        />
                      </View>

                      <TouchableOpacity style={styles.saveBtn} onPress={saveFaq}>
                        <Check size={16} color="#fff" />
                        <Text style={styles.saveBtnText}>Save FAQ</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.sectionCard}>
                      <View style={styles.cardHeaderRow}>
                        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
                        <TouchableOpacity style={styles.smallAddBtn} onPress={startAddFaq}>
                          <Plus size={14} color="#fff" />
                          <Text style={styles.smallAddBtnText}>Add FAQ</Text>
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.sectionDesc}>
                        Customer concierge questions rendered on the website homepage.
                      </Text>

                      {config.faqs.map((faq, idx) => (
                        <View key={idx} style={styles.faqCard}>
                          <View style={{ flex: 1, marginRight: 8 }}>
                            <Text style={styles.faqQ}>
                              Q{idx + 1}: {faq.q}
                            </Text>
                            <Text style={styles.faqA} numberOfLines={2}>
                              {faq.a}
                            </Text>
                          </View>
                          <View style={styles.slideActions}>
                            <TouchableOpacity
                              style={styles.actionBtn}
                              onPress={() => startEditFaq(idx)}
                            >
                              <Edit2 size={14} color="#09090b" />
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.actionBtn}
                              onPress={() => removeFaq(idx)}
                            >
                              <Trash2 size={14} color="#ef4444" />
                            </TouchableOpacity>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              )}

              {/* TAB 6: CONTACT INFORMATION */}
              {activeTab === 'contact' && (
                <View style={styles.sectionCard}>
                  <Text style={styles.sectionTitle}>Contact & Social Information</Text>
                  <Text style={styles.sectionDesc}>
                    Displayed in the website footer, navbar WhatsApp icon, and customer support links.
                  </Text>

                  <Text style={styles.inputLabel}>Phone Number (Display)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="+91 94160 51951"
                    placeholderTextColor="#a1a1aa"
                    value={config.contactInfo.phoneNumber}
                    onChangeText={(txt) =>
                      setConfig({
                        ...config,
                        contactInfo: { ...config.contactInfo, phoneNumber: txt },
                      })
                    }
                  />

                  <Text style={styles.inputLabel}>WhatsApp Number (Raw with country code)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="919416051951"
                    placeholderTextColor="#a1a1aa"
                    value={config.contactInfo.whatsappNumber}
                    onChangeText={(txt) =>
                      setConfig({
                        ...config,
                        contactInfo: { ...config.contactInfo, whatsappNumber: txt },
                      })
                    }
                  />

                  <Text style={styles.inputLabel}>Email Address</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholder="contact@jb51.com"
                    placeholderTextColor="#a1a1aa"
                    value={config.contactInfo.email}
                    onChangeText={(txt) =>
                      setConfig({
                        ...config,
                        contactInfo: { ...config.contactInfo, email: txt },
                      })
                    }
                  />

                  {/* RICH TEXT / MULTILINE EDITOR FOR STORE ADDRESS */}
                  <View style={{ marginTop: 10 }}>
                    <SimpleTextEditor
                      label="Physical Store Address"
                      value={config.contactInfo.address}
                      onChangeText={(txt) =>
                        setConfig({
                          ...config,
                          contactInfo: { ...config.contactInfo, address: txt },
                        })
                      }
                      placeholder="JB51 Store, Main Market, Kaithal, Haryana 136027"
                      multiline
                      numberOfLines={3}
                      sectionType="contact"
                    />
                  </View>

                  <Text style={styles.inputLabel}>Instagram Profile URL</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="https://instagram.com/jb51suits"
                    placeholderTextColor="#a1a1aa"
                    value={config.contactInfo.instagramUrl || ''}
                    onChangeText={(txt) =>
                      setConfig({
                        ...config,
                        contactInfo: { ...config.contactInfo, instagramUrl: txt },
                      })
                    }
                  />
                </View>
              )}
            </ScrollView>
          )}

          {/* Bottom Fixed Action Bar - gracefully positioned without keyboard collision */}
          {!isKeyboardVisible && (
            <View style={[styles.bottomBar, isTablet && styles.bottomBarTablet]}>
              <TouchableOpacity
                style={styles.discardBtn}
                onPress={loadConfig}
                disabled={loading || saving}
              >
                <RotateCw size={15} color="#71717a" />
                <Text style={styles.discardBtnText}>Reload</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.publishBtn, saving && { opacity: 0.7 }]}
                onPress={() => handleSave(true)}
                disabled={loading || saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Save size={16} color="#fff" />
                )}
                <Text style={styles.publishBtnText}>
                  {saving ? 'Saving...' : `Save ${getTabTitle(activeTab)}`}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Dedicated Floating Keyboard Accessory Bar when user is actively editing */}
          {isKeyboardVisible && (
            <View style={styles.keyboardAccessoryBar}>
              <View style={styles.keyboardAccessoryLeft}>
                <View style={styles.keyboardEditingDot} />
                <Text style={styles.keyboardAccessoryHint}>
                  Editing {getTabTitle(activeTab)}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.keyboardDoneBtn}
                onPress={() => Keyboard.dismiss()}
                activeOpacity={0.7}
              >
                <Text style={styles.keyboardDoneBtnText}>Done</Text>
                <Check size={13} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

// ============================================================================
// STYLES
// ============================================================================
const uploadStyles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  labelRow: {
    marginBottom: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#27272a',
  },
  subLabel: {
    fontSize: 11,
    color: '#71717a',
    marginTop: 2,
  },
  uploadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
    backgroundColor: '#fff1ee',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffddce',
  },
  uploadingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF5E36',
  },
  previewCard: {
    backgroundColor: '#fafafa',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    padding: 10,
    overflow: 'hidden',
  },
  imageWrapper: {
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#f4f4f5',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  cdnBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(9, 9, 11, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  cdnBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#09090b',
  },
  actionBtnDanger: {
    borderColor: '#fee2e2',
    backgroundColor: '#fff5f5',
  },
  actionBtnIconOnly: {
    padding: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 8,
    marginLeft: 'auto',
  },
  urlEditBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  urlInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 11,
    color: '#09090b',
  },
  urlApplyBtn: {
    backgroundColor: '#09090b',
    padding: 8,
    borderRadius: 8,
  },
  dropzone: {
    backgroundColor: '#fafafa',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#d4d4d8',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropzoneIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff1ee',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  dropzoneTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#18181b',
    marginBottom: 2,
  },
  dropzoneSubtitle: {
    fontSize: 11,
    color: '#71717a',
    textAlign: 'center',
    marginBottom: 12,
  },
  dropzoneBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  galleryUploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#09090b',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 9,
  },
  galleryUploadBtnText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  cameraUploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 9,
  },
  cameraUploadBtnText: {
    color: '#09090b',
    fontSize: 11,
    fontWeight: '700',
  },
  manualUrlToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 10,
  },
  manualUrlToggleText: {
    fontSize: 11,
    color: '#71717a',
    textDecorationLine: 'underline',
  },
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f4f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e4e4e7',
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fff1ee',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FF5E36',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#09090b',
  },
  subtitle: {
    fontSize: 11,
    color: '#71717a',
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  revalidateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#fff1ee',
    borderWidth: 1,
    borderColor: '#ffddce',
  },
  revalidateText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF5E36',
  },
  closeBtn: {
    padding: 7,
    backgroundColor: '#f4f4f5',
    borderRadius: 8,
  },
  tabsContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e4e4e7',
  },
  tabsScroll: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f4f4f5',
  },
  activeTab: {
    backgroundColor: '#fff1ee',
    borderWidth: 1,
    borderColor: '#ffc5b3',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#71717a',
  },
  activeTabText: {
    color: '#FF5E36',
    fontWeight: '700',
  },
  keyboardContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    fontSize: 13,
    color: '#71717a',
    marginTop: 10,
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    marginBottom: 12,
  },
  retryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#09090b',
    borderRadius: 8,
  },
  retryBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  contentScroll: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 120,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#09090b',
  },
  sectionDesc: {
    fontSize: 12,
    color: '#71717a',
    marginBottom: 14,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  itemNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f4f4f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemNumberText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#71717a',
  },
  itemInput: {
    flex: 1,
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#09090b',
  },
  deleteIconBtn: {
    padding: 6,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 8,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#09090b',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  addBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  smallAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FF5E36',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  smallAddBtnText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3f3f46',
    marginBottom: 4,
    marginTop: 12,
  },
  inputSubLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#71717a',
    marginBottom: 4,
    marginTop: 6,
  },
  input: {
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#09090b',
  },
  gridRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gridRowColumn: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  slideCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    gap: 10,
  },
  slideThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#e4e4e7',
  },
  placeholderThumbnail: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideInfo: {
    flex: 1,
  },
  slideBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  slideIdxText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FF5E36',
  },
  slideTaglineText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#71717a',
  },
  slideTitleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#09090b',
    marginBottom: 2,
  },
  slideOutfitText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '600',
  },
  slideActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtn: {
    padding: 7,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e4e4e7',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FF5E36',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 18,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  cancelText: {
    fontSize: 12,
    color: '#71717a',
    fontWeight: '600',
  },
  toggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  toggleOn: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  toggleOff: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  toggleText: {
    fontSize: 10,
    fontWeight: '800',
  },
  toggleTextOn: {
    color: '#059669',
  },
  toggleTextOff: {
    color: '#dc2626',
  },
  faqCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  faqQ: {
    fontSize: 13,
    fontWeight: '700',
    color: '#09090b',
    marginBottom: 2,
  },
  faqA: {
    fontSize: 11,
    color: '#71717a',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e4e4e7',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  bottomBarTablet: {
    maxWidth: 740,
    alignSelf: 'center',
    width: '100%',
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e4e4e7',
  },
  discardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#f4f4f5',
  },
  discardBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#52525b',
  },
  publishBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#09090b',
  },
  publishBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  keyboardAccessoryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e4e4e7',
    paddingHorizontal: 16,
    paddingVertical: 9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 4,
  },
  keyboardAccessoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  keyboardEditingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF5E36',
  },
  keyboardAccessoryHint: {
    fontSize: 12,
    fontWeight: '700',
    color: '#09090b',
  },
  keyboardDoneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#09090b',
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 8,
  },
  keyboardDoneBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  timerStatusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    marginTop: 10,
    borderWidth: 1,
  },
  timerStatusActive: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  timerStatusDisabled: {
    backgroundColor: '#f4f4f5',
    borderColor: '#e4e4e7',
  },
  timerStatusExpired: {
    backgroundColor: '#fff1ee',
    borderColor: '#ffddce',
  },
  timerStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10b981',
  },
  timerStatusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  timerInputCol: {
    flex: 1,
    alignItems: 'center',
  },
  timerSubLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  timerInput: {
    width: '100%',
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 10,
    fontSize: 16,
    fontWeight: '800',
    color: '#09090b',
    textAlign: 'center',
  },
  timerColon: {
    fontSize: 20,
    fontWeight: '900',
    color: '#a1a1aa',
    marginTop: 18,
  },
  timerPresetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  presetChip: {
    backgroundColor: '#f4f4f5',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  presetChipReset: {
    backgroundColor: '#fff5f5',
    borderColor: '#fee2e2',
  },
  presetChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#09090b',
  },
});
