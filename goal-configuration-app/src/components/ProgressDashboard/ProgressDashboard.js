import React, { useEffect, useState } from "react";
import { Card, CardContent, Typography, Grid } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { format, parseISO, startOfMonth, endOfMonth } from "date-fns";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  // your firebase config
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const ProgressDashboard = () => {
  const [monthlyData, setMonthlyData] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, "progress")); // Assuming your collection is 'progress'
      const rawData = [];

      querySnapshot.forEach((doc) => {
        rawData.push(doc.data());
      });

      const monthly = {};
      const heatmap = [];

      rawData.forEach(({ date, deepWork = 0, exercise = 0, meditation = 0, reading = 0 }) => {
        const parsedDate = parseISO(date);
        const key = format(parsedDate, "yyyy-MM");

        if (!monthly[key]) {
          monthly[key] = { month: key, deepWork: 0, exercise: 0, meditation: 0, reading: 0 };
        }

        monthly[key].deepWork += deepWork;
        monthly[key].exercise += exercise;
        monthly[key].meditation += meditation;
        monthly[key].reading += reading;

        heatmap.push({
          date,
          count: deepWork + exercise + meditation + reading,
        });
      });

      setMonthlyData(Object.values(monthly));
      setHeatmapData(heatmap);
    };

    fetchData();
  }, []);

  return (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6">Monthly Progress</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="deepWork" fill="#8884d8" />
                <Bar dataKey="exercise" fill="#82ca9d" />
                <Bar dataKey="meditation" fill="#ffc658" />
                <Bar dataKey="reading" fill="#ff8042" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6">Calendar Heatmap</Typography>
            <CalendarHeatmap
              startDate={startOfMonth(new Date())}
              endDate={endOfMonth(new Date())}
              values={heatmapData}
              classForValue={(value) => {
                if (!value) return "color-empty";
                if (value.count >= 180) return "color-github-4";
                if (value.count >= 120) return "color-github-3";
                if (value.count >= 60) return "color-github-2";
                return "color-github-1";
              }}
              tooltipDataAttrs={(value) => ({
                "data-tip": `${value.date}: ${value.count} min`,
              })}
            />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default ProgressDashboard;
