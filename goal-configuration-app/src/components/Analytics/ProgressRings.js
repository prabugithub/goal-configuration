import React, { useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Grid,
  LinearProgress,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

/**
 * ProgressRings - Circular progress indicators for different time periods
 * Shows: Weekly, Monthly, Quarterly, Yearly completion with trend arrows
 * Features:
 * - SVG circular progress rings
 * - Smooth animations
 * - Status indicators
 * - Trend visualization
 * - Responsive design
 */
export const ProgressRings = ({ metrics, goals = {} }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const progressData = useMemo(() => {
    if (!metrics) return null;

    const weeklyData = metrics.getPeriodCompletion('daily', 'week');
    const monthlyData = metrics.getPeriodCompletion('weekly', 'month');
    const quarterlyData = metrics.getPeriodCompletion('monthly', 'quarter');
    const yearlyData = metrics.getPeriodCompletion('quarterly', 'year');

    const weeklyTrend = metrics.getTrend('daily', 7);
    const monthlyTrend = metrics.getTrend('weekly', 30);
    const quarterlyTrend = metrics.getTrend('monthly', 90);
    const yearlyTrend = metrics.getTrend('quarterly', 365);

    return {
      weekly: {
        percentage: weeklyData.percentage,
        completed: weeklyData.completed,
        total: weeklyData.total,
        trend: weeklyTrend.direction,
        trendPercent: weeklyTrend.percentage,
        label: 'This Week',
        emoji: '🌅',
        color: '#3498DB',
      },
      monthly: {
        percentage: monthlyData.percentage,
        completed: monthlyData.completed,
        total: monthlyData.total,
        trend: monthlyTrend.direction,
        trendPercent: monthlyTrend.percentage,
        label: 'This Month',
        emoji: '📅',
        color: '#9B59B6',
      },
      quarterly: {
        percentage: quarterlyData.percentage,
        completed: quarterlyData.completed,
        total: quarterlyData.total,
        trend: quarterlyTrend.direction,
        trendPercent: quarterlyTrend.percentage,
        label: 'This Quarter',
        emoji: '📊',
        color: '#E67E22',
      },
      yearly: {
        percentage: yearlyData.percentage,
        completed: yearlyData.completed,
        total: yearlyData.total,
        trend: yearlyTrend.direction,
        trendPercent: yearlyTrend.percentage,
        label: 'This Year',
        emoji: '🎯',
        color: '#27AE60',
      },
    };
  }, [metrics]);

  if (!progressData) return null;

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant={isMobile ? 'h6' : 'h5'} sx={{ fontWeight: 'bold', mb: 2 }}>
        📈 Progress Rings
      </Typography>

      <Grid container spacing={isMobile ? 1 : 2}>
        {Object.entries(progressData).map(([key, data]) => (
          <Grid item xs={6} sm={6} md={3} key={key}>
            <ProgressRingCard {...data} isMobile={isMobile} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

/**
 * Individual Progress Ring Card
 */
const ProgressRingCard = ({
  percentage,
  completed,
  total,
  trend,
  trendPercent,
  label,
  emoji,
  color,
  isMobile,
}) => {
  const radius = isMobile ? 35 : 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUpIcon sx={{ fontSize: 16, color: '#27AE60' }} />;
    if (trend === 'down') return <TrendingDownIcon sx={{ fontSize: 16, color: '#E74C3C' }} />;
    return <span style={{ fontSize: 12 }}>→</span>;
  };

  const getStatusColor = () => {
    if (percentage >= 85) return '#27AE60';
    if (percentage >= 70) return '#3498DB';
    if (percentage >= 50) return '#F39C12';
    return '#E74C3C';
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ p: isMobile ? 1 : 1.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ mb: 1.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: isMobile ? '0.8rem' : '0.9rem' }}>
            {emoji} {label}
          </Typography>
        </Box>

        {/* SVG Circular Progress */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
          <Box sx={{ position: 'relative', width: isMobile ? 100 : 140, height: isMobile ? 100 : 140 }}>
            <svg width="100%" height="100%" viewBox={`0 0 ${radius * 2 + 20} ${radius * 2 + 20}`}>
              {/* Background circle */}
              <circle
                cx={radius + 10}
                cy={radius + 10}
                r={radius}
                fill="none"
                stroke="#f0f0f0"
                strokeWidth={isMobile ? 3 : 4}
              />
              {/* Progress circle */}
              <circle
                cx={radius + 10}
                cy={radius + 10}
                r={radius}
                fill="none"
                stroke={getStatusColor()}
                strokeWidth={isMobile ? 3 : 4}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                style={{
                  transition: 'stroke-dashoffset 0.8s ease-in-out',
                  transform: 'rotate(-90deg)',
                  transformOrigin: `${radius + 10}px ${radius + 10}px`,
                }}
              />
            </svg>

            {/* Center text */}
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 'bold',
                  fontSize: isMobile ? '1.1rem' : '1.5rem',
                  color: getStatusColor(),
                }}
              >
                {Math.round(percentage)}%
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontSize: isMobile ? '0.65rem' : '0.75rem',
                  display: 'block',
                  color: 'textSecondary',
                }}
              >
                {completed}/{total}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Trend Indicator */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 0.5,
            mt: 0.5,
          }}
        >
          {getTrendIcon()}
          <Typography
            variant="caption"
            sx={{
              fontSize: isMobile ? '0.7rem' : '0.8rem',
              color: trend === 'up' ? '#27AE60' : trend === 'down' ? '#E74C3C' : '#666',
            }}
          >
            {trendPercent > 0 && '+'}
            {trendPercent}%
          </Typography>
        </Box>

        {/* Status Label */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
          <Chip
            label={getStatusLabel(percentage)}
            size="small"
            sx={{
              backgroundColor: getStatusColor(),
              color: 'white',
              fontWeight: 'bold',
              fontSize: isMobile ? '0.65rem' : '0.75rem',
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

const getStatusLabel = (percentage) => {
  if (percentage >= 85) return 'Excellent';
  if (percentage >= 70) return 'Good';
  if (percentage >= 50) return 'Fair';
  return 'Low';
};

export default ProgressRings;
