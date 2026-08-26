import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Animated, Easing } from 'react-native';

interface SizingChartProps {
  sizes?: string[];
  values?: number[];
  color?: string;
}

export default function SizingChart({
  sizes = ['XS', 'S', 'M', 'L', 'XL'],
  values = [20, 50, 85, 60, 25],
  color = '#FF5E36'
}: SizingChartProps) {
  
  // Create an array of Animated.Value instances
  const animations = useRef(sizes.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    // Reset and trigger parallel animations
    animations.forEach(anim => anim.setValue(0));
    
    const animationTriggers = animations.map((anim, idx) => {
      const targetPercent = values[idx] / 100;
      return Animated.timing(anim, {
        toValue: targetPercent,
        duration: 900,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: false,
      });
    });

    Animated.parallel(animationTriggers).start();
  }, [values]);

  return (
    <View style={styles.chartCard}>
      <Text style={styles.cardTitle}>Size Variant Performance</Text>
      <Text style={styles.cardSub}>Visual distribution of customer interest per size</Text>
      
      <View style={styles.barsContainer}>
        {sizes.map((sz, idx) => {
          const val = values[idx];
          const interestLabel = val > 75 ? 'Exceptional' : val > 40 ? 'High' : 'Moderate';
          const labelColor = val > 75 ? '#ef4444' : val > 40 ? '#FF5E36' : '#71717a';
          
          const widthPercent = animations[idx].interpolate({
            inputRange: [0, 1],
            outputRange: ['0%', '100%'],
          });

          return (
            <View key={sz} style={styles.row}>
              <View style={styles.sizeCol}>
                <Text style={styles.sizeText}>{sz}</Text>
                <Text style={[styles.interestText, { color: labelColor }]}>{interestLabel}</Text>
              </View>
              
              <View style={styles.barTrack}>
                <Animated.View style={[styles.barFill, { width: widthPercent, backgroundColor: color }]} />
              </View>
              
              <View style={styles.valCol}>
                <Text style={styles.valText}>{val}%</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chartCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 24,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
  },
  cardTitle: {
    fontFamily: 'serif',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#09090b',
  },
  cardSub: {
    fontSize: 9,
    color: '#71717a',
    marginTop: 2,
  },
  barsContainer: {
    marginTop: 16,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sizeCol: {
    width: 65,
  },
  sizeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#09090b',
  },
  interestText: {
    fontSize: 8,
    fontWeight: '600',
    marginTop: 1,
  },
  barTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#f4f4f5',
    borderRadius: 4,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  valCol: {
    width: 32,
    alignItems: 'flex-end',
  },
  valText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#09090b',
  },
});
