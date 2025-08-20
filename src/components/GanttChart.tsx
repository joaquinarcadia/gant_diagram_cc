import React, { useMemo } from "react";
import { Box, Paper, Typography, Chip, Divider } from "@mui/material";
import { format, addDays, isWeekend } from "date-fns";
import { calculateTimeline } from "../utils/timelineCalculator";

interface UserStory {
    id: string;
    title: string;
    epic: string;
    minSP: number;
    maxSP: number;
    dependencies: string[];
}

interface GanttChartProps {
    userStories: UserStory[];
    startDate: Date;
    estimationType: "min" | "max";
    teamSize: number;
}

const GanttChart: React.FC<GanttChartProps> = ({ userStories, startDate, estimationType, teamSize }) => {
    // Calculate timeline for each story
    const timelineData = useMemo(() => {
        return calculateTimeline(userStories, startDate, estimationType, teamSize);
    }, [userStories, startDate, estimationType, teamSize]);

    // Calculate total duration and end date
    const totalDuration = useMemo(() => {
        return timelineData.length > 0 ? new Date(Math.max(...timelineData.map((story) => story.endDate.getTime()))) : startDate;
    }, [timelineData, startDate]);

    // Generate date headers
    const dateHeaders = useMemo(() => {
        const headers: Date[] = [];
        let currentDate = startDate;
        const endDate = totalDuration;

        while (currentDate <= endDate) {
            headers.push(currentDate);
            currentDate = addDays(currentDate, 1);
        }

        return headers;
    }, [startDate, totalDuration]);

    // Group stories by epic
    const storiesByEpic = useMemo(() => {
        const groups: { [key: string]: any[] } = {};
        timelineData.forEach((story) => {
            if (!groups[story.epic]) {
                groups[story.epic] = [];
            }
            groups[story.epic].push(story);
        });
        return groups;
    }, [timelineData]);

    const getEpicColor = (epic: string) => {
        return epic === "Consultant" ? "#1976d2" : "#dc004e";
    };

    const getStoryColor = (story: any) => {
        // Assign different colors to each story
        const colors = [
            "#1976d2", // Blue
            "#dc004e", // Red
            "#ff9800", // Orange
            "#4caf50", // Green
            "#9c27b0", // Purple
            "#00bcd4", // Cyan
            "#ff5722", // Deep Orange
            "#795548", // Brown
            "#607d8b", // Blue Grey
            "#e91e63", // Pink
            "#3f51b5", // Indigo
            "#009688", // Teal
            "#ffc107", // Amber
            "#8bc34a", // Light Green
            "#ff4081", // Pink
        ];

        // Use story ID to consistently assign colors
        const storyIndex = userStories.findIndex((s) => s.id === story.id);
        return colors[storyIndex % colors.length];
    };

    return (
        <Paper elevation={3} sx={{ p: 3, overflow: "auto" }}>
            <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                    Total Duration: {format(startDate, "MM/dd/yyyy")} - {format(totalDuration, "MM/dd/yyyy")}
                </Typography>
            </Box>

            {/* Date Headers */}
            <Box sx={{ display: "flex", mb: 2, minWidth: "fit-content" }}>
                <Box sx={{ width: 300, flexShrink: 0 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                        User Stories
                    </Typography>
                </Box>
                <Box sx={{ display: "flex", minWidth: "fit-content" }}>
                    {dateHeaders.map((date, index) => (
                        <Box
                            key={index}
                            sx={{
                                minWidth: 40,
                                height: 30,
                                border: "1px solid #e0e0e0",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "0.75rem",
                                backgroundColor: isWeekend(date) ? "#f5f5f5" : "white",
                                fontWeight: isWeekend(date) ? "bold" : "normal",
                                flexShrink: 0,
                            }}
                        >
                            {format(date, "MM/dd")}
                        </Box>
                    ))}
                </Box>
            </Box>

            {/* Stories Timeline */}
            {Object.entries(storiesByEpic).map(([epic, stories]) => (
                <Box key={epic} sx={{ mb: 3 }}>
                    {/* Epic Header */}
                    <Box sx={{ display: "flex", mb: 1 }}>
                        <Box sx={{ width: 300, flexShrink: 0 }}>
                            <Chip
                                label={epic}
                                sx={{
                                    backgroundColor: getEpicColor(epic),
                                    color: "white",
                                    fontWeight: "bold",
                                }}
                            />
                        </Box>
                        <Box sx={{ flex: 1 }} />
                    </Box>

                    {/* Stories */}
                    {stories.map((story) => (
                        <Box key={story.id} sx={{ display: "flex", mb: 1, alignItems: "center" }}>
                            <Box sx={{ width: 300, flexShrink: 0 }}>
                                <Typography variant="body2" sx={{ fontSize: "0.875rem", fontWeight: "bold" }}>
                                    {story.title}
                                    {story.dependencies.length > 0 && (
                                        <span style={{ color: "#666", fontSize: "0.7rem", marginLeft: "8px", fontWeight: "normal" }}>
                                            (depends on {story.dependencies.length} story{story.dependencies.length > 1 ? "ies" : ""})
                                        </span>
                                    )}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {story.storyPoints} SP • {story.duration} days • Dev {story.assignedDeveloper} • Sprint{" "}
                                    {Math.floor((story.sprintStartDate.getTime() - startDate.getTime()) / (10 * 24 * 60 * 60 * 1000)) + 1}
                                </Typography>
                            </Box>

                            <Box sx={{ display: "flex", minWidth: "fit-content", position: "relative" }}>
                                {dateHeaders.map((date, index) => {
                                    const isInRange = date >= story.startDate && date <= story.endDate;
                                    return (
                                        <Box
                                            key={index}
                                            sx={{
                                                minWidth: 40,
                                                height: 30,
                                                borderRight: index === dateHeaders.length - 1 ? "1px solid #e0e0e0" : "none",
                                                borderLeft: index === 0 ? "1px solid #e0e0e0" : "none",
                                                borderTop: "1px solid #e0e0e0",
                                                borderBottom: "1px solid #e0e0e0",
                                                backgroundColor: isInRange ? getStoryColor(story) : "transparent",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                position: "relative",
                                            }}
                                        >
                                            {isInRange && (
                                                <Box
                                                    sx={{
                                                        position: "absolute",
                                                        top: 0,
                                                        left: 0,
                                                        right: 0,
                                                        bottom: 0,
                                                        backgroundColor: getStoryColor(story),
                                                        opacity: 0.8,
                                                    }}
                                                />
                                            )}
                                        </Box>
                                    );
                                })}
                            </Box>
                        </Box>
                    ))}

                    <Divider sx={{ mt: 2 }} />
                </Box>
            ))}
        </Paper>
    );
};

export default GanttChart;
