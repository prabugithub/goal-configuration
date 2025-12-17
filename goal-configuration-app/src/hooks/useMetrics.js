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

  // Helper to generate identifier for a date based on level
  const getIdentifierForDate = useCallback((date, level) => {
    const year = date.getFullYear();
    const month = date.getMonth();

    switch (level) {
      case 'daily':
        return format(date, 'yyyy-MM-dd');

      case 'weekly':
        // Get the week start (Sunday) and return as YYYY-MM-DD
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        return format(weekStart, 'yyyy-MM-dd');

      case 'monthly':
        // Use format YYYY-M (without zero padding)
        return `${year}-${month + 1}`;

      case 'quarterly':
        const quarter = Math.floor(month / 3) + 1;
        return `${year}-Q${quarter}`;

      case 'yearly':
        return String(year);

      default:
        return format(date, 'yyyy-MM-dd');
    }
  }, []);

  // Helper to get dates for a week based on week identifier
  const getWeekDates = useCallback((weekIdentifier) => {
    // Parse week identifier like "2025-12-07" (Sunday date)
    const [year, month, day] = weekIdentifier.split('-').map(Number);
    const sunday = new Date(year, month - 1, day);

    // Generate all 7 days of the week starting from Sunday
    const weekDates = {};
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 0; i < 7; i++) {
      const date = new Date(sunday);
      date.setDate(sunday.getDate() + i);
      weekDates[dayNames[i]] = format(date, 'yyyy-MM-dd');
    }

    return weekDates;
  }, []);

  // Get completion data for a specific period
  const getPeriodCompletion = useCallback(
    (level, periodType) => {
      const now = new Date();

      // HIERARCHICAL CALCULATION LOGIC

      // 1. WEEKLY COMPLETION (based on daily goals from planned days)
      if (level === 'daily' && periodType === 'week') {
        if (!goals.weekly || !goals.daily) {
          return { percentage: 0, completed: 0, total: 0 };
        }

        // Get current week identifier
        const currentWeekId = getIdentifierForDate(now, 'weekly');
        const weeklyGoal = goals.weekly[currentWeekId];

        if (!weeklyGoal || !weeklyGoal.taskSplitUp) {
          return { percentage: 0, completed: 0, total: 0 };
        }

        // Get the actual dates for this week
        const weekDates = getWeekDates(currentWeekId);

        // Count total planned days
        const plannedDays = Object.values(weeklyGoal.taskSplitUp).filter(t => t && t.trim() !== '');
        const totalPlannedDays = plannedDays.length;

        if (totalPlannedDays === 0) {
          return { percentage: 0, completed: 0, total: 0 };
        }

        // Sum the completion percentages of all planned days
        let totalCompletion = 0;
        let completedDaysCount = 0;

        Object.entries(weeklyGoal.taskSplitUp).forEach(([day, task]) => {
          if (task && task.trim() !== '') {
            // This day is planned
            const dateKey = weekDates[day];
            const dailyGoal = goals.daily[dateKey];

            if (dailyGoal && dailyGoal.performance && typeof dailyGoal.performance.completion !== 'undefined') {
              totalCompletion += Number(dailyGoal.performance.completion) || 0;
              completedDaysCount++;
            }
          }
        });

        // Weekly completion = sum of all daily completions / total planned days
        const weeklyCompletion = totalCompletion / totalPlannedDays;

        return {
          percentage: Math.round(weeklyCompletion),
          completed: completedDaysCount,
          total: totalPlannedDays,
        };
      }

      // 2. MONTHLY COMPLETION (based on daily goals from all planned days in all weeks)
      if (level === 'weekly' && periodType === 'month') {
        if (!goals.weekly || !goals.daily) {
          return { percentage: 0, completed: 0, total: 0 };
        }

        const monthStart = startOfMonth(now);
        const monthEnd = endOfMonth(now);
        const monthDates = eachDayOfInterval({ start: monthStart, end: monthEnd });

        // Get all weeks in this month
        const weekIdentifiers = new Set();
        monthDates.forEach(date => {
          weekIdentifiers.add(getIdentifierForDate(date, 'weekly'));
        });

        // First, count total planned days across all weeks
        let totalPlannedDays = 0;
        weekIdentifiers.forEach(weekId => {
          const weeklyGoal = goals.weekly[weekId];
          if (weeklyGoal && weeklyGoal.taskSplitUp) {
            const planned = Object.values(weeklyGoal.taskSplitUp).filter(t => t && t.trim() !== '');
            totalPlannedDays += planned.length;
          }
        });

        if (totalPlannedDays === 0) {
          return { percentage: 0, completed: 0, total: 0 };
        }

        // Calculate completion for days that have data
        let totalCompletion = 0;
        let completedDaysCount = 0;

        weekIdentifiers.forEach(weekId => {
          const weeklyGoal = goals.weekly[weekId];
          if (weeklyGoal && weeklyGoal.taskSplitUp) {
            const weekDates = getWeekDates(weekId);

            Object.entries(weeklyGoal.taskSplitUp).forEach(([day, task]) => {
              if (task && task.trim() !== '') {
                const dateKey = weekDates[day];
                const dailyGoal = goals.daily[dateKey];

                if (dailyGoal && dailyGoal.performance && typeof dailyGoal.performance.completion !== 'undefined') {
                  totalCompletion += Number(dailyGoal.performance.completion) || 0;
                  completedDaysCount++;
                }
              }
            });
          }
        });

        // Each planned day represents a portion of the month
        const dayWeight = 100 / totalPlannedDays;
        const avgDayCompletion = completedDaysCount > 0 ? totalCompletion / completedDaysCount : 0;
        const monthlyCompletion = (avgDayCompletion * completedDaysCount * dayWeight) / 100;

        return {
          percentage: Math.round(monthlyCompletion),
          completed: completedDaysCount,
          total: totalPlannedDays,
        };
      }

      // 3. QUARTERLY COMPLETION (based on monthly goals' completion values)
      if (level === 'monthly' && periodType === 'quarter') {
        if (!goals.monthly) {
          return { percentage: 0, completed: 0, total: 0 };
        }

        const quarterStart = startOfQuarter(now);
        const quarterEnd = endOfQuarter(now);
        const quarterMonths = eachDayOfInterval({ start: quarterStart, end: quarterEnd });

        const monthIdentifiers = new Set();
        quarterMonths.forEach(date => {
          monthIdentifiers.add(getIdentifierForDate(date, 'monthly'));
        });

        const totalMonths = monthIdentifiers.size; // Always 3 months in a quarter

        let totalCompletion = 0;
        let completedMonths = 0;

        monthIdentifiers.forEach(monthId => {
          const monthlyGoal = goals.monthly[monthId];
          if (monthlyGoal && monthlyGoal.performance && typeof monthlyGoal.performance.completion !== 'undefined') {
            totalCompletion += Number(monthlyGoal.performance.completion) || 0;
            completedMonths++;
          }
        });

        // Each month = 33.33% of the quarter
        const monthWeight = 100 / totalMonths;
        const avgMonthCompletion = completedMonths > 0 ? totalCompletion / completedMonths : 0;
        const quarterlyCompletion = (avgMonthCompletion * completedMonths * monthWeight) / 100;

        return {
          percentage: Math.round(quarterlyCompletion),
          completed: completedMonths,
          total: totalMonths,
        };
      }

      // 4. YEARLY COMPLETION (based on quarterly goals with partial weighting)
      if (level === 'quarterly' && periodType === 'year') {
        if (!goals.quarterly) {
          return { percentage: 0, completed: 0, total: 0 };
        }

        // Get all 4 quarters
        const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
        const currentYear = now.getFullYear();

        let totalWeightedCompletion = 0;
        let completedQuarters = 0;

        quarters.forEach((q, index) => {
          const quarterId = `${currentYear}-${q}`;
          const quarterlyGoal = goals.quarterly[quarterId];

          if (quarterlyGoal && quarterlyGoal.performance && typeof quarterlyGoal.performance.completion !== 'undefined') {
            const qCompletion = Number(quarterlyGoal.performance.completion) || 0;
            totalWeightedCompletion += qCompletion;
            completedQuarters++;
          }
        });

        // Each quarter = 25% of the year
        // If 2 quarters completed with avg 70%, yearly = (70% * 2) * 25% = 35%
        const quarterWeight = 25; // Each quarter is 25% of the year
        const avgQuarterCompletion = completedQuarters > 0 ? totalWeightedCompletion / completedQuarters : 0;
        const yearlyCompletion = (avgQuarterCompletion * completedQuarters * quarterWeight) / 100;

        return {
          percentage: Math.round(yearlyCompletion),
          completed: completedQuarters,
          total: 4,
        };
      }

      // Fallback for any other combinations
      return { percentage: 0, completed: 0, total: 0 };
    },
    [goals, getIdentifierForDate, getWeekDates]
  );

  // Auto-calculate performance.completion for a goal before saving
  const autoCalculateCompletion = useCallback(
    (level, identifier, goalData) => {
      // Only auto-calculate for weekly, monthly, quarterly (daily is manual)
      if (level === 'daily') {
        return goalData; // Daily completion is set manually
      }

      // Weekly: Calculate from daily goals
      if (level === 'weekly') {
        if (!goalData.taskSplitUp || !goals.daily) {
          return goalData;
        }

        const weekDates = getWeekDates(identifier);
        const plannedDays = Object.values(goalData.taskSplitUp).filter(t => t && t.trim() !== '');
        const totalPlannedDays = plannedDays.length;

        if (totalPlannedDays === 0) {
          return goalData;
        }

        let totalCompletion = 0;

        Object.entries(goalData.taskSplitUp).forEach(([day, task]) => {
          if (task && task.trim() !== '') {
            const dateKey = weekDates[day];
            const dailyGoal = goals.daily[dateKey];

            if (dailyGoal && dailyGoal.performance && typeof dailyGoal.performance.completion !== 'undefined') {
              totalCompletion += Number(dailyGoal.performance.completion) || 0;
            }
          }
        });

        const weeklyCompletion = totalCompletion / totalPlannedDays;

        return {
          ...goalData,
          performance: {
            ...goalData.performance,
            completion: Math.round(weeklyCompletion)
          }
        };
      }

      // Monthly: Calculate from daily goals across all weeks
      if (level === 'monthly') {
        if (!goals.weekly || !goals.daily) {
          return goalData;
        }

        const [year, month] = identifier.split('-');
        const monthDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        const monthStart = startOfMonth(monthDate);
        const monthEnd = endOfMonth(monthDate);
        const monthDates = eachDayOfInterval({ start: monthStart, end: monthEnd });

        const weekIdentifiers = new Set();
        monthDates.forEach(date => {
          weekIdentifiers.add(getIdentifierForDate(date, 'weekly'));
        });

        let totalPlannedDays = 0;
        weekIdentifiers.forEach(weekId => {
          const weeklyGoal = goals.weekly[weekId];
          if (weeklyGoal && weeklyGoal.taskSplitUp) {
            const planned = Object.values(weeklyGoal.taskSplitUp).filter(t => t && t.trim() !== '');
            totalPlannedDays += planned.length;
          }
        });

        if (totalPlannedDays === 0) {
          return goalData;
        }

        let totalCompletion = 0;
        let completedDaysCount = 0;

        weekIdentifiers.forEach(weekId => {
          const weeklyGoal = goals.weekly[weekId];
          if (weeklyGoal && weeklyGoal.taskSplitUp) {
            const weekDates = getWeekDates(weekId);

            Object.entries(weeklyGoal.taskSplitUp).forEach(([day, task]) => {
              if (task && task.trim() !== '') {
                const dateKey = weekDates[day];
                const dailyGoal = goals.daily[dateKey];

                if (dailyGoal && dailyGoal.performance && typeof dailyGoal.performance.completion !== 'undefined') {
                  totalCompletion += Number(dailyGoal.performance.completion) || 0;
                  completedDaysCount++;
                }
              }
            });
          }
        });

        const dayWeight = 100 / totalPlannedDays;
        const avgDayCompletion = completedDaysCount > 0 ? totalCompletion / completedDaysCount : 0;
        const monthlyCompletion = (avgDayCompletion * completedDaysCount * dayWeight) / 100;

        return {
          ...goalData,
          performance: {
            ...goalData.performance,
            completion: Math.round(monthlyCompletion)
          }
        };
      }

      // Quarterly: Calculate from monthly goals
      if (level === 'quarterly') {
        if (!goals.monthly) {
          return goalData;
        }

        const [year, quarter] = identifier.split('-Q');
        const quarterNum = parseInt(quarter);
        const quarterStart = startOfQuarter(new Date(parseInt(year), (quarterNum - 1) * 3, 1));
        const quarterEnd = endOfQuarter(quarterStart);
        const quarterMonths = eachDayOfInterval({ start: quarterStart, end: quarterEnd });

        const monthIdentifiers = new Set();
        quarterMonths.forEach(date => {
          monthIdentifiers.add(getIdentifierForDate(date, 'monthly'));
        });

        const totalMonths = monthIdentifiers.size;
        let totalCompletion = 0;
        let completedMonths = 0;

        monthIdentifiers.forEach(monthId => {
          const monthlyGoal = goals.monthly[monthId];
          if (monthlyGoal && monthlyGoal.performance && typeof monthlyGoal.performance.completion !== 'undefined') {
            totalCompletion += Number(monthlyGoal.performance.completion) || 0;
            completedMonths++;
          }
        });

        const monthWeight = 100 / totalMonths;
        const avgMonthCompletion = completedMonths > 0 ? totalCompletion / completedMonths : 0;
        const quarterlyCompletion = (avgMonthCompletion * completedMonths * monthWeight) / 100;

        return {
          ...goalData,
          performance: {
            ...goalData.performance,
            completion: Math.round(quarterlyCompletion)
          }
        };
      }

      return goalData;
    },
    [goals, getIdentifierForDate, getWeekDates]
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
      autoCalculateCompletion,
    }),
    [getCompletion, getStreak, getTrend, getHabitCompletion, getPeriodCompletion, getInsights, autoCalculateCompletion]
  );
};
