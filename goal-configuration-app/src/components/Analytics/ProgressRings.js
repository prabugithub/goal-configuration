import React, { useMemo, useState } from 'react';
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
  IconButton,
  ButtonGroup,
  Button,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { format, subWeeks, subMonths, subQuarters, subYears, startOfWeek, startOfMonth, startOfQuarter, startOfYear, addWeeks, addMonths, addQuarters, addYears } from 'date-fns';

/**
 * ProgressRings - Circular progress indicators for different time periods
 * Shows: Weekly, Monthly, Quarterly, Yearly completion with trend arrows
 * Features:
 * - SVG circular progress rings
 * - Smooth animations
 * - Status indicators
 * - Trend visualization
 * - Time navigation (view previous periods)
 * - Responsive design
 */
export const ProgressRings = ({ metrics, goals = {} }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [timeOffset, setTimeOffset] = useState({
    weekly: 0,
    monthly: 0,
    quarterly: 0,
    yearly: 0,
  });

  const getDateLabel = (period, offset) => {
    const now = new Date();
    let targetDate;

    switch(period) {
      case 'weekly':
        targetDate = subWeeks(now, offset);
        return offset === 0 ? 'This Week' : format(startOfWeek(targetDate), 'MMM d');
      case 'monthly':
        targetDate = subMonths(now, offset);
        return offset === 0 ? 'This Month' : format(startOfMonth(targetDate), 'MMM yyyy');
      case 'quarterly':
        targetDate = subQuarters(now, offset);
        const quarter = Math.floor(targetDate.getMonth() / 3) + 1;
        return offset === 0 ? 'This Quarter' : `Q${quarter} ${targetDate.getFullYear()}`;
      case 'yearly':
        targetDate = subYears(now, offset);
        return offset === 0 ? 'This Year' : targetDate.getFullYear().toString();
      default:
        return '';
    }
  };

  const progressData = useMemo(() => {
    if (!metrics) return null;

    const weeklyData = metrics.getPeriodCompletion('daily', 'week', timeOffset.weekly);
    const monthlyData = metrics.getPeriodCompletion('weekly', 'month', timeOffset.monthly);
    const quarterlyData = metrics.getPeriodCompletion('monthly', 'quarter', timeOffset.quarterly);
    const yearlyData = metrics.getPeriodCompletion('quarterly', 'year', timeOffset.yearly);

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
        label: getDateLabel('weekly', timeOffset.weekly),
        emoji: '🌅',
        color: '#3498DB',
        period: 'weekly',
        offset: timeOffset.weekly,
      },
      monthly: {
        percentage: monthlyData.percentage,
        completed: monthlyData.completed,
        total: monthlyData.total,
        trend: monthlyTrend.direction,
        trendPercent: monthlyTrend.percentage,
        label: getDateLabel('monthly', timeOffset.monthly),
        emoji: '📅',
        color: '#9B59B6',
        period: 'monthly',
        offset: timeOffset.monthly,
      },
      quarterly: {
        percentage: quarterlyData.percentage,
        completed: quarterlyData.completed,
        total: quarterlyData.total,
        trend: quarterlyTrend.direction,
        trendPercent: quarterlyTrend.percentage,
        label: getDateLabel('quarterly', timeOffset.quarterly),
        emoji: '📊',
        color: '#E67E22',
        period: 'quarterly',
        offset: timeOffset.quarterly,
      },
      yearly: {
        percentage: yearlyData.percentage,
        completed: yearlyData.completed,
        total: yearlyData.total,
        trend: yearlyTrend.direction,
        trendPercent: yearlyTrend.percentage,
        label: getDateLabel('yearly', timeOffset.yearly),
        emoji: '🎯',
        color: '#27AE60',
        period: 'yearly',
        offset: timeOffset.yearly,
      },
    };
  }, [metrics, timeOffset]);

  const handleNavigation = (period, direction) => {
    setTimeOffset(prev => ({
      ...prev,
      [period]: Math.max(0, prev[period] + direction),
    }));
  };

  if (!progressData) return null;

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant={isMobile ? 'h6' : 'h5'} sx={{ fontWeight: 'bold', mb: 2 }}>
        📈 Progress Rings
      </Typography>

      <Grid container spacing={isMobile ? 1 : 2}>
        {Object.entries(progressData).map(([key, data]) => (
          <Grid item xs={6} sm={6} md={3} key={key}>
            <ProgressRingCard
              {...data}
              isMobile={isMobile}
              onNavigate={handleNavigation}
            />
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
  period,
  offset,
  onNavigate,
}) => {
  const radius = isMobile ? 35 : 45;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (percentage / 100) * circumference;

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
        {/* Header with Navigation */}
        <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <IconButton
            size="small"
            onClick={() => onNavigate(period, 1)}
            sx={{ p: 0.25 }}
          >
            <ChevronLeftIcon fontSize="small" />
          </IconButton>

          <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: isMobile ? '0.75rem' : '0.85rem', textAlign: 'center', flex: 1 }}>
            {emoji} {label}
          </Typography>

          <IconButton
            size="small"
            onClick={() => onNavigate(period, -1)}
            disabled={offset === 0}
            sx={{ p: 0.25 }}
          >
            <ChevronRightIcon fontSize="small" />
          </IconButton>
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
                strokeDashoffset={progressOffset}
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
