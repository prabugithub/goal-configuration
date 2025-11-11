// CACHE BUSTER v2
import { useState, useCallback, useContext } from 'react';
import {
  saveGoal,
  getGoal,
  updateGoal,
  deleteGoal,
} from '../api/services/firebaseServices';
import { useGoalCache } from './useGoalCache';
import { ToastContext } from '../context/ToastContext';

// Default toast object when context is not available
const defaultToast = {
  success: (msg) => console.log('✓ Success:', msg),
  error: (msg) => console.error('✗ Error:', msg),
  warning: (msg) => console.warn('⚠️ Warning:', msg),
  info: (msg) => console.info('ℹ️ Info:', msg),
};

/**
 * useGoals - Hook for managing goal CRUD operations
 * Handles saving, fetching, updating, and deleting goals with caching
 *
 * Usage:
 * const { goals, loading, getGoal, saveGoal, updateGoal, deleteGoal } = useGoals(userId);
 */
export const useGoals = (userId) => {
  const [goals, setGoals] = useState({});
  const [loading, setLoading] = useState(false);
  const { getCachedGoal, invalidateCache } = useGoalCache();

  // Safely get toast from context, fallback to console methods
  const toastContext = useContext(ToastContext);
  const toast = toastContext || defaultToast;

  // Fetch a goal
  const fetchGoal = useCallback(
    async (level, identifier) => {
      if (!userId) {
        toast.error('User not authenticated');
        return null;
      }

      setLoading(true);
      try {
        const data = await getCachedGoal(level, identifier, async () => {
          return await getGoal(userId, level, identifier);
        });

        setGoals((prev) => ({
          ...prev,
          [level]: { ...prev[level], [identifier]: data },
        }));

        return data;
      } catch (error) {
        console.error('Error fetching goal:', error);
        toast.error('Failed to load goal');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [userId, getCachedGoal, toast]
  );

  // Save a new goal
  const createGoal = useCallback(
    async (level, identifier, data) => {
      if (!userId) {
        toast.error('User not authenticated');
        return false;
      }

      setLoading(true);
      try {
        await saveGoal(data, userId, level, identifier);

        // Update local state
        setGoals((prev) => ({
          ...prev,
          [level]: { ...prev[level], [identifier]: data },
        }));

        // Invalidate cache
        invalidateCache(`${level}-${identifier}`);

        toast.success('Goal saved successfully!');
        return true;
      } catch (error) {
        console.error('Error saving goal:', error);
        toast.error('Failed to save goal');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [userId, invalidateCache, toast]
  );

  // Update an existing goal
  const editGoal = useCallback(
    async (level, identifier, data) => {
      if (!userId) {
        toast.error('User not authenticated');
        return false;
      }

      setLoading(true);
      try {
        await updateGoal(data, userId, level, identifier);

        // Update local state
        setGoals((prev) => ({
          ...prev,
          [level]: { ...prev[level], [identifier]: data },
        }));

        // Invalidate cache
        invalidateCache(`${level}-${identifier}`);

        toast.success('Goal updated successfully!');
        return true;
      } catch (error) {
        console.error('Error updating goal:', error);
        toast.error('Failed to update goal');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [userId, invalidateCache, toast]
  );

  // Delete a goal
  const removeGoal = useCallback(
    async (level, identifier) => {
      if (!userId) {
        toast.error('User not authenticated');
        return false;
      }

      setLoading(true);
      try {
        await deleteGoal(userId, level, identifier);

        // Update local state
        setGoals((prev) => {
          const newGoals = { ...prev };
          if (newGoals[level]) {
            delete newGoals[level][identifier];
          }
          return newGoals;
        });

        // Invalidate cache
        invalidateCache(`${level}-${identifier}`);

        toast.success('Goal deleted successfully!');
        return true;
      } catch (error) {
        console.error('Error deleting goal:', error);
        toast.error('Failed to delete goal');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [userId, invalidateCache, toast]
  );

  return {
    goals,
    loading,
    fetchGoal,
    createGoal,
    editGoal,
    removeGoal,
  };
};
