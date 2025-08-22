import React, { useState, useMemo, useEffect } from "react";

import {
    Box,
    Button,
    Container,
    CssBaseline,
    Grid,
    Paper,
    ThemeProvider,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
    IconButton,
} from "@mui/material";
import { Brightness4, CalendarToday } from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

import { format } from "date-fns";

import StoryForm from "./components/StoryForm/StoryForm";
import GanttChart from "./components/GanttChart/GanttChart";

import { calculateProjectEndDate } from "./utils/timelineCalculator";
import { getEpicsFromStories } from "./utils/epicUtils";
import {
    getStories,
    setStories as saveStoriesToStorage,
    getTheme,
    getStartDate,
    setTheme as saveThemeToStorage,
    setStartDate as saveDateToStorage,
} from "./utils/storage";

import type { UserStory } from "./types/user-story.types";

import { lightTheme, darkTheme } from "@/theme/theme";

function App() {
    const [estimationType, setEstimationType] = useState<"min" | "max">("min");
    const [startDate, setStartDate] = useState<Date | null>(getStartDate()); // Load from storage
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [stories, setStories] = useState<UserStory[]>(getStories()); // Load from storage
    const [isStoryFormOpen, setIsStoryFormOpen] = useState(false);
    const [themeMode, setThemeMode] = useState<"light" | "dark">(getTheme()); // Load from storage
    const [isLoaded, setIsLoaded] = useState(false);

    const theme = useMemo(() => (themeMode === "light" ? lightTheme : darkTheme), [themeMode]);

    // Persist stories to localStorage whenever they change
    useEffect(() => {
        saveStoriesToStorage(stories);
    }, [stories]);

    // Persist theme to localStorage whenever it changes
    useEffect(() => {
        saveThemeToStorage(themeMode);
    }, [themeMode]);

    // Persist start date to localStorage whenever it changes
    useEffect(() => {
        saveDateToStorage(startDate);
    }, [startDate]);

    // Mark as loaded after initial render
    useEffect(() => {
        setIsLoaded(true);
    }, []);

    const handleShowDatePicker = () => {
        setShowDatePicker(!showDatePicker);
    };

    // Calculate end dates for both minimum and maximum cases
    const minEndDate = useMemo(() => {
        if (!startDate) return null;
        const endDate = calculateProjectEndDate(stories, startDate, "min", 3);
        return endDate;
    }, [startDate, stories]);

    const maxEndDate = useMemo(() => {
        if (!startDate) return null;
        const endDate = calculateProjectEndDate(stories, startDate, "max", 3);
        return endDate;
    }, [startDate, stories]);

    const handleEstimationChange = (_event: React.MouseEvent<HTMLElement>, newEstimationType: "min" | "max" | null) => {
        if (newEstimationType !== null) {
            setEstimationType(newEstimationType);
        }
    };

    const disableWeekends = (date: Date) => {
        const day = date.getDay();
        return day === 0 || day === 6;
    };

    const handleDateChange = (newValue: Date | null) => {
        setStartDate(newValue);
        setShowDatePicker(false);
    };

    const handleAddStory = (story: Partial<UserStory>) => {
        console.log("Adding story:", story);

        const newStory: UserStory = {
            id: (story.title ?? "new-story").toLowerCase().replace(/\s+/g, "-"),
            title: story.title ?? "Untitled",
            epic: story.epic ?? "",
            minSP: story.minSP ?? 1,
            maxSP: story.maxSP ?? 1,
            dependencies: story.dependencies ?? [],
            priority: story.priority ?? null,
        };

        console.log("Created new story:", newStory);

        setStories((prev) => {
            const updated = [...prev, newStory];
            console.log("Updated stories array:", updated);
            return updated;
        });
    };

    return (
        <ThemeProvider theme={theme}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <CssBaseline />
                <Container maxWidth="xl">
                    <Box
                        sx={{
                            my: 4,
                        }}
                    >
                        <Typography variant="h3" component="h1" gutterBottom align="center">
                            CC User Stories Gantt Chart
                        </Typography>

                        <Box
                            sx={{
                                mb: 3,
                                display: "flex",
                                justifyContent: "center",
                            }}
                        >
                            <Paper
                                elevation={2}
                                sx={{
                                    p: 2,
                                }}
                            >
                                <Grid container spacing={3} alignItems="center">
                                    <Grid>
                                        {!showDatePicker && (
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    cursor: "pointer",
                                                }}
                                                onClick={handleShowDatePicker}
                                            >
                                                <Typography variant="body1">
                                                    <strong>Start Date:</strong> {startDate ? format(startDate, "MM/dd/yyyy") : "-"}
                                                </Typography>
                                                <Box
                                                    sx={{
                                                        ml: 1,
                                                    }}
                                                >
                                                    <CalendarToday fontSize="small" />
                                                </Box>
                                            </Box>
                                        )}
                                        {showDatePicker && (
                                            <DatePicker
                                                open
                                                label="Start Date"
                                                value={startDate}
                                                defaultValue={startDate}
                                                onChange={handleDateChange}
                                                onClose={handleShowDatePicker}
                                                shouldDisableDate={disableWeekends}
                                                slotProps={{
                                                    textField: {
                                                        variant: "outlined",
                                                        fullWidth: true,
                                                    },
                                                }}
                                            />
                                        )}
                                    </Grid>
                                    <Grid>
                                        <Typography variant="body1">
                                            <strong>End Date:</strong>{" "}
                                            {minEndDate && maxEndDate
                                                ? format(estimationType === "min" ? minEndDate : maxEndDate, "MM/dd/yyyy")
                                                : "-"}
                                        </Typography>
                                    </Grid>
                                    <Grid>
                                        <Typography variant="body1">
                                            <strong>Team Size:</strong> 3 developers
                                        </Typography>
                                    </Grid>
                                    <Grid>
                                        <ToggleButtonGroup value={estimationType} exclusive onChange={handleEstimationChange} size="small">
                                            <ToggleButton value="min">Minimum Story Points</ToggleButton>
                                            <ToggleButton value="max">Maximum Story Points</ToggleButton>
                                        </ToggleButtonGroup>
                                    </Grid>
                                    <Grid>
                                        <IconButton
                                            sx={{ ml: 1 }}
                                            onClick={() => setThemeMode(themeMode === "light" ? "dark" : "light")}
                                            color="inherit"
                                        >
                                            <Brightness4 />
                                        </IconButton>
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Box>

                        <Box sx={{ mb: 2, display: "flex", justifyContent: "center", gap: 2 }}>
                            <Button variant="contained" onClick={() => setIsStoryFormOpen(true)}>
                                Add Story
                            </Button>
                        </Box>

                        <StoryForm
                            epics={getEpicsFromStories(stories)}
                            stories={stories}
                            onAddStory={handleAddStory}
                            open={isStoryFormOpen}
                            onClose={() => setIsStoryFormOpen(false)}
                        />
                        {!isLoaded ? (
                            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                                <Typography variant="body1" color="text.secondary">
                                    Loading data...
                                </Typography>
                            </Box>
                        ) : startDate ? (
                            <GanttChart userStories={stories} startDate={startDate} estimationType={estimationType} teamSize={3} />
                        ) : null}
                    </Box>
                </Container>
            </LocalizationProvider>
        </ThemeProvider>
    );
}

export default App;
