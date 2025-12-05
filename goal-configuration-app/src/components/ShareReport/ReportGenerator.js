import React, { useState, useRef } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Stack,
  Card,
  CardContent,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import GetAppIcon from '@mui/icons-material/GetApp';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { useToast } from '../../hooks/useToast';
import { format, startOfWeek, startOfMonth } from 'date-fns';
import html2canvas from 'html2canvas';

/**
 * ReportGenerator - Generate and export reports as Image or PDF
 * Features:
 * - Multiple report formats (Weekly, Monthly, Quarterly)
 * - HTML to Image conversion (PNG)
 * - PDF export ready (can be enhanced with jsPDF)
 * - Styled report cards
 * - Download functionality
 */
export const ReportGenerator = ({ goals = {}, config = {}, metrics, userId }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const toast = useToast();

  const [reportOpen, setReportOpen] = useState(false);
  const [reportType, setReportType] = useState('weekly');
  const [exportFormat, setExportFormat] = useState('image'); // image, pdf
  const [generating, setGenerating] = useState(false);
  const reportRef = useRef(null);

  const reportData = generateReportData(reportType, goals, metrics);

  const handleGenerateAndDownload = async () => {
    if (!reportRef.current) {
      toast.error('Report not ready');
      return;
    }

    try {
      setGenerating(true);

      if (exportFormat === 'image') {
        await generateImage();
      } else {
        await generatePDF();
      }

      toast.success(`${exportFormat === 'image' ? 'Image' : 'PDF'} downloaded!`);
      setReportOpen(false);
    } catch (error) {
      toast.error(`Failed to generate ${exportFormat}`);
      console.error(error);
    } finally {
      setGenerating(false);
    }
  };

  const generateImage = async () => {
    const canvas = await html2canvas(reportRef.current, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = `goal-report-${reportType}-${format(new Date(), 'yyyy-MM-dd')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generatePDF = async () => {
    // Note: For full PDF support, you would need jsPDF library
    // For now, we'll generate as image and show a message
    await generateImage();
    toast.info('PDF support coming soon. Downloaded as PNG for now.');
  };

  return (
    <>
      {/* Report Button */}
      <Button
        variant="outlined"
        startIcon={<GetAppIcon />}
        onClick={() => setReportOpen(true)}
        size={isMobile ? 'small' : 'medium'}
      >
        {isMobile ? 'Report' : 'Export Report'}
      </Button>

      {/* Report Dialog */}
      <Dialog open={reportOpen} onClose={() => setReportOpen(false)} fullScreen={isMobile} maxWidth="md" fullWidth>
        <DialogTitle>Generate & Export Report</DialogTitle>

        <DialogContent sx={{ py: 2 }}>
          <Stack spacing={3}>
            {/* Report Type Selection */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                📋 Report Type
              </Typography>
              <RadioGroup value={reportType} onChange={(e) => setReportType(e.target.value)}>
                <FormControlLabel value="weekly" control={<Radio />} label="📅 Weekly Report" />
                <FormControlLabel value="monthly" control={<Radio />} label="📊 Monthly Report" />
                <FormControlLabel value="quarterly" control={<Radio />} label="🎯 Quarterly Report" />
              </RadioGroup>
            </Box>

            {/* Export Format Selection */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                💾 Export Format
              </Typography>
              <RadioGroup value={exportFormat} onChange={(e) => setExportFormat(e.target.value)}>
                <FormControlLabel
                  value="image"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ImageIcon fontSize="small" />
                      <span>PNG Image (Recommended for sharing)</span>
                    </Box>
                  }
                />
                <FormControlLabel
                  value="pdf"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PictureAsPdfIcon fontSize="small" />
                      <span>PDF Document</span>
                    </Box>
                  }
                />
              </RadioGroup>
            </Box>

            {/* Report Preview */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                📄 Report Preview
              </Typography>
              <ReportPreview ref={reportRef} data={reportData} isMobile={isMobile} />
            </Box>

            {/* Info */}
            <Alert severity="info">
              <Typography variant="body2">
                💡 <strong>Tip:</strong> The report will be downloaded as a {exportFormat === 'image' ? 'PNG image' : 'PDF'} that you
                can easily share on social media or email!
              </Typography>
            </Alert>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setReportOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            startIcon={<GetAppIcon />}
            onClick={handleGenerateAndDownload}
            disabled={generating}
            size={isMobile ? 'small' : 'medium'}
          >
            {generating ? 'Generating...' : `Download ${exportFormat === 'image' ? 'PNG' : 'PDF'}`}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

/**
 * ReportPreview Component
 */
const ReportPreview = React.forwardRef(({ data, isMobile }, ref) => {
  return (
    <Card
      ref={ref}
      sx={{
        backgroundColor: '#ffffff',
        p: isMobile ? 2 : 4,
        borderRadius: '12px',
        boxShadow: 2,
        minHeight: '400px',
      }}
    >
      <CardContent sx={{ p: 0 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 3, pb: 2, borderBottom: '2px solid #e0e0e0' }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333', mb: 0.5 }}>
            {data.title}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Generated on {format(new Date(), 'MMMM dd, yyyy')}
          </Typography>
        </Box>

        {/* Key Metrics */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333', mb: 1 }}>
            📊 Key Metrics
          </Typography>
          <Stack spacing={1}>
            {data.metrics.map((metric, idx) => (
              <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5, borderBottom: '1px solid #f0f0f0' }}>
                <Typography variant="body2">{metric.label}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#2E7D32' }}>
                  {metric.value}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>

        {/* Achievements */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333', mb: 1 }}>
            🏆 Achievements
          </Typography>
          <Stack spacing={1}>
            {data.achievements.map((achievement, idx) => (
              <Typography key={idx} variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                ✓ {achievement}
              </Typography>
            ))}
          </Stack>
        </Box>

        {/* Insights */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333', mb: 1 }}>
            💡 Insights
          </Typography>
          <Stack spacing={1}>
            {data.insights.map((insight, idx) => (
              <Typography key={idx} variant="body2" sx={{ fontStyle: 'italic', color: '#555' }}>
                • {insight}
              </Typography>
            ))}
          </Stack>
        </Box>

        {/* Footer */}
        <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #e0e0e0', textAlign: 'center' }}>
          <Typography variant="caption" color="textSecondary">
            Focus2Win - Goal Tracking System
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
});

ReportPreview.displayName = 'ReportPreview';

/**
 * Generate report data based on type
 */
function generateReportData(reportType, goals, metrics) {
  const now = new Date();
  let title = '';
  let metrics_data = [];
  let achievements = [];
  let insights = [];

  switch (reportType) {
    case 'weekly': {
      const weekStart = startOfWeek(now, { weekStartsOn: 1 });
      title = `📅 Weekly Goal Summary - ${format(weekStart, 'MMM dd')}`;

      const weeklyStats = metrics.getPeriodCompletion('daily', 'week');
      const streak = metrics.getStreak('daily');
      const trend = metrics.getTrend('daily', 7);

      metrics_data = [
        { label: 'Completion Rate', value: `${weeklyStats.percentage}%` },
        { label: 'Days Tracked', value: `${weeklyStats.completed}/${weeklyStats.total}` },
        { label: 'Current Streak', value: `🔥 ${streak} days` },
        { label: 'Weekly Trend', value: `${trend.percentage > 0 ? '+' : ''}${trend.percentage}%` },
      ];

      achievements = [
        `Tracked goals for ${weeklyStats.completed} days`,
        `Achieved ${weeklyStats.percentage}% completion rate`,
        `Maintained a ${streak}-day streak`,
      ];

      insights = [
        'Stay consistent with daily goal entry',
        'Review weekly progress every Friday',
        'Adjust goals based on completion patterns',
      ];
      break;
    }

    case 'monthly': {
      const monthStart = startOfMonth(now);
      title = `📊 Monthly Goal Summary - ${format(monthStart, 'MMMM yyyy')}`;

      const monthlyStats = metrics.getPeriodCompletion('weekly', 'month');
      const trend = metrics.getTrend('weekly', 30);

      metrics_data = [
        { label: 'Weekly Goals Completion', value: `${monthlyStats.percentage}%` },
        { label: 'Weeks Completed', value: `${monthlyStats.completed}/${monthlyStats.total}` },
        { label: 'Monthly Trend', value: `${trend.percentage > 0 ? '+' : ''}${trend.percentage}%` },
        { label: 'Status', value: getStatusEmoji(monthlyStats.percentage) },
      ];

      achievements = [
        `Completed ${monthlyStats.completed} full weeks`,
        `${monthlyStats.percentage}% goal completion this month`,
        'Maintained consistent weekly planning',
      ];

      insights = [
        'Review monthly performance at month-end',
        'Identify patterns in goal completion',
        'Plan for next month based on insights',
      ];
      break;
    }

    case 'quarterly': {
      title = `🎯 Quarterly Goal Summary - Q${Math.ceil((now.getMonth() + 1) / 3)} ${now.getFullYear()}`;

      const quarterlyStats = metrics.getPeriodCompletion('monthly', 'quarter');
      const trend = metrics.getTrend('monthly', 90);

      metrics_data = [
        { label: 'Monthly Goals Completion', value: `${quarterlyStats.percentage}%` },
        { label: 'Months Completed', value: `${quarterlyStats.completed}/${quarterlyStats.total}` },
        { label: 'Quarterly Trend', value: `${trend.percentage > 0 ? '+' : ''}${trend.percentage}%` },
        { label: 'Performance', value: getStatusEmoji(quarterlyStats.percentage) },
      ];

      achievements = [
        `Completed ${quarterlyStats.completed} months of goals`,
        `${quarterlyStats.percentage}% quarterly completion`,
        'Consistent goal tracking throughout the quarter',
      ];

      insights = [
        'Reflect on quarter accomplishments',
        'Identify key learnings and patterns',
        'Plan ambitious goals for next quarter',
      ];
      break;
    }

    default:
      break;
  }

  return { title, metrics: metrics_data, achievements, insights };
}

function getStatusEmoji(percentage) {
  if (percentage >= 85) return '🟢 Excellent';
  if (percentage >= 70) return '🔵 Good';
  if (percentage >= 50) return '🟡 Fair';
  return '🔴 Low';
}

export default ReportGenerator;
