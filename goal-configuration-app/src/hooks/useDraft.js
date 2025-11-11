import { useState, useCallback, useEffect, useRef } from 'react';

const DRAFT_STORAGE_PREFIX = 'goal_draft_';

/**
 * useDraft - Hook for managing form drafts with auto-save
 * Auto-saves to localStorage and syncs with Firebase
 * Recovers draft on page reload
 *
 * Usage:
 * const { data, setData, saveStatus, submitAndClearDraft, discardDraft, hasDraft } = useDraft(
 *   level,
 *   identifier,
 *   onSubmit, // async function to save to Firebase
 * );
 */
export const useDraft = (level, identifier, onSubmit) => {
  const [data, setData] = useState(() => {
    // Load from localStorage on mount
    return loadDraft(level, identifier) || {};
  });

  const [saveStatus, setSaveStatus] = useState('saved'); // saved | saving | error
  const [hasDraft, setHasDraft] = useState(() => {
    return !!loadDraft(level, identifier);
  });

  const autoSaveTimeoutRef = useRef(null);

  // Auto-save to localStorage
  useEffect(() => {
    // Clear any pending timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Skip saving empty data
    if (Object.keys(data).length === 0) {
      return;
    }

    setSaveStatus('saving');

    // Debounce save - wait 1 second after last change
    autoSaveTimeoutRef.current = setTimeout(() => {
      try {
        const key = getDraftKey(level, identifier);
        localStorage.setItem(key, JSON.stringify(data));
        setSaveStatus('saved');
        setHasDraft(true);
        console.log(`[Draft Saved] ${key}`);
      } catch (error) {
        console.error('Error saving draft:', error);
        setSaveStatus('error');
      }
    }, 1000);

    // Cleanup on unmount
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [data, level, identifier]);

  const submitAndClearDraft = useCallback(
    async (finalData = null) => {
      const dataToSubmit = finalData || data;

      try {
        setSaveStatus('saving');

        // Call the submit handler (Firebase save)
        if (onSubmit) {
          await onSubmit(dataToSubmit);
        }

        // Clear draft from localStorage
        clearDraft(level, identifier);
        setData({});
        setHasDraft(false);

        setSaveStatus('saved');
        return true;
      } catch (error) {
        console.error('Error submitting draft:', error);
        setSaveStatus('error');
        throw error;
      }
    },
    [data, level, identifier, onSubmit]
  );

  const discardDraft = useCallback(() => {
    clearDraft(level, identifier);
    setData({});
    setHasDraft(false);
    console.log(`[Draft Discarded] ${getDraftKey(level, identifier)}`);
  }, [level, identifier]);

  const resetData = useCallback(() => {
    setData({});
  }, []);

  return {
    data,
    setData,
    saveStatus,
    submitAndClearDraft,
    discardDraft,
    resetData,
    hasDraft,
  };
};

/**
 * Utility functions for draft management
 */
const getDraftKey = (level, identifier) => {
  return `${DRAFT_STORAGE_PREFIX}${level}_${identifier}`;
};

const loadDraft = (level, identifier) => {
  try {
    const key = getDraftKey(level, identifier);
    const draft = localStorage.getItem(key);
    return draft ? JSON.parse(draft) : null;
  } catch (error) {
    console.error('Error loading draft:', error);
    return null;
  }
};

const clearDraft = (level, identifier) => {
  try {
    const key = getDraftKey(level, identifier);
    localStorage.removeItem(key);
    console.log(`[Draft Cleared] ${key}`);
  } catch (error) {
    console.error('Error clearing draft:', error);
  }
};

// Export utility functions for manual draft management
export { loadDraft, clearDraft, getDraftKey };
