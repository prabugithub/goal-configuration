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
import { format, subDays, parseISO } from 'date-fns';

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
 * Habit Heatmap - Calendar style heatmap of goal completion
 */
const HabitHeatmap = ({ goals = {}, isMobile }) => {
  const heatmapData = useMemo(() => {
    if (!goals.daily) return [];

    const data = [];
    const now = new Date();

    // Last 42 days (6 weeks)
    for (let i = 41; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateKey = format(date, 'yyyy-MM-dd');
      const goalExists = goals.daily[dateKey] ? 1 : 0;

      data.push({
        date: dateKey,
        week: Math.floor(i / 7),
        day: i % 7,
        value: goalExists,
        displayDate: format(date, 'MMM d'),
      });
    }

    return data;
  }, [goals]);

  const getColor = (value) => {
    if (value === 0) return '#f0f0f0';
    return '#27AE60';
  };

  const cellSize = isMobile ? 16 : 20;
  const gap = 2;

  return (
    <Card>
      <CardContent>
        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 2 }}>
          Last 6 Weeks Activity Heatmap
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 2, overflowX: 'auto', pb: 1 }}>
          {/* Week labels */}
          <Box sx={{ width: isMobile ? 30 : 40 }} />
          {Array(6)
            .fill(0)
            .map((_, week) => (
              <Box
                key={week}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap,
                }}
              >
                <Typography variant="caption" sx={{ fontSize: isMobile ? '0.65rem' : '0.75rem', textAlign: 'center' }}>
                  W{week + 1}
                </Typography>
              </Box>
            ))}
        </Box>

        {/* Heatmap grid */}
        <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto' }}>
          {/* Day labels */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap, width: isMobile ? 30 : 40 }}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
              <Box
                key={day}
                sx={{
                  height: cellSize,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: isMobile ? '0.6rem' : '0.7rem',
                  fontWeight: 'bold',
                }}
              >
                {day.slice(0, 1)}
              </Box>
            ))}
          </Box>

          {/* Heatmap cells */}
          {Array(6)
            .fill(0)
            .map((_, week) => (
              <Box
                key={week}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap,
                }}
              >
                {Array(7)
                  .fill(0)
                  .map((_, day) => {
                    const cellIndex = week * 7 + day;
                    const cell = heatmapData[cellIndex];
                    return (
                      <Box
                        key={`${week}-${day}`}
                        title={cell?.displayDate}
                        sx={{
                          width: cellSize,
                          height: cellSize,
                          backgroundColor: cell ? getColor(cell.value) : '#f0f0f0',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          border: cell && cell.value === 1 ? '1px solid #27AE60' : '1px solid #ddd',
                          transition: 'all 0.2s',
                          '&:hover': {
                            transform: 'scale(1.1)',
                            boxShadow: '0 0 4px rgba(0,0,0,0.1)',
                          },
                        }}
                      />
                    );
                  })}
              </Box>
            ))}
        </Box>

        {/* Legend */}
        <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, backgroundColor: '#f0f0f0', borderRadius: '2px' }} />
            <Typography variant="caption">No activity</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, backgroundColor: '#27AE60', borderRadius: '2px' }} />
            <Typography variant="caption">Goal completed</Typography>
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
