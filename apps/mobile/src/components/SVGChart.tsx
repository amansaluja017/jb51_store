import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Dimensions, Animated, Easing } from 'react-native';
import Svg, { Path, Circle, Line, Defs, LinearGradient, Stop } from 'react-native-svg';

const { width } = Dimensions.get('window');

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface SVGChartProps {
  activeMetric: 'views' | 'waHits' | 'igHits' | 'conversion' | 'orders';
  metricData: number[];
  labels: string[];
  title: string;
  color?: string;
}

export default function SVGChart({
  activeMetric,
  metricData,
  labels,
  title,
  color = '#FF5E36'
}: SVGChartProps) {
  const chartHeight = 160;
  const paddingX = 24;
  const paddingY = 20;
  const canvasWidth = width - 64;
  const chartWidth = canvasWidth - paddingX * 2;
  
  const maxVal = Math.max(...metricData, 1);
  const minVal = 0;

  // Map data to SVG coordinate space
  const points = metricData.map((val, idx) => {
    const x = paddingX + (idx / (metricData.length - 1)) * chartWidth;
    const y = chartHeight - paddingY - ((val - minVal) / (maxVal - minVal)) * (chartHeight - paddingY * 2);
    return { x, y, value: val };
  });

  // Build the line path
  const linePath = points.reduce((acc, p, idx) => {
    if (idx === 0) {
      return `M ${p.x} ${p.y}`;
    }
    // Make it a slightly curved bezier path for smooth aesthetics
    const prev = points[idx - 1];
    const cpX1 = prev.x + (p.x - prev.x) / 2;
    const cpY1 = prev.y;
    const cpX2 = prev.x + (p.x - prev.x) / 2;
    const cpY2 = p.y;
    return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p.x} ${p.y}`;
  }, '');

  // Build the filled area path
  const areaPath = points.length > 0 
    ? `${linePath} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`
    : '';

  // Animation drivers
  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Reset and trigger smooth animation on data change
    animation.setValue(0);
    Animated.timing(animation, {
      toValue: 1,
      duration: 900,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1), // smooth ease-in-out
      useNativeDriver: false, // SVG property animations require false
    }).start();
  }, [metricData]);

  // Animate drawing the line using strokeDashoffset
  // Estimated path length of ~600
  const strokeDashoffset = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0]
  });

  // Animate opacity of grid, dots, and area
  const opacity = animation.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0, 0.2, 1]
  });

  const areaOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.15]
  });

  return (
    <View style={styles.chartCard}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardSub}>6-Week performance review & trends</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: color + '15' }]}>
          <Text style={[styles.badgeText, { color }]}>{activeMetric.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.chartCanvasContainer}>
        <Svg height={chartHeight} width={canvasWidth}>
          <Defs>
            <LinearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={color} stopOpacity="1" />
              <Stop offset="100%" stopColor={color} stopOpacity="0" />
            </LinearGradient>
          </Defs>

          {/* Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = paddingY + ratio * (chartHeight - paddingY * 2);
            return (
              <Line 
                key={idx}
                x1={paddingX} 
                y1={y} 
                x2={canvasWidth - paddingX} 
                y2={y} 
                stroke="#f4f4f5" 
                strokeWidth="1" 
                strokeDasharray="4 4"
              />
            );
          })}

          {/* Area under the path (Animated) */}
          {areaPath ? (
            <AnimatedPath
              d={areaPath}
              fill="url(#chartGradient)"
              opacity={areaOpacity}
            />
          ) : null}

          {/* Line Path (Animated) */}
          {linePath ? (
            <AnimatedPath
              d={linePath}
              fill="none"
              stroke={color}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="600"
              strokeDashoffset={strokeDashoffset}
            />
          ) : null}

          {/* Data point circles (Animated) */}
          {points.map((p, idx) => (
            <AnimatedCircle
              key={idx}
              cx={p.x}
              cy={p.y}
              r="4.5"
              fill="#ffffff"
              stroke={color}
              strokeWidth="2.5"
              opacity={opacity}
            />
          ))}
        </Svg>
      </View>
      
      {/* Legend Weeks */}
      <View style={styles.chartLegend}>
        {labels.map((label, idx) => (
          <Text key={idx} style={styles.legendWeek}>{label}</Text>
        ))}
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
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  chartCanvasContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginTop: 8,
  },
  legendWeek: {
    fontSize: 8,
    color: '#a1a1aa',
    fontWeight: 'bold',
  },
});
