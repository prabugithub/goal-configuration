# Weekly & Monthly Planning Logic Design

This document explains the clean, usable logic for your goal-tracking app's weekly and monthly planning system.

## Core Rules

1. **Week Definition**: Sunday through Saturday
   - Week starts on Sunday (day 0)
   - Week ends on Saturday (day 6)

2. **Monthly Planning Window**: First Sunday of the month
   - Monthly planning always happens on the first Sunday of the month
   - If a month starts mid-week, planning is deferred to the first Sunday
   - Example: Feb 1 is Saturday → Monthly planning happens Feb 2 (Sunday)

3. **Week-Month Boundaries**:
   - If a new month starts on a day other than Sunday, that week still belongs to the previous month's cycle
   - The next planning Sunday becomes the first Sunday of the new month
   - Weekly planning on the first Sunday of a new month supersedes any overlapping January week

## Implementation Files

### 1. `planningDateUtils.js` - Core Logic
Location: `src/common/utils/planningDateUtils.js`

**Key Functions:**

#### `getWeekStart(date)` → Date
Returns the Sunday of the week containing the given date.
```javascript
const sun = getWeekStart(new Date(2025, 1, 14)); // Feb 14
// Returns: Feb 9, 2025 (Sunday)
```

#### `getMonthlyPlanningDate(date)` → Date
Returns the first Sunday of the month containing the given date.
```javascript
const planDate = getMonthlyPlanningDate(new Date(2025, 1, 1)); // Feb 1
// Returns: Feb 2, 2025 (first Sunday of February)
```

#### `getMissingMonthlyPlanning(weekDate)` → string | null
Detects if monthly planning is missing for a new month when the user is on a weekly view.

**Returns:**
- `null` if planning is on track or not applicable
- `"yyyy-m"` (e.g., "2025-2") if the month is missing planning

**Logic:**
1. Gets the week containing the provided date
2. Checks if the week spans into a new month
3. Verifies if we've reached/passed the monthly planning date for that new month
4. Returns the month identifier if planning is missing

```javascript
const feb14 = new Date(2025, 1, 14);
const missing = getMissingMonthlyPlanning(feb14);
// Returns: "2025-2" (Feb planning is missing)
```

#### `getMonthPlanningInfo(date)` → Object
Returns human-readable info about a month's planning date.
```javascript
const info = getMonthPlanningInfo(new Date(2025, 1, 15));
// Returns: {
//   month: 'February',
//   year: 2025,
//   date: 2,
//   monthIdentifier: '2025-2',
//   planningDate: Date(2025, 1, 2)
// }
```

### 2. `useMonthlyPlanningCheck.js` - React Hook
Location: `src/hooks/useMonthlyPlanningCheck.js`

Monitors whether monthly planning is missing and manages dialog state.

**Props:**
- `weekDate` (Date | null): Current date when on weekly planning level
- `savedData` (Object): Existing saved planning data from Firebase

**Returns Object:**
```javascript
{
  hasMissing: boolean,           // Is monthly planning missing?
  missingMonthIdentifier: string, // "yyyy-m" format
  monthInfo: Object,              // Human-readable month info
  dismiss: Function,              // Hide dialog for this session
  reset: Function                 // Show dialog again if needed
}
```

**Usage:**
```javascript
const monthlyCheck = useMonthlyPlanningCheck(
  currentLevel === 'weekly' ? selectedDate : null,
  savedData
);

if (monthlyCheck.hasMissing) {
  // Show prompt to user
}
```

### 3. `MissingMonthlyPlanDialog.js` - UI Component
Location: `src/components/MissingMonthlyPlanDialog/MissingMonthlyPlanDialog.js`

Material-UI Dialog that prompts user to complete missing monthly planning.

**Props:**
- `open` (boolean): Show/hide dialog
- `monthInfo` (Object): `{ month, year, monthIdentifier }`
- `onNavigateToMonth` (Function): User clicked "Plan Now"
- `onDismiss` (Function): User clicked "Dismiss"

**Features:**
- Warning icon and styling
- Explains the planning rules
- Two-button UX: "Dismiss for now" and "Plan [Month]"

### 4. Integration in `TrackYourGoal.js`

**Added Imports:**
```javascript
import MissingMonthlyPlanDialog from '../MissingMonthlyPlanDialog/MissingMonthlyPlanDialog';
import { useMonthlyPlanningCheck } from '../../hooks/useMonthlyPlanningCheck';
import { getMonthlyPlanningDate } from '../../common/utils/planningDateUtils';
```

**Initialize Hook:**
```javascript
const monthlyCheck = useMonthlyPlanningCheck(
  levels[tabIndex] === 'weekly' ? selectedDate : null,
  savedData
);
```

**Navigation Handler:**
```javascript
const handleNavigateToMissingMonthlyPlan = () => {
  const monthlyIndex = levels.indexOf('monthly');
  if (monthlyIndex >= 0) {
    const planningDate = getMonthlyPlanningDate(selectedDate);
    setSelectedDate(planningDate);
    setTabIndex(monthlyIndex);
    monthlyCheck.reset();
  }
};
```

**Render Dialog:**
```jsx
<MissingMonthlyPlanDialog
  open={monthlyCheck.hasMissing}
  monthInfo={monthlyCheck.monthInfo}
  onNavigateToMonth={handleNavigateToMissingMonthlyPlan}
  onDismiss={monthlyCheck.dismiss}
/>
```

## User Experience Flow

### Scenario 1: On-Time Monthly Planning (Happy Path)
```
User: Feb 2 (Sunday) → Weekly Planning Level
System: Checks for missing monthly planning
Result: None missing, proceeds normally
```

### Scenario 2: Missed Monthly Planning Detection
```
User: Feb 14 (Friday) → Tries to plan week
System:
  1. Detects we're in a February week
  2. Checks if Feb 2 (first Sunday) had planning
  3. Finds no monthly plan for February
  4. Shows dialog: "Missing February Planning"
User Options:
  a) "Plan February" → Navigates to Feb 2, monthly planning tab
  b) "Dismiss for now" → Closes dialog, allows weekly planning (can retry later)
```

### Scenario 3: Planning Across Month Boundary
```
User: Jan 31 → Not a new month yet
System: No missing monthly planning check needed
User: Feb 9 (next planning Sunday) → Enters new month
System:
  a) If Feb 2 was missed → Shows dialog
  b) If Feb 2 was completed → No dialog, allow normal weekly planning
```

## Examples & Edge Cases

### February 2025 (Feb 1 = Saturday)
```javascript
// Timeline:
// Jan 26 (Sun) - Jan 31 (Fri): Week 1 of Jan, then Jan 31
// Feb 1 (Sat): Same week as above, first day of February
// Feb 2 (Sun): First Sunday of February → MONTHLY PLANNING DAY
// Feb 3-8: Week 1 of February
// Feb 9 (Sun): Week 2 of February

// At Feb 1:
getMissingMonthlyPlanning(new Date(2025, 1, 1)) // null (still in Jan week)

// At Feb 14:
getMissingMonthlyPlanning(new Date(2025, 1, 14)) // "2025-2" (Feb planning missing!)
```

### March 2025 (Mar 1 = Saturday)
```javascript
// Mar 1 (Sat) → Mar 2 (Sun) is first Sunday
const planDate = getMonthlyPlanningDate(new Date(2025, 2, 1));
// Returns: Mar 2, 2025
```

### Leap Year (Feb 2024)
```javascript
// Feb 1 (Thu) → Feb 4 (Sun) is first Sunday
const planDate = getMonthlyPlanningDate(new Date(2024, 1, 1));
// Returns: Feb 4, 2024
```

## Testing

Run tests to verify all scenarios:
```bash
npm test src/common/utils/planningDateUtils.test.js
```

Test coverage includes:
- Monthly planning date calculations
- Week boundaries and identifiers
- Missing planning detection
- Edge cases (leap years, month boundaries)
- Human-readable info generation
- User journey scenarios

## Design Principles

1. **Immutable Dates**: All functions return new Date objects, don't mutate inputs
2. **Timezone Aware**: Handles timezone offset corrections
3. **Type Safe**: Clear parameter types and return values
4. **Testable**: Pure functions with predictable outputs
5. **User-Centric**: Dates and identifiers match user expectations
6. **Non-Blocking**: Users can dismiss the dialog and come back later

## Common Questions

**Q: What if a user dismisses the dialog but never plans that month?**
A: The check resets when they navigate away or the week changes. If they return to a weekly view in that month, the dialog will show again.

**Q: What happens to weekly tasks if monthly planning is incomplete?**
A: Currently, the dialog prompts but doesn't block. You can enhance this by preventing the "Save" button on weekly tasks if monthly planning is missing.

**Q: Does this affect past months?**
A: No. The check only triggers when entering a new month's planning week. Past months are not re-checked.

**Q: How does this work with quarterly/yearly planning?**
A: The logic focuses on monthly boundaries. Quarterly and yearly planning follow their own hierarchical cascade. Monthly planning acts as a synchronization point.

## Future Enhancements

1. **Blocking Save**: Prevent weekly plan save until monthly is complete
2. **Progressive Disclosure**: Show a subtle warning badge instead of dialog for non-intrusive UX
3. **Catch-Up Mode**: Allow planning multiple missing months in one session
4. **Analytics**: Track how many monthly plans are missed and when
5. **Smart Scheduling**: Recommend best time to catch up on missed planning
