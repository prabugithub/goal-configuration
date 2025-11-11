import React, { useState, useMemo } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  TextField,
  Typography,
  Stack,
  Chip,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Alert,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ShareIcon from '@mui/icons-material/Share';
import { useToast } from '../../hooks/useToast';
import { createGoalSummaryText } from '../../utils/dataExportUtils';
import { format, startOfWeek, startOfMonth } from 'date-fns';

/**
 * WhatsAppShare - Share goal summaries via WhatsApp
 * Features:
 * - Multiple summary formats (Weekly, Monthly, Quarterly)
 * - Copy to clipboard option
 * - Direct WhatsApp share
 * - Formatted emoji-rich messages
 * - URL shortener ready
 */
export const WhatsAppShare = ({ goals = {}, config = {}, metrics }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const toast = useToast();

  const [shareOpen, setShareOpen] = useState(false);
  const [reportType, setReportType] = useState('weekly'); // weekly, monthly, quarterly
  const [customMessage, setCustomMessage] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);

  const reportContent = useMemo(() => {
    let content = '';
    let title = '';

    const now = new Date();

    switch (reportType) {
      case 'weekly': {
        const weekStart = startOfWeek(now, { weekStartsOn: 1 });
        title = `📅 Weekly Goal Summary - ${format(weekStart, 'MMM dd')}`;

        const weeklyStats = metrics.getPeriodCompletion('daily', 'week');
        const streak = metrics.getStreak('daily');
        const trend = metrics.getTrend('daily', 7);

        content = `
${title}

✨ *Weekly Performance*
├─ Completion: ${weeklyStats.percentage}%
├─ Days Tracked: ${weeklyStats.completed}/${weeklyStats.total}
├─ Current Streak: 🔥 ${streak} days
└─ Trend: ${getTrendEmoji(trend.direction)} ${trend.percentage > 0 ? '+' : ''}${trend.percentage}%

📊 *Key Achievements*
${generateWeeklyAchievements(goals, weeklyStats)}

💡 *Focus Areas*
${generateFocusAreas(metrics)}
`;
        break;
      }

      case 'monthly': {
        const monthStart = startOfMonth(now);
        title = `📊 Monthly Goal Summary - ${format(monthStart, 'MMMM yyyy')}`;

        const monthlyStats = metrics.getPeriodCompletion('weekly', 'month');
        const trend = metrics.getTrend('weekly', 30);

        content = `
${title}

📈 *Monthly Overview*
├─ Weekly Goals Completion: ${monthlyStats.percentage}%
├─ Weeks Completed: ${monthlyStats.completed}/${monthlyStats.total}
├─ Trend: ${getTrendEmoji(trend.direction)} ${trend.percentage > 0 ? '+' : ''}${trend.percentage}%
└─ Status: ${getStatusEmoji(monthlyStats.percentage)}

🏆 *This Month's Wins*
${generateMonthlyAchievements(goals, monthlyStats)}

🎯 *Next Steps*
${generateNextSteps(metrics)}
`;
        break;
      }

      case 'quarterly': {
        title = `🎯 Quarterly Goal Summary - Q${Math.ceil((now.getMonth() + 1) / 3)} ${now.getFullYear()}`;

        const quarterlyStats = metrics.getPeriodCompletion('monthly', 'quarter');
        const trend = metrics.getTrend('monthly', 90);

        content = `
${title}

🚀 *Quarterly Performance*
├─ Monthly Goals Completion: ${quarterlyStats.percentage}%
├─ Months Completed: ${quarterlyStats.completed}/${quarterlyStats.total}
├─ Trend: ${getTrendEmoji(trend.direction)} ${trend.percentage > 0 ? '+' : ''}${trend.percentage}%
└─ Overall Status: ${getStatusEmoji(quarterlyStats.percentage)}

🏅 *Quarterly Achievements*
${generateQuarterlyAchievements(goals, quarterlyStats)}

📋 *Goals for Next Quarter*
${generateGoalSuggestions(metrics)}
`;
        break;
      }

      default:
        break;
    }

    return {
      title,
      content: content.trim(),
      formattedContent: customMessage ? `${customMessage}\n\n${content.trim()}` : content.trim(),
    };
  }, [reportType, goals, metrics, customMessage]);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(reportContent.formattedContent);
    toast.success('Copied to clipboard!');
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(reportContent.formattedContent);
    const whatsappUrl = `https://wa.me/?text=${text}`;
    window.open(whatsappUrl, '_blank');
    toast.success('Opening WhatsApp...');
    setShareOpen(false);
  };

  const handleWhatsAppWeb = () => {
    const text = encodeURIComponent(reportContent.formattedContent);
    const whatsappWebUrl = `https://web.whatsapp.com/send?text=${text}`;
    window.open(whatsappWebUrl, '_blank');
    toast.success('Opening WhatsApp Web...');
    setShareOpen(false);
  };

  return (
    <>
      {/* Share Button */}
      <Button
        variant="outlined"
        startIcon={<ShareIcon />}
        onClick={() => setShareOpen(true)}
        size={isMobile ? 'small' : 'medium'}
      >
        {isMobile ? 'Share' : 'Share Report'}
      </Button>

      {/* Share Dialog */}
      <Dialog open={shareOpen} onClose={() => setShareOpen(false)} fullScreen={isMobile} maxWidth="sm" fullWidth>
        <DialogTitle>Share Goal Summary via WhatsApp</DialogTitle>

        <DialogContent sx={{ py: 2 }}>
          <Stack spacing={3}>
            {/* Report Type Selection */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                Report Type
              </Typography>
              <RadioGroup value={reportType} onChange={(e) => setReportType(e.target.value)}>
                <FormControlLabel value="weekly" control={<Radio />} label="📅 Weekly Summary" />
                <FormControlLabel value="monthly" control={<Radio />} label="📊 Monthly Summary" />
                <FormControlLabel value="quarterly" control={<Radio />} label="🎯 Quarterly Summary" />
              </RadioGroup>
            </Box>

            {/* Custom Message */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                Add Personal Message (Optional)
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={isMobile ? 2 : 3}
                placeholder="Add a message before the report..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                variant="outlined"
                size="small"
              />
            </Box>

            {/* Preview */}
            <Box>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setPreviewOpen(true)}
                sx={{ mb: 2 }}
              >
                Preview Report
              </Button>

              <Alert severity="info">
                The report will be formatted with emojis and metrics for easy sharing on WhatsApp.
              </Alert>
            </Box>

            {/* Info */}
            <Alert severity="info" icon={<SendIcon />}>
              <Typography variant="body2">
                💬 <strong>Tip:</strong> You can share with any WhatsApp contact, group, or save to notes!
              </Typography>
            </Alert>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setShareOpen(false)}>Cancel</Button>
          <Button
            variant="outlined"
            startIcon={<ContentCopyIcon />}
            onClick={handleCopyToClipboard}
            size={isMobile ? 'small' : 'medium'}
          >
            Copy
          </Button>
          <Button
            variant="contained"
            startIcon={<ShareIcon />}
            onClick={handleWhatsAppShare}
            sx={{ backgroundColor: '#25D366', '&:hover': { backgroundColor: '#1DA851' } }}
            size={isMobile ? 'small' : 'medium'}
          >
            {isMobile ? 'Share' : 'WhatsApp'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        fullScreen={isMobile}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Report Preview</DialogTitle>
        <DialogContent>
          <Card sx={{ mt: 2, backgroundColor: '#f5f5f5' }}>
            <CardContent>
              <Typography
                component="pre"
                sx={{
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                  fontFamily: 'monospace',
                  fontSize: isMobile ? '0.8rem' : '0.9rem',
                  lineHeight: 1.6,
                }}
              >
                {reportContent.formattedContent}
              </Typography>
            </CardContent>
          </Card>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
          <Button
            variant="contained"
            startIcon={<ContentCopyIcon />}
            onClick={() => {
              handleCopyToClipboard();
              setPreviewOpen(false);
            }}
          >
            Copy All
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

/**
 * Helper functions to generate report content
 */

function getTrendEmoji(trend) {
  if (trend === 'up') return '📈';
  if (trend === 'down') return '📉';
  return '→';
}

function getStatusEmoji(percentage) {
  if (percentage >= 85) return '🟢 Excellent';
  if (percentage >= 70) return '🔵 Good';
  if (percentage >= 50) return '🟡 Fair';
  return '🔴 Low';
}

function generateWeeklyAchievements(goals, stats) {
  const achievementLines = [];

  if (stats.percentage >= 80) {
    achievementLines.push('✅ Maintained 80%+ completion!');
  }
  if (stats.completed >= 5) {
    achievementLines.push(`✅ Tracked ${stats.completed} days this week`);
  }
  if (goals.daily && Object.keys(goals.daily).length > 0) {
    achievementLines.push('✅ Consistent goal tracking');
  }

  if (achievementLines.length === 0) {
    achievementLines.push('✅ Started tracking goals');
  }

  return achievementLines.map((line) => `├─ ${line}`).join('\n');
}

function generateFocusAreas(metrics) {
  const insights = metrics.getInsights();
  if (insights.length === 0) {
    return '├─ Keep maintaining your current momentum!';
  }

  return insights
    .slice(0, 2)
    .map((insight) => `├─ ${insight.title}: ${insight.message}`)
    .join('\n');
}

function generateMonthlyAchievements(goals, stats) {
  const achievements = [];

  if (stats.percentage >= 80) {
    achievements.push('🏆 Exceptional monthly performance!');
  }
  if (stats.percentage >= 60) {
    achievements.push('🎯 Strong consistency this month');
  }
  if (stats.completed >= 3) {
    achievements.push(`📊 Completed ${stats.completed} full weeks`);
  }

  if (achievements.length === 0) {
    achievements.push('📈 Building momentum');
  }

  return achievements.map((line) => `├─ ${line}`).join('\n');
}

function generateNextSteps(metrics) {
  const steps = [
    '├─ 📌 Review weekly goals at start of week',
    '├─ 📝 Update progress daily',
    '├─ 🔄 Adjust goals based on completion patterns',
  ];

  return steps.join('\n');
}

function generateQuarterlyAchievements(goals, stats) {
  const achievements = [];

  if (stats.percentage >= 75) {
    achievements.push('🏅 Outstanding quarterly results!');
  }
  if (stats.percentage >= 60) {
    achievements.push('⭐ Strong quarter overall');
  }

  achievements.push(`📈 ${stats.completed}/${stats.total} months fully tracked`);

  return achievements.map((line) => `├─ ${line}`).join('\n');
}

function generateGoalSuggestions(metrics) {
  const suggestions = [
    '├─ 🎯 Refine goals based on quarterly learnings',
    '├─ 📚 Increase ambition level by 10%',
    '├─ 🔄 Maintain proven habit patterns',
  ];

  return suggestions.join('\n');
}

export default WhatsAppShare;
