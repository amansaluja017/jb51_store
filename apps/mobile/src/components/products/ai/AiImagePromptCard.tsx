import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Camera, Sun, Maximize2, Terminal } from 'lucide-react-native';
import { AiImagePromptItem } from '../../../utils/ai';
import { styles } from '../AiImagePromptsModal.styles';

export interface AiImagePromptCardProps {
  prompt: AiImagePromptItem;
  viewCliMode: boolean;
  onToggleCliMode: (val: boolean) => void;
}

export const AiImagePromptCard: React.FC<AiImagePromptCardProps> = ({
  prompt,
  viewCliMode,
  onToggleCliMode,
}) => {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.promptCardTopBar}>
        <View style={styles.badgePill}>
          <Text style={styles.badgePillText}>{prompt.badge}</Text>
        </View>
        <View style={styles.aspectRatioTag}>
          <Maximize2 size={10} color="#71717a" />
          <Text style={styles.aspectRatioTagText}>{prompt.recommendedAspect}</Text>
        </View>
      </View>

      <Text style={styles.promptCardTitle}>{prompt.title}</Text>
      <Text style={styles.promptCardSubtitle}>{prompt.subtitle}</Text>

      {/* Technical specs */}
      <View style={styles.promptSpecsContainer}>
        <View style={styles.promptSpecRow}>
          <Camera size={12} color="#0284c7" />
          <Text style={styles.promptSpecLabel}>CAMERA:</Text>
          <Text style={styles.promptSpecValue}>{prompt.cameraSpecs}</Text>
        </View>
        <View style={styles.promptSpecRow}>
          <Sun size={12} color="#d97706" />
          <Text style={styles.promptSpecLabel}>LIGHTING:</Text>
          <Text style={styles.promptSpecValue}>{prompt.lightingSetup}</Text>
        </View>
      </View>

      {/* View Format Selector (Full Prompt vs Midjourney CLI) */}
      <View style={{ flexDirection: 'row', gap: 6, marginBottom: 10 }}>
        <TouchableOpacity
          onPress={() => onToggleCliMode(false)}
          style={{
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 6,
            backgroundColor: !viewCliMode ? '#18181b' : '#f4f4f5',
          }}
          activeOpacity={0.7}
        >
          <Text style={{ fontSize: 10.5, fontWeight: '700', color: !viewCliMode ? '#ffffff' : '#71717a' }}>
            Full Studio Prompt
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onToggleCliMode(true)}
          style={{
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 6,
            backgroundColor: viewCliMode ? '#18181b' : '#f4f4f5',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
          }}
          activeOpacity={0.7}
        >
          <Terminal size={11} color={viewCliMode ? '#ffffff' : '#71717a'} />
          <Text style={{ fontSize: 10.5, fontWeight: '700', color: viewCliMode ? '#ffffff' : '#71717a' }}>
            Midjourney / Flux CLI
          </Text>
        </TouchableOpacity>
      </View>

      {/* Prompt Text Box */}
      <View style={styles.promptTextBox}>
        <Text style={styles.promptTextMonospace} selectable={true}>
          {viewCliMode
            ? prompt.promptText.split('MIDJOURNEY / FLUX CLI COMMAND:\n')[1] || prompt.promptText
            : prompt.promptText}
        </Text>
      </View>

      {/* Negative Prompt */}
      {prompt.negativePrompt ? (
        <View style={styles.negativePromptBox}>
          <Text style={styles.negativePromptLabel}>NEGATIVE PROMPT (FORBIDDEN ELEMENTS):</Text>
          <Text style={styles.negativePromptText} selectable={true}>
            {prompt.negativePrompt}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

export default AiImagePromptCard;

