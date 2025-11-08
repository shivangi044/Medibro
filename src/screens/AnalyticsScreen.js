import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

const AnalyticsScreen = ({ navigation }) => {
  const [timeRange, setTimeRange] = useState('week'); // week, month, year
  const [adherenceData, setAdherenceData] = useState({});
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = () => {
    // Mock analytics data
    const mockData = {
      week: {
        adherenceRate: 85,
        totalDoses: 28,
        takenDoses: 24,
        missedDoses: 4,
        lineData: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [
            {
              data: [95, 80, 100, 90, 75, 85, 95],
              color: (opacity = 1) => `rgba(46, 134, 171, ${opacity})`,
              strokeWidth: 3,
            },
          ],
        },
        medicineData: [
          { name: 'Paracetamol', taken: 14, total: 14, color: '#4CAF50' },
          { name: 'Vitamin D', taken: 6, total: 7, color: '#FF9800' },
          { name: 'Omega-3', taken: 4, total: 7, color: '#F44336' },
        ],
      },
      month: {
        adherenceRate: 88,
        totalDoses: 120,
        takenDoses: 106,
        missedDoses: 14,
        lineData: {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
          datasets: [
            {
              data: [92, 85, 90, 85],
              color: (opacity = 1) => `rgba(46, 134, 171, ${opacity})`,
              strokeWidth: 3,
            },
          ],
        },
        medicineData: [
          { name: 'Paracetamol', taken: 58, total: 60, color: '#4CAF50' },
          { name: 'Vitamin D', taken: 26, total: 30, color: '#FF9800' },
          { name: 'Omega-3', taken: 22, total: 30, color: '#F44336' },
        ],
      },
    };

    setAdherenceData(mockData[timeRange] || mockData.week);
    generateInsights(mockData[timeRange] || mockData.week);
  };

  const generateInsights = (data) => {
    const mockInsights = [
      {
        id: 1,
        type: 'positive',
        icon: 'trending-up',
        title: 'Great Progress!',
        description: `Your adherence rate of ${data.adherenceRate}% is above average.`,
      },
      {
        id: 2,
        type: 'warning',
        icon: 'alert-circle',
        title: 'Missed Evening Doses',
        description: 'You tend to miss more doses in the evening. Consider setting stronger reminders.',
      },
      {
        id: 3,
        type: 'tip',
        icon: 'lightbulb',
        title: 'AI Recommendation',
        description: 'Based on your patterns, taking Omega-3 with breakfast might improve adherence.',
      },
      {
        id: 4,
        type: 'prediction',
        icon: 'analytics',
        title: 'Prediction',
        description: 'If current trend continues, you\'ll reach 90% adherence by next month.',
      },
    ];
    setInsights(mockInsights);
  };

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(46, 134, 171, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#2E86AB',
    },
  };

  const getInsightIcon = (type) => {
    const iconMap = {
      positive: 'checkmark-circle',
      warning: 'warning',
      tip: 'bulb',
      prediction: 'analytics',
    };
    return iconMap[type] || 'information-circle';
  };

  const getInsightColor = (type) => {
    const colorMap = {
      positive: '#4CAF50',
      warning: '#FF9800',
      tip: '#2196F3',
      prediction: '#9C27B0',
    };
    return colorMap[type] || '#666';
  };

  const pieChartData = adherenceData.medicineData?.map((med, index) => ({
    name: med.name,
    adherence: Math.round((med.taken / med.total) * 100),
    color: med.color,
    legendFontColor: '#333',
    legendFontSize: 12,
  })) || [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Analytics</Text>
        <TouchableOpacity style={styles.exportButton}>
          <Ionicons name="download-outline" size={20} color="#2E86AB" />
        </TouchableOpacity>
      </View>

      {/* Time Range Selector */}
      <View style={styles.timeRangeContainer}>
        {['week', 'month'].map((range) => (
          <TouchableOpacity
            key={range}
            style={[
              styles.timeRangeButton,
              timeRange === range && styles.timeRangeButtonActive,
            ]}
            onPress={() => setTimeRange(range)}
          >
            <Text style={[
              styles.timeRangeText,
              timeRange === range && styles.timeRangeTextActive,
            ]}>
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Overview Cards */}
        <View style={styles.overviewContainer}>
          <View style={styles.overviewCard}>
            <Text style={styles.overviewNumber}>{adherenceData.adherenceRate}%</Text>
            <Text style={styles.overviewLabel}>Adherence Rate</Text>
            <Ionicons name="trending-up" size={24} color="#4CAF50" />
          </View>
          
          <View style={styles.overviewCard}>
            <Text style={styles.overviewNumber}>{adherenceData.takenDoses}</Text>
            <Text style={styles.overviewLabel}>Doses Taken</Text>
            <Ionicons name="checkmark-circle" size={24} color="#2E86AB" />
          </View>
          
          <View style={styles.overviewCard}>
            <Text style={styles.overviewNumber}>{adherenceData.missedDoses}</Text>
            <Text style={styles.overviewLabel}>Doses Missed</Text>
            <Ionicons name="close-circle" size={24} color="#F44336" />
          </View>
        </View>

        {/* Adherence Trend Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Adherence Trend</Text>
          <Text style={styles.chartSubtitle}>Daily adherence percentage</Text>
          
          {adherenceData.lineData && (
            <LineChart
              data={adherenceData.lineData}
              width={width - 40}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          )}
        </View>

        {/* Medicine-wise Adherence */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Medicine Performance</Text>
          <Text style={styles.chartSubtitle}>Adherence by medicine type</Text>
          
          <View style={styles.medicineStatsContainer}>
            {adherenceData.medicineData?.map((medicine, index) => (
              <View key={index} style={styles.medicineStatItem}>
                <View style={styles.medicineStatLeft}>
                  <View style={[styles.medicineColorIndicator, { backgroundColor: medicine.color }]} />
                  <Text style={styles.medicineStatName}>{medicine.name}</Text>
                </View>
                <View style={styles.medicineStatRight}>
                  <Text style={styles.medicineStatNumber}>
                    {medicine.taken}/{medicine.total}
                  </Text>
                  <Text style={styles.medicineStatPercentage}>
                    {Math.round((medicine.taken / medicine.total) * 100)}%
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* AI Insights */}
        <View style={styles.insightsContainer}>
          <Text style={styles.insightsTitle}>AI Insights & Recommendations</Text>
          
          {insights.map((insight) => (
            <View key={insight.id} style={styles.insightCard}>
              <View style={styles.insightHeader}>
                <Ionicons 
                  name={getInsightIcon(insight.type)} 
                  size={24} 
                  color={getInsightColor(insight.type)} 
                />
                <Text style={[styles.insightTitle, { color: getInsightColor(insight.type) }]}>
                  {insight.title}
                </Text>
              </View>
              <Text style={styles.insightDescription}>{insight.description}</Text>
            </View>
          ))}
        </View>

        {/* Weekly Pattern Analysis */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Weekly Pattern</Text>
          <Text style={styles.chartSubtitle}>Best and worst days for adherence</Text>
          
          <View style={styles.patternContainer}>
            <View style={styles.patternItem}>
              <Ionicons name="sunny" size={24} color="#4CAF50" />
              <Text style={styles.patternLabel}>Best Day</Text>
              <Text style={styles.patternValue}>Wednesday</Text>
            </View>
            
            <View style={styles.patternItem}>
              <Ionicons name="cloudy" size={24} color="#FF9800" />
              <Text style={styles.patternLabel}>Needs Focus</Text>
              <Text style={styles.patternValue}>Friday</Text>
            </View>
            
            <View style={styles.patternItem}>
              <Ionicons name="time" size={24} color="#2E86AB" />
              <Text style={styles.patternLabel}>Best Time</Text>
              <Text style={styles.patternValue}>Morning</Text>
            </View>
          </View>
        </View>

        {/* Health Score */}
        <View style={styles.healthScoreContainer}>
          <Text style={styles.healthScoreTitle}>Health Score</Text>
          <View style={styles.healthScoreCircle}>
            <Text style={styles.healthScoreNumber}>87</Text>
            <Text style={styles.healthScoreLabel}>/ 100</Text>
          </View>
          <Text style={styles.healthScoreDescription}>
            Based on adherence, consistency, and timing
          </Text>
          
          <View style={styles.healthFactors}>
            <View style={styles.healthFactor}>
              <Text style={styles.healthFactorLabel}>Consistency</Text>
              <View style={styles.healthFactorBar}>
                <View style={[styles.healthFactorFill, { width: '85%' }]} />
              </View>
            </View>
            
            <View style={styles.healthFactor}>
              <Text style={styles.healthFactorLabel}>Timing</Text>
              <View style={styles.healthFactorBar}>
                <View style={[styles.healthFactorFill, { width: '90%' }]} />
              </View>
            </View>
            
            <View style={styles.healthFactor}>
              <Text style={styles.healthFactorLabel}>Compliance</Text>
              <View style={styles.healthFactorBar}>
                <View style={[styles.healthFactorFill, { width: '87%' }]} />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E86AB',
  },
  exportButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeRangeContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    gap: 10,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  timeRangeButtonActive: {
    backgroundColor: '#2E86AB',
  },
  timeRangeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  timeRangeTextActive: {
    color: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  overviewContainer: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 10,
  },
  overviewCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  overviewNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E86AB',
  },
  overviewLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginTop: 20,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  chartSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  medicineStatsContainer: {
    marginTop: 10,
  },
  medicineStatItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  medicineStatLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  medicineColorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  medicineStatName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  medicineStatRight: {
    alignItems: 'flex-end',
  },
  medicineStatNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E86AB',
  },
  medicineStatPercentage: {
    fontSize: 12,
    color: '#666',
  },
  insightsContainer: {
    marginTop: 20,
    marginBottom: 30,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  insightCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  insightDescription: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  patternContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  patternItem: {
    alignItems: 'center',
  },
  patternLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  patternValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  healthScoreContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginTop: 20,
    marginBottom: 30,
    alignItems: 'center',
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  healthScoreTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  healthScoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 8,
    borderColor: '#2E86AB',
  },
  healthScoreNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2E86AB',
  },
  healthScoreLabel: {
    fontSize: 14,
    color: '#666',
  },
  healthScoreDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  healthFactors: {
    width: '100%',
  },
  healthFactor: {
    marginBottom: 15,
  },
  healthFactorLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  healthFactorBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  healthFactorFill: {
    height: '100%',
    backgroundColor: '#2E86AB',
    borderRadius: 4,
  },
});

export default AnalyticsScreen;