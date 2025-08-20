import React, { useState, useMemo } from "react";
import { ThemeProvider, createTheme, CssBaseline, Container, Box, Typography, ToggleButton, ToggleButtonGroup, Paper, Grid } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import GanttChart from "./components/GanttChart";
import { format, addDays } from "date-fns";
import { calculateProjectEndDate } from "./utils/timelineCalculator";

const theme = createTheme({
    palette: {
        mode: "light",
        primary: {
            main: "#1976d2",
        },
        secondary: {
            main: "#dc004e",
        },
    },
});

interface UserStory {
    id: string;
    title: string;
    epic: string;
    minSP: number;
    maxSP: number;
    dependencies: string[];
}

// User stories data
const userStories: UserStory[] = [
    // Epic: Consultant
    {
        id: "consultant-job-ui",
        title: "Job opening UI",
        epic: "Consultant",
        minSP: 3,
        maxSP: 5,
        dependencies: [],
    },
    {
        id: "consultant-job-integration",
        title: "Job opening integration",
        epic: "Consultant",
        minSP: 5,
        maxSP: 8,
        dependencies: ["consultant-job-ui"],
    },
    {
        id: "consultant-payments",
        title: "Payments integration",
        epic: "Consultant",
        minSP: 5,
        maxSP: 8,
        dependencies: [],
    },

    // Epic: Client
    {
        id: "client-interviews",
        title: "Interviews integration",
        epic: "Client",
        minSP: 5,
        maxSP: 8,
        dependencies: [],
    },
    {
        id: "client-new-interview",
        title: "New interview integration",
        epic: "Client",
        minSP: 5,
        maxSP: 8,
        dependencies: ["client-interviews"],
    },
    {
        id: "client-hire-contract",
        title: "(Hire) -> Complete and verify contract details",
        epic: "Client",
        minSP: 3,
        maxSP: 3,
        dependencies: ["client-new-interview"],
    },
    {
        id: "client-docusign",
        title: "DocuSign integration",
        epic: "Client",
        minSP: 8,
        maxSP: 8,
        dependencies: ["client-hire-contract"],
    },
    {
        id: "client-job-integration",
        title: "Job opening integration",
        epic: "Client",
        minSP: 5,
        maxSP: 8,
        dependencies: [],
    },
    {
        id: "client-post-job",
        title: "Post new job opening integration",
        epic: "Client",
        minSP: 5,
        maxSP: 8,
        dependencies: ["client-job-integration"],
    },
    {
        id: "client-search-ui",
        title: "Searching consultants UI",
        epic: "Client",
        minSP: 1,
        maxSP: 1,
        dependencies: [],
    },
    {
        id: "client-projects-ui",
        title: "Projects UI",
        epic: "Client",
        minSP: 5,
        maxSP: 5,
        dependencies: [],
    },
    {
        id: "client-projects-integration",
        title: "Projects integration",
        epic: "Client",
        minSP: 5,
        maxSP: 8,
        dependencies: ["client-projects-ui"],
    },
    {
        id: "client-worklog-ui",
        title: "Projects work log UI",
        epic: "Client",
        minSP: 3,
        maxSP: 5,
        dependencies: ["client-projects-integration"],
    },
    {
        id: "client-worklog-integration",
        title: "Projects work log integration",
        epic: "Client",
        minSP: 5,
        maxSP: 8,
        dependencies: ["client-worklog-ui"],
    },
    {
        id: "client-payments",
        title: "Payments integration",
        epic: "Client",
        minSP: 5,
        maxSP: 8,
        dependencies: [],
    },
];

function App() {
    const [estimationType, setEstimationType] = useState<"min" | "max">("min");
    const startDate = addDays(new Date(), 1); // Tomorrow

    // Calculate end dates for both minimum and maximum cases
    const minEndDate = useMemo(() => {
        return calculateProjectEndDate(userStories, startDate, "min", 3);
    }, [startDate]);

    const maxEndDate = useMemo(() => {
        return calculateProjectEndDate(userStories, startDate, "max", 3);
    }, [startDate]);

    const handleEstimationChange = (_event: React.MouseEvent<HTMLElement>, newEstimationType: "min" | "max" | null) => {
        if (newEstimationType !== null) {
            setEstimationType(newEstimationType);
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <CssBaseline />
                <Container maxWidth="xl">
                    <Box sx={{ my: 4 }}>
                        <Typography variant="h3" component="h1" gutterBottom align="center">
                            CC User Stories Gantt Chart
                        </Typography>

                        <Box sx={{ mb: 3, display: "flex", justifyContent: "center" }}>
                            <Paper elevation={2} sx={{ p: 2 }}>
                                <Grid container spacing={3} alignItems="center">
                                    <Grid>
                                        <Typography variant="body1">
                                            <strong>Start Date:</strong> {format(startDate, "MM/dd/yyyy")}
                                        </Typography>
                                    </Grid>
                                    <Grid>
                                        <Typography variant="body1">
                                            <strong>End Date:</strong> {format(estimationType === "min" ? minEndDate : maxEndDate, "MM/dd/yyyy")}
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
                                </Grid>
                            </Paper>
                        </Box>

                        <GanttChart userStories={userStories} startDate={startDate} estimationType={estimationType} teamSize={3} />
                    </Box>
                </Container>
            </LocalizationProvider>
        </ThemeProvider>
    );
}

export default App;
