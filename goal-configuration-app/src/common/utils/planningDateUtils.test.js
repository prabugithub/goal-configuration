/**
 * Test cases for planningDateUtils
 * Demonstrates the weekly/monthly planning logic
 */

import {
    getWeekStart,
    getWeekEnd,
    getMonthlyPlanningDate,
    isMonthlyPlanningDate,
    getMonthIdentifier,
    getWeekIdentifier,
    getMissingMonthlyPlanning,
    getMonthPlanningInfo,
} from './planningDateUtils';

/**
 * Test Scenario: February 2025
 * Feb 1 = Saturday (mid-week boundary)
 * Feb 1 is in the week starting Jan 26 (Sunday)
 * First Sunday of February = Feb 2
 */
describe('February 2025 Scenario (Feb 1 = Saturday)', () => {
    test('Feb 1 (Sat) is NOT the monthly planning date', () => {
        const feb1 = new Date(2025, 1, 1); // Feb 1, 2025
        expect(isMonthlyPlanningDate(feb1)).toBe(false);
    });

    test('Feb 2 (Sun) IS the monthly planning date', () => {
        const feb2 = new Date(2025, 1, 2); // Feb 2, 2025
        expect(isMonthlyPlanningDate(feb2)).toBe(true);
    });

    test('getMonthlyPlanningDate returns Feb 2 for any date in February', () => {
        const feb15 = new Date(2025, 1, 15);
        const planningDate = getMonthlyPlanningDate(feb15);
        expect(planningDate.getDate()).toBe(2);
        expect(planningDate.getMonth()).toBe(1); // February
    });

    test('Week containing Feb 1 belongs to January cycle (Jan 26 - Feb 1)', () => {
        const jan30 = new Date(2025, 0, 30); // Jan 30 (Thursday)
        const weekStart = getWeekStart(jan30);
        expect(weekStart.getDate()).toBe(26);
        expect(weekStart.getMonth()).toBe(0); // January
    });

    test('Week starting Feb 2 is first February week', () => {
        const feb2 = new Date(2025, 1, 2); // Feb 2 (Sunday)
        const weekStart = getWeekStart(feb2);
        expect(weekStart.getDate()).toBe(2);
        expect(weekStart.getMonth()).toBe(1); // February
    });
});

/**
 * Test Scenario: User at Feb 14 (two weeks after first planning Sunday)
 * Feb 7 (first Sunday) was missed
 * Feb 14 falls in a week of February
 * System should detect missing February monthly plan
 */
describe('Missed Monthly Planning Detection (Feb 14 case)', () => {
    test('Week of Feb 14 is in February', () => {
        const feb14 = new Date(2025, 1, 14); // Feb 14, 2025
        const weekStart = getWeekStart(feb14);
        expect(weekStart.getDate()).toBe(9); // Sunday, Feb 9
        expect(weekStart.getMonth()).toBe(1); // February
    });

    test('getMissingMonthlyPlanning detects missing February plan on Feb 14', () => {
        const feb14 = new Date(2025, 1, 14);
        const missing = getMissingMonthlyPlanning(feb14);
        expect(missing).toBe('2025-2'); // February 2025
    });

    test('getMissingMonthlyPlanning returns null if we haven\'t crossed into new month', () => {
        const feb1 = new Date(2025, 1, 1); // Feb 1, still in Jan week
        const missing = getMissingMonthlyPlanning(feb1);
        expect(missing).toBeNull();
    });

    test('getMissingMonthlyPlanning returns null for first planning Sunday', () => {
        const feb2 = new Date(2025, 1, 2); // Feb 2 (first Sunday, planning day)
        const missing = getMissingMonthlyPlanning(feb2);
        expect(missing).toBeNull();
    });
});

/**
 * Test Scenario: Week spanning month boundary
 * Last week of January might contain dates from February
 */
describe('Month Spanning Weeks', () => {
    test('Week of Jan 26 to Feb 1 contains both months', () => {
        const jan30 = new Date(2025, 0, 30);
        const weekStart = getWeekStart(jan30);
        const weekEnd = getWeekEnd(jan30);

        expect(weekStart.getMonth()).toBe(0); // January
        expect(weekEnd.getMonth()).toBe(1); // February
    });

    test('Identifiers correctly represent different months', () => {
        const jan30 = new Date(2025, 0, 30);
        const feb15 = new Date(2025, 1, 15);

        expect(getMonthIdentifier(jan30)).toBe('2025-1');
        expect(getMonthIdentifier(feb15)).toBe('2025-2');
    });
});

/**
 * Test Scenario: Different months with different first Sunday dates
 */
describe('Various Month Planning Dates', () => {
    test('January 2025: Jan 1 is Wednesday, first Sunday is Jan 5', () => {
        const jan1 = new Date(2025, 0, 1);
        const planningDate = getMonthlyPlanningDate(jan1);
        expect(planningDate.getDate()).toBe(5);
        expect(planningDate.getDay()).toBe(0); // Sunday
    });

    test('March 2025: Mar 1 is Saturday, first Sunday is Mar 2', () => {
        const mar1 = new Date(2025, 2, 1);
        const planningDate = getMonthlyPlanningDate(mar1);
        expect(planningDate.getDate()).toBe(2);
        expect(planningDate.getDay()).toBe(0); // Sunday
    });

    test('April 2025: Apr 1 is Tuesday, first Sunday is Apr 6', () => {
        const apr1 = new Date(2025, 3, 1);
        const planningDate = getMonthlyPlanningDate(apr1);
        expect(planningDate.getDate()).toBe(6);
        expect(planningDate.getDay()).toBe(0); // Sunday
    });
});

/**
 * Test Scenario: Week identifiers are consistent and unique
 */
describe('Week Identifier Consistency', () => {
    test('All dates in same week have same week identifier', () => {
        const feb9 = new Date(2025, 1, 9); // Sunday
        const feb13 = new Date(2025, 1, 13); // Thursday
        const feb15 = new Date(2025, 1, 15); // Saturday

        const id9 = getWeekIdentifier(feb9);
        const id13 = getWeekIdentifier(feb13);
        const id15 = getWeekIdentifier(feb15);

        expect(id9).toBe(id13);
        expect(id13).toBe(id15);
    });

    test('Different weeks have different identifiers', () => {
        const feb2 = new Date(2025, 1, 2); // Sunday, week 1
        const feb9 = new Date(2025, 1, 9); // Sunday, week 2

        const id1 = getWeekIdentifier(feb2);
        const id2 = getWeekIdentifier(feb9);

        expect(id1).not.toBe(id2);
    });
});

/**
 * Test Scenario: getMonthPlanningInfo provides human-readable data
 */
describe('Human-Readable Planning Info', () => {
    test('getMonthPlanningInfo returns correct details', () => {
        const feb15 = new Date(2025, 1, 15);
        const info = getMonthPlanningInfo(feb15);

        expect(info.month).toBe('February');
        expect(info.year).toBe(2025);
        expect(info.date).toBe(2); // First Sunday
        expect(info.monthIdentifier).toBe('2025-2');
    });
});

/**
 * Edge case: Leap year handling
 */
describe('Leap Year Edge Cases', () => {
    test('February 2024 (leap year): Feb 1 is Thursday, first Sunday is Feb 4', () => {
        const feb1 = new Date(2024, 1, 1);
        const planningDate = getMonthlyPlanningDate(feb1);
        expect(planningDate.getDate()).toBe(4);
        expect(planningDate.getDay()).toBe(0);
    });

    test('February 2023 (non-leap): Feb 1 is Wednesday, first Sunday is Feb 5', () => {
        const feb1 = new Date(2023, 1, 1);
        const planningDate = getMonthlyPlanningDate(feb1);
        expect(planningDate.getDate()).toBe(5);
        expect(planningDate.getDay()).toBe(0);
    });
});

/**
 * Example usage demonstration
 */
describe('Usage Example: February 2025 User Journey', () => {
    test('User on Feb 1 (Sat) - should NOT see monthly plan dialog', () => {
        const feb1 = new Date(2025, 1, 1);
        const missing = getMissingMonthlyPlanning(feb1);
        expect(missing).toBeNull(); // Still in January week
    });

    test('User on Feb 7 (Fri) - should NOT see dialog (correct planning day)', () => {
        const feb7 = new Date(2025, 1, 7);
        const missing = getMissingMonthlyPlanning(feb7);
        expect(missing).toBeNull(); // Still in planning week
    });

    test('User on Feb 14 (Fri) - SHOULD see dialog (missed Feb 2 planning)', () => {
        const feb14 = new Date(2025, 1, 14);
        const missing = getMissingMonthlyPlanning(feb14);
        expect(missing).toBe('2025-2'); // Missing February planning
    });

    test('After user clicks "Plan February", date is set to Feb 2', () => {
        const feb14 = new Date(2025, 1, 14);
        const planningDate = getMonthlyPlanningDate(feb14);
        expect(planningDate.getDate()).toBe(2);
        expect(planningDate.getDay()).toBe(0); // Sunday
    });
});
