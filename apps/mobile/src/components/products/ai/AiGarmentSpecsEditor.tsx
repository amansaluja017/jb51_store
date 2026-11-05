import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { AlertTriangle, Edit3, Wand2 } from 'lucide-react-native';
import { ProductAiInput } from '../../../utils/ai';
import { styles } from '../AiImagePromptsModal.styles';

export interface AiGarmentSpecsEditorProps {
  isMissingInfo: boolean;
  showEditSpecs: boolean;
  onToggleEditSpecs: (val: boolean) => void;
  localName: string;
  setLocalName: (val: string) => void;
  localColor: string;
  setLocalColor: (val: string) => void;
  localFabric: string;
  setLocalFabric: (val: string) => void;
  localFit: string;
  setLocalFit: (val: string) => void;
  localDesc: string;
  setLocalDesc: (val: string) => void;
  onApply: () => void;
  applyButtonLabel?: string;
  currentData: ProductAiInput;
}

export const AiGarmentSpecsEditor: React.FC<AiGarmentSpecsEditorProps> = ({
  isMissingInfo,
  showEditSpecs,
  onToggleEditSpecs,
  localName,
  setLocalName,
  localColor,
  setLocalColor,
  localFabric,
  setLocalFabric,
  localFit,
  setLocalFit,
  localDesc,
  setLocalDesc,
  onApply,
  applyButtonLabel = 'Apply Details & Update Studio',
  currentData,
}) => {
  if (isMissingInfo || showEditSpecs) {
    return (
      <View style={styles.missingDetailsCard}>
        <View style={styles.missingHeaderRow}>
          <AlertTriangle size={17} color="#d97706" />
          <Text style={styles.missingTitle}>
            {isMissingInfo ? 'Product Details Needed for AI Generation' : 'Edit Garment Details'}
          </Text>
        </View>
        <Text style={styles.missingSubtext}>
          To generate authentic, photorealistic imagery consistent with your brand, provide the garment details below:
        </Text>

        {/* Garment Name */}
        <View style={styles.missingFieldGroup}>
          <Text style={styles.missingFieldLabel}>Design Name</Text>
          <TextInput
            value={localName}
            onChangeText={setLocalName}
            placeholder="e.g. Palace Silk Kurta"
            placeholderTextColor="#a1a1aa"
            style={styles.missingInput}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetsScroll}>
            {['Palace Silk Kurta Set', 'Heritage Patiala Salwar Suit', 'Zari Embroidered Anarkali', 'Festive Velvet Suit'].map((preset) => (
              <TouchableOpacity
                key={preset}
                style={styles.presetChip}
                onPress={() => setLocalName(preset)}
              >
                <Text style={styles.presetChipText}>{preset}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Color Shade */}
        <View style={styles.missingFieldGroup}>
          <Text style={styles.missingFieldLabel}>Variant Color / Shade</Text>
          <TextInput
            value={localColor}
            onChangeText={setLocalColor}
            placeholder="e.g. Rani Pink, Royal Navy, Mustard Gold"
            placeholderTextColor="#a1a1aa"
            style={styles.missingInput}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetsScroll}>
            {['Rani Pink', 'Royal Navy Blue', 'Mustard Gold', 'Emerald Green', 'Deep Wine / Maroon', 'Ivory Cream'].map((c) => (
              <TouchableOpacity
                key={c}
                style={styles.presetChip}
                onPress={() => setLocalColor(c)}
              >
                <Text style={styles.presetChipText}>{c}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Fabric */}
        <View style={styles.missingFieldGroup}>
          <Text style={styles.missingFieldLabel}>Fabric Details</Text>
          <TextInput
            value={localFabric}
            onChangeText={setLocalFabric}
            placeholder="e.g. 100% Pure Chanderi Silk with Zari borders"
            placeholderTextColor="#a1a1aa"
            style={styles.missingInput}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetsScroll}>
            {[
              '100% Pure Chanderi Silk with Zari border',
              'Flowing Georgette with Resham threadwork',
              'Pure Raw Silk with Hand-embroidery',
              'Lightweight Handloom Cotton Mulmul',
            ].map((f) => (
              <TouchableOpacity
                key={f}
                style={styles.presetChip}
                onPress={() => setLocalFabric(f)}
              >
                <Text style={styles.presetChipText}>{f}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Fit / Silhouette */}
        <View style={styles.missingFieldGroup}>
          <Text style={styles.missingFieldLabel}>Fit & Silhouette</Text>
          <TextInput
            value={localFit}
            onChangeText={setLocalFit}
            placeholder="e.g. Straight Silhouette with comfort ease"
            placeholderTextColor="#a1a1aa"
            style={styles.missingInput}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetsScroll}>
            {[
              'Straight Cut Kurta with Pleated Patiala Salwar',
              'Comfort Straight Fit with Narrow Trouser',
              'Flared Anarkali Silhouette with Churidar',
              'Wide-Leg Sharara Suit',
            ].map((s) => (
              <TouchableOpacity
                key={s}
                style={styles.presetChip}
                onPress={() => setLocalFit(s)}
              >
                <Text style={styles.presetChipText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Description & Motifs */}
        <View style={styles.missingFieldGroup}>
          <Text style={styles.missingFieldLabel}>Key Motifs & Detailing</Text>
          <TextInput
            value={localDesc}
            onChangeText={setLocalDesc}
            placeholder="e.g. Hand-embroidered zardozi neckline, scalloped organza dupatta"
            placeholderTextColor="#a1a1aa"
            style={styles.missingInput}
          />
        </View>

        <TouchableOpacity
          style={styles.applyDetailsBtn}
          onPress={onApply}
          activeOpacity={0.8}
        >
          <Wand2 size={15} color="#ffffff" />
          <Text style={styles.applyDetailsBtnText}>{applyButtonLabel}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.specsSummaryBar}>
      <View style={styles.specsSummaryTop}>
        <Text style={styles.specsSummaryTitle}>Garment Context Active</Text>
        <TouchableOpacity
          onPress={() => onToggleEditSpecs(true)}
          style={styles.editSpecsBtn}
          activeOpacity={0.7}
        >
          <Edit3 size={11} color="#09090b" />
          <Text style={styles.editSpecsBtnText}>Edit</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.specsGrid}>
        <View style={styles.specItemPill}>
          <Text style={styles.specItemLabel}>NAME</Text>
          <Text style={styles.specItemValue} numberOfLines={1}>{currentData.name || 'Untitled'}</Text>
        </View>
        <View style={styles.specItemPill}>
          <Text style={styles.specItemLabel}>COLOR</Text>
          <Text style={styles.specItemValue} numberOfLines={1}>{currentData.variantColor || 'Not set'}</Text>
        </View>
        <View style={styles.specItemPill}>
          <Text style={styles.specItemLabel}>FABRIC</Text>
          <Text style={styles.specItemValue} numberOfLines={1}>{currentData.fabric || 'Pure Silk'}</Text>
        </View>
        <View style={styles.specItemPill}>
          <Text style={styles.specItemLabel}>FIT</Text>
          <Text style={styles.specItemValue} numberOfLines={1}>{currentData.fit || 'Straight Fit'}</Text>
        </View>
      </View>
    </View>
  );
};

export default AiGarmentSpecsEditor;

