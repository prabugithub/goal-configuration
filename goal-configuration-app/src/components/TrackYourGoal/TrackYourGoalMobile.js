import React, { useEffect, useRef, useState } from 'react';
import {
  Container,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
  Button,
  Stack,
  Checkbox,
  RadioGroup,
  Radio,
  FormGroup,
  FormControlLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Rating,
  IconButton,
  Tooltip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import { format } from 'date-fns';
import { useToast } from '../../hooks/useToast';
import { useDraft } from '../../hooks/useDraft';

/**
 * TrackYourGoalMobile - Mobile-optimized goal entry form
 * Features:
 * - Collapsible sections (accordion)
 * - Sticky action buttons
 * - Full-width inputs
 * - Draft auto-save
 * - Responsive date navigation
 */
export const TrackYourGoalMobile = ({
  level,
  identifier,
  sections = [],
  onSave,
  onDelete,
  initialData = {},
  loading = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const toast = useToast();

  const [formData, setFormData] = useState(initialData);
  const [editMode, setEditMode] = useState(!initialData || Object.keys(initialData).length === 0);
  const [expandedSections, setExpandedSections] = useState(
    new Array(sections.length).fill(true) // Expand first 2 sections
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: draftData, setData: setDraftData, hasDraft, submitAndClearDraft, discardDraft } = useDraft(
    level,
    identifier,
    async (finalData) => {
      await onSave(finalData);
    }
  );

  // Load draft if available
  useEffect(() => {
    if (hasDraft && draftData && Object.keys(draftData).length > 0) {
      setFormData(draftData);
      setEditMode(true);
    }
  }, [hasDraft, draftData]);

  const handleAccordionToggle = (index) => {
    const newExpanded = [...expandedSections];
    newExpanded[index] = !newExpanded[index];
    setExpandedSections(newExpanded);
  };

  const handleFieldChange = (sectionName, fieldName, value) => {
    setFormData((prev) => ({
      ...prev,
      [sectionName]: {
        ...prev[sectionName],
        [fieldName]: value,
      },
    }));

    // Update draft
    if (editMode) {
      setDraftData((prev) => ({
        ...prev,
        [sectionName]: {
          ...prev[sectionName],
          [fieldName]: value,
        },
      }));
    }
  };

  const handleSave = async () => {
    try {
      await submitAndClearDraft(formData);
      toast.success('Goal saved successfully!');
      setEditMode(false);
    } catch (error) {
      toast.error('Failed to save goal');
    }
  };

  const handleDelete = async () => {
    try {
      await onDelete();
      toast.success('Goal deleted successfully!');
      setDeleteDialogOpen(false);
    } catch (error) {
      toast.error('Failed to delete goal');
    }
  };

  const handleEdit = () => {
    setFormData(initialData);
    setEditMode(true);
  };

  const handleCancel = () => {
    discardDraft();
    setFormData(initialData);
    setEditMode(false);
  };

  // Helper function to check if a field should be displayed based on conditional logic
  const shouldShowField = (field, section) => {
    // Find the controlling field by checking if any field in the section has a conditionalField pointing to this field
    const controllingField = section.fields.find(f =>
      f.conditionalField && f.conditionalField.targetFieldName === field.name
    );

    // If no controlling field found, always show the field
    if (!controllingField) {
      return true;
    }

    // If this field is controlled by another field, check the condition
    const controlValue = formData[section.name]?.[controllingField.name];
    const condition = controllingField.conditionalField.condition;
    const thresholdValue = controllingField.conditionalField.value;

    // Evaluate the condition
    switch (condition) {
      case '<':
        return Number(controlValue) < thresholdValue;
      case '<=':
        return Number(controlValue) <= thresholdValue;
      case '>':
        return Number(controlValue) > thresholdValue;
      case '>=':
        return Number(controlValue) >= thresholdValue;
      case '==':
      case '===':
        return controlValue == thresholdValue;
      case '!=':
      case '!==':
        return controlValue != thresholdValue;
      default:
        return true;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ pb: isMobile ? '120px' : 8, px: isMobile ? 1 : 2 }}>
      {/* Header */}
      <Box sx={{ mb: 2, pt: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
          {level.charAt(0).toUpperCase() + level.slice(1)} Goal Entry
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {identifier}
        </Typography>

        {hasDraft && (
          <Chip
            label="Draft Recovery Available"
            color="warning"
            size="small"
            sx={{ mt: 1 }}
          />
        )}
      </Box>

      {/* Sections as Accordions */}
      <Stack spacing={1} sx={{ mb: 3 }}>
        {sections.map((section, idx) => (
          <Accordion
            key={section.name}
            expanded={expandedSections[idx]}
            onChange={() => handleAccordionToggle(idx)}
            sx={{
              '&.Mui-expanded': {
                margin: 0,
              },
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', flex: 1 }}>
                  {section.label || section.name}
                </Typography>
                {!editMode && formData[section.name] && Object.keys(formData[section.name]).length > 0 && (
                  <CheckIcon sx={{ color: 'success.main', fontSize: 20 }} />
                )}
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ p: isMobile ? 1.5 : 2 }}>
              <Stack spacing={2}>
                {section.fields.map((field) => {
                  // Check if field should be shown based on conditional logic
                  if (!shouldShowField(field, section)) {
                    return null;
                  }

                  return (
                    <FormField
                      key={field.name}
                      field={field}
                      value={formData[section.name]?.[field.name] || ''}
                      onChange={(val) => handleFieldChange(section.name, field.name, val)}
                      disabled={!editMode}
                      isMobile={isMobile}
                    />
                  );
                })}
              </Stack>
            </AccordionDetails>
          </Accordion>
        ))}
      </Stack>

      {/* Action Buttons - Sticky */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          bgcolor: 'background.paper',
          borderTop: `1px solid ${theme.palette.divider}`,
          p: 1.5,
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 1,
          zIndex: 100,
        }}
      >
        {editMode ? (
          <>
            <Tooltip title="Save">
              <IconButton
                color="success"
                onClick={handleSave}
                disabled={loading}
                sx={{
                  bgcolor: 'success.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'success.dark',
                  },
                  '&:disabled': {
                    bgcolor: 'grey.300',
                  }
                }}
              >
                <SaveIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Cancel">
              <IconButton
                color="error"
                onClick={handleCancel}
                disabled={loading}
                sx={{
                  bgcolor: 'error.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'error.dark',
                  },
                  '&:disabled': {
                    bgcolor: 'grey.300',
                  }
                }}
              >
                <CancelIcon />
              </IconButton>
            </Tooltip>
          </>
        ) : (
          <>
            <Tooltip title="Edit">
              <IconButton
                color="primary"
                onClick={handleEdit}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  }
                }}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton
                color="error"
                onClick={() => setDeleteDialogOpen(true)}
                sx={{
                  bgcolor: 'error.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'error.dark',
                  }
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </>
        )}
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Goal?</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this goal entry?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

/**
 * FormField - Renders different field types
 */
const FormField = ({ field, value, onChange, disabled, isMobile }) => {
  switch (field.type) {
    case 'text':
      return (
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 0.5 }}>
            {field.label}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={isMobile ? 3 : 4}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            placeholder={`Enter ${field.label.toLowerCase()}`}
            variant="outlined"
            size="small"
          />
        </Box>
      );

    case 'rating':
      const ratingValue = Number(value) || 0;
      const maxRating = 10;

      return (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
              {field.label}
            </Typography>
            <Typography variant="body2" color="primary.main" fontWeight="bold">
              {ratingValue}/{maxRating}
            </Typography>
          </Box>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 1.5,
            bgcolor: 'grey.50',
            borderRadius: 1,
          }}>
            <Rating
              value={ratingValue}
              max={maxRating}
              size="large"
              precision={1}
              onChange={(event, newValue) => onChange(newValue || 0)}
              disabled={disabled}
              sx={{
                color: 'warning.main',
                '& .MuiRating-iconEmpty': {
                  color: 'grey.300'
                }
              }}
            />
          </Box>
        </Box>
      );

    case 'number':
    case 'time':
      return (
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 0.5 }}>
            {field.label}
          </Typography>
          <TextField
            fullWidth
            type="number"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            placeholder={`Enter ${field.label.toLowerCase()}`}
            variant="outlined"
            size="small"
            inputProps={{ step: 'any' }}
          />
        </Box>
      );

    case 'checkbox':
      return (
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 1 }}>
            {field.label}
          </Typography>
          <FormGroup>
            {field.options?.map((option) => (
              <FormControlLabel
                key={option}
                control={
                  <Checkbox
                    checked={Array.isArray(value) && value.includes(option)}
                    onChange={(e) => {
                      const currentValue = Array.isArray(value) ? value : [];
                      const newValue = e.target.checked
                        ? [...currentValue, option]
                        : currentValue.filter((item) => item !== option);
                      onChange(newValue);
                    }}
                    disabled={disabled}
                  />
                }
                label={option}
              />
            ))}
          </FormGroup>
        </Box>
      );

    case 'radio':
      return (
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 1 }}>
            {field.label}
          </Typography>
          <RadioGroup value={value || ''} onChange={(e) => onChange(e.target.value)}>
            {field.options?.map((option) => (
              <FormControlLabel
                key={option}
                value={option}
                control={<Radio disabled={disabled} />}
                label={option}
              />
            ))}
          </RadioGroup>
        </Box>
      );

    case 'dropdown':
      return (
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 0.5 }}>
            {field.label}
          </Typography>
          <Select
            fullWidth
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            size="small"
          >
            <MenuItem value="">Select {field.label.toLowerCase()}</MenuItem>
            {field.options?.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </Box>
      );

    default:
      return null;
  }
};

const CheckIcon = ({ sx }) => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" sx={sx}>
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
  </svg>
);

export default TrackYourGoalMobile;
