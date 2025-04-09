import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography, Grid } from "@mui/material";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import {
  format, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays, isWithinInterval, subMonths
} from "date-fns";
import { getDailyRitualData } from "../../api/services/getDailyRitualData"; // should accept userId & date

const ProgressDashboard = ({ userId }) => {
  const [monthlyData, setMonthlyData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);

  useEffect(() => {
    const fetchMonthlyData = async () => {
      const today = new Date();
      const prevMonthDate = subMonths(today, 0);
      const monthStart = startOfMonth(prevMonthDate);
      const monthEnd = endOfMonth(prevMonthDate);
      const weekStart = startOfWeek(today, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

      const tempMonthly = {};
      const tempWeekly = [];

      // Iterate through each day of the current month
      for (let d = monthStart; d <= monthEnd; d = addDays(d, 1)) {
        const formattedDate = format(d, "yyyy-MM-dd");

        try {
          const data = await getDailyRitualData(userId, formattedDate); // expects one date fetch
          if (data) {
            const dateKey = formattedDate;

            // Monthly aggregation
            if (!tempMonthly[dateKey]) {
              tempMonthly[dateKey] = {
                date: dateKey,
                deepwork: 0,
                reading: 0,
                exercise: 0
              };
            }

            tempMonthly[dateKey].deepwork += data.deepwork || 0;
            tempMonthly[dateKey].reading += data.reading || 0;
            tempMonthly[dateKey].exercise += data.exercise || 0;

            // Weekly aggregation
            const dateObj = parseISO(dateKey);
            if (isWithinInterval(dateObj, { start: weekStart, end: weekEnd })) {
              tempWeekly.push({
                ...data,
                date: format(dateObj, "EEE") // Short weekday name
              });
            }
          }
        } catch (error) {
          console.warn(`No data for ${formattedDate}`, error.message);
        }
      }

      setMonthlyData(Object.values(tempMonthly));
      setWeeklyData(tempWeekly);
    };

    fetchMonthlyData();
  }, [userId]);

  return (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6">Weekly Progress</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="deepwork" fill="#8884d8" />
                <Bar dataKey="reading" fill="#82ca9d" />
                <Bar dataKey="exercise" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6">Monthly Progress</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="deepwork" fill="#8884d8" />
                <Bar dataKey="reading" fill="#82ca9d" />
                <Bar dataKey="exercise" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default ProgressDashboard;
