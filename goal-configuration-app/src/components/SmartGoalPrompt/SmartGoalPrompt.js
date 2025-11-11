import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Button,
  Typography,
  Box,
  Collapse,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { format, startOfWeek, startOfMonth, getQuarter } from 'date-fns';

/**
 * SmartGoalPrompt - Intelligent suggestion system for goal entry
 * Shows contextual prompts based on:
 * - Current time of day
 * - Day of week
 * - Completion history
 * - Last goal entry time
 */
export const SmartGoalPrompt = ({ goals = {}, config = {}, onSelectLevel, currentLevel }) => {
  const [suggestion, setSuggestion] = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    // Load dismissed state from localStorage
    const isDismissed = localStorage.getItem('smartPromptDismissed');
    if (isDismissed) {
      setDismissed(true);
      return;
    }

    const suggestion = determineSuggestion(goals, config);
    setSuggestion(suggestion);
  }, [goals, config]);

  const handleDismiss = () => {
    localStorage.setItem('smartPromptDismissed', 'true');
    setDismissed(true);
  };

  const handleEnableSuggestions = () => {
    localStorage.removeItem('smartPromptDismissed');
    setDismissed(false);
  };

  if (dismissed || !suggestion) {
    return null;
  }

  return (
    <Card
      sx={{
        mb: 2,
        background: `linear-gradient(135deg, ${suggestion.color1} 0%, ${suggestion.color2} 100%)`,
        color: 'white',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {suggestion.emoji} {suggestion.title}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, opacity: 0.95 }}>
              {suggestion.message}
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={handleDismiss}
            sx={{ color: 'white', ml: 1 }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </CardContent>

      <CardActions sx={{ pt: 0 }}>
        {suggestion.level && (
          <Button
            size="small"
            variant="contained"
            sx={{
              backgroundColor: 'rgba(255,255,255,0.3)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.5)',
              },
            }}
            onClick={() => {
              onSelectLevel(suggestion.level);
              handleDismiss();
            }}
          >
            Add {suggestion.level} Goal
          </Button>
        )}
        <Button
          size="small"
          sx={{ color: 'white', ml: 'auto' }}
          onClick={() => setExpanded(!expanded)}
        >
          <ExpandMoreIcon sx={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }} />
        </Button>
      </CardActions>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent sx={{ pt: 0 }}>
          <Typography variant="caption" sx={{ opacity: 0.9 }}>
            💡 {suggestion.details}
          </Typography>
        </CardContent>
      </Collapse>
    </Card>
  );
};

/**
 * Determine the best suggestion based on current state
 */
function determineSuggestion(goals = {}, config = {}) {
  const now = new Date();
  const hour = now.getHours();
  const dayOfWeek = now.getDay();
  const dayOfMonth = now.getDate();
  const quarter = getQuarter(now);

  // Check if goals exist for each level
  const hasDailyGoals = goals.daily && Object.keys(goals.daily).length > 0;
  const hasWeeklyGoals = goals.weekly && Object.keys(goals.weekly).length > 0;
  const hasMonthlyGoals = goals.monthly && Object.keys(goals.monthly).length > 0;
  const hasQuarterlyGoals = goals.quarterly && Object.keys(goals.quarterly).length > 0;

  // Get today's date key
  const todayKey = format(now, 'yyyy-MM-dd');
  const weekStartKey = format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const monthStartKey = format(startOfMonth(now), 'yyyy-MM');

  const hasTodayGoals = goals.daily && goals.daily[todayKey];
  const hasThisWeekGoals = goals.weekly && goals.weekly[weekStartKey];
  const hasThisMonthGoals = goals.monthly && goals.monthly[monthStartKey];

  // Morning suggestions (6 AM - 10 AM)
  if (hour >= 6 && hour < 10) {
    if (!hasTodayGoals) {
      return {
        emoji: '🌅',
        title: 'Good Morning!',
        message: 'Time to plan your day? Add your daily goals.',
        level: 'daily',
        details: 'Starting your day with clear goals increases productivity by 50%+. What do you want to achieve today?',
        color1: '#FFA500',
        color2: '#FF6B6B',
      };
    }
  }

  // Evening suggestions (8 PM - 10 PM)
  if (hour >= 20 && hour < 22) {
    if (hasTodayGoals && !hasThisWeekGoals && dayOfWeek === 1) {
      // Monday evening
      return {
        emoji: '📅',
        title: 'Plan Your Week?',
        message: 'Monday evening is perfect for weekly planning. Add your weekly goals.',
        level: 'weekly',
        details: 'Weekly goals help maintain momentum and provide direction. Spend 10 minutes planning your week.',
        color1: '#9B59B6',
        color2: '#E74C3C',
      };
    }
  }

  // End of month suggestions (25th+)
  if (dayOfMonth >= 25 && dayOfMonth <= 27) {
    if (hasThisMonthGoals && !hasQuarterlyGoals) {
      return {
        emoji: '📊',
        title: 'Monthly Review Time',
        message: 'Great job completing the month! Time to set quarterly goals?',
        level: 'quarterly',
        details: 'Take 15 minutes to reflect on this month and set direction for the next quarter.',
        color1: '#27AE60',
        color2: '#2ECC71',
      };
    }
  }

  // If multiple days have goals, suggest next level
  if (hasDailyGoals) {
    const dailyGoalsCount = Object.keys(goals.daily || {}).length;

    if (dailyGoalsCount >= 5 && !hasThisWeekGoals) {
      return {
        emoji: '🎯',
        title: 'You\'re on a Roll!',
        message: `${dailyGoalsCount} days tracked. Time to set weekly goals for structure?`,
        level: 'weekly',
        details: 'Weekly goals provide context and structure for your daily efforts.',
        color1: '#3498DB',
        color2: '#2980B9',
      };
    }

    if (dailyGoalsCount >= 10 && !hasMonthlyGoals) {
      return {
        emoji: '🚀',
        title: 'Amazing Consistency!',
        message: `${dailyGoalsCount} days of goals! Add monthly goals for better tracking.`,
        level: 'monthly',
        details: 'Monthly goals help align daily efforts with bigger objectives.',
        color1: '#E67E22',
        color2: '#D35400',
      };
    }
  }

  // Default suggestion based on time
  if (!hasTodayGoals && config.levels?.daily) {
    return {
      emoji: '✨',
      title: 'Ready to Track?',
      message: 'Add today\'s goals to stay focused and motivated.',
      level: 'daily',
      details: 'Setting clear goals each morning improves focus and productivity throughout the day.',
      color1: '#3498DB',
      color2: '#2980B9',
    };
  }

  return null;
}

export default SmartGoalPrompt;
