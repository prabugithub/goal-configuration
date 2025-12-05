import React, { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
  Alert,
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import {
  exportGoalsAsJSON,
  exportGoalsAsCSV,
  exportLevelGoalsAsCSV,
} from '../../utils/dataExportUtils';
import { useToast } from '../../hooks/useToast';

/**
 * ExportButton - Export goals data in various formats
 * Supports: JSON (full backup), CSV (all goals), CSV (specific level)
 */
export const ExportButton = ({ goals, config, userId, disabled = false }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [showLevelDialog, setShowLevelDialog] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const toast = useToast();

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleExportJSON = () => {
    try {
      exportGoalsAsJSON(userId, goals, config);
      toast.success('Goals exported as JSON!');
      handleMenuClose();
    } catch (error) {
      toast.error('Failed to export JSON');
      console.error(error);
    }
  };

  const handleExportAllCSV = () => {
    try {
      exportGoalsAsCSV(userId, goals);
      toast.success('Goals exported as CSV!');
      handleMenuClose();
    } catch (error) {
      toast.error('Failed to export CSV');
      console.error(error);
    }
  };

  const handleExportLevelCSV = (level) => {
    try {
      if (!goals[level] || Object.keys(goals[level]).length === 0) {
        toast.warning(`No goals found for ${level} level`);
        return;
      }
      exportLevelGoalsAsCSV(level, goals);
      toast.success(`${level} goals exported as CSV!`);
      setShowLevelDialog(false);
      handleMenuClose();
    } catch (error) {
      toast.error('Failed to export CSV');
      console.error(error);
    }
  };

  const hasGoals = Object.values(goals).some(
    (levelGoals) => levelGoals && Object.keys(levelGoals).length > 0
  );

  const levels = Object.keys(goals).filter(
    (level) => goals[level] && Object.keys(goals[level]).length > 0
  );

  return (
    <>
      <IconButton
        onClick={handleMenuOpen}
        disabled={disabled || !hasGoals}
        title="Export your goals"
        color="primary"
      >
        <FileDownloadIcon />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleExportJSON}>
          📋 Export as JSON (Full Backup)
        </MenuItem>
        <MenuItem onClick={handleExportAllCSV}>
          📊 Export as CSV (All Goals)
        </MenuItem>
        <MenuItem onClick={() => setShowLevelDialog(true)}>
          📄 Export as CSV (Specific Level)
        </MenuItem>
      </Menu>

      {/* Level Selection Dialog */}
      <Dialog open={showLevelDialog} onClose={() => setShowLevelDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Export Goals by Level</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Typography variant="body2" color="textSecondary">
              Select a goal level to export:
            </Typography>
            {levels.length > 0 ? (
              levels.map((level) => (
                <Button
                  key={level}
                  variant="outlined"
                  fullWidth
                  onClick={() => handleExportLevelCSV(level)}
                  sx={{ justifyContent: 'flex-start' }}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)} Goals (
                  {Object.keys(goals[level]).length})
                </Button>
              ))
            ) : (
              <Alert severity="info">No goals to export</Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowLevelDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ExportButton;
