import React, { useState, useEffect, useMemo } from 'react';
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
  IconButton,
  Tooltip,
  ClickAwayListener,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { format, startOfWeek, startOfMonth, startOfQuarter, startOfYear, endOfMonth, eachDayOfInterval, addMonths, subMonths } from 'date-fns';
import { useMetrics } from '../../hooks/useMetrics';
import { ProgressRings } from '../Analytics/ProgressRings';
import { ActivityDashboard } from '../Analytics/ActivityDashboard';

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

      {/* Progress Rings - Top Section */}
      <ProgressRings metrics={metrics} goals={goals} />

      {/* ── NEW: Activity Dashboard (rituals, deep work, rating) ── */}
      <ActivityDashboard goals={goals} />

      {/* Activity Heatmap Section */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant={isMobile ? 'h6' : 'h5'}
          sx={{ fontWeight: 'bold', mb: 2 }}
        >
          🔥 Activity Heatmap
        </Typography>

        <MonthHeatmap goals={goals} isMobile={isMobile} />
      </Box>

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
      {/* Period Cards Section */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant={isMobile ? 'h6' : 'h5'}
          sx={{ fontWeight: 'bold', mt: 2 }}
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

// ─── Heatmap mode definitions ─────────────────────────────────────────────────
const HEATMAP_MODES = [
  {
    key: 'goal',
    label: '🎯',
    title: 'Goal %',
    getValue: (day) => {
      if (!day) return null;
      let v = day?.performance?.completion;
      if (v == null) return null;
      if (typeof v === 'object') v = v.completion ?? 0;
      return Number(v);
    },
    getColor: (v) => {
      if (v >= 80) return '#27AE60';
      if (v >= 60) return '#52C77A';
      if (v >= 40) return '#FFA726';
      if (v >= 20) return '#FF7043';
      return '#E74C3C';
    },
    legend: [
      { color: '#E74C3C', label: '<20%' },
      { color: '#FFA726', label: '40–60%' },
      { color: '#52C77A', label: '60–80%' },
      { color: '#27AE60', label: '80%+' },
    ],
    unit: '%',
    textThreshold: 60,   // value above which we use white text
  },
  {
    key: 'meditation',
    label: '🧘',
    title: 'Meditation',
    getValue: (day) => {
      if (!day) return null;
      const v = day?.rituals?.meditation;
      return typeof v === 'number' && v > 0 ? v : null;
    },
    getColor: (v) => {
      if (v >= 60) return '#5B21B6';
      if (v >= 30) return '#7C3AED';
      if (v >= 15) return '#A78BFA';
      return '#DDD6FE';
    },
    legend: [
      { color: '#DDD6FE', label: '<15m' },
      { color: '#A78BFA', label: '15–30m' },
      { color: '#7C3AED', label: '30–60m' },
      { color: '#5B21B6', label: '60m+' },
    ],
    unit: 'm',
    textThreshold: 30,
  },
  {
    key: 'exercise',
    label: '🏃',
    title: 'Exercise',
    getValue: (day) => {
      if (!day) return null;
      const v = day?.rituals?.excercise;   // stored with typo
      return typeof v === 'number' && v > 0 ? v : null;
    },
    getColor: (v) => {
      if (v >= 60) return '#065F46';
      if (v >= 30) return '#059669';
      if (v >= 15) return '#34D399';
      return '#A7F3D0';
    },
    legend: [
      { color: '#A7F3D0', label: '<15m' },
      { color: '#34D399', label: '15–30m' },
      { color: '#059669', label: '30–60m' },
      { color: '#065F46', label: '60m+' },
    ],
    unit: 'm',
    textThreshold: 30,
  },
  {
    key: 'reading',
    label: '📖',
    title: 'Reading',
    getValue: (day) => {
      if (!day) return null;
      const v = day?.rituals?.reading;
      return typeof v === 'number' && v > 0 ? v : null;
    },
    getColor: (v) => {
      if (v >= 60) return '#1E40AF';
      if (v >= 30) return '#2563EB';
      if (v >= 15) return '#60A5FA';
      return '#BFDBFE';
    },
    legend: [
      { color: '#BFDBFE', label: '<15m' },
      { color: '#60A5FA', label: '15–30m' },
      { color: '#2563EB', label: '30–60m' },
      { color: '#1E40AF', label: '60m+' },
    ],
    unit: 'm',
    textThreshold: 30,
  },
  {
    key: 'deepwork',
    label: '⏱',
    title: 'Deep Work',
    getValue: (day) => {
      if (!day) return null;
      const v = day?.performance?.deepwork;
      return typeof v === 'number' && v > 0 ? v : null;
    },
    getColor: (v) => {
      if (v >= 240) return '#991B1B';
      if (v >= 120) return '#DC2626';
      if (v >= 60) return '#F87171';
      return '#FECACA';
    },
    legend: [
      { color: '#FECACA', label: '<1h' },
      { color: '#F87171', label: '1–2h' },
      { color: '#DC2626', label: '2–4h' },
      { color: '#991B1B', label: '4h+' },
    ],
    unit: 'm',
    textThreshold: 120,
  },
  {
    key: 'rating',
    label: '⭐',
    title: 'Day Rating',
    getValue: (day) => {
      if (!day) return null;
      const v = day?.ratings?.['day-rating'];
      return typeof v === 'number' ? v : null;
    },
    getColor: (v) => {
      if (v >= 9) return '#78350F';
      if (v >= 7) return '#D97706';
      if (v >= 5) return '#FCD34D';
      if (v >= 3) return '#FDE68A';
      return '#FEF3C7';
    },
    legend: [
      { color: '#FEF3C7', label: '1–2' },
      { color: '#FDE68A', label: '3–4' },
      { color: '#FCD34D', label: '5–6' },
      { color: '#D97706', label: '7–8' },
      { color: '#78350F', label: '9–10' },
    ],
    unit: '/10',
    textThreshold: 7,
  },
  {
    key: 'diet',
    label: '🥗',
    title: 'Diet',
    getValue: (day) => {
      if (!day) return null;
      const v = day?.rituals?.diet;
      if (!v) return null;
      const arr = Array.isArray(v) ? v : [v];
      return arr.includes('Yes') ? 1 : 0;
    },
    getColor: (v) => (v === 1 ? '#16A34A' : '#FCA5A5'),
    legend: [
      { color: '#FCA5A5', label: 'No' },
      { color: '#16A34A', label: 'Yes' },
    ],
    unit: '',
    textThreshold: 1,
  },
];

/**
 * fmtDuration – turn minutes into readable string for tooltip
 */
const fmtMin = (v, unit) => {
  if (unit === 'm') {
    const h = Math.floor(v / 60);
    const m = v % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  }
  if (unit === '/10') return `${v}/10`;
  if (unit === '') return v === 1 ? 'Yes' : 'No';
  return `${v}${unit}`;
};

/**
 * Month Heatmap - Calendar heatmap with month navigation + activity mode switcher
 */
const MonthHeatmap = ({ goals = {}, isMobile }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [modeKey, setModeKey] = useState('goal');

  const mode = HEATMAP_MODES.find((m) => m.key === modeKey) || HEATMAP_MODES[0];

  const heatmapData = useMemo(() => {
    if (!goals.daily) return [];

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    return daysInMonth.map(date => {
      const dateKey = format(date, 'yyyy-MM-dd');
      const dailyGoal = goals.daily[dateKey] || null;
      const rawValue = mode.getValue(dailyGoal);

      return {
        date: dateKey,
        dateObj: date,
        day: date.getDate(),
        dayOfWeek: date.getDay(),
        hasEntry: dailyGoal !== null,
        rawValue,
        displayDate: format(date, 'MMM d'),
      };
    });
  }, [goals, currentMonth, mode]);

  const handlePrevMonth = () => setCurrentMonth(prev => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));
  const canGoNext = () => addMonths(currentMonth, 1) <= new Date();

  const cellSize = isMobile ? 32 : 40;
  const gap = isMobile ? '4px' : '6px';

  // Month stats
  const totalDays = heatmapData.length;
  const daysWithData = heatmapData.filter(d => d.rawValue !== null).length;
  const avgValue = daysWithData > 0
    ? Math.round(heatmapData.filter(d => d.rawValue !== null).reduce((s, d) => s + d.rawValue, 0) / daysWithData)
    : 0;

  // Build calendar weeks
  const weeks = [];
  let currentWeek = [];
  const firstDayOfWeek = heatmapData[0]?.dayOfWeek || 0;
  for (let i = 0; i < firstDayOfWeek; i++) currentWeek.push(null);
  heatmapData.forEach(day => {
    currentWeek.push(day);
    if (currentWeek.length === 7) { weeks.push(currentWeek); currentWeek = []; }
  });
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) currentWeek.push(null);
    weeks.push(currentWeek);
  }

  return (
    <Card>
      <CardContent>

        {/* ── Month navigation header ─────────────────────────── */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <IconButton onClick={handlePrevMonth} size="small"><ChevronLeftIcon /></IconButton>
          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
            {format(currentMonth, 'MMMM yyyy')}
          </Typography>
          <IconButton onClick={handleNextMonth} size="small" disabled={!canGoNext()}><ChevronRightIcon /></IconButton>
        </Box>

        {/* ── Activity mode switcher ──────────────────────────── */}
        <Box sx={{ mb: 1.5, overflowX: 'auto', pb: 0.5 }}>
          <ToggleButtonGroup
            value={modeKey}
            exclusive
            onChange={(_, v) => { if (v) { setModeKey(v); setSelectedDate(null); } }}
            size="small"
            sx={{
              display: 'flex',
              flexWrap: 'nowrap',
              gap: 0.5,
              '& .MuiToggleButton-root': {
                border: '1px solid #e0e0e0',
                borderRadius: '20px !important',
                px: 1.5,
                py: 0.4,
                fontSize: isMobile ? '0.75rem' : '0.8rem',
                textTransform: 'none',
                fontWeight: 500,
                minWidth: 0,
                transition: 'all 0.15s',
              },
              '& .Mui-selected': {
                fontWeight: 'bold',
              },
            }}
          >
            {HEATMAP_MODES.map(m => (
              <ToggleButton key={m.key} value={m.key}>
                {m.label} {!isMobile && <span style={{ marginLeft: 4, fontSize: '0.72rem' }}>{m.title}</span>}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        {/* ── Stats row ───────────────────────────────────────── */}
        <Box sx={{ display: 'flex', gap: 2, mb: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            <strong>{daysWithData}</strong>/{totalDays} days with {mode.title} data
          </Typography>
          {daysWithData > 0 && (
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Avg: <strong>{fmtMin(avgValue, mode.unit)}</strong>
            </Typography>
          )}
        </Box>

        {/* ── Day-of-week headers ──────────────────────────────── */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap, mb: 1 }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <Box key={d} sx={{ textAlign: 'center', fontSize: isMobile ? '0.65rem' : '0.75rem', fontWeight: 'bold', color: 'text.secondary' }}>
              {d.slice(0, isMobile ? 1 : 3)}
            </Box>
          ))}
        </Box>

        {/* ── Calendar grid ───────────────────────────────────── */}
        {weeks.map((week, weekIdx) => (
          <Box key={weekIdx} sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap, mb: gap }}>
            {week.map((day, dayIdx) => {
              const isSelected = selectedDate === day?.date;
              const hasValue = day?.rawValue != null;
              const cellColor = hasValue ? mode.getColor(day.rawValue)
                : day?.hasEntry ? '#e8f5e9'   // entry exists but no value for this mode → light neutral
                  : 'transparent';
              const useWhiteText = hasValue && day.rawValue >= mode.textThreshold;

              const tooltipText = day
                ? hasValue
                  ? `${day.displayDate}: ${fmtMin(day.rawValue, mode.unit)}`
                  : day.hasEntry
                    ? `${day.displayDate}: no ${mode.title} logged`
                    : `${day.displayDate}: no entry`
                : '';

              return (
                <ClickAwayListener
                  key={`${weekIdx}-${dayIdx}`}
                  onClickAway={() => { if (isSelected) setSelectedDate(null); }}
                >
                  <Box>
                    <Tooltip
                      title={tooltipText}
                      open={isSelected}
                      onClose={() => setSelectedDate(null)}
                      disableFocusListener
                      disableHoverListener
                      disableTouchListener
                      arrow
                      placement="top"
                    >
                      <Box
                        onClick={() => { if (day) setSelectedDate(isSelected ? null : day.date); }}
                        sx={{
                          width: cellSize,
                          height: cellSize,
                          backgroundColor: cellColor,
                          borderRadius: '6px',
                          cursor: day ? 'pointer' : 'default',
                          border: isSelected
                            ? '2px solid #1a1a1a'
                            : day?.hasEntry
                              ? `1px solid ${hasValue ? 'rgba(0,0,0,0.15)' : '#c8e6c9'}`
                              : 'none',
                          transition: 'all 0.18s',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: isMobile ? '0.62rem' : '0.72rem',
                          fontWeight: hasValue ? 'bold' : 'normal',
                          color: useWhiteText ? '#fff' : '#333',
                          '&:hover': day ? {
                            transform: 'scale(1.18)',
                            boxShadow: '0 3px 10px rgba(0,0,0,0.18)',
                            zIndex: 2,
                          } : {},
                        }}
                      >
                        {day?.day}
                      </Box>
                    </Tooltip>
                  </Box>
                </ClickAwayListener>
              );
            })}
          </Box>
        ))}

        {/* ── Dynamic legend ───────────────────────────────────── */}
        <Box sx={{ mt: 2, display: 'flex', gap: 1.5, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 12, height: 12, backgroundColor: '#f0f0f0', borderRadius: '2px', border: '1px solid #ddd' }} />
            <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>No data</Typography>
          </Box>
          {mode.legend.map(({ color, label }) => (
            <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 12, height: 12, backgroundColor: color, borderRadius: '2px' }} />
              <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>{label}</Typography>
            </Box>
          ))}
        </Box>

      </CardContent>
    </Card>
  );
};

export default Dashboard;
