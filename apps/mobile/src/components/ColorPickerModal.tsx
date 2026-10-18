import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Check, Pipette, Sparkles } from 'lucide-react-native';
import {
  rgbToHex,
  hexToRgb,
  isValidHex,
  getClosestColorName
} from '../utils/colorThiefHelper';
import styles from './ColorPickerModal.styles';

interface ColorPickerModalProps {
  visible: boolean;
  initialHex?: string;
  onClose: () => void;
  onSelectColor: (hex: string, suggestedName: string) => void;
}

// 18 Preset trending apparel colors
const PRESET_SWATCHES = [
  '#0A0A0A', // Jet Black
  '#36393F', // Charcoal
  '#708090', // Slate Gray
  '#FFFFFF', // Pure White
  '#F5F5DC', // Beige
  '#C19A6B', // Camel
  '#4A2614', // Chocolate Brown
  '#722F37', // Wine Red
  '#800000', // Maroon
  '#DC143C', // Crimson
  '#E2725B', // Terracotta
  '#FF7F50', // Coral
  '#FF6699', // Rose Pink
  '#FEC8D8', // Blush Pink
  '#000080', // Navy Blue
  '#4169E1', // Royal Blue
  '#008080', // Teal
  '#6B8E23', // Olive Green
  '#228B22', // Forest Green
  '#9DC183', // Sage Green
  '#E1AD01', // Mustard Yellow
  '#FFD700', // Gold
  '#800080', // Purple
  '#8E4585', // Plum
];

// 12 Hue steps for the rainbow hue bar
const HUE_STEPS = [
  { hue: 0, hex: '#FF0000' },
  { hue: 30, hex: '#FF8000' },
  { hue: 60, hex: '#FFFF00' },
  { hue: 90, hex: '#80FF00' },
  { hue: 120, hex: '#00FF00' },
  { hue: 150, hex: '#00FF80' },
  { hue: 180, hex: '#00FFFF' },
  { hue: 210, hex: '#0080FF' },
  { hue: 240, hex: '#0000FF' },
  { hue: 270, hex: '#8000FF' },
  { hue: 300, hex: '#FF00FF' },
  { hue: 330, hex: '#FF0080' },
];

// Helper to convert HSV to RGB
function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0, g = 0, b = 0;

  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0;
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x;
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c;
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c;
  } else {
    r = c; g = 0; b = x;
  }

  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}

// Helper to convert RGB to HSV
function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (max !== min) {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
  }

  return [h, s, v];
}

export default function ColorPickerModal({
  visible,
  initialHex = '#FF5E36',
  onClose,
  onSelectColor,
}: ColorPickerModalProps) {
  const [currentHex, setCurrentHex] = useState(initialHex);
  const [inputHex, setInputHex] = useState(initialHex);
  const [selectedHue, setSelectedHue] = useState(14);
  const [selectedShadeIndex, setSelectedShadeIndex] = useState(2); // 0: pastel, 1: light, 2: pure, 3: deep, 4: dark

  useEffect(() => {
    if (visible) {
      const valid = isValidHex(initialHex) ? initialHex.toUpperCase() : '#FF5E36';
      setCurrentHex(valid);
      setInputHex(valid);
      const rgb = hexToRgb(valid);
      if (rgb) {
        const [h] = rgbToHsv(rgb[0], rgb[1], rgb[2]);
        setSelectedHue(Math.round(h));
      }
    }
  }, [visible, initialHex]);

  const handleSelectPreset = (hex: string) => {
    setCurrentHex(hex);
    setInputHex(hex);
    const rgb = hexToRgb(hex);
    if (rgb) {
      const [h] = rgbToHsv(rgb[0], rgb[1], rgb[2]);
      setSelectedHue(Math.round(h));
    }
  };

  const handleHueSelect = (hue: number) => {
    setSelectedHue(hue);
    // Apply shade based on selected shade index
    const shades = [
      { s: 0.35, v: 0.95 },
      { s: 0.65, v: 0.9 },
      { s: 1.0, v: 0.9 },
      { s: 0.85, v: 0.65 },
      { s: 0.9, v: 0.4 },
    ];
    const { s, v } = shades[selectedShadeIndex] || shades[2];
    const rgb = hsvToRgb(hue, s, v);
    const hex = rgbToHex(rgb[0], rgb[1], rgb[2]);
    setCurrentHex(hex);
    setInputHex(hex);
  };

  const handleShadeSelect = (shadeIndex: number) => {
    setSelectedShadeIndex(shadeIndex);
    const shades = [
      { s: 0.35, v: 0.95 },
      { s: 0.65, v: 0.9 },
      { s: 1.0, v: 0.9 },
      { s: 0.85, v: 0.65 },
      { s: 0.9, v: 0.4 },
    ];
    const { s, v } = shades[shadeIndex];
    const rgb = hsvToRgb(selectedHue, s, v);
    const hex = rgbToHex(rgb[0], rgb[1], rgb[2]);
    setCurrentHex(hex);
    setInputHex(hex);
  };

  const handleHexInputChange = (text: string) => {
    let clean = text.toUpperCase().replace(/[^0-9A-F#]/g, '');
    if (!clean.startsWith('#') && clean.length > 0) {
      clean = '#' + clean;
    }
    setInputHex(clean);
    if (isValidHex(clean)) {
      const formatted = clean.length === 4 
        ? `#${clean[1]}${clean[1]}${clean[2]}${clean[2]}${clean[3]}${clean[3]}` 
        : clean;
      setCurrentHex(formatted);
      const rgb = hexToRgb(formatted);
      if (rgb) {
        const [h] = rgbToHsv(rgb[0], rgb[1], rgb[2]);
        setSelectedHue(Math.round(h));
      }
    }
  };

  const handleApply = () => {
    const finalHex = isValidHex(currentHex) ? currentHex.toUpperCase() : '#FF5E36';
    const suggestedName = getClosestColorName(finalHex);
    onSelectColor(finalHex, suggestedName);
    onClose();
  };

  const currentRgb = hexToRgb(currentHex) || [255, 94, 54];
  const colorName = getClosestColorName(currentHex);

  // Generate 5 shade swatches for the currently selected hue
  const currentHueShades = [
    { label: 'Pastel', ...(() => { const rgb = hsvToRgb(selectedHue, 0.35, 0.95); return { hex: rgbToHex(rgb[0], rgb[1], rgb[2]) }; })() },
    { label: 'Soft', ...(() => { const rgb = hsvToRgb(selectedHue, 0.65, 0.9); return { hex: rgbToHex(rgb[0], rgb[1], rgb[2]) }; })() },
    { label: 'Vibrant', ...(() => { const rgb = hsvToRgb(selectedHue, 1.0, 0.9); return { hex: rgbToHex(rgb[0], rgb[1], rgb[2]) }; })() },
    { label: 'Deep', ...(() => { const rgb = hsvToRgb(selectedHue, 0.85, 0.65); return { hex: rgbToHex(rgb[0], rgb[1], rgb[2]) }; })() },
    { label: 'Dark', ...(() => { const rgb = hsvToRgb(selectedHue, 0.9, 0.4); return { hex: rgbToHex(rgb[0], rgb[1], rgb[2]) }; })() },
  ];

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.dialogCard}>
            
            {/* Header */}
            <View style={styles.headerRow}>
              <View style={styles.titleContainer}>
                <Pipette size={18} color="#FF5E36" style={{ marginRight: 8 }} />
                <Text style={styles.titleText}>Color Picker</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
                <X size={18} color="#71717a" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
              
              {/* Live Preview Card */}
              <View style={styles.previewCard}>
                <View style={[styles.largeColorCircle, { backgroundColor: currentHex }]}>
                  {/* Subtle inner highlight */}
                  <View style={styles.circleInnerGloss} />
                </View>

                <View style={styles.previewInfo}>
                  <View style={styles.suggestedBadge}>
                    <Sparkles size={11} color="#FF5E36" style={{ marginRight: 4 }} />
                    <Text style={styles.suggestedNameText}>{colorName}</Text>
                  </View>

                  <Text style={styles.previewHexText}>{currentHex}</Text>
                  <Text style={styles.previewRgbText}>
                    RGB: {currentRgb[0]}, {currentRgb[1]}, {currentRgb[2]}
                  </Text>
                </View>
              </View>

              {/* Manual Hex Input */}
              <View style={styles.sectionBlock}>
                <Text style={styles.sectionLabel}>ENTER HEX CODE MANUALLY</Text>
                <View style={styles.hexInputRow}>
                  <View style={[styles.inputColorDot, { backgroundColor: currentHex }]} />
                  <TextInput
                    value={inputHex}
                    onChangeText={handleHexInputChange}
                    placeholder="#RRGGBB"
                    maxLength={7}
                    autoCapitalize="characters"
                    style={styles.hexTextInput}
                    placeholderTextColor="#a1a1aa"
                  />
                  {isValidHex(inputHex) ? (
                    <View style={styles.validHexBadge}>
                      <Check size={12} color="#16a34a" />
                      <Text style={styles.validHexText}>Valid</Text>
                    </View>
                  ) : (
                    <Text style={styles.invalidHexText}>Invalid Hex</Text>
                  )}
                </View>
              </View>

              {/* Hue Spectrum Bar */}
              <View style={styles.sectionBlock}>
                <Text style={styles.sectionLabel}>1. SELECT HUE SPECTRUM</Text>
                <View style={styles.hueBarContainer}>
                  {HUE_STEPS.map((h, i) => {
                    const isSelected = Math.abs(selectedHue - h.hue) < 20;
                    return (
                      <TouchableOpacity
                        key={i}
                        onPress={() => handleHueSelect(h.hue)}
                        style={[
                          styles.hueSegment,
                          { backgroundColor: h.hex },
                          isSelected && styles.hueSegmentSelected,
                        ]}
                        activeOpacity={0.8}
                      />
                    );
                  })}
                </View>
              </View>

              {/* Tone / Shade Bar */}
              <View style={styles.sectionBlock}>
                <Text style={styles.sectionLabel}>2. SELECT SHADE / INTENSITY</Text>
                <View style={styles.shadesRow}>
                  {currentHueShades.map((shade, idx) => {
                    const isSelected = selectedShadeIndex === idx;
                    return (
                      <TouchableOpacity
                        key={idx}
                        onPress={() => handleShadeSelect(idx)}
                        style={[
                          styles.shadeCard,
                          isSelected && styles.shadeCardSelected,
                        ]}
                        activeOpacity={0.8}
                      >
                        <View style={[styles.shadeCircle, { backgroundColor: shade.hex }]} />
                        <Text style={styles.shadeLabel}>{shade.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Preset Swatches */}
              <View style={styles.sectionBlock}>
                <Text style={styles.sectionLabel}>POPULAR APPAREL PRESETS</Text>
                <View style={styles.presetsGrid}>
                  {PRESET_SWATCHES.map((hex, idx) => {
                    const isSelected = currentHex.toLowerCase() === hex.toLowerCase();
                    return (
                      <TouchableOpacity
                        key={idx}
                        onPress={() => handleSelectPreset(hex)}
                        style={[
                          styles.presetCircleBtn,
                          { backgroundColor: hex },
                          isSelected && styles.presetCircleSelected,
                        ]}
                        activeOpacity={0.7}
                      >
                        {isSelected && (
                          <Check
                            size={12}
                            color={hex.toLowerCase() === '#ffffff' || hex.toLowerCase() === '#f5f5dc' ? '#000000' : '#ffffff'}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.footerRow}>
              <TouchableOpacity
                onPress={onClose}
                style={styles.cancelBtn}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleApply}
                style={styles.applyBtn}
                activeOpacity={0.8}
              >
                <Check size={16} color="#ffffff" style={{ marginRight: 6 }} />
                <Text style={styles.applyBtnText}>Apply Color</Text>
              </TouchableOpacity>
            </View>

          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

