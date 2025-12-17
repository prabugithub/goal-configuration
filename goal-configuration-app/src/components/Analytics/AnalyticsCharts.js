import React, { useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Tabs,
  Tab,
  IconButton,
} from '@mui/material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Area,
  AreaChart,
} from 'recharts';
import { format, subDays, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths } from 'date-fns';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

/**
 * AnalyticsCharts - Advanced visualization of goal progress
 * Features:
 * - Completion trend line chart
 * - Weekly breakdown bar chart
 * - Habit heatmap
 * - Multi-period views
 * - Responsive to screen size
 */
export const AnalyticsCharts = ({ metrics, goals = {} }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [chartTab, setChartTab] = useState(0);

  if (!metrics) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant={isMobile ? 'h6' : 'h5'} sx={{ fontWeight: 'bold', mb: 2 }}>
        📊 Analytics & Trends
      </Typography>

      <Tabs
        value={chartTab}
        onChange={(e, newVal) => setChartTab(newVal)}
        variant={isMobile ? 'scrollable' : 'standard'}
        scrollButtonsDisplay={isMobile ? 'auto' : 'off'}
        sx={{ mb: 2, borderBottom: `1px solid ${theme.palette.divider}` }}
      >
        <Tab label="📈 Trend" />
        <Tab label="📊 Weekly" />
        <Tab label="🔥 Heatmap" />
        <Tab label="⏰ Habits" />
      </Tabs>

      <Box sx={{ mt: 2 }}>
        {chartTab === 0 && <CompletionTrendChart metrics={metrics} isMobile={isMobile} />}
        {chartTab === 1 && <WeeklyBreakdownChart goals={goals} isMobile={isMobile} />}
        {chartTab === 2 && <HabitHeatmap goals={goals} isMobile={isMobile} />}
        {chartTab === 3 && <HabitCompletionChart goals={goals} metrics={metrics} isMobile={isMobile} />}
      </Box>
    </Box>
  );
};

/**
 * Completion Trend Chart - Line chart showing completion % over 30 days
 */
const CompletionTrendChart = ({ metrics, isMobile }) => {
  const trendData = useMemo(() => {
    const trend = metrics.getTrend('daily', 30);
    if (!trend.data) return [];

    return trend.data.map((item) => ({
      date: format(parseISO(item.date), isMobile ? 'MM/dd' : 'MMM dd'),
      completion: item.completed * 100 / 30, // Rough estimate
      fullDate: item.date,
    }));
  }, [metrics, isMobile]);

  return (
    <Card>
      <CardContent>
        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 2 }}>
          Last 30 Days Completion Trend
        </Typography>
        <ResponsiveContainer width="100%" height={isMobile ? 200 : 300}>
          <AreaChart data={trendData}>
            <defs>
              <linearGradient id="colorCompletion" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3498DB" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3498DB" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="date" tick={{ fontSize: isMobile ? 10 : 12 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: isMobile ? 10 : 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0,0,0,0.8)',
                border: 'none',
                borderRadius: '4px',
                color: '#fff',
              }}
            />
            <Area
              type="monotone"
              dataKey="completion"
              stroke="#3498DB"
              fillOpacity={1}
              fill="url(#colorCompletion)"
              isAnimationActive={true}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

/**
 * Weekly Breakdown - Bar chart showing daily goals for current week
 */
const WeeklyBreakdownChart = ({ goals = {}, isMobile }) => {
  const weeklyData = useMemo(() => {
    if (!goals.daily) return [];

    const data = [];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(monday.getDate() - monday.getDay() + 1);

    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(date.getDate() + i);
      const dateKey = format(date, 'yyyy-MM-dd');
      const goalExists = goals.daily[dateKey] ? 1 : 0;

      data.push({
        day: days[i],
        completed: goalExists,
        date: dateKey,
      });
    }

    return data;
  }, [goals]);

  const completionCount = weeklyData.reduce((sum, day) => sum + day.completed, 0);

  return (
    <Card>
      <CardContent>
        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
          This Week: {completionCount}/7 days tracked
        </Typography>
        <ResponsiveContainer width="100%" height={isMobile ? 200 : 250}>
          <BarChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="day" tick={{ fontSize: isMobile ? 10 : 12 }} />
            <YAxis domain={[0, 1]} hide />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0,0,0,0.8)',
                border: 'none',
                color: '#fff',
              }}
              formatter={(value) => [value ? '✓ Completed' : '✗ Skipped', 'Status']}
            />
            <Bar dataKey="completed" fill="#27AE60" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

/**
 * Habit Heatmap - Month-wise calendar heatmap with navigation
 */
const HabitHeatmap = ({ goals = {}, isMobile }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const heatmapData = useMemo(() => {
    if (!goals.daily) return [];

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    return daysInMonth.map(date => {
      const dateKey = format(date, 'yyyy-MM-dd');
      const dailyGoal = goals.daily[dateKey];
      const completion = dailyGoal?.performance?.completion || 0;

      return {
        date: dateKey,
        dateObj: date,
        day: date.getDate(),
        dayOfWeek: date.getDay(), // 0 = Sunday, 1 = Monday, etc.
        value: dailyGoal ? 1 : 0,
        completion: completion,
        displayDate: format(date, 'MMM d'),
      };
    });
  }, [goals, currentMonth]);

  const getColor = (value, completion) => {
    if (value === 0) return '#f0f0f0'; // No data
    if (completion >= 80) return '#27AE60'; // Green for high completion
    if (completion >= 60) return '#52C77A'; // Light green
    if (completion >= 40) return '#FFA726'; // Orange
    if (completion >= 20) return '#FF7043'; // Light red
    return '#E74C3C'; // Red for low completion
  };

  const handlePrevMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  const canGoNext = () => {
    const nextMonth = addMonths(currentMonth, 1);
    return nextMonth <= new Date();
  };

  const cellSize = isMobile ? 32 : 40;
  const gap = isMobile ? 4 : 6;

  // Calculate stats for the month
  const totalDays = heatmapData.length;
  const daysWithData = heatmapData.filter(d => d.value === 1).length;
  const avgCompletion = daysWithData > 0
    ? Math.round(heatmapData.reduce((sum, d) => sum + d.completion, 0) / daysWithData)
    : 0;

  // Group days by week for calendar layout
  const weeks = [];
  let currentWeek = [];
  const firstDayOfWeek = heatmapData[0]?.dayOfWeek || 0;

  // Add empty cells for days before month starts
  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push(null);
  }

  heatmapData.forEach((day, idx) => {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  // Add remaining days to last week
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  return (
    <Card>
      <CardContent>
        {/* Month navigation header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <IconButton onClick={handlePrevMonth} size="small">
            <ChevronLeftIcon />
          </IconButton>
          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
            {format(currentMonth, 'MMMM yyyy')}
          </Typography>
          <IconButton onClick={handleNextMonth} size="small" disabled={!canGoNext()}>
            <ChevronRightIcon />
          </IconButton>
        </Box>

        {/* Stats */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {daysWithData}/{totalDays} days tracked
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Avg: {avgCompletion}% completion
          </Typography>
        </Box>

        {/* Day of week headers */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap, mb: 1 }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <Box
              key={day}
              sx={{
                textAlign: 'center',
                fontSize: isMobile ? '0.65rem' : '0.75rem',
                fontWeight: 'bold',
                color: 'text.secondary',
              }}
            >
              {day.slice(0, isMobile ? 1 : 3)}
            </Box>
          ))}
        </Box>

        {/* Calendar grid */}
        {weeks.map((week, weekIdx) => (
          <Box key={weekIdx} sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap, mb: gap }}>
            {week.map((day, dayIdx) => (
              <Box
                key={`${weekIdx}-${dayIdx}`}
                title={day ? `${day.displayDate}: ${day.value ? day.completion + '%' : 'No data'}` : ''}
                sx={{
                  width: cellSize,
                  height: cellSize,
                  backgroundColor: day ? getColor(day.value, day.completion) : 'transparent',
                  borderRadius: '6px',
                  cursor: day ? 'pointer' : 'default',
                  border: day ? `1px solid ${day.value ? '#ccc' : '#e0e0e0'}` : 'none',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: isMobile ? '0.65rem' : '0.75rem',
                  fontWeight: day?.value ? 'bold' : 'normal',
                  color: day?.completion >= 60 ? '#fff' : '#333',
                  '&:hover': day ? {
                    transform: 'scale(1.15)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    zIndex: 1,
                  } : {},
                }}
              >
                {day?.day}
              </Box>
            ))}
          </Box>
        ))}

        {/* Legend */}
        <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', fontSize: isMobile ? '0.7rem' : '0.75rem' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 12, height: 12, backgroundColor: '#f0f0f0', borderRadius: '2px', border: '1px solid #ddd' }} />
            <Typography variant="caption">No data</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 12, height: 12, backgroundColor: '#E74C3C', borderRadius: '2px' }} />
            <Typography variant="caption">&lt;20%</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 12, height: 12, backgroundColor: '#FFA726', borderRadius: '2px' }} />
            <Typography variant="caption">40-60%</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 12, height: 12, backgroundColor: '#27AE60', borderRadius: '2px' }} />
            <Typography variant="caption">80%+</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

/**
 * Habit Completion Chart - Tracks specific habit completion rates
 */
const HabitCompletionChart = ({ goals = {}, metrics, isMobile }) => {
  const habitData = useMemo(() => {
    if (!metrics) return [];

    // Get completion rates for common fields
    const habits = [
      { name: 'Daily Goals', section: 'planning', field: 'goals', emoji: '🎯' },
      { name: 'Evaluation', section: 'evaluation', field: 'whatWentWell', emoji: '✨' },
      { name: 'Tasks', section: 'taskSplitUp', field: 'tasks', emoji: '✅' },
    ];

    return habits
      .map((habit) => {
        const completion = metrics.getHabitCompletion('daily', habit.section, habit.field, 30);
        return {
          name: habit.name,
          emoji: habit.emoji,
          completion,
        };
      })
      .filter((h) => h.completion > 0);
  }, [metrics]);

  if (habitData.length === 0) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 3 }}>
          <Typography color="textSecondary">No habit data available yet</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 2 }}>
          Habit Completion Rate (Last 30 Days)
        </Typography>
        <ResponsiveContainer width="100%" height={isMobile ? 200 : 250}>
          <BarChart data={habitData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: isMobile ? 10 : 12 }} />
            <YAxis dataKey="emoji" type="category" width={isMobile ? 20 : 30} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0,0,0,0.8)',
                border: 'none',
                color: '#fff',
              }}
              formatter={(value) => `${Math.round(value)}%`}
            />
            <Bar dataKey="completion" fill="#9B59B6" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default AnalyticsCharts;
