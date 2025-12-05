# Planning Logic - Visual Guide

## Core Concept: Weekly Planning Respects Month Boundaries

### February 2025 Timeline (Example)

```
January 2025                    February 2025
Sun Mon Tue Wed Thu Fri Sat    Sun Mon Tue Wed Thu Fri Sat
                   26  27  28  29  30  31 | 1   2   3   4   5   6   7   8
                              Week A (Jan) | [Planning Week!]
                                          |  ↓
                    9  10  11  12  13  14  15 | Week B (Feb)
                    [Missing Planning Alert!]

Legend:
- Week A: Includes Feb 1 but belongs to January cycle (Feb 1 = Sat)
- [Planning Week!]: Feb 2 (Sun) = First monthly planning date
- Week B: If user reaches this week without monthly planning, show dialog
```

## Decision Tree: When to Show Missing Monthly Planning Dialog

```
User opens Weekly Planning View
         ↓
    Is current date in a new month from previous week?
         ↓
    ┌────┴─────┐
   No          Yes
    ↓           ↓
  (End)   Have we reached/passed the
          first Sunday of this month?
               ↓
          ┌────┴─────┐
         No          Yes
          ↓           ↓
        (End)    Does monthly planning
                 exist for this month?
                      ↓
                  ┌────┴─────┐
                 Yes          No
                  ↓           ↓
                (End)    🔴 SHOW DIALOG
                        "Missing [Month] Planning"
```

## Function Call Flow

```
TrackYourGoal Component
         ↓
useMonthlyPlanningCheck Hook (triggered when level='weekly')
         ↓
getMissingMonthlyPlanning(selectedDate)
         ├─→ getWeekStart(date)        [Get Sunday of current week]
         ├─→ getWeekEnd(date)          [Get Saturday of current week]
         ├─→ getMonthIdentifier(weekEnd) [Compare month IDs]
         └─→ getMonthlyPlanningDate()   [Calculate first Sunday of new month]
         ↓
Returns: "2025-2" (if missing) OR null (if not missing)
         ↓
Hook checks: savedData.monthly['2025-2'] exists?
         ├─→ Yes: hasMissing = false
         └─→ No: hasMissing = true, monthInfo = { month: 'February', year: 2025 }
         ↓
Render: <MissingMonthlyPlanDialog open={hasMissing} ... />
```

## Date Calculation Examples

### Example 1: February 1 is Saturday

```
Input: new Date(2025, 1, 1)  [Feb 1, 2025]

getMonthlyPlanningDate(feb1):
  ├─ month = 1 (February)
  ├─ firstDay = Feb 1 = Saturday (day 6)
  ├─ Calculate: (7 - 6) % 7 = 1
  └─ Result: Feb 1 + 1 day = Feb 2 (Sunday) ✓
```

### Example 2: March 1 is Saturday

```
Input: new Date(2025, 2, 1)  [Mar 1, 2025]

getMonthlyPlanningDate(mar1):
  ├─ month = 2 (March)
  ├─ firstDay = Mar 1 = Saturday (day 6)
  ├─ Calculate: (7 - 6) % 7 = 1
  └─ Result: Mar 1 + 1 day = Mar 2 (Sunday) ✓
```

### Example 3: January 1 is Wednesday

```
Input: new Date(2025, 0, 1)  [Jan 1, 2025]

getMonthlyPlanningDate(jan1):
  ├─ month = 0 (January)
  ├─ firstDay = Jan 1 = Wednesday (day 3)
  ├─ Calculate: (7 - 3) % 7 = 4
  └─ Result: Jan 1 + 4 days = Jan 5 (Sunday) ✓
```

### Example 4: April 1 is Tuesday

```
Input: new Date(2025, 3, 1)  [Apr 1, 2025]

getMonthlyPlanningDate(apr1):
  ├─ month = 3 (April)
  ├─ firstDay = Apr 1 = Tuesday (day 2)
  ├─ Calculate: (7 - 2) % 7 = 5
  └─ Result: Apr 1 + 5 days = Apr 6 (Sunday) ✓
```

## User Journey: Missed Monthly Planning

### Timeline

```
Feb 1 (Sat)
└─ User doesn't plan (it's not a planning day)

Feb 2 (Sun) ← PLANNED MONTHLY PLANNING DAY
└─ User misses it (forgets, busy, etc.)

Feb 7 (Fri)
└─ User tries to plan weekly
   └─ Completes weekly plan without monthly

Feb 14 (Fri) ← USER RETURNS TO PLAN AGAIN
└─ Opens app, goes to Weekly view
   └─ App detects:
      • Week of Feb 14 is in February
      • Feb 2 (first Sunday) had no monthly plan saved
      • ⚠️ SHOW DIALOG

   User has 2 choices:

   A) Click "Plan February"
   └─ Navigate to Feb 2, monthly tab
   └─ Fill out monthly planning
   └─ Return to weekly view

   B) Click "Dismiss for now"
   └─ Continue with weekly planning
   └─ (Dialog will show again if they come back to weekly later)
```

## Week Spanning Multiple Months

```
Last week of January + First days of February

Date:    Jan 26(Sun) 27(Mon) 28(Tue) 29(Wed) 30(Thu) 31(Fri) | Feb 1(Sat) 2(Sun) 3(Mon)...
Week:    ├────────────── WEEK A (January cycle) ─────────────────────────────────┤
Month:   └─────January──────────────────────────┬─────────February──────────────┤

Key Points:
✓ Week A includes Feb 1 but it's still the January week cycle
✓ Feb 2 (Sun) starts a new weekly cycle AND monthly planning cycle
✓ If user plans Week A (before Feb 1), no monthly check needed
✓ If user plans Week starting Feb 2, monthly check IS needed
```

## State Machine: Monthly Planning Check

```
                    ┌────────────────────┐
                    │   Initial State     │
                    │ (hasMissing=false)  │
                    └─────────┬──────────┘
                              │
                              ↓
                    ┌────────────────────┐
                    │  Detects new month │
                    │  no monthly plan    │
                    │  (hasMissing=true)  │
                    └────┬────────────────┘
                         │
          ┌──────────────┴──────────────┐
          ↓                             ↓
    ┌────────────────┐        ┌──────────────────┐
    │ User clicks    │        │ User clicks      │
    │ "Plan Month"   │        │ "Dismiss"        │
    └────────┬───────┘        └─────────┬────────┘
             │                          │
             ↓                          ↓
    ┌──────────────┐         ┌──────────────────┐
    │ Navigate to  │         │ dismissed=true   │
    │ monthly tab  │         │ (hasMissing stays│
    │ date=planned │         │  false in hook)  │
    └──────────────┘         └──────────────────┘
             │                          │
             └──────────────┬───────────┘
                            ↓
                   ┌─────────────────────┐
                   │  Dialog closes      │
                   │ Component continues │
                   │ normal operation    │
                   └─────────────────────┘
```

## Component Integration Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                   TrackYourGoal Component                   │
│                                                             │
│  State Management:                                          │
│  ├─ tabIndex (current level)                               │
│  ├─ selectedDate (user's selected date)                    │
│  └─ savedData (Firebase data)                              │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  useMonthlyPlanningCheck Hook                        │  │
│  │                                                      │  │
│  │  Input: selectedDate, savedData                      │  │
│  │  ↓                                                   │  │
│  │  Calls: getMissingMonthlyPlanning()                  │  │
│  │  ↓                                                   │  │
│  │  Output: {                                           │  │
│  │    hasMissing,          [boolean]                    │  │
│  │    missingMonthIdentifier, [string | null]          │  │
│  │    monthInfo,           [{ month, year, ... }]       │  │
│  │    dismiss(),           [function]                   │  │
│  │    reset()              [function]                   │  │
│  │  }                                                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                        ↓                                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  <MissingMonthlyPlanDialog>                          │  │
│  │                                                      │  │
│  │  Props:                                              │  │
│  │  ├─ open={monthlyCheck.hasMissing}                  │  │
│  │  ├─ monthInfo={monthlyCheck.monthInfo}              │  │
│  │  ├─ onNavigateToMonth={handler}                     │  │
│  │  └─ onDismiss={monthlyCheck.dismiss}                │  │
│  │                                                      │  │
│  │  Dialog Content:                                     │  │
│  │  ├─ Warning icon + title                            │  │
│  │  ├─ Explanation of rules                            │  │
│  │  └─ Two buttons                                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Timezone Handling

```
User's Local Date: Feb 14, 2025 (local timezone)
         ↓
JavaScript Date() automatically handles timezone
         ↓
getWeekStart(date) applies timezone offset correction:
  ├─ Gets timezone offset: date.getTimezoneOffset()
  ├─ Corrects date by milliseconds
  └─ Ensures week calculation matches user's local calendar
         ↓
Result: Correct week boundaries in user's timezone
```

## Test Scenarios Visualization

```
Test 1: Feb 1 = Saturday (Mid-week month boundary)
│
├─ Feb 1 at weekly view → No dialog (still in Jan week)
├─ Feb 2 at weekly view → No dialog (planning day itself)
├─ Feb 9 at weekly view → Dialog if no plan (missed Feb 2)
└─ Feb 14 at weekly view → Dialog if no plan (missed Feb 2)

Test 2: Mar 1 = Saturday (Similar to Feb)
│
├─ Mar 1 at weekly view → No dialog (still in Feb week)
├─ Mar 2 at weekly view → No dialog (planning day)
└─ Mar 10+ at weekly view → Dialog if no plan

Test 3: Jan 1 = Wednesday (Not a Sunday)
│
├─ Jan 1 at weekly view → No dialog (mid-week, mid-Jan)
├─ Jan 5 at weekly view → No dialog (planning day)
└─ Jan 15+ at weekly view → Dialog if no plan

Test 4: Leap Year February 2024
│
├─ Feb 1 = Thursday → Feb 4 is first Sunday
├─ Feb 4 at weekly view → No dialog (planning day)
└─ Feb 15+ at weekly view → Dialog if no plan
```

This visual guide helps understand how the system works without diving into code!
