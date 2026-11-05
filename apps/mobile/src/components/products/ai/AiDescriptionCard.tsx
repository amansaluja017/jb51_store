import React from 'react';
import { View, Text } from 'react-native';
import { CheckCircle2 } from 'lucide-react-native';
import { AiDescriptionItem } from '../../../utils/ai';
import { styles } from '../AiDescriptionModal.styles';

export interface AiDescriptionCardProps {
  item: AiDescriptionItem;
}

export const AiDescriptionCard: React.FC<AiDescriptionCardProps> = ({ item }) => {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.cardTopRow}>
        <View style={styles.badgePill}>
          <Text style={styles.badgePillText}>{item.badge}</Text>
        </View>
        <View style={styles.wordCountBadge}>
          <CheckCircle2 size={12} color="#047857" />
          <Text style={styles.wordCountBadgeText}>{item.wordCount} words (100+ met)</Text>
        </View>
      </View>

      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardSubtitle}>{item.styleName}</Text>

      {/* Highlight pills */}
      <View style={styles.highlightsContainer}>
        {item.highlightPoints.map((pt, i) => (
          <View key={i} style={styles.highlightPill}>
            <Text style={styles.highlightPillText}>• {pt}</Text>
          </View>
        ))}
      </View>

      {/* Description text box */}
      <View style={styles.descriptionTextBox}>
        <Text style={styles.descriptionText} selectable={true}>
          {item.descriptionText}
        </Text>
      </View>
    </View>
  );
};

export default AiDescriptionCard;

