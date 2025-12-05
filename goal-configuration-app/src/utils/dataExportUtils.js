/**
 * Data Export Utilities
 * Provides functions to export goals and configuration as JSON or CSV
 */

/**
 * Export all goals and configuration as JSON
 * @param {string} userId - User ID
 * @param {object} goals - Goals object with all data
 * @param {object} config - Configuration object
 * @returns {void} - Downloads JSON file
 */
export const exportGoalsAsJSON = (userId, goals, config) => {
  const exportData = {
    exportedAt: new Date().toISOString(),
    userId: userId,
    configuration: config,
    goals: goals,
    summary: {
      totalGoals: Object.values(goals).reduce(
        (total, level) => total + Object.keys(level || {}).length,
        0
      ),
      levels: Object.keys(goals),
    },
  };

  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `goals-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Export goals as CSV format
 * @param {string} userId - User ID
 * @param {object} goals - Goals object with all data
 * @returns {void} - Downloads CSV file
 */
export const exportGoalsAsCSV = (userId, goals) => {
  const rows = [
    ['Date', 'Level', 'Section', 'Field', 'Value'],
  ];

  Object.entries(goals).forEach(([level, levelGoals]) => {
    if (!levelGoals) return;

    Object.entries(levelGoals).forEach(([identifier, goal]) => {
      if (!goal) return;

      Object.entries(goal).forEach(([section, sectionData]) => {
        if (typeof sectionData !== 'object') return;

        Object.entries(sectionData).forEach(([field, value]) => {
          let displayValue = value;
          if (Array.isArray(value)) {
            displayValue = value.join('; ');
          } else if (typeof value === 'object') {
            displayValue = JSON.stringify(value);
          }

          rows.push([identifier, level, section, field, displayValue || '']);
        });
      });
    });
  });

  const csvContent = rows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `goals-export-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Export a specific period's goals as CSV
 * Useful for exporting a single week, month, etc.
 * @param {string} level - Goal level (daily, weekly, monthly, etc.)
 * @param {object} goals - Goals object
 * @returns {void} - Downloads CSV file
 */
export const exportLevelGoalsAsCSV = (level, goals) => {
  if (!goals[level]) {
    console.error(`No goals found for level: ${level}`);
    return;
  }

  const rows = [
    ['Date', 'Section', 'Field', 'Value'],
  ];

  Object.entries(goals[level]).forEach(([identifier, goal]) => {
    if (!goal) return;

    Object.entries(goal).forEach(([section, sectionData]) => {
      if (typeof sectionData !== 'object') return;

      Object.entries(sectionData).forEach(([field, value]) => {
        let displayValue = value;
        if (Array.isArray(value)) {
          displayValue = value.join('; ');
        } else if (typeof value === 'object') {
          displayValue = JSON.stringify(value);
        }

        rows.push([identifier, section, field, displayValue || '']);
      });
    });
  });

  const csvContent = rows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `goals-${level}-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Import goals from exported JSON
 * @param {file} file - JSON file to import
 * @param {function} onSuccess - Callback with imported data
 * @param {function} onError - Error callback
 */
export const importGoalsFromJSON = (file, onSuccess, onError) => {
  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);

      if (!data.goals || !data.configuration) {
        throw new Error('Invalid backup file format');
      }

      onSuccess(data);
    } catch (error) {
      onError(error);
    }
  };

  reader.onerror = () => {
    onError(new Error('Failed to read file'));
  };

  reader.readAsText(file);
};

/**
 * Create a shareable text summary of goals
 * @param {object} goals - Goals object
 * @param {string} level - Goal level to summarize
 * @returns {string} - Formatted text summary
 */
export const createGoalSummaryText = (goals, level) => {
  if (!goals[level]) return '';

  let summary = `Goal Summary for ${level.toUpperCase()}\n`;
  summary += `Generated: ${new Date().toLocaleString()}\n`;
  summary += `${'='.repeat(50)}\n\n`;

  Object.entries(goals[level]).forEach(([identifier, goal]) => {
    if (!goal) return;

    summary += `📅 ${identifier}\n`;
    summary += `${'-'.repeat(40)}\n`;

    Object.entries(goal).forEach(([section, sectionData]) => {
      if (typeof sectionData !== 'object') return;

      summary += `\n${section}:\n`;

      Object.entries(sectionData).forEach(([field, value]) => {
        let displayValue = value;
        if (Array.isArray(value)) {
          displayValue = value.join(', ');
        } else if (typeof value === 'object') {
          displayValue = JSON.stringify(value);
        }

        if (displayValue) {
          summary += `  • ${field}: ${displayValue}\n`;
        }
      });
    });

    summary += '\n';
  });

  return summary;
};
