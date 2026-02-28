import React, { useMemo } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Chip,
    Stack,
    Tooltip,
    LinearProgress,
    useMediaQuery,
    useTheme,
    Divider,
    Avatar,
} from '@mui/material';
import { format, subDays, eachDayOfInterval, startOfYear, endOfYear, differenceInDays } from 'date-fns';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import StarRateIcon from '@mui/icons-material/StarRate';
import SelfImprovementIcon from '@mui/icons-material/SelfImprovement';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import TimerIcon from '@mui/icons-material/Timer';

// ─── helpers ──────────────────────────────────────────────────────────────────

const getDayData = (goals, dateKey) => goals?.daily?.[dateKey] || null;

const getRitual = (day, field) => {
    const v = day?.rituals?.[field];
    return typeof v === 'number' ? v : 0;
};

const getDeepWork = (day) => {
    const v = day?.performance?.deepwork;
    return typeof v === 'number' ? v : 0;
};

const getCompletion = (day) => {
    let v = day?.performance?.completion;
    if (v == null) return null;
    if (typeof v === 'object') v = v.completion ?? 0;
    return Number(v);
};

const getRating = (day) => {
    const v = day?.ratings?.['day-rating'];
    return typeof v === 'number' ? v : null;
};

/** Compute consecutive-day streak for a given value getter */
const computeHabitStreak = (goals, getVal) => {
    if (!goals?.daily) return 0;
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
        const d = subDays(today, i);
        const key = format(d, 'yyyy-MM-dd');
        const day = getDayData(goals, key);
        const val = getVal(day);
        if (val && val > 0) {
            streak++;
        } else if (i > 0) {
            break; // gap: only allow today to be empty
        }
    }
    return streak;
};

/** Count days with a truthy value in last N days */
const countDaysWithValue = (goals, getVal, lastN = 30) => {
    if (!goals?.daily) return 0;
    const today = new Date();
    const start = subDays(today, lastN - 1);
    return eachDayOfInterval({ start, end: today }).filter((d) => {
        const key = format(d, 'yyyy-MM-dd');
        const day = getDayData(goals, key);
        const val = getVal(day);
        return val && val > 0;
    }).length;
};

/** Max value ever across all daily data */
const getMaxValue = (goals, getVal) => {
    if (!goals?.daily) return { val: 0, date: null };
    let max = 0;
    let bestDate = null;
    Object.entries(goals.daily).forEach(([key, day]) => {
        const v = getVal(day) ?? 0;
        if (v > max) { max = v; bestDate = key; }
    });
    return { val: max, date: bestDate };
};

/** Sum all values */
const sumAll = (goals, getVal) => {
    if (!goals?.daily) return 0;
    return Object.values(goals.daily).reduce((s, day) => s + (getVal(day) || 0), 0);
};

const fmtMin = (m) => {
    const h = Math.floor(m / 60);
    const rem = m % 60;
    if (h === 0) return `${m}m`;
    if (rem === 0) return `${h}h`;
    return `${h}h ${rem}m`;
};

// ─── badge definitions ────────────────────────────────────────────────────────

const BADGE_DEFS = [
    // Streak based
    {
        id: 'streak3', icon: '🔥', title: 'On Fire', desc: '3-day tracking streak',
        color: '#FD7E14', bg: '#FFF3E0',
        check: (g) => computeHabitStreak(g, (d) => getCompletion(d) ?? (d ? 1 : 0)) >= 3,
    },
    {
        id: 'streak7', icon: '💫', title: 'Week Warrior', desc: '7-day tracking streak',
        color: '#7C3AED', bg: '#F3E8FF',
        check: (g) => computeHabitStreak(g, (d) => getCompletion(d) ?? (d ? 1 : 0)) >= 7,
    },
    {
        id: 'streak14', icon: '⚡', title: 'Fortnight', desc: '14-day tracking streak',
        color: '#0284C7', bg: '#E0F2FE',
        check: (g) => computeHabitStreak(g, (d) => getCompletion(d) ?? (d ? 1 : 0)) >= 14,
    },
    {
        id: 'streak30', icon: '🏆', title: 'Month Beast', desc: '30-day tracking streak',
        color: '#B45309', bg: '#FEF3C7',
        check: (g) => computeHabitStreak(g, (d) => getCompletion(d) ?? (d ? 1 : 0)) >= 30,
    },
    // Consistency
    {
        id: 'medHabit', icon: '🧘', title: 'Zen Habit', desc: 'Meditated 15 of last 30 days',
        color: '#6D28D9', bg: '#EDE9FE',
        check: (g) => countDaysWithValue(g, (d) => getRitual(d, 'meditation')) >= 15,
    },
    {
        id: 'exHabit', icon: '🏃', title: 'Move Daily', desc: 'Exercised 12 of last 30 days',
        color: '#059669', bg: '#D1FAE5',
        check: (g) => countDaysWithValue(g, (d) => getRitual(d, 'excercise')) >= 12,
    },
    {
        id: 'readHabit', icon: '📚', title: 'Bookworm', desc: 'Read 15 of last 30 days',
        color: '#2563EB', bg: '#DBEAFE',
        check: (g) => countDaysWithValue(g, (d) => getRitual(d, 'reading')) >= 15,
    },
    {
        id: 'deepHabit', icon: '🎯', title: 'Deep Worker', desc: 'Deep work 15 of last 30 days',
        color: '#DC2626', bg: '#FEE2E2',
        check: (g) => countDaysWithValue(g, (d) => getDeepWork(d)) >= 15,
    },
    // Rating
    {
        id: 'highRating', icon: '⭐', title: 'High Vibes', desc: 'Avg rating ≥ 8 in last 14 days',
        color: '#D97706', bg: '#FEF3C7',
        check: (g) => {
            if (!g?.daily) return false;
            const days = eachDayOfInterval({ start: subDays(new Date(), 13), end: new Date() })
                .map(d => getRating(getDayData(g, format(d, 'yyyy-MM-dd'))))
                .filter(v => v !== null);
            if (days.length < 5) return false;
            return days.reduce((s, v) => s + v, 0) / days.length >= 8;
        },
    },
    // Performance milestones
    {
        id: 'perfect100', icon: '💯', title: 'Perfect Day', desc: 'Hit 100% goal completion',
        color: '#16A34A', bg: '#DCFCE7',
        check: (g) => getMaxValue(g, getCompletion).val >= 100,
    },
    {
        id: 'deepHero', icon: '🔬', title: 'Focus Hero', desc: 'Logged 4h+ deep work in one day',
        color: '#9333EA', bg: '#F3E8FF',
        check: (g) => getMaxValue(g, getDeepWork).val >= 240,
    },
    {
        id: 'totalDeep50', icon: '🧠', title: 'Brain Gym', desc: '50h total deep work logged',
        color: '#1D4ED8', bg: '#DBEAFE',
        check: (g) => sumAll(g, getDeepWork) >= 3000,  // 50h = 3000 min
    },
    {
        id: 'totalMed', icon: '☮️', title: 'Meditation 100', desc: '100h total meditation logged',
        color: '#7C3AED', bg: '#EDE9FE',
        check: (g) => sumAll(g, (d) => getRitual(d, 'meditation')) >= 6000,  // 100h
    },
];

// ─── Year Progress Bar ────────────────────────────────────────────────────────
const YearProgress = ({ isMobile }) => {
    const now = new Date();
    const yearStart = startOfYear(now);
    const yearEnd = endOfYear(now);
    const totalDays = differenceInDays(yearEnd, yearStart) + 1;
    const elapsed = differenceInDays(now, yearStart) + 1;
    const pct = Math.round((elapsed / totalDays) * 100);
    const remaining = totalDays - elapsed;

    return (
        <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#4B5563' }}>
                    📅 {format(now, 'yyyy')} — Day {elapsed} of {totalDays}
                </Typography>
                <Typography variant="caption" sx={{ color: '#6B7280' }}>
                    {remaining} days left · {pct}% through the year
                </Typography>
            </Box>
            <Box sx={{ position: 'relative' }}>
                <LinearProgress
                    variant="determinate"
                    value={pct}
                    sx={{
                        height: 10,
                        borderRadius: 5,
                        bgcolor: '#E5E7EB',
                        '& .MuiLinearProgress-bar': {
                            borderRadius: 5,
                            background: 'linear-gradient(90deg, #6366F1, #8B5CF6, #A78BFA)',
                        },
                    }}
                />
                <Box
                    sx={{
                        position: 'absolute',
                        left: `${pct}%`,
                        top: -4,
                        transform: 'translateX(-50%)',
                        fontSize: 16,
                        lineHeight: 1,
                    }}
                >
                    📍
                </Box>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                <Typography variant="caption" sx={{ color: '#9CA3AF', fontSize: '0.6rem' }}>Jan 1</Typography>
                <Typography variant="caption" sx={{ color: '#9CA3AF', fontSize: '0.6rem' }}>Dec 31</Typography>
            </Box>
        </Box>
    );
};

// ─── Per-Habit Streak Row ─────────────────────────────────────────────────────
const HABIT_STREAKS = [
    { key: 'meditation', label: 'Meditation', emoji: '🧘', getVal: (d) => getRitual(d, 'meditation'), color: '#7C3AED' },
    { key: 'exercise', label: 'Exercise', emoji: '🏃', getVal: (d) => getRitual(d, 'excercise'), color: '#059669' },
    { key: 'reading', label: 'Reading', emoji: '📖', getVal: (d) => getRitual(d, 'reading'), color: '#2563EB' },
    { key: 'deepwork', label: 'Deep Work', emoji: '⏱', getVal: (d) => getDeepWork(d), color: '#DC2626' },
];

const HabitStreakRow = ({ goals, isMobile }) => {
    const streaks = useMemo(
        () => HABIT_STREAKS.map(h => ({ ...h, streak: computeHabitStreak(goals, h.getVal) })),
        [goals]
    );

    return (
        <Box sx={{ mb: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#4B5563', display: 'block', mb: 1 }}>
                🔥 Current Habit Streaks
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {streaks.map(({ key, label, emoji, streak, color }) => (
                    <Box
                        key={key}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.75,
                            px: 1.5,
                            py: 0.75,
                            borderRadius: 3,
                            bgcolor: streak > 0 ? `${color}15` : '#F9FAFB',
                            border: `1px solid ${streak > 0 ? `${color}40` : '#E5E7EB'}`,
                            minWidth: 0,
                            transition: 'all 0.2s',
                        }}
                    >
                        <Typography sx={{ fontSize: isMobile ? '1rem' : '1.1rem', lineHeight: 1 }}>{emoji}</Typography>
                        <Box>
                            <Typography
                                variant="caption"
                                sx={{
                                    fontWeight: 'bold',
                                    color: streak > 0 ? color : '#9CA3AF',
                                    fontSize: isMobile ? '0.75rem' : '0.8rem',
                                    lineHeight: 1,
                                    display: 'block',
                                }}
                            >
                                {streak > 0 ? `${streak}d` : '—'}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#9CA3AF', fontSize: '0.6rem', lineHeight: 1 }}>
                                {label}
                            </Typography>
                        </Box>
                    </Box>
                ))}
            </Stack>
        </Box>
    );
};

// ─── Achievement Badges ───────────────────────────────────────────────────────
const BadgeChip = ({ badge, locked }) => (
    <Tooltip title={`${badge.title}: ${badge.desc}`} placement="top" arrow>
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0.3,
                opacity: locked ? 0.35 : 1,
                filter: locked ? 'grayscale(1)' : 'none',
                transition: 'all 0.2s',
                cursor: 'default',
                '&:hover': locked ? {} : { transform: 'translateY(-2px)', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))' },
            }}
        >
            <Avatar
                sx={{
                    width: 44,
                    height: 44,
                    bgcolor: locked ? '#F3F4F6' : badge.bg,
                    fontSize: '1.4rem',
                    border: locked ? '2px solid #E5E7EB' : `2px solid ${badge.color}50`,
                    boxShadow: locked ? 'none' : `0 2px 8px ${badge.color}30`,
                }}
            >
                {badge.icon}
            </Avatar>
            <Typography
                variant="caption"
                sx={{
                    fontSize: '0.58rem',
                    color: locked ? '#9CA3AF' : badge.color,
                    fontWeight: locked ? 400 : 'bold',
                    textAlign: 'center',
                    maxWidth: 48,
                    lineHeight: 1.2,
                }}
            >
                {badge.title}
            </Typography>
        </Box>
    </Tooltip>
);

const AchievementBadges = ({ goals, isMobile }) => {
    const { earned, locked } = useMemo(() => {
        const earned = []; const locked = [];
        BADGE_DEFS.forEach(b => (b.check(goals) ? earned : locked).push(b));
        return { earned, locked };
    }, [goals]);

    return (
        <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#4B5563' }}>
                    🏅 Achievements — {earned.length}/{BADGE_DEFS.length} earned
                </Typography>
                {earned.length > 0 && (
                    <Chip
                        label={`${earned.length} unlocked`}
                        size="small"
                        icon={<WorkspacePremiumIcon sx={{ fontSize: '0.9rem !important' }} />}
                        sx={{ bgcolor: '#FEF3C7', color: '#B45309', fontSize: '0.65rem', height: 20, fontWeight: 'bold' }}
                    />
                )}
            </Box>
            <Box
                sx={{
                    display: 'flex',
                    gap: isMobile ? 1.5 : 2,
                    overflowX: 'auto',
                    pb: 1,
                    /* Show earned first, then locked */
                }}
            >
                {earned.map(b => <BadgeChip key={b.id} badge={b} locked={false} />)}
                {locked.map(b => <BadgeChip key={b.id} badge={b} locked={true} />)}
            </Box>
            {earned.length === 0 && (
                <Typography variant="caption" sx={{ color: '#9CA3AF', fontStyle: 'italic' }}>
                    Keep tracking daily to unlock your first achievement!
                </Typography>
            )}
        </Box>
    );
};

// ─── Personal Records ─────────────────────────────────────────────────────────
const PersonalRecords = ({ goals, isMobile }) => {
    const records = useMemo(() => {
        if (!goals?.daily) return [];

        const bestDeepWork = getMaxValue(goals, getDeepWork);
        const bestRating = getMaxValue(goals, getRating);
        const bestMed = getMaxValue(goals, (d) => getRitual(d, 'meditation'));
        const bestEx = getMaxValue(goals, (d) => getRitual(d, 'excercise'));
        const totalDW = sumAll(goals, getDeepWork);
        const totalMed = sumAll(goals, (d) => getRitual(d, 'meditation'));
        const totalEx = sumAll(goals, (d) => getRitual(d, 'excercise'));
        const trackedDays = Object.keys(goals.daily).length;

        return [
            bestDeepWork.val > 0 && { icon: '⏱', label: 'Best Deep Work', value: fmtMin(bestDeepWork.val), sub: bestDeepWork.date ? format(new Date(bestDeepWork.date + 'T00:00'), 'MMM d') : '', color: '#DC2626' },
            bestRating.val > 0 && { icon: '⭐', label: 'Best Day Rating', value: `${bestRating.val}/10`, sub: bestRating.date ? format(new Date(bestRating.date + 'T00:00'), 'MMM d') : '', color: '#D97706' },
            bestMed.val > 0 && { icon: '🧘', label: 'Best Meditation', value: fmtMin(bestMed.val), sub: bestMed.date ? format(new Date(bestMed.date + 'T00:00'), 'MMM d') : '', color: '#7C3AED' },
            bestEx.val > 0 && { icon: '🏃', label: 'Best Exercise', value: fmtMin(bestEx.val), sub: bestEx.date ? format(new Date(bestEx.date + 'T00:00'), 'MMM d') : '', color: '#059669' },
            totalDW > 0 && { icon: '🧠', label: 'Total Deep Work', value: fmtMin(totalDW), sub: 'all time', color: '#9333EA' },
            totalMed > 0 && { icon: '🌙', label: 'Total Meditation', value: fmtMin(totalMed), sub: 'all time', color: '#6D28D9' },
            totalEx > 0 && { icon: '💪', label: 'Total Exercise', value: fmtMin(totalEx), sub: 'all time', color: '#065F46' },
            trackedDays > 0 && { icon: '📓', label: 'Days Tracked', value: `${trackedDays}`, sub: 'total entries', color: '#0369A1' },
        ].filter(Boolean);
    }, [goals]);

    if (records.length === 0) return null;

    return (
        <Box sx={{ mb: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#4B5563', display: 'block', mb: 1 }}>
                📈 Personal Records
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 0.5 }}>
                {records.map(({ icon, label, value, sub, color }) => (
                    <Box
                        key={label}
                        sx={{
                            minWidth: isMobile ? 80 : 96,
                            textAlign: 'center',
                            px: 1,
                            py: 1,
                            borderRadius: 2,
                            bgcolor: `${color}10`,
                            border: `1px solid ${color}25`,
                            flexShrink: 0,
                            transition: 'transform 0.15s',
                            '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 4px 12px ${color}20` },
                        }}
                    >
                        <Typography sx={{ fontSize: isMobile ? '1.1rem' : '1.25rem', lineHeight: 1, mb: 0.25 }}>{icon}</Typography>
                        <Typography
                            sx={{ fontSize: isMobile ? '0.8rem' : '0.9rem', fontWeight: 'bold', color, lineHeight: 1.1 }}
                        >
                            {value}
                        </Typography>
                        <Typography sx={{ fontSize: '0.58rem', color: '#9CA3AF', lineHeight: 1.2, mt: 0.25 }}>
                            {label}
                        </Typography>
                        {sub && (
                            <Typography sx={{ fontSize: '0.55rem', color: `${color}90`, lineHeight: 1 }}>
                                {sub}
                            </Typography>
                        )}
                    </Box>
                ))}
            </Box>
        </Box>
    );
};

// ─── This Week's Win ──────────────────────────────────────────────────────────
const WeeklyWin = ({ goals, isMobile }) => {
    const win = useMemo(() => {
        if (!goals?.daily) return null;

        const today = new Date();
        const wins = [];

        for (let i = 0; i < 7; i++) {
            const d = subDays(today, i);
            const key = format(d, 'yyyy-MM-dd');
            const day = getDayData(goals, key);
            if (!day) continue;

            const rating = getRating(day);
            const deepWork = getDeepWork(day);
            const med = getRitual(day, 'meditation');
            const comp = getCompletion(day);

            if (comp === 100) wins.push({ msg: `🎯 Perfect 100% goal on ${format(d, 'MMM d')}!`, score: 100 });
            if (rating >= 9) wins.push({ msg: `⭐ Incredible day rated ${rating}/10 on ${format(d, 'MMM d')}`, score: 95 });
            if (deepWork >= 240) wins.push({ msg: `⏱ Massive ${fmtMin(deepWork)} deep work on ${format(d, 'MMM d')}!`, score: 90 });
            if (med >= 30) wins.push({ msg: `🧘 Great ${fmtMin(med)} meditation on ${format(d, 'MMM d')}`, score: 80 });
            if (rating >= 7) wins.push({ msg: `✨ Strong day rated ${rating}/10 on ${format(d, 'MMM d')}`, score: 70 });
            if (comp >= 80) wins.push({ msg: `💪 ${comp}% goal completion on ${format(d, 'MMM d')}`, score: 65 });
        }

        if (!wins.length) return null;
        // Return highest scoring win
        return wins.sort((a, b) => b.score - a.score)[0];
    }, [goals]);

    if (!win) return null;

    return (
        <Box
            sx={{
                p: 1.5,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #FFF7ED, #FEF3C7)',
                border: '1px solid #FDE68A',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                mb: 1,
            }}
        >
            <AutoAwesomeIcon sx={{ color: '#D97706', fontSize: 22, flexShrink: 0 }} />
            <Box>
                <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#92400E', display: 'block', fontSize: '0.7rem' }}>
                    🌟 This Week's Win
                </Typography>
                <Typography variant="caption" sx={{ color: '#78350F', fontSize: isMobile ? '0.75rem' : '0.8rem' }}>
                    {win.msg}
                </Typography>
            </Box>
        </Box>
    );
};

// ─── Main Export ──────────────────────────────────────────────────────────────

/**
 * MotivationPanel – Achievements, habit streaks, personal records, and a year progress bar.
 */
export const MotivationPanel = ({ goals = {} }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const hasAnyData = Object.keys(goals?.daily || {}).length > 0;

    if (!hasAnyData) {
        return (
            <Card sx={{ mb: 3, bgcolor: '#FFFBEB', border: '1px solid #FDE68A' }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <EmojiEventsIcon sx={{ fontSize: 40, color: '#D97706', mb: 1 }} />
                    <Typography variant="body2" sx={{ color: '#78350F', fontWeight: 'bold' }}>
                        Start tracking daily to unlock achievements & see your progress!
                    </Typography>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card
            sx={{
                mb: 3,
                borderTop: '3px solid',
                borderImage: 'linear-gradient(90deg, #6366F1, #8B5CF6, #EC4899) 1',
            }}
        >
            <CardContent sx={{ pb: '12px !important' }}>

                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <EmojiEventsIcon sx={{ color: '#D97706', fontSize: isMobile ? 22 : 26 }} />
                    <Typography variant={isMobile ? 'body1' : 'h6'} sx={{ fontWeight: 'bold' }}>
                        Your Progress
                    </Typography>
                    <Chip
                        label="Motivation"
                        size="small"
                        icon={<AutoAwesomeIcon sx={{ fontSize: '0.8rem !important' }} />}
                        sx={{ ml: 'auto', bgcolor: '#F3E8FF', color: '#7C3AED', fontSize: '0.65rem', fontWeight: 'bold', height: 20 }}
                    />
                </Box>

                {/* Year Progress */}
                <YearProgress isMobile={isMobile} />

                <Divider sx={{ my: 1.5 }} />

                {/* This Week's Win */}
                <WeeklyWin goals={goals} isMobile={isMobile} />

                {/* Habit Streaks */}
                <HabitStreakRow goals={goals} isMobile={isMobile} />

                <Divider sx={{ my: 1.5 }} />

                {/* Achievement Badges */}
                <AchievementBadges goals={goals} isMobile={isMobile} />

                <Divider sx={{ my: 1.5 }} />

                {/* Personal Records */}
                <PersonalRecords goals={goals} isMobile={isMobile} />

            </CardContent>
        </Card>
    );
};

export default MotivationPanel;
