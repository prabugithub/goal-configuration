import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Alert,
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

/**
 * Dialog to prompt user when monthly planning is missing
 *
 * Props:
 * - open: boolean - whether dialog is visible
 * - monthInfo: object - { month: string, year: number, monthIdentifier: string }
 * - onNavigateToMonth: function - called when "Plan Now" button is clicked
 * - onDismiss: function - called when "Dismiss" button is clicked
 */
const MissingMonthlyPlanDialog = ({
    open,
    monthInfo,
    onNavigateToMonth,
    onDismiss,
}) => {
    if (!monthInfo) {
        return null;
    }

    return (
        <Dialog
            open={open}
            onClose={onDismiss}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderLeft: '4px solid #ff9800',
                }
            }}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'bold' }}>
                <WarningIcon sx={{ color: '#ff9800' }} />
                Missing Monthly Planning
            </DialogTitle>

            <DialogContent sx={{ pt: 2 }}>
                <Alert severity="warning" icon={<CalendarMonthIcon />} sx={{ mb: 2 }}>
                    You're planning a week in <strong>{monthInfo.month} {monthInfo.year}</strong>,
                    but the monthly plan for this month is missing.
                </Alert>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    According to your planning rules:
                </Typography>

                <Box sx={{ pl: 2, mb: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                        ✓ Monthly planning always happens on the first Sunday of the month
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                        ✓ If a month starts mid-week, planning is deferred to that first Sunday
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                        ✓ Weekly plans cascade from monthly plans
                    </Typography>
                </Box>

                <Typography variant="body2" sx={{ color: '#f57c00', fontWeight: 500 }}>
                    Please fill out the <strong>{monthInfo.month}</strong> monthly plan first.
                </Typography>
            </DialogContent>

            <DialogActions sx={{ p: 2, pt: 0 }}>
                <Button
                    onClick={onDismiss}
                    variant="text"
                >
                    Dismiss for now
                </Button>
                <Button
                    onClick={onNavigateToMonth}
                    variant="contained"
                    color="warning"
                    autoFocus
                >
                    Plan {monthInfo.month}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default MissingMonthlyPlanDialog;
