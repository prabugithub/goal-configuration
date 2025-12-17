import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Stack,
  useMediaQuery,
  useTheme,
  Button,
  Chip,
  LinearProgress,
  CircularProgress,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { format, startOfWeek, startOfMonth, startOfQuarter, startOfYear } from 'date-fns';
import { useMetrics } from '../../hooks/useMetrics';

/**
 * Dashboard - Comprehensive overview of all goals
 * Mobile-first responsive design
 * Shows: Quick stats, goal cards by period, recent entries
 */
export const Dashboard = ({ goals = {}, config = {} }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const metrics = useMetrics(goals, config);

  const [stats, setStats] = useState({
    weeklyCompletion: 0,
    monthlyCompletion: 0,
    quarterlyCompletion: 0,
    yearlyCompletion: 0,
    streak: 0,
  });

  useEffect(() => {
    console.log('Dashboard received goals:', goals);

    // Calculate metrics
    const weeklyStats = metrics.getPeriodCompletion('daily', 'week');
    const monthlyStats = metrics.getPeriodCompletion('weekly', 'month');
    const quarterlyStats = metrics.getPeriodCompletion('monthly', 'quarter');
    const yearlyStats = metrics.getPeriodCompletion('quarterly', 'year');
    const streak = metrics.getStreak('daily');

    console.log('Calculated stats:', {
      weeklyStats,
      monthlyStats,
      quarterlyStats,
      yearlyStats,
      streak,
    });

    setStats({
      weeklyCompletion: weeklyStats.percentage,
      monthlyCompletion: monthlyStats.percentage,
      quarterlyCompletion: quarterlyStats.percentage,
      yearlyCompletion: yearlyStats.percentage,
      streak,
    });
  }, [goals, metrics]);

  const now = new Date();
  const weekStart = format(startOfWeek(now, { weekStartsOn: 1 }), 'MMM dd');
  const monthStart = format(startOfMonth(now), 'MMMM');
  const quarterStart = format(startOfQuarter(now), 'QQQ yyyy');
  const yearStart = format(startOfYear(now), 'yyyy');

  return (
    <Container maxWidth="sm" sx={{ pb: 4, px: isMobile ? 1 : 2 }}>
      {/* Quick Stats Section */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant={isMobile ? 'h6' : 'h5'}
          sx={{ fontWeight: 'bold', mb: 2 }}
        >
          📊 Overview
        </Typography>

        <Grid container spacing={1}>
          {/* Streak Card */}
          <Grid item xs={6} sm={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', p: isMobile ? 1.5 : 2 }}>
                <LocalFireDepartmentIcon
                  sx={{ fontSize: 32, color: '#FF6B6B', mb: 1 }}
                />
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  {stats.streak}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Day Streak
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* This Week Card */}
          <Grid item xs={6} sm={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', p: isMobile ? 1.5 : 2 }}>
                <CheckCircleIcon
                  sx={{ fontSize: 32, color: '#4CAF50', mb: 1 }}
                />
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  {stats.weeklyCompletion}%
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  This Week
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Period Cards Section */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant={isMobile ? 'h6' : 'h5'}
          sx={{ fontWeight: 'bold', mb: 2 }}
        >
          📅 Progress by Period
        </Typography>

        <Stack spacing={2}>
          {/* Weekly Progress */}
          <PeriodCard
            period="This Week"
            dates={weekStart}
            completion={stats.weeklyCompletion}
            icon="🌅"
            color="#3498DB"
            isMobile={isMobile}
          />

          {/* Monthly Progress */}
          {config.levels?.monthly && (
            <PeriodCard
              period="This Month"
              dates={monthStart}
              completion={stats.monthlyCompletion}
              icon="📅"
              color="#9B59B6"
              isMobile={isMobile}
            />
          )}

          {/* Quarterly Progress */}
          {config.levels?.quarterly && (
            <PeriodCard
              period="This Quarter"
              dates={quarterStart}
              completion={stats.quarterlyCompletion}
              icon="📊"
              color="#E67E22"
              isMobile={isMobile}
            />
          )}

          {/* Yearly Progress */}
          {config.levels?.yearly && (
            <PeriodCard
              period="This Year"
              dates={yearStart}
              completion={stats.yearlyCompletion}
              icon="🎯"
              color="#27AE60"
              isMobile={isMobile}
            />
          )}
        </Stack>
      </Box>

      {/* Recent Goals Section */}
      {/* <Box sx={{ mb: 3 }}>
        <Typography
          variant={isMobile ? 'h6' : 'h5'}
          sx={{ fontWeight: 'bold', mb: 2 }}
        >
          📌 Recent Entries
        </Typography>

        <RecentEntriesTimeline goals={goals} isMobile={isMobile} />
      </Box> */}

      {/* Insights Section */}
      <Box>
        <Typography
          variant={isMobile ? 'h6' : 'h5'}
          sx={{ fontWeight: 'bold', mb: 2 }}
        >
          💡 Insights
        </Typography>

        <InsightsCards metrics={metrics} isMobile={isMobile} />
      </Box>
    </Container>
  );
};

/**
 * Period Progress Card Component
 */
const PeriodCard = ({ period, dates, completion, icon, color, isMobile }) => {
  const getStatus = (completion) => {
    if (completion >= 85) return { label: 'Excellent', color: '#27AE60' };
    if (completion >= 70) return { label: 'Good', color: '#3498DB' };
    if (completion >= 50) return { label: 'Fair', color: '#F39C12' };
    return { label: 'Low', color: '#E74C3C' };
  };

  const status = getStatus(completion);

  return (
    <Card>
      <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: isMobile ? '1rem' : '1.1rem' }}>
              {icon} {period}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {dates}
            </Typography>
          </Box>
          <Chip
            label={status.label}
            size="small"
            sx={{
              backgroundColor: status.color,
              color: 'white',
              fontWeight: 'bold',
            }}
          />
        </Box>

        <Box sx={{ mb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2">{completion}% Complete</Typography>
            <TrendingUpIcon sx={{ fontSize: 16, color: completion > 60 ? '#27AE60' : '#E74C3C' }} />
          </Box>
          <LinearProgress
            variant="determinate"
            value={completion}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: '#e0e0e0',
              '& .MuiLinearProgress-bar': {
                backgroundColor: color,
                borderRadius: 4,
              },
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

/**
 * Recent Entries Timeline Component
 */
const RecentEntriesTimeline = ({ goals = {}, isMobile }) => {
  const [recentEntries, setRecentEntries] = useState([]);

  useEffect(() => {
    // Collect all recent entries across all levels
    const entries = [];

    Object.entries(goals).forEach(([level, levelGoals]) => {
      if (!levelGoals) return;

      Object.entries(levelGoals).forEach(([identifier, goal]) => {
        if (!goal || !Object.keys(goal).length) return;

        entries.push({
          date: identifier,
          level,
          goal,
          timestamp: new Date(identifier),
        });
      });
    });

    // Sort by date (newest first) and take top 10
    entries.sort((a, b) => b.timestamp - a.timestamp);
    setRecentEntries(entries.slice(0, 10));
  }, [goals]);

  if (recentEntries.length === 0) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 3 }}>
          <Typography color="textSecondary">No entries yet. Start tracking!</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Stack spacing={1}>
      {recentEntries.map((entry, idx) => (
        <Card key={idx}>
          <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  📝 {entry.date}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {entry.level.charAt(0).toUpperCase() + entry.level.slice(1)}
                </Typography>
              </Box>
              <Chip
                label={`${Object.keys(entry.goal).length} sections`}
                size="small"
                variant="outlined"
              />
            </Box>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
};

/**
 * Insights Cards Component
 */
const InsightsCards = ({ metrics, isMobile }) => {
  const insights = metrics.getInsights();

  if (insights.length === 0) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 2 }}>
          <Typography color="textSecondary">Add more goals to see insights!</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Stack spacing={1}>
      {insights.slice(0, 3).map((insight, idx) => (
        <Card
          key={idx}
          sx={{
            borderLeft: `4px solid ${getInsightColor(insight.type)}`,
          }}
        >
          <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              {getInsightEmoji(insight.type)} {insight.title}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {insight.message}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
};

const getInsightColor = (type) => {
  const colors = {
    positive: '#27AE60',
    warning: '#E67E22',
    achievement: '#9B59B6',
    neutral: '#3498DB',
  };
  return colors[type] || colors.neutral;
};

const getInsightEmoji = (type) => {
  const emojis = {
    positive: '✨',
    warning: '⚠️',
    achievement: '🏆',
    neutral: '💡',
  };
  return emojis[type] || emojis.neutral;
};

export default Dashboard;
