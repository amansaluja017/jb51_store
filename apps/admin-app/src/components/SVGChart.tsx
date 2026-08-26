import React from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import Svg, { Polyline, Circle, Line } from 'react-native-svg';

const { width } = Dimensions.get('window');

interface SVGChartProps {
  viewsPoints: string;
  inqPoints: string;
}

export default function SVGChart({ viewsPoints, inqPoints }: SVGChartProps) {
  return (
    <View style={styles.chartCard}>
      <Text style={styles.cardTitle}>Inquiry Traffic Trends</Text>
      <Text style={styles.cardSub}>6-Week details: Views (Orange) vs Inquiries (Black)</Text>
      
      <View style={styles.chartCanvasContainer}>
        <Svg height="200" width={width - 64}>
          {/* Grid Lines */}
          <Line x1="20" y1="30" x2={width - 80} y2="30" stroke="#f4f4f5" strokeWidth="1" />
          <Line x1="20" y1="80" x2={width - 80} y2="80" stroke="#f4f4f5" strokeWidth="1" />
          <Line x1="20" y1="130" x2={width - 80} y2="130" stroke="#f4f4f5" strokeWidth="1" />
          <Line x1="20" y1="180" x2={width - 80} y2="180" stroke="#f4f4f5" strokeWidth="1" />

          {/* Polyline Charts */}
          <Polyline
            fill="none"
            stroke="#FF5E36"
            strokeWidth="2.5"
            points={viewsPoints}
          />
          <Polyline
            fill="none"
            stroke="#09090b"
            strokeWidth="2.5"
            points={inqPoints}
          />

          {/* Data points */}
          <Circle cx="270" cy="30" r="4" fill="#FF5E36" />
          <Circle cx="270" cy="135" r="4" fill="#09090b" />
        </Svg>
      </View>
      
      <View style={styles.chartLegend}>
        <Text style={styles.legendWeek}>W1</Text>
        <Text style={styles.legendWeek}>W2</Text>
        <Text style={styles.legendWeek}>W3</Text>
        <Text style={styles.legendWeek}>W4</Text>
        <Text style={styles.legendWeek}>W5</Text>
        <Text style={styles.legendWeek}>W6</Text>
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
  chartCanvasContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 8,
  },
  legendWeek: {
    fontSize: 8,
    color: '#a1a1aa',
    fontWeight: 'bold',
  },
});
