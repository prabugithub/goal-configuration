import React, { useState, useMemo } from 'react';
import {
  Box,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  InputAdornment,
  useMediaQuery,
  useTheme,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import CloseIcon from '@mui/icons-material/Close';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import TuneIcon from '@mui/icons-material/Tune';
import { format, parseISO, isWithinInterval, subDays } from 'date-fns';

/**
 * GoalSearch - Search and filter goals across all periods
 * Supports:
 * - Text search across all fields
 * - Date range filtering
 * - Level filtering
 * - Section filtering
 * - Completion status filtering
 */
export const GoalSearch = ({ goals = {}, config = {}, onSelectGoal }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [searchOpen, setSearchOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    dateRange: 'all', // all, 7days, 30days, custom
    customDateStart: null,
    customDateEnd: null,
    levels: [],
    sections: [],
    completionStatus: 'all', // all, completed, incomplete
  });

  // Get all sections across all levels
  const allSections = useMemo(() => {
    const sections = new Set();
    Object.values(config.sections || {}).forEach((levelSections) => {
      levelSections?.forEach((section) => {
        sections.add(section.name);
      });
    });
    return Array.from(sections);
  }, [config]);

  // Search and filter goals
  const results = useMemo(() => {
    const searchResults = [];

    Object.entries(goals).forEach(([level, levelGoals]) => {
      if (!levelGoals) return;
      if (filters.levels.length > 0 && !filters.levels.includes(level)) return;

      Object.entries(levelGoals).forEach(([identifier, goal]) => {
        if (!goal || typeof goal !== 'object') return;

        // Check date filter
        if (!matchesDateFilter(identifier, filters)) return;

        let matchedFields = [];
        let sectionMatches = [];

        Object.entries(goal).forEach(([section, sectionData]) => {
          if (typeof sectionData !== 'object') return;
          if (filters.sections.length > 0 && !filters.sections.includes(section)) return;

          Object.entries(sectionData).forEach(([field, value]) => {
            const valueStr = String(value).toLowerCase();

            if (searchQuery && !valueStr.includes(searchQuery.toLowerCase())) {
              return;
            }

            matchedFields.push({
              section,
              field,
              value,
            });

            if (!sectionMatches.includes(section)) {
              sectionMatches.push(section);
            }
          });
        });

        if (matchedFields.length > 0 || (!searchQuery && filters.levels.length === 0 && filters.sections.length === 0)) {
          searchResults.push({
            level,
            identifier,
            goal,
            matchedFields,
            matchedSections: sectionMatches,
          });
        }
      });
    });

    return searchResults.slice(0, 50); // Limit to 50 results
  }, [goals, searchQuery, filters, config]);

  const handleDateRangeChange = (range) => {
    const newFilters = { ...filters, dateRange: range };
    if (range !== 'custom') {
      newFilters.customDateStart = null;
      newFilters.customDateEnd = null;
    }
    setFilters(newFilters);
  };

  const handleLevelToggle = (level) => {
    setFilters((prev) => ({
      ...prev,
      levels: prev.levels.includes(level)
        ? prev.levels.filter((l) => l !== level)
        : [...prev.levels, level],
    }));
  };

  const handleSectionToggle = (section) => {
    setFilters((prev) => ({
      ...prev,
      sections: prev.sections.includes(section)
        ? prev.sections.filter((s) => s !== section)
        : [...prev.sections, section],
    }));
  };

  const clearFilters = () => {
    setFilters({
      dateRange: 'all',
      customDateStart: null,
      customDateEnd: null,
      levels: [],
      sections: [],
      completionStatus: 'all',
    });
    setSearchQuery('');
  };

  return (
    <>
      {/* Search Button */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search goals..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setSearchOpen(true)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'action.active' }} />
              </InputAdornment>
            ),
          }}
          variant="outlined"
        />
        <Button
          variant="outlined"
          size="small"
          onClick={() => setFilterOpen(true)}
          startIcon={<FilterAltIcon />}
          sx={{ minWidth: isMobile ? '44px' : 'auto' }}
        >
          {!isMobile && 'Filter'}
        </Button>
      </Box>

      {/* Results Count */}
      {(searchQuery || filters.levels.length > 0 || filters.sections.length > 0) && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="textSecondary">
            Found {results.length} matching goal{results.length !== 1 ? 's' : ''}
          </Typography>
        </Box>
      )}

      {/* Active Filters Chips */}
      {(filters.levels.length > 0 || filters.sections.length > 0 || filters.dateRange !== 'all') && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {filters.levels.map((level) => (
            <Chip
              key={level}
              label={level}
              onDelete={() => handleLevelToggle(level)}
              size="small"
            />
          ))}
          {filters.sections.map((section) => (
            <Chip
              key={section}
              label={section}
              onDelete={() => handleSectionToggle(section)}
              size="small"
              variant="outlined"
            />
          ))}
          {filters.dateRange !== 'all' && (
            <Chip
              label={`Last ${filters.dateRange}`}
              onDelete={() => handleDateRangeChange('all')}
              size="small"
              variant="outlined"
            />
          )}
          <Button size="small" onClick={clearFilters}>
            Clear All
          </Button>
        </Box>
      )}

      {/* Search Results */}
      {searchOpen && (
        <SearchResultsModal
          results={results}
          loading={false}
          onClose={() => setSearchOpen(false)}
          onSelectGoal={onSelectGoal}
          isMobile={isMobile}
        />
      )}

      {/* Filter Dialog */}
      <FilterDialog
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        levels={Object.keys(goals)}
        sections={allSections}
        onDateRangeChange={handleDateRangeChange}
        onLevelToggle={handleLevelToggle}
        onSectionToggle={handleSectionToggle}
        isMobile={isMobile}
      />
    </>
  );
};

/**
 * Search Results Modal
 */
const SearchResultsModal = ({ results, loading, onClose, onSelectGoal, isMobile }) => {
  return (
    <Dialog
      open={true}
      onClose={onClose}
      fullScreen={isMobile}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Search Results
        <Button onClick={onClose} color="inherit" startIcon={<CloseIcon />} />
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : results.length === 0 ? (
          <Typography color="textSecondary" sx={{ textAlign: 'center', py: 3 }}>
            No results found
          </Typography>
        ) : (
          <List sx={{ width: '100%' }}>
            {results.map((result, idx) => (
              <SearchResultItem
                key={idx}
                result={result}
                onSelect={(goal) => {
                  onSelectGoal(goal);
                  onClose();
                }}
              />
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
};

/**
 * Individual Search Result Item
 */
const SearchResultItem = ({ result, onSelect }) => {
  return (
    <>
      <ListItemButton
        onClick={() => onSelect({ level: result.level, identifier: result.identifier })}
      >
        <ListItemText
          primary={`📅 ${result.identifier}`}
          secondary={
            <>
              <Typography variant="caption" display="block">
                {result.level.toUpperCase()}
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                {result.matchedSections.map((section) => (
                  <Chip
                    key={section}
                    label={section}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Box>
            </>
          }
        />
      </ListItemButton>
      <Divider />
    </>
  );
};

/**
 * Filter Dialog
 */
const FilterDialog = ({
  open,
  onClose,
  filters,
  levels,
  sections,
  onDateRangeChange,
  onLevelToggle,
  onSectionToggle,
  isMobile,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={isMobile}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Filter Goals</DialogTitle>
      <DialogContent sx={{ py: 2 }}>
        <Stack spacing={3}>
          {/* Date Range Filter */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              📅 Date Range
            </Typography>
            <Stack spacing={1}>
              {['all', '7days', '30days'].map((range) => (
                <Chip
                  key={range}
                  label={range === 'all' ? 'All Time' : `Last ${range}`}
                  onClick={() => onDateRangeChange(range)}
                  variant={filters.dateRange === range ? 'filled' : 'outlined'}
                  color={filters.dateRange === range ? 'primary' : 'default'}
                />
              ))}
            </Stack>
          </Box>

          {/* Level Filter */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              📊 Goal Level
            </Typography>
            <Stack spacing={1}>
              {levels.map((level) => (
                <Chip
                  key={level}
                  label={level.charAt(0).toUpperCase() + level.slice(1)}
                  onClick={() => onLevelToggle(level)}
                  variant={filters.levels.includes(level) ? 'filled' : 'outlined'}
                  color={filters.levels.includes(level) ? 'primary' : 'default'}
                />
              ))}
            </Stack>
          </Box>

          {/* Section Filter */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              📋 Section
            </Typography>
            <Stack spacing={1}>
              {sections.map((section) => (
                <Chip
                  key={section}
                  label={section}
                  onClick={() => onSectionToggle(section)}
                  variant={filters.sections.includes(section) ? 'filled' : 'outlined'}
                  color={filters.sections.includes(section) ? 'primary' : 'default'}
                />
              ))}
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Done</Button>
      </DialogActions>
    </Dialog>
  );
};

/**
 * Helper function to match date filter
 */
function matchesDateFilter(dateStr, filters) {
  if (filters.dateRange === 'all') return true;

  try {
    const goalDate = parseISO(dateStr);
    const now = new Date();

    switch (filters.dateRange) {
      case '7days':
        return isWithinInterval(goalDate, {
          start: subDays(now, 7),
          end: now,
        });
      case '30days':
        return isWithinInterval(goalDate, {
          start: subDays(now, 30),
          end: now,
        });
      case 'custom':
        if (!filters.customDateStart || !filters.customDateEnd) return true;
        return isWithinInterval(goalDate, {
          start: filters.customDateStart,
          end: filters.customDateEnd,
        });
      default:
        return true;
    }
  } catch (error) {
    return true;
  }
}

export default GoalSearch;
