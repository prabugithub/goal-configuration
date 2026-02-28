import React, { useMemo, useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    useTheme,
    useMediaQuery,
    Chip,
    Avatar,
    Stack,
} from '@mui/material';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    Radar,
} from 'recharts';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import SelfImprovementIcon from '@mui/icons-material/SelfImprovement';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import TimerIcon from '@mui/icons-material/Timer';
import StarIcon from '@mui/icons-material/Star';
import BoltIcon from '@mui/icons-material/Bolt';

// ─── Colour palette for the charts ───────────────────────────────────────────
const COLORS = {
    meditation: '#7C3AED',   // purple
    exercise: '#059669',   // emerald
    reading: '#2563EB',   // blue
    deepWork: '#DC2626',   // red
    rating: '#F59E0B',   // amber
    energy: '#EC4899',   // pink
    goal: '#10B981',   // green
};

// Helper: convert minutes to a "Xh Ym" display string
const fmtDuration = (minutes) => {
    if (!minutes || minutes <= 0) return '—';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
};

// Helper: pull routine minutes from daily goal data
const getRitualValue = (dayData, field) => {
    const val = dayData?.rituals?.[field];
    return typeof val === 'number' ? val : 0;
};

const getDeepWork = (dayData) => {
    const val = dayData?.performance?.deepwork;
    return typeof val === 'number' ? val : 0;
};

const getGoalCompletion = (dayData) => {
    const val = dayData?.performance?.completion;
    if (val == null) return null;
    if (typeof val === 'object') return val.completion ?? null;
    return typeof val === 'number' ? val : null;
};

const getDayRating = (dayData) => {
    const val = dayData?.ratings?.['day-rating'];
    return typeof val === 'number' ? val : null;
};

const getEnergy = (dayData) => {
    const val = dayData?.performance?.energy;
    return typeof val === 'number' ? val : null;
};

/**
 * ActivityDashboard
 * Central hub for daily activity metrics: rituals, deep work, rating and goal comparison.
 */
export const ActivityDashboard = ({ goals = {} }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [rangeDays, setRangeDays] = useState(14);

    // ── Build time-series dataset ─────────────────────────────────────────────
    const chartData = useMemo(() => {
        if (!goals.daily) return [];

        const now = new Date();
        const start = subDays(now, rangeDays - 1);
        const interval = eachDayOfInterval({ start, end: now });

        return interval.map((date) => {
            const key = format(date, 'yyyy-MM-dd');
            const day = goals.daily[key] || null;
            const completion = getGoalCompletion(day);

            return {
                date: key,
                label: format(date, isMobile ? 'dd' : 'MMM dd'),
                meditation: getRitualValue(day, 'meditation'),
                exercise: getRitualValue(day, 'excercise'),   // note: stored as 'excercise'
                reading: getRitualValue(day, 'reading'),
                deepWork: getDeepWork(day),
                rating: getDayRating(day),
                energy: getEnergy(day),
                goal: completion,
                hasData: day !== null,
            };
        });
    }, [goals.daily, rangeDays, isMobile]);

    // ── Today & recent averages ───────────────────────────────────────────────
    const summaryStats = useMemo(() => {
        const todayKey = format(new Date(), 'yyyy-MM-dd');
        const today = goals.daily?.[todayKey] || null;

        const recentDays = chartData.filter((d) => d.hasData);
        const count = recentDays.length || 1;

        const avg = (key) =>
            Math.round(recentDays.reduce((s, d) => s + (d[key] || 0), 0) / count);

        const avgRating = recentDays.filter((d) => d.rating != null).length > 0
            ? (recentDays.filter((d) => d.rating != null)
                .reduce((s, d) => s + d.rating, 0) /
                recentDays.filter((d) => d.rating != null).length).toFixed(1)
            : '—';

        return {
            today: {
                meditation: getRitualValue(today, 'meditation'),
                exercise: getRitualValue(today, 'excercise'),
                reading: getRitualValue(today, 'reading'),
                deepWork: getDeepWork(today),
                rating: getDayRating(today),
                goal: getGoalCompletion(today),
            },
            avg: {
                meditation: avg('meditation'),
                exercise: avg('exercise'),
                reading: avg('reading'),
                deepWork: avg('deepWork'),
                rating: avgRating,
                goal: avg('goal'),
            },
        };
    }, [chartData, goals.daily]);

    return (
        <Box sx={{ mb: 3 }}>
            {/* Section header + range toggle */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <Typography variant={isMobile ? 'h6' : 'h5'} sx={{ fontWeight: 'bold' }}>
                    🏃 Daily Activities
                </Typography>
                {/* Custom pill range selector */}
                <Box sx={{ display: 'flex', gap: 0.5, p: 0.5, bgcolor: '#F1F5F9', borderRadius: '100px' }}>
                    {[7, 14, 30].map((d) => (
                        <Box
                            key={d}
                            onClick={() => setRangeDays(d)}
                            sx={{
                                px: 1.75,
                                py: 0.4,
                                borderRadius: '100px',
                                cursor: 'pointer',
                                userSelect: 'none',
                                fontSize: '0.78rem',
                                fontWeight: rangeDays === d ? 700 : 400,
                                color: rangeDays === d ? '#fff' : '#64748B',
                                bgcolor: rangeDays === d ? '#1E293B' : 'transparent',
                                boxShadow: rangeDays === d ? '0 1px 4px rgba(0,0,0,0.18)' : 'none',
                                transition: 'all 0.18s cubic-bezier(.4,0,.2,1)',
                                '&:hover': { color: rangeDays === d ? '#fff' : '#1E293B' },
                            }}
                        >
                            {d}d
                        </Box>
                    ))}
                </Box>
            </Box>

            {/* Today's quick snapshot cards */}
            <TodaySnapshot stats={summaryStats} isMobile={isMobile} rangeDays={rangeDays} />

            {/* Rituals duration comparison chart */}
            <RitualsChart chartData={chartData} isMobile={isMobile} />

            {/* Deep work + goal completion comparison */}
            <DeepWorkGoalChart chartData={chartData} isMobile={isMobile} />

            {/* Day rating trend */}
            <DayRatingChart chartData={chartData} isMobile={isMobile} />

            {/* Radar: current period averages */}
            <ActivityRadar summaryStats={summaryStats} isMobile={isMobile} />
        </Box>
    );
};

// ─── Today Snapshot ───────────────────────────────────────────────────────────
const METRIC_CARDS = [
    { key: 'meditation', label: 'Meditation', icon: <SelfImprovementIcon />, color: COLORS.meditation, unit: 'min' },
    { key: 'exercise', label: 'Exercise', icon: <FitnessCenterIcon />, color: COLORS.exercise, unit: 'min' },
    { key: 'reading', label: 'Reading', icon: <MenuBookIcon />, color: COLORS.reading, unit: 'min' },
    { key: 'deepWork', label: 'Deep Work', icon: <TimerIcon />, color: COLORS.deepWork, unit: 'min' },
    { key: 'rating', label: 'Day Rating', icon: <StarIcon />, color: COLORS.rating, unit: '/10', isRating: true },
    { key: 'goal', label: 'Goal %', icon: <BoltIcon />, color: COLORS.goal, unit: '%', isGoal: true },
];

const TodaySnapshot = ({ stats, isMobile, rangeDays }) => {
    return (
        <Box sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1, color: 'text.secondary' }}>
                📅 Today vs. Recent Average
            </Typography>
            <Grid container spacing={1}>
                {METRIC_CARDS.map(({ key, label, icon, color, unit, isRating, isGoal }) => {
                    const todayVal = stats.today[key];
                    const avgVal = stats.avg[key];
                    const display =
                        isRating
                            ? (todayVal != null ? `${todayVal}${unit}` : '—')
                            : isGoal
                                ? (todayVal != null ? `${todayVal}${unit}` : '—')
                                : fmtDuration(todayVal);

                    const avgDisplay =
                        isRating
                            ? `${rangeDays}d avg: ${avgVal}`
                            : isGoal
                                ? `${rangeDays}d avg: ${avgVal}%`
                                : `${rangeDays}d avg: ${fmtDuration(avgVal)}`;

                    const isBetter = isRating || isGoal
                        ? (todayVal != null && avgVal !== '—' && Number(todayVal) >= Number(avgVal))
                        : (todayVal != null && todayVal >= avgVal);

                    return (
                        <Grid item xs={6} sm={4} md={2} key={key}>
                            <Card
                                sx={{
                                    height: '100%',
                                    borderTop: `3px solid ${color}`,
                                    transition: 'transform 0.15s',
                                    '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 },
                                }}
                            >
                                <CardContent sx={{ p: isMobile ? 1.5 : 2, textAlign: 'center' }}>
                                    <Avatar
                                        sx={{
                                            bgcolor: `${color}20`,
                                            color,
                                            mx: 'auto',
                                            mb: 1,
                                            width: isMobile ? 32 : 40,
                                            height: isMobile ? 32 : 40,
                                        }}
                                    >
                                        {React.cloneElement(icon, { sx: { fontSize: isMobile ? 18 : 22 } })}
                                    </Avatar>
                                    <Typography
                                        variant={isMobile ? 'h6' : 'h5'}
                                        sx={{ fontWeight: 'bold', color, lineHeight: 1 }}
                                    >
                                        {display}
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        sx={{ display: 'block', color: 'text.secondary', mt: 0.5, fontSize: '0.65rem' }}
                                    >
                                        {label}
                                    </Typography>
                                    <Chip
                                        label={avgDisplay}
                                        size="small"
                                        sx={{
                                            mt: 0.5,
                                            height: 18,
                                            fontSize: '0.6rem',
                                            bgcolor: todayVal != null && isBetter ? '#dcfce7' : '#f3f4f6',
                                            color: todayVal != null && isBetter ? '#15803d' : '#6b7280',
                                        }}
                                    />
                                </CardContent>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>
        </Box>
    );
};

// ─── Rituals Duration Chart ───────────────────────────────────────────────────
const CustomTooltipDuration = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <Box
            sx={{
                bgcolor: 'rgba(15,23,42,0.92)',
                borderRadius: 2,
                p: 1.5,
                minWidth: 130,
            }}
        >
            <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 0.5 }}>
                {label}
            </Typography>
            {payload.map((p) => (
                <Box key={p.dataKey} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: p.color }} />
                    <Typography variant="caption" sx={{ color: '#e2e8f0' }}>
                        {p.name}: {fmtDuration(p.value)}
                    </Typography>
                </Box>
            ))}
        </Box>
    );
};

const RitualsChart = ({ chartData, isMobile }) => {
    const hasAnyData = chartData.some((d) => d.meditation > 0 || d.exercise > 0 || d.reading > 0);

    if (!hasAnyData) {
        return (
            <Card sx={{ mb: 2 }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <Typography color="text.secondary" variant="body2">
                        🧘 No ritual data yet — start tracking meditation, exercise & reading!
                    </Typography>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card sx={{ mb: 2 }}>
            <CardContent>
                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 2 }}>
                    🧘 Rituals Comparison (minutes)
                </Typography>
                <ResponsiveContainer width="100%" height={isMobile ? 200 : 260}>
                    <BarChart data={chartData} barGap={2} barCategoryGap="25%">
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis
                            dataKey="label"
                            tick={{ fontSize: isMobile ? 9 : 11 }}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            tick={{ fontSize: isMobile ? 9 : 11 }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(v) => `${v}m`}
                            width={32}
                        />
                        <Tooltip content={<CustomTooltipDuration />} />
                        <Legend
                            wrapperStyle={{ fontSize: isMobile ? 10 : 12 }}
                            iconType="circle"
                            iconSize={8}
                        />
                        <Bar dataKey="meditation" name="Meditation" fill={COLORS.meditation} radius={[4, 4, 0, 0]} />
                        <Bar dataKey="exercise" name="Exercise" fill={COLORS.exercise} radius={[4, 4, 0, 0]} />
                        <Bar dataKey="reading" name="Reading" fill={COLORS.reading} radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

// ─── Deep Work + Goal Completion Chart ───────────────────────────────────────
const CustomTooltipCombo = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <Box sx={{ bgcolor: 'rgba(15,23,42,0.92)', borderRadius: 2, p: 1.5, minWidth: 150 }}>
            <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 0.5 }}>
                {label}
            </Typography>
            {payload.map((p) => (
                <Box key={p.dataKey} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: p.color }} />
                    <Typography variant="caption" sx={{ color: '#e2e8f0' }}>
                        {p.name}:{' '}
                        {p.dataKey === 'deepWork' ? fmtDuration(p.value) : `${p.value ?? '—'}%`}
                    </Typography>
                </Box>
            ))}
        </Box>
    );
};

const DeepWorkGoalChart = ({ chartData, isMobile }) => {
    const hasDeepWork = chartData.some((d) => d.deepWork > 0);
    const hasGoal = chartData.some((d) => d.goal != null);

    if (!hasDeepWork && !hasGoal) {
        return (
            <Card sx={{ mb: 2 }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <Typography color="text.secondary" variant="body2">
                        ⏱ No deep work or goal data yet.
                    </Typography>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card sx={{ mb: 2 }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        ⏱ Deep Work vs Goal Completion
                    </Typography>
                    <Stack direction="row" spacing={1}>
                        <Chip size="small" label="Deep Work (left axis)" sx={{ bgcolor: `${COLORS.deepWork}20`, color: COLORS.deepWork, fontSize: '0.65rem' }} />
                        <Chip size="small" label="Goal % (right axis)" sx={{ bgcolor: `${COLORS.goal}20`, color: COLORS.goal, fontSize: '0.65rem' }} />
                    </Stack>
                </Box>
                <ResponsiveContainer width="100%" height={isMobile ? 200 : 260}>
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="deepWorkGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={COLORS.deepWork} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={COLORS.deepWork} stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="goalGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={COLORS.goal} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={COLORS.goal} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis dataKey="label" tick={{ fontSize: isMobile ? 9 : 11 }} tickLine={false} axisLine={false} />
                        <YAxis
                            yAxisId="left"
                            tick={{ fontSize: isMobile ? 9 : 11 }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(v) => `${v}m`}
                            width={32}
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            tick={{ fontSize: isMobile ? 9 : 11 }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(v) => `${v}%`}
                            domain={[0, 100]}
                            width={36}
                        />
                        <Tooltip content={<CustomTooltipCombo />} />
                        <Area
                            yAxisId="left"
                            type="monotone"
                            dataKey="deepWork"
                            name="Deep Work"
                            stroke={COLORS.deepWork}
                            fill="url(#deepWorkGrad)"
                            strokeWidth={2}
                            dot={false}
                        />
                        <Area
                            yAxisId="right"
                            type="monotone"
                            dataKey="goal"
                            name="Goal %"
                            stroke={COLORS.goal}
                            fill="url(#goalGrad)"
                            strokeWidth={2}
                            dot={false}
                            connectNulls
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
};

// ─── Day Rating Chart ─────────────────────────────────────────────────────────
const DayRatingChart = ({ chartData, isMobile }) => {
    const hasRating = chartData.some((d) => d.rating != null);

    if (!hasRating) {
        return (
            <Card sx={{ mb: 2 }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <Typography color="text.secondary" variant="body2">
                        ⭐ No day ratings yet — rate your days to see the trend!
                    </Typography>
                </CardContent>
            </Card>
        );
    }

    const avgRating = (() => {
        const rated = chartData.filter((d) => d.rating != null);
        if (!rated.length) return 0;
        return (rated.reduce((s, d) => s + d.rating, 0) / rated.length).toFixed(1);
    })();

    const ratingColor = (r) => (r >= 8 ? '#10b981' : r >= 5 ? '#f59e0b' : '#ef4444');

    return (
        <Card sx={{ mb: 2 }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        ⭐ Day Rating Trend (out of 10)
                    </Typography>
                    <Chip
                        label={`Avg: ${avgRating}/10`}
                        size="small"
                        sx={{
                            bgcolor: `${ratingColor(Number(avgRating))}20`,
                            color: ratingColor(Number(avgRating)),
                            fontWeight: 'bold',
                            fontSize: '0.7rem',
                        }}
                    />
                </Box>
                <ResponsiveContainer width="100%" height={isMobile ? 180 : 220}>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis dataKey="label" tick={{ fontSize: isMobile ? 9 : 11 }} tickLine={false} axisLine={false} />
                        <YAxis
                            domain={[0, 10]}
                            ticks={[0, 2, 4, 6, 8, 10]}
                            tick={{ fontSize: isMobile ? 9 : 11 }}
                            tickLine={false}
                            axisLine={false}
                            width={24}
                        />
                        <Tooltip
                            contentStyle={{
                                background: 'rgba(15,23,42,0.92)',
                                border: 'none',
                                borderRadius: 8,
                                color: '#e2e8f0',
                                fontSize: 12,
                            }}
                            formatter={(v) => [`${v}/10`, 'Day Rating']}
                            labelStyle={{ color: '#94a3b8' }}
                        />
                        {/* Reference bands */}
                        <Line
                            type="monotone"
                            dataKey="rating"
                            name="Day Rating"
                            stroke={COLORS.rating}
                            strokeWidth={2.5}
                            dot={{ r: 4, fill: COLORS.rating, strokeWidth: 0 }}
                            activeDot={{ r: 6 }}
                            connectNulls
                        />
                        <Line
                            type="monotone"
                            dataKey="energy"
                            name="Energy"
                            stroke={COLORS.energy}
                            strokeWidth={1.5}
                            strokeDasharray="4 4"
                            dot={false}
                            connectNulls
                        />
                        <Legend wrapperStyle={{ fontSize: isMobile ? 10 : 12 }} iconType="circle" iconSize={8} />
                    </LineChart>
                </ResponsiveContainer>
                {/* Colour legend for rating levels */}
                <Box sx={{ display: 'flex', gap: 2, mt: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                    {[{ label: '8-10 Great', color: '#10b981' }, { label: '5-7 OK', color: '#f59e0b' }, { label: '0-4 Low', color: '#ef4444' }].map(({ label, color }) => (
                        <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: color }} />
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>{label}</Typography>
                        </Box>
                    ))}
                </Box>
            </CardContent>
        </Card>
    );
};

// ─── Radar: Activity Overview ─────────────────────────────────────────────────
const ActivityRadar = ({ summaryStats, isMobile }) => {
    const avg = summaryStats.avg;

    // Normalize values for radar (0-100 scale)
    const maxDeepWork = 240; // 4 hours max
    const maxRitual = 120;   // 2 hours max ritual

    const radarData = [
        { subject: '🧘 Meditation', value: Math.min(100, Math.round((avg.meditation / maxRitual) * 100)) },
        { subject: '🏃 Exercise', value: Math.min(100, Math.round((avg.exercise / maxRitual) * 100)) },
        { subject: '📖 Reading', value: Math.min(100, Math.round((avg.reading / maxRitual) * 100)) },
        { subject: '⏱ Deep Work', value: Math.min(100, Math.round((avg.deepWork / maxDeepWork) * 100)) },
        { subject: '🎯 Goal %', value: avg.goal },
        { subject: '⭐ Rating', value: avg.rating !== '—' ? Math.round(Number(avg.rating) * 10) : 0 },
    ];

    const hasAnyData = radarData.some((d) => d.value > 0);

    if (!hasAnyData) return null;

    return (
        <Card sx={{ mb: 2 }}>
            <CardContent>
                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 2 }}>
                    📡 Activity Balance (Period Average)
                </Typography>
                <ResponsiveContainer width="100%" height={isMobile ? 220 : 280}>
                    <RadarChart data={radarData}>
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fontSize: isMobile ? 9 : 11, fill: '#64748b' }}
                        />
                        <Radar
                            name="Activity"
                            dataKey="value"
                            stroke="#6366f1"
                            fill="#6366f1"
                            fillOpacity={0.25}
                            strokeWidth={2}
                        />
                        <Tooltip
                            contentStyle={{
                                background: 'rgba(15,23,42,0.92)',
                                border: 'none',
                                borderRadius: 8,
                                color: '#e2e8f0',
                                fontSize: 12,
                            }}
                            formatter={(v) => [`${v}%`, 'Score']}
                        />
                    </RadarChart>
                </ResponsiveContainer>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', textAlign: 'center', mt: 1 }}>
                    Values normalised: rituals vs 2h max · deep work vs 4h max · rating ×10
                </Typography>
            </CardContent>
        </Card>
    );
};

export default ActivityDashboard;
