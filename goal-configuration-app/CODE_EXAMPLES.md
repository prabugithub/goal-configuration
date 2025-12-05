# Code Examples: Monthly Planning Feature

## Core Logic Examples

### Example 1: Calculate Monthly Planning Date

```javascript
import { getMonthlyPlanningDate, isMonthlyPlanningDate } from './planningDateUtils';

// February 2025 - Feb 1 is Saturday
const feb1 = new Date(2025, 1, 1);
const planningDate = getMonthlyPlanningDate(feb1);

console.log(planningDate); // Date object: Feb 2, 2025 (Sunday)
console.log(planningDate.getDate()); // 2
console.log(planningDate.getDay()); // 0 (Sunday)

// Check if a specific date is the monthly planning date
console.log(isMonthlyPlanningDate(new Date(2025, 1, 2))); // true
console.log(isMonthlyPlanningDate(new Date(2025, 1, 1))); // false
```

### Example 2: Detect Missing Monthly Planning

```javascript
import { getMissingMonthlyPlanning } from './planningDateUtils';

// User is on Feb 14 (Friday)
const feb14 = new Date(2025, 1, 14);
const missingMonth = getMissingMonthlyPlanning(feb14);

if (missingMonth) {
  console.log(`Missing planning for: ${missingMonth}`); // "2025-2"
  // Show dialog to user
} else {
  console.log('Monthly planning is up to date');
  // Continue normally
}
```

### Example 3: Get Week Boundaries

```javascript
import { getWeekStart, getWeekEnd } from './planningDateUtils';

const anyDateInWeek = new Date(2025, 1, 14); // Feb 14 (Friday)

const sunday = getWeekStart(anyDateInWeek);  // Feb 9 (Sunday)
const saturday = getWeekEnd(anyDateInWeek);  // Feb 15 (Saturday)

console.log(sunday.toLocaleDateString());    // 2/9/2025
console.log(saturday.toLocaleDateString());  // 2/15/2025
```

### Example 4: Human-Readable Month Info

```javascript
import { getMonthPlanningInfo, getMonthInfoFromIdentifier } from './planningDateUtils';

// From a date
const info = getMonthPlanningInfo(new Date(2025, 1, 15));
console.log(info);
// {
//   month: 'February',
//   year: 2025,
//   date: 2,
//   monthIdentifier: '2025-2',
//   planningDate: Date(2025, 1, 2)
// }

// From an identifier
const info2 = getMonthInfoFromIdentifier('2025-2');
console.log(info2);
// {
//   month: 'February',
//   year: 2025,
//   monthIdentifier: '2025-2'
// }
```

## React Hook Examples

### Example 1: Basic Hook Usage

```javascript
import { useMonthlyPlanningCheck } from '../../hooks/useMonthlyPlanningCheck';

function MyComponent() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [savedData, setSavedData] = useState({});

  // Only check when on weekly planning level
  const monthlyCheck = useMonthlyPlanningCheck(selectedDate, savedData);

  return (
    <div>
      {monthlyCheck.hasMissing && (
        <div>
          Missing planning for {monthlyCheck.monthInfo.month}!
          <button onClick={monthlyCheck.dismiss}>Dismiss</button>
        </div>
      )}
    </div>
  );
}
```

### Example 2: Conditional Hook Activation

```javascript
import { useMonthlyPlanningCheck } from '../../hooks/useMonthlyPlanningCheck';

function TrackYourGoal() {
  const [tabIndex, setTabIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [savedData, setSavedData] = useState({});

  const levels = ['yearly', 'quarterly', 'monthly', 'weekly', 'daily'];

  // Only check when on weekly planning level
  const monthlyCheck = useMonthlyPlanningCheck(
    levels[tabIndex] === 'weekly' ? selectedDate : null,
    savedData
  );

  return (
    <>
      {/* Dialog only shows if monthlyCheck.hasMissing is true */}
      <MissingMonthlyPlanDialog
        open={monthlyCheck.hasMissing}
        monthInfo={monthlyCheck.monthInfo}
        onNavigateToMonth={handleNavigateToMonth}
        onDismiss={monthlyCheck.dismiss}
      />
    </>
  );
}
```

### Example 3: Full Integration Pattern

```javascript
import { useMonthlyPlanningCheck } from '../../hooks/useMonthlyPlanningCheck';
import { getMonthlyPlanningDate } from '../../common/utils/planningDateUtils';

function TrackYourGoal() {
  const [tabIndex, setTabIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [savedData, setSavedData] = useState({});

  const levels = ['yearly', 'quarterly', 'monthly', 'weekly', 'daily']
    .filter(level => config.levels[level]);

  // Initialize monthly planning check
  const monthlyCheck = useMonthlyPlanningCheck(
    levels[tabIndex] === 'weekly' ? selectedDate : null,
    savedData
  );

  // Handle navigation to missing monthly planning
  const handleNavigateToMissingMonthlyPlan = () => {
    const monthlyIndex = levels.indexOf('monthly');
    if (monthlyIndex >= 0) {
      // Calculate the planning date for the month
      const planningDate = getMonthlyPlanningDate(selectedDate);

      // Navigate to that date
      setSelectedDate(planningDate);

      // Switch to monthly planning level
      setTabIndex(monthlyIndex);

      // Reset dismissal state so dialog can show again if needed
      monthlyCheck.reset();
    }
  };

  return (
    <Box>
      {/* The Dialog */}
      <MissingMonthlyPlanDialog
        open={monthlyCheck.hasMissing}
        monthInfo={monthlyCheck.monthInfo}
        onNavigateToMonth={handleNavigateToMissingMonthlyPlan}
        onDismiss={monthlyCheck.dismiss}
      />

      {/* Rest of component */}
      <BreadcrumbNavigation
        selectedDate={selectedDate}
        currentLevel={levels[tabIndex]}
        onLevelChange={handleTabChange}
        levels={levels}
        savedData={savedData}
      />

      {/* Planning form */}
      {/* ... */}
    </Box>
  );
}
```

## Dialog Component Examples

### Example 1: Basic Usage

```javascript
import MissingMonthlyPlanDialog from './MissingMonthlyPlanDialog';

function MyComponent() {
  const [open, setOpen] = useState(false);
  const monthInfo = {
    month: 'February',
    year: 2025,
    monthIdentifier: '2025-2'
  };

  return (
    <MissingMonthlyPlanDialog
      open={open}
      monthInfo={monthInfo}
      onNavigateToMonth={() => {
        console.log('User wants to plan', monthInfo.month);
        setOpen(false);
      }}
      onDismiss={() => setOpen(false)}
    />
  );
}
```

### Example 2: With Data Management

```javascript
import MissingMonthlyPlanDialog from './MissingMonthlyPlanDialog';
import { getMonthlyPlanningDate } from '../utils/planningDateUtils';

function TrackYourGoal() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tabIndex, setTabIndex] = useState(0);
  const [showMissingDialog, setShowMissingDialog] = useState(false);
  const [missingMonthInfo, setMissingMonthInfo] = useState(null);

  const handleNavigateToMissingMonth = () => {
    // Calculate the first Sunday of the missing month
    const planningDate = getMonthlyPlanningDate(selectedDate);

    // Update selected date
    setSelectedDate(planningDate);

    // Switch to monthly tab
    setTabIndex(levels.indexOf('monthly'));

    // Close dialog
    setShowMissingDialog(false);
  };

  return (
    <MissingMonthlyPlanDialog
      open={showMissingDialog}
      monthInfo={missingMonthInfo}
      onNavigateToMonth={handleNavigateToMissingMonth}
      onDismiss={() => setShowMissingDialog(false)}
    />
  );
}
```

## Testing Examples

### Example 1: Unit Test - Get Monthly Planning Date

```javascript
import { getMonthlyPlanningDate } from './planningDateUtils';

describe('getMonthlyPlanningDate', () => {
  test('Feb 1 = Sat, returns Feb 2 (Sun)', () => {
    const feb1 = new Date(2025, 1, 1);
    const result = getMonthlyPlanningDate(feb1);

    expect(result.getDate()).toBe(2);
    expect(result.getDay()).toBe(0); // Sunday
    expect(result.getMonth()).toBe(1); // February
  });

  test('Jan 1 = Wed, returns Jan 5 (Sun)', () => {
    const jan1 = new Date(2025, 0, 1);
    const result = getMonthlyPlanningDate(jan1);

    expect(result.getDate()).toBe(5);
    expect(result.getDay()).toBe(0); // Sunday
  });

  test('Mar 1 = Sat, returns Mar 2 (Sun)', () => {
    const mar1 = new Date(2025, 2, 1);
    const result = getMonthlyPlanningDate(mar1);

    expect(result.getDate()).toBe(2);
    expect(result.getDay()).toBe(0); // Sunday
  });
});
```

### Example 2: Integration Test - Missing Planning Detection

```javascript
import { getMissingMonthlyPlanning } from './planningDateUtils';

describe('getMissingMonthlyPlanning', () => {
  test('User on Feb 14 should detect missing Feb planning', () => {
    const feb14 = new Date(2025, 1, 14);
    const result = getMissingMonthlyPlanning(feb14);

    expect(result).toBe('2025-2');
  });

  test('User on Feb 1 should NOT detect missing (still in Jan week)', () => {
    const feb1 = new Date(2025, 1, 1);
    const result = getMissingMonthlyPlanning(feb1);

    expect(result).toBeNull();
  });

  test('User on Feb 2 (planning day) should NOT detect missing', () => {
    const feb2 = new Date(2025, 1, 2);
    const result = getMissingMonthlyPlanning(feb2);

    expect(result).toBeNull();
  });
});
```

### Example 3: Hook Test - Check and Dismiss

```javascript
import { renderHook, act } from '@testing-library/react';
import { useMonthlyPlanningCheck } from './useMonthlyPlanningCheck';

describe('useMonthlyPlanningCheck', () => {
  test('Hook detects missing monthly planning', () => {
    const feb14 = new Date(2025, 1, 14);
    const savedData = {}; // No monthly planning

    const { result } = renderHook(() =>
      useMonthlyPlanningCheck(feb14, savedData)
    );

    expect(result.current.hasMissing).toBe(true);
    expect(result.current.missingMonthIdentifier).toBe('2025-2');
  });

  test('Hook allows dismissal', () => {
    const feb14 = new Date(2025, 1, 14);
    const savedData = {};

    const { result } = renderHook(() =>
      useMonthlyPlanningCheck(feb14, savedData)
    );

    expect(result.current.hasMissing).toBe(true);

    // User dismisses
    act(() => {
      result.current.dismiss();
    });

    // Still shows as missing in data, but dismissed state affects display
    expect(result.current.hasMissing).toBe(false);
  });
});
```

## Real-World Scenarios

### Scenario 1: February 2025 - User is Late to Monthly Planning

```javascript
// Feb 2: User doesn't plan (forgets)
// Feb 7: User plans weekly
// Feb 14: User tries to plan weekly again

const selectedDate = new Date(2025, 1, 14); // Feb 14
const savedData = {
  // No monthly planning for Feb
  monthly: {
    '2025-1': { /* Jan data */ },
    // '2025-2' is MISSING
  },
  weekly: {
    '2025-01-05': { /* Jan week data */ },
    '2025-02-09': { /* Feb week data */ }
  }
};

const monthlyCheck = useMonthlyPlanningCheck(selectedDate, savedData);

console.log(monthlyCheck.hasMissing); // true
console.log(monthlyCheck.missingMonthIdentifier); // "2025-2"
console.log(monthlyCheck.monthInfo); // { month: 'February', year: 2025, ... }

// User clicks "Plan February"
const planningDate = getMonthlyPlanningDate(selectedDate);
// planningDate = Feb 2, 2025 (first Sunday)

// App navigates to Feb 2, monthly planning tab
// User fills out monthly planning
// Data is saved: savedData.monthly['2025-2'] = { /* data */ }

// User returns to weekly view
// Now monthlyCheck.hasMissing = false (planning is complete)
```

### Scenario 2: March 2025 - User is On Time

```javascript
// Mar 2: User plans monthly (on time!)
// Mar 10: User plans weekly

const selectedDate = new Date(2025, 2, 10); // Mar 10
const savedData = {
  monthly: {
    '2025-3': { /* Mar monthly data */ }, // ✓ Exists
  }
};

const monthlyCheck = useMonthlyPlanningCheck(selectedDate, savedData);

console.log(monthlyCheck.hasMissing); // false
// No dialog appears, user continues normally
```

These examples demonstrate all the ways you can use the new monthly planning feature!
