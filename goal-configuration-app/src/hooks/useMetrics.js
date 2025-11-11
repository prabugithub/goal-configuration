import { useMemo, useCallback } from 'react';
import { eachDayOfInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear, format, differenceInDays } from 'date-fns';

/**
 * useMetrics - Calculate advanced metrics and analytics
 * Provides completion tracking, streaks, trends, and habit analysis
 *
 * Usage:
 * const metrics = useMetrics(goals, config);
 * metrics.getCompletion('daily', 'this-week'); // 85
 * metrics.getStreak('daily'); // 5
 * metrics.getTrend('daily', 30); // { direction: 'up', percentage: 12 }
 */
export const useMetrics = (goals = {}, config = {}) => {
  // Calculate completion percentage for a level and period
  const getCompletion = useCallback(
    (level, period) => {
      if (!goals[level]) return 0;

      const goalsForPeriod = Object.values(goals[level]).filter((goal) => goal !== null);
      if (goalsForPeriod.length === 0) return 0;

      // Count goals that have at least one field filled
      const completedGoals = goalsForPeriod.filter((goal) => {
        if (!goal || typeof goal !== 'object') return false;
        const fieldCount = Object.values(goal).reduce((count, section) => {
          if (typeof section === 'object') {
            return count + Object.keys(section).length;
          }
          return count;
        }, 0);
        return fieldCount > 0;
      });

      const completion = (completedGoals.length / goalsForPeriod.length) * 100;
      return Math.round(completion);
    },
    [goals]
  );

  // Calculate consecutive days/weeks/months with goals
  const getStreak = useCallback(
    (level) => {
      if (!goals[level]) return 0;

      const levelGoals = Object.keys(goals[level]).sort();
      if (levelGoals.length === 0) return 0;

      let streak = 0;
      let currentDate = new Date();

      // Work backwards from today
      for (let i = 0; i < 365; i++) {
        const checkDate = new Date(currentDate);
        checkDate.setDate(checkDate.getDate() - i);
        const dateKey = format(checkDate, 'yyyy-MM-dd');

        if (levelGoals.includes(dateKey) && goals[level][dateKey]) {
          streak++;
        } else if (i > 0) {
          // Break if there's a gap (but allow today to be empty)
          break;
        }
      }

      return streak;
    },
    [goals]
  );

  // Calculate completion trend over a period
  const getTrend = useCallback(
    (level, daysPeriod = 30) => {
      if (!goals[level]) {
        return { direction: 'stable', percentage: 0, data: [] };
      }

      const levelGoals = goals[level];
      const now = new Date();
      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() - daysPeriod);

      const dates = eachDayOfInterval({ start: startDate, end: now });
      const trendData = [];

      dates.forEach((date) => {
        const dateKey = format(date, 'yyyy-MM-dd');
        const goalExists = levelGoals[dateKey] && Object.keys(levelGoals[dateKey]).length > 0;

        trendData.push({
          date: dateKey,
          completed: goalExists ? 1 : 0,
        });
      });

      // Calculate trend direction
      const mid = Math.floor(trendData.length / 2);
      const firstHalf = trendData.slice(0, mid).reduce((sum, d) => sum + d.completed, 0);
      const secondHalf = trendData.slice(mid).reduce((sum, d) => sum + d.completed, 0);

      const changePercentage = ((secondHalf - firstHalf) / (firstHalf || 1)) * 100;
      const direction = changePercentage > 5 ? 'up' : changePercentage < -5 ? 'down' : 'stable';

      return {
        direction,
        percentage: Math.round(changePercentage),
        data: trendData,
      };
    },
    [goals]
  );

  // Track a specific field completion (e.g., "Exercise")
  const getHabitCompletion = useCallback(
    (level, sectionName, fieldName, daysPeriod = 30) => {
      if (!goals[level]) return 0;

      const now = new Date();
      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() - daysPeriod);

      const dates = eachDayOfInterval({ start: startDate, end: now });
      let completedDays = 0;

      dates.forEach((date) => {
        const dateKey = format(date, 'yyyy-MM-dd');
        const goal = goals[level][dateKey];

        if (
          goal &&
          goal[sectionName] &&
          goal[sectionName][fieldName] &&
          goal[sectionName][fieldName] !== '' &&
          goal[sectionName][fieldName] !== 0
        ) {
          completedDays++;
        }
      });

      const completion = (completedDays / dates.length) * 100;
      return Math.round(completion);
    },
    [goals]
  );

  // Get completion data for a specific period
  const getPeriodCompletion = useCallback(
    (level, periodType) => {
      if (!goals[level]) return { percentage: 0, completed: 0, total: 0 };

      let dates = [];
      const now = new Date();

      switch (periodType) {
        case 'week':
          const weekStart = startOfWeek(now, { weekStartsOn: 1 });
          const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
          dates = eachDayOfInterval({ start: weekStart, end: weekEnd });
          break;

        case 'month':
          const monthStart = startOfMonth(now);
          const monthEnd = endOfMonth(now);
          dates = eachDayOfInterval({ start: monthStart, end: monthEnd });
          break;

        case 'quarter':
          const quarterStart = startOfQuarter(now);
          const quarterEnd = endOfQuarter(now);
          dates = eachDayOfInterval({ start: quarterStart, end: quarterEnd });
          break;

        case 'year':
          const yearStart = startOfYear(now);
          const yearEnd = endOfYear(now);
          dates = eachDayOfInterval({ start: yearStart, end: yearEnd });
          break;

        default:
          dates = eachDayOfInterval({
            start: new Date(now.getFullYear(), now.getMonth(), 1),
            end: new Date(now.getFullYear(), now.getMonth() + 1, 0),
          });
      }

      let completed = 0;
      dates.forEach((date) => {
        const dateKey = format(date, 'yyyy-MM-dd');
        if (goals[level][dateKey] && Object.keys(goals[level][dateKey]).length > 0) {
          completed++;
        }
      });

      const percentage = (completed / dates.length) * 100;

      return {
        percentage: Math.round(percentage),
        completed,
        total: dates.length,
      };
    },
    [goals]
  );

  // Get insight recommendations based on metrics
  const getInsights = useCallback(() => {
    const insights = [];

    // Completion insights
    const dailyCompletion = getCompletion('daily', 'week');
    if (dailyCompletion >= 85) {
      insights.push({
        type: 'positive',
        title: 'Great Week!',
        message: `You've completed ${dailyCompletion}% of your goals this week.`,
        priority: 'high',
      });
    } else if (dailyCompletion < 50) {
      insights.push({
        type: 'warning',
        title: 'Low Completion',
        message: `Only ${dailyCompletion}% completion this week. Consider simplifying your goals.`,
        priority: 'high',
      });
    }

    // Streak insights
    const streak = getStreak('daily');
    if (streak >= 7) {
      insights.push({
        type: 'achievement',
        title: `${streak}-Day Streak!`,
        message: `You're on an amazing ${streak}-day streak! Keep it going!`,
        priority: 'medium',
      });
    }

    // Trend insights
    const trend = getTrend('daily', 30);
    if (trend.direction === 'up' && trend.percentage > 10) {
      insights.push({
        type: 'positive',
        title: 'Trending Up',
        message: `Your completion is trending up by ${trend.percentage}% over the last month.`,
        priority: 'medium',
      });
    } else if (trend.direction === 'down' && trend.percentage < -10) {
      insights.push({
        type: 'warning',
        title: 'Completion Declining',
        message: `Your completion is down ${Math.abs(trend.percentage)}%. Time to refocus?`,
        priority: 'high',
      });
    }

    return insights;
  }, [getCompletion, getStreak, getTrend]);

  return useMemo(
    () => ({
      getCompletion,
      getStreak,
      getTrend,
      getHabitCompletion,
      getPeriodCompletion,
      getInsights,
    }),
    [getCompletion, getStreak, getTrend, getHabitCompletion, getPeriodCompletion, getInsights]
  );
};
