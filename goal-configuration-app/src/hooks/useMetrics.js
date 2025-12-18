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
    const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

    for (let i = 0; i < 7; i++) {
      const date = new Date(sunday);
      date.setDate(sunday.getDate() + i);
      weekDates[dayNames[i]] = format(date, 'yyyy-MM-dd');
    }

    return weekDates;
  }, []);

  // Get completion data for a specific period
  const getPeriodCompletion = useCallback(
    (level, periodType, offset = 0) => {
      let now = new Date();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Apply time offset based on period type
      if (offset > 0) {
        switch (periodType) {
          case 'week':
            now.setDate(now.getDate() - (offset * 7));
            break;
          case 'month':
            now.setMonth(now.getMonth() - offset);
            break;
          case 'quarter':
            now.setMonth(now.getMonth() - (offset * 3));
            break;
          case 'year':
            now.setFullYear(now.getFullYear() - offset);
            break;
        }
      }

      // HIERARCHICAL CALCULATION LOGIC

      // 1. WEEKLY COMPLETION (based on daily goals from planned days)
      if (level === 'daily' && periodType === 'week') {
        if (!goals.weekly || !goals.daily) {
          return { percentage: 0, completed: 0, total: 0 };
        }

        // Get current week identifier
        const currentWeekId = getIdentifierForDate(now, 'weekly');
        const weekDates = getWeekDates(currentWeekId);

        // Count total planned days (Future = Always Planned, Past = Plan dependent)
        let totalPlannedDays = 0;
        let totalCompletion = 0;
        let completedDaysCount = 0;

        const weeklyGoal = goals.weekly[currentWeekId];
        const taskSplitUp = weeklyGoal?.taskSplitUp || {};

        Object.entries(weekDates).forEach(([dayName, dateStr]) => {
          const date = new Date(dateStr);
          date.setHours(0, 0, 0, 0);

          if (date > today) {
            // Future date: Always counts as a planned day
            totalPlannedDays++;
            // Completion is 0 for future
          } else {
            // Past/Today: Only counts if in plan
            const task = taskSplitUp[dayName];
            if (task && task.trim() !== '') {
              totalPlannedDays++;

              const dailyGoal = goals.daily[dateStr];
              if (dailyGoal && dailyGoal.performance && typeof dailyGoal.performance.completion !== 'undefined') {
                const val = dailyGoal.performance.completion;
                const completionVal = (typeof val === 'object' && val !== null) ? val.completion : val;
                totalCompletion += Number(completionVal) || 0;
                completedDaysCount++;
              }
            }
          }
        });

        if (totalPlannedDays === 0) {
          return { percentage: 0, completed: 0, total: 0 };
        }

        // Weekly completion = sum of all daily completions / total planned days
        const weeklyCompletion = totalCompletion / totalPlannedDays;

        return {
          percentage: Math.round(weeklyCompletion),
          completed: completedDaysCount,
          total: totalPlannedDays,
        };
      }

      // 2. MONTHLY COMPLETION (based on daily completion % for planned days up to today)
      if (level === 'weekly' && periodType === 'month') {
        if (!goals.weekly || !goals.daily) {
          return { percentage: 0, completed: 0, total: 0 };
        }

        const monthStart = startOfMonth(now);
        const monthEnd = endOfMonth(now);
        const monthDates = eachDayOfInterval({ start: monthStart, end: monthEnd });
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get all weeks where at least 4 days fall in this month (majority of week)
        const weekIdentifiers = new Set();
        const weekDayCounts = new Map(); // Track how many days of each week are in this month

        monthDates.forEach(date => {
          const weekId = getIdentifierForDate(date, 'weekly');
          weekDayCounts.set(weekId, (weekDayCounts.get(weekId) || 0) + 1);
        });

        // Only include weeks where at least 4 days (majority) are in this month
        weekDayCounts.forEach((dayCount, weekId) => {
          if (dayCount >= 4) {
            weekIdentifiers.add(weekId);
          }
        });

        const totalWeeksInMonth = weekIdentifiers.size; // Total weeks with majority in month

        // Count total weeks with plans
        let totalWeeksWithPlans = 0;
        let totalWeeklyCompletion = 0;
        let weeksProcessed = 0;

        console.log('=== MONTHLY CALCULATION DEBUG ===');

        weekIdentifiers.forEach(weekId => {
          const weeklyGoal = goals.weekly[weekId];
          const taskSplitUp = weeklyGoal?.taskSplitUp || {};
          const weekDates = getWeekDates(weekId);

          let totalDailyCompletion = 0;
          let totalPlannedDaysInWeek = 0;
          let daysWithData = 0;
          let hasFutureOrPlannedDays = false;

          // Check each day in this week
          Object.entries(weekDates).forEach(([dayName, dateStr]) => {
            const date = new Date(dateStr);
            date.setHours(0, 0, 0, 0);

            if (date > today) {
              // Future: Counts as planned
              totalPlannedDaysInWeek++;
              hasFutureOrPlannedDays = true;
            } else {
              // Past/Today: Check plan
              const task = taskSplitUp[dayName];
              if (task && task.trim() !== '') {
                totalPlannedDaysInWeek++;
                hasFutureOrPlannedDays = true;

                const dailyGoal = goals.daily[dateStr];
                if (dailyGoal && dailyGoal.performance && typeof dailyGoal.performance.completion !== 'undefined') {
                  const val = dailyGoal.performance.completion;
                  const completionVal = (typeof val === 'object' && val !== null) ? val.completion : val;
                  const completion = Number(completionVal) || 0;
                  totalDailyCompletion += completion;
                  daysWithData++;
                }
              }
            }
          });

          if (hasFutureOrPlannedDays) {
            totalWeeksWithPlans++;
            let weekCompletion = 0;
            if (totalPlannedDaysInWeek > 0) {
              weekCompletion = totalDailyCompletion / totalPlannedDaysInWeek;
            }
            totalWeeklyCompletion += weekCompletion;
            weeksProcessed++;
            console.log(`  Week ${weekId}: ${weekCompletion.toFixed(2)}% (${totalPlannedDaysInWeek} planned days)`);
          }
        });

        if (totalWeeksWithPlans === 0) {
          return { percentage: 0, completed: 0, total: totalWeeksInMonth };
        }

        // Monthly completion = average of all weeks' completion percentages
        const monthlyCompletion = weeksProcessed > 0 ? totalWeeklyCompletion / totalWeeksWithPlans : 0;
        console.log(`\nMonthly total: ${totalWeeklyCompletion.toFixed(2)} / ${totalWeeksWithPlans} weeks = ${monthlyCompletion.toFixed(2)}%`);
        console.log('=== END MONTHLY CALCULATION ===\n');

        return {
          percentage: Math.round(monthlyCompletion),
          completed: weeksProcessed,
          total: totalWeeksInMonth, // Show total calendar weeks
        };
      }

      // 3. QUARTERLY COMPLETION (based on monthly completion calculated on-the-fly)
      if (level === 'monthly' && periodType === 'quarter') {
        if (!goals.weekly || !goals.daily) {
          return { percentage: 0, completed: 0, total: 0 };
        }

        const quarterStart = startOfQuarter(now);
        const quarterEnd = endOfQuarter(now);
        const quarterMonths = eachDayOfInterval({ start: quarterStart, end: quarterEnd });
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const monthIdentifiers = new Set();
        quarterMonths.forEach(date => {
          monthIdentifiers.add(getIdentifierForDate(date, 'monthly'));
        });

        const totalMonths = monthIdentifiers.size; // Always 3 months in a quarter

        console.log('=== QUARTERLY CALCULATION DEBUG ===');
        console.log('Quarter months:', Array.from(monthIdentifiers));

        let totalCompletion = 0;
        let monthsProcessed = 0;

        // Calculate completion for each month in the quarter
        monthIdentifiers.forEach(monthId => {
          const [year, month] = monthId.split('-');
          const monthDate = new Date(parseInt(year), parseInt(month) - 1, 1);
          const monthStart = startOfMonth(monthDate);
          const monthEnd = endOfMonth(monthDate);
          const monthDates = eachDayOfInterval({ start: monthStart, end: monthEnd });

          // Get all weeks in this month
          const weekIdentifiers = new Set();
          monthDates.forEach(date => {
            weekIdentifiers.add(getIdentifierForDate(date, 'weekly'));
          });

          console.log(`\nMonth ${monthId}:`);
          console.log('  Weeks in month:', Array.from(weekIdentifiers));

          // Count total weeks with plans/future days
          let totalWeeksWithPlans = 0;
          let totalWeeklyCompletion = 0;
          let weeksProcessed = 0;

          weekIdentifiers.forEach(weekId => {
            const weeklyGoal = goals.weekly[weekId];
            const taskSplitUp = weeklyGoal?.taskSplitUp || {};
            const weekDates = getWeekDates(weekId);

            let totalDailyCompletion = 0;
            let totalPlannedDaysInWeek = 0;
            let hasFutureOrPlannedDays = false;

            Object.entries(weekDates).forEach(([dayName, dateStr]) => {
              const date = new Date(dateStr);
              date.setHours(0, 0, 0, 0);

              if (date > today) {
                totalPlannedDaysInWeek++;
                hasFutureOrPlannedDays = true;
              } else {
                const task = taskSplitUp[dayName];
                if (task && task.trim() !== '') {
                  totalPlannedDaysInWeek++;
                  hasFutureOrPlannedDays = true;
                  const dailyGoal = goals.daily[dateStr];
                  if (dailyGoal && dailyGoal.performance && typeof dailyGoal.performance.completion !== 'undefined') {
                    totalDailyCompletion += Number(dailyGoal.performance.completion) || 0;
                  }
                }
              }
            });

            if (hasFutureOrPlannedDays) {
              totalWeeksWithPlans++;
              let weekCompletion = 0;
              if (totalPlannedDaysInWeek > 0) {
                weekCompletion = totalDailyCompletion / totalPlannedDaysInWeek;
              }
              totalWeeklyCompletion += weekCompletion;
              weeksProcessed++;
            }
          });

          if (totalWeeksWithPlans === 0) {
            // Month with no plans = 0%
            monthsProcessed++;
            return;
          }

          // Calculate this month's completion
          const monthCompletion = weeksProcessed > 0 ? totalWeeklyCompletion / totalWeeksWithPlans : 0;
          console.log(`  Month completion: ${totalWeeklyCompletion.toFixed(2)} / ${totalWeeksWithPlans} weeks = ${monthCompletion.toFixed(2)}%`);

          totalCompletion += monthCompletion;
          monthsProcessed++;
        });

        // Quarterly completion = average of all 3 months
        const quarterlyCompletion = monthsProcessed > 0 ? totalCompletion / totalMonths : 0;
        console.log(`\nQuarterly total: ${totalCompletion.toFixed(2)} / ${totalMonths} months = ${quarterlyCompletion.toFixed(2)}%`);
        console.log('=== END QUARTERLY CALCULATION ===\n');

        return {
          percentage: Math.round(quarterlyCompletion),
          completed: monthsProcessed,
          total: totalMonths,
        };
      }

      // 4. YEARLY COMPLETION (based on quarterly completion calculated on-the-fly)
      if (level === 'quarterly' && periodType === 'year') {
        if (!goals.weekly || !goals.daily) {
          return { percentage: 0, completed: 0, total: 0 };
        }

        // Get all 4 quarters
        const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
        const currentYear = now.getFullYear();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        console.log('=== YEARLY CALCULATION DEBUG ===');
        console.log('Year:', currentYear);

        let totalCompletion = 0;
        let quartersProcessed = 0;

        // Calculate completion for each quarter
        quarters.forEach((q, quarterIndex) => {
          const quarterNum = quarterIndex + 1;
          const quarterStart = startOfQuarter(new Date(currentYear, quarterNum * 3 - 3, 1));
          const quarterEnd = endOfQuarter(quarterStart);
          const quarterMonths = eachDayOfInterval({ start: quarterStart, end: quarterEnd });

          const monthIdentifiers = new Set();
          quarterMonths.forEach(date => {
            monthIdentifiers.add(getIdentifierForDate(date, 'monthly'));
          });

          console.log(`\n${q} (${Array.from(monthIdentifiers).join(', ')}):`);

          let quarterCompletion = 0;
          let monthsInQuarter = 0;

          // Calculate completion for each month in this quarter
          monthIdentifiers.forEach(monthId => {
            const [year, month] = monthId.split('-');
            const monthDate = new Date(parseInt(year), parseInt(month) - 1, 1);
            const monthStart = startOfMonth(monthDate);
            const monthEnd = endOfMonth(monthDate);
            const monthDates = eachDayOfInterval({ start: monthStart, end: monthEnd });

            // Get all weeks in this month
            const weekIdentifiers = new Set();
            monthDates.forEach(date => {
              weekIdentifiers.add(getIdentifierForDate(date, 'weekly'));
            });

            // Count total weeks with plans/future days
            let totalWeeksWithPlans = 0;
            let totalWeeklyCompletion = 0;
            let weeksProcessed = 0;

            weekIdentifiers.forEach(weekId => {
              const weeklyGoal = goals.weekly[weekId];
              const taskSplitUp = weeklyGoal?.taskSplitUp || {};
              const weekDates = getWeekDates(weekId);

              let totalDailyCompletion = 0;
              let totalPlannedDaysInWeek = 0;
              let hasFutureOrPlannedDays = false;

              Object.entries(weekDates).forEach(([dayName, dateStr]) => {
                const date = new Date(dateStr);
                date.setHours(0, 0, 0, 0);

                if (date > today) {
                  totalPlannedDaysInWeek++;
                  hasFutureOrPlannedDays = true;
                } else {
                  const task = taskSplitUp[dayName];
                  if (task && task.trim() !== '') {
                    totalPlannedDaysInWeek++;
                    hasFutureOrPlannedDays = true;
                    const dailyGoal = goals.daily[dateStr];
                    if (dailyGoal && dailyGoal.performance && typeof dailyGoal.performance.completion !== 'undefined') {
                      totalDailyCompletion += Number(dailyGoal.performance.completion) || 0;
                    }
                  }
                }
              });

              if (hasFutureOrPlannedDays) {
                totalWeeksWithPlans++;
                let weekCompletion = 0;
                if (totalPlannedDaysInWeek > 0) {
                  weekCompletion = totalDailyCompletion / totalPlannedDaysInWeek;
                }
                totalWeeklyCompletion += weekCompletion;
                weeksProcessed++;
              }
            });

            if (totalWeeksWithPlans === 0) {
              // Month with no plans = 0%
              monthsInQuarter++;
              return;
            }

            // Calculate this month's completion
            const monthCompletion = weeksProcessed > 0 ? totalWeeklyCompletion / totalWeeksWithPlans : 0;
            quarterCompletion += monthCompletion;
            monthsInQuarter++;
          });

          // Calculate this quarter's completion (average of 3 months)
          const avgQuarterCompletion = monthsInQuarter > 0 ? quarterCompletion / 3 : 0;
          console.log(`  ${q} completion: ${quarterCompletion.toFixed(2)} / 3 months = ${avgQuarterCompletion.toFixed(2)}%`);

          totalCompletion += avgQuarterCompletion;
          quartersProcessed++;
        });

        // Yearly completion = average of all 4 quarters
        const yearlyCompletion = quartersProcessed > 0 ? totalCompletion / 4 : 0;
        console.log(`\nYearly total: ${totalCompletion.toFixed(2)} / 4 quarters = ${yearlyCompletion.toFixed(2)}%`);
        console.log('=== END YEARLY CALCULATION ===\n');

        return {
          percentage: Math.round(yearlyCompletion),
          completed: quartersProcessed,
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
              const val = dailyGoal.performance.completion;
              const completionVal = (typeof val === 'object' && val !== null) ? val.completion : val;
              totalCompletion += Number(completionVal) || 0;
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
                  const val = dailyGoal.performance.completion;
                  const completionVal = (typeof val === 'object' && val !== null) ? val.completion : val;
                  totalCompletion += Number(completionVal) || 0;
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
