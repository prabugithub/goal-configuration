/**
 * Planning Date Utilities
 *
 * Handles calendar logic for weekly and monthly planning with the rule:
 * - Week starts on Sunday
 * - Monthly planning happens on the first Sunday of the month
 * - If a month starts mid-week, monthly planning is deferred to the next Sunday
 */

/**
 * Get the start of the week (Sunday) for a given date
 * @param {Date} date - The date to get week start for
 * @returns {Date} - A new Date object set to the Sunday of that week
 */
export const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const diff = d.getDate() - day; // Adjust to Sunday
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
};

/**
 * Get the end of the week (Saturday) for a given date
 * @param {Date} date - The date to get week end for
 * @returns {Date} - A new Date object set to the Saturday of that week
 */
export const getWeekEnd = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + 6; // Adjust to Saturday
    d.setDate(diff);
    d.setHours(23, 59, 59, 999);
    return d;
};

/**
 * Get the first Sunday of a given month (the "monthly planning Sunday")
 *
 * Example: If Feb 1 is Monday, returns Feb 7 (first Sunday)
 *
 * @param {Date} date - Any date in the target month
 * @returns {Date} - The first Sunday of that month
 */
export const getMonthlyPlanningDate = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();

    // Start with the 1st of the month
    const firstDay = new Date(year, month, 1);
    const dayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Calculate how many days until the first Sunday
    const daysUntilSunday = (7 - dayOfWeek) % 7 || 0;

    // If the 1st is already Sunday, return it; otherwise add days to reach first Sunday
    const planningSunday = new Date(year, month, 1 + daysUntilSunday);
    planningSunday.setHours(0, 0, 0, 0);

    return planningSunday;
};

/**
 * Check if a given date is the monthly planning date for its month
 * @param {Date} date - The date to check
 * @returns {boolean} - True if the date is the monthly planning date for its month
 */
export const isMonthlyPlanningDate = (date) => {
    const monthlyPlanning = getMonthlyPlanningDate(date);
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);

    return normalizedDate.getTime() === monthlyPlanning.getTime();
};

/**
 * Get the month identifier from a date (e.g., "2025-2" for February 2025)
 * @param {Date} date - The date to get month identifier for
 * @returns {string} - Format: "yyyy-m" (e.g., "2025-2")
 */
export const getMonthIdentifier = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    return `${year}-${month}`;
};

/**
 * Get the week identifier from a date (e.g., "2025-01-05" for the week starting Sunday, Jan 5)
 * @param {Date} date - The date to get week identifier for
 * @returns {string} - Format: "yyyy-mm-dd" of the Sunday that week starts
 */
export const getWeekIdentifier = (date) => {
    const weekStart = getWeekStart(date);
    const year = weekStart.getFullYear();
    const month = String(weekStart.getMonth() + 1).padStart(2, '0');
    const day = String(weekStart.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Check if a weekly planning date is in the same month or previous month
 * (i.e., not yet in a new month's planning week)
 *
 * @param {Date} weekDate - The date (will be normalized to week start)
 * @returns {string|null} - If the week contains dates from a different month with missing monthly plan,
 *                          returns the month identifier of the unplanned month. Otherwise returns null.
 */
export const getMissingMonthlyPlanning = (weekDate) => {
    const weekStart = getWeekStart(weekDate);
    const weekEnd = getWeekEnd(weekDate);

    // Check if this week spans into a new month
    const startMonth = getMonthIdentifier(weekStart);
    const endMonth = getMonthIdentifier(weekEnd);

    // If we've moved to a new month and are at/past the planning date for that month
    if (startMonth !== endMonth) {
        // We've entered a new month
        const newMonthDate = new Date(weekEnd);
        const planningDate = getMonthlyPlanningDate(newMonthDate);
        const normalizedWeekStart = new Date(weekStart);
        normalizedWeekStart.setHours(0, 0, 0, 0);

        // If our week start is at or after the monthly planning date for the new month
        if (normalizedWeekStart >= planningDate) {
            return endMonth;
        }
    }

    return null;
};

/**
 * Get a human-readable description of a month planning date
 * Example: { month: 'February', year: 2025, date: 7, monthIdentifier: '2025-2' }
 *
 * @param {Date} date - Any date in the target month
 * @returns {Object} - Object with month info
 */
export const getMonthPlanningInfo = (date) => {
    const planningDate = getMonthlyPlanningDate(date);
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];

    return {
        month: monthNames[planningDate.getMonth()],
        year: planningDate.getFullYear(),
        date: planningDate.getDate(),
        monthIdentifier: getMonthIdentifier(planningDate),
        planningDate: planningDate,
    };
};

/**
 * Get a human-readable description of what month is missing planning
 *
 * @param {string} monthIdentifier - Format: "yyyy-m" (e.g., "2025-2")
 * @returns {Object} - Object with month info
 */
export const getMonthInfoFromIdentifier = (monthIdentifier) => {
    const [year, month] = monthIdentifier.split('-');
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    const monthIndex = parseInt(month) - 1;

    return {
        month: monthNames[monthIndex],
        year: parseInt(year),
        monthIdentifier: monthIdentifier,
    };
};

export default {
    getWeekStart,
    getWeekEnd,
    getMonthlyPlanningDate,
    isMonthlyPlanningDate,
    getMonthIdentifier,
    getWeekIdentifier,
    getMissingMonthlyPlanning,
    getMonthPlanningInfo,
    getMonthInfoFromIdentifier,
};
