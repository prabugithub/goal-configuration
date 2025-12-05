import { useState, useEffect } from 'react';
import { getMissingMonthlyPlanning, getMonthInfoFromIdentifier } from '../common/utils/planningDateUtils';

/**
 * Hook to check if monthly planning is missing for the current week
 *
 * Returns an object with:
 * - hasMissing: boolean - true if monthly planning is missing
 * - missingMonthIdentifier: string - the month identifier of the missing plan (if hasMissing is true)
 * - monthInfo: object - human-readable info about the missing month
 * - dismiss: function - call this to dismiss the warning (for current session)
 */
export const useMonthlyPlanningCheck = (weekDate, savedData = {}) => {
    const [hasMissing, setHasMissing] = useState(false);
    const [missingMonthIdentifier, setMissingMonthIdentifier] = useState(null);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        // Only check when on weekly planning level
        if (!weekDate) {
            setHasMissing(false);
            setMissingMonthIdentifier(null);
            return;
        }

        // Get the month that might be missing planning
        const missingMonth = getMissingMonthlyPlanning(weekDate);

        if (missingMonth && !dismissed) {
            // Check if monthly plan exists for this month
            const monthlyDataExists = savedData['monthly'] && savedData['monthly'][missingMonth];

            if (!monthlyDataExists) {
                setHasMissing(true);
                setMissingMonthIdentifier(missingMonth);
            } else {
                setHasMissing(false);
                setMissingMonthIdentifier(null);
            }
        } else {
            setHasMissing(false);
            setMissingMonthIdentifier(null);
        }
    }, [weekDate, savedData, dismissed]);

    const monthInfo = missingMonthIdentifier ? getMonthInfoFromIdentifier(missingMonthIdentifier) : null;

    return {
        hasMissing,
        missingMonthIdentifier,
        monthInfo,
        dismiss: () => setDismissed(true),
        reset: () => setDismissed(false),
    };
};

export default useMonthlyPlanningCheck;
