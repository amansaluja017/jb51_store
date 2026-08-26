import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BarChart } from '@mui/x-charts/BarChart';

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
  return (
    <View style={styles.chartCard}>
      <Text style={styles.cardTitle}>Size Variant Performance</Text>
      <Text style={styles.cardSub}>Visual distribution of customer interest per size</Text>
      
      <View style={styles.chartCanvasContainer}>
        <BarChart
          xAxis={[{
            scaleType: 'band',
            data: sizes,
            tickLabelStyle: {
              fontFamily: 'inherit',
              fontSize: 10,
              fill: '#a1a1aa',
              fontWeight: 600,
            }
          }]}
          yAxis={[{
            tickLabelStyle: {
              fontFamily: 'inherit',
              fontSize: 10,
              fill: '#a1a1aa',
              fontWeight: 600,
            }
          }]}
          series={[
            {
              data: values,
              color: color,
              label: 'Interest Score',
            }
          ]}
          height={200}
          grid={{ horizontal: true }}
          slotProps={{
            legend: { hidden: true } as any
          }}
          sx={{
            width: '100%',
            '& .MuiChartsGrid-line': {
              stroke: '#f4f4f5',
              strokeDasharray: '4 4',
            },
            '& .MuiChartsGrid-horizontalLine': {
              stroke: '#f4f4f5',
            },
            '& .MuiBarElement-root': {
              rx: 4,
              ry: 4,
            }
          }}
        />
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
    marginTop: 16,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
  },
});
