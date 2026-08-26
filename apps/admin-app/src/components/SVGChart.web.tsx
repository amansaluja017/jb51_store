import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LineChart } from '@mui/x-charts/LineChart';

interface SVGChartProps {
  activeMetric: 'views' | 'waHits' | 'igHits' | 'conversion';
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
  return (
    <View style={styles.chartCard}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardSub}>6-Week performance review & trends</Text>
        </View>
        <div style={{
          padding: '4px 8px',
          borderRadius: '8px',
          backgroundColor: `${color}15`,
          fontSize: '9px',
          fontWeight: 'bold',
          color: color,
          letterSpacing: '0.5px',
          textTransform: 'uppercase'
        }}>
          {activeMetric}
        </div>
      </View>

      <View style={styles.chartCanvasContainer}>
        <LineChart
          xAxis={[{
            data: labels,
            scaleType: 'point',
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
              data: metricData,
              label: title,
              color: color,
              area: true,
              curve: 'monotoneX', // Smooth curves!
              showMark: true,
            },
          ]}
          height={220}
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
            '& .MuiAreaElement-root': {
              fill: `url(#gradient-${activeMetric})`,
              opacity: 0.15,
            },
            '& .MuiLineElement-root': {
              strokeWidth: 3,
            },
            '& .MuiMarkElement-root': {
              stroke: color,
              strokeWidth: 2.5,
              fill: '#ffffff',
              r: 5,
            }
          }}
        >
          <defs>
            <linearGradient id={`gradient-${activeMetric}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={1} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
        </LineChart>
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
    // Native shadow mappings will map to web box-shadow automatically in react-native-web
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
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
  chartCanvasContainer: {
    marginTop: 16,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
  },
});
