import { addDays, isWeekend } from "date-fns";

// Sprint configuration
const SPRINT_DURATION_DAYS = 10; // 2 weeks = 10 working days
const STORY_POINTS_PER_DEVELOPER_PER_SPRINT = 8;

interface UserStory {
    id: string;
    title: string;
    epic: string;
    minSP: number;
    maxSP: number;
    dependencies: string[];
}

interface TimelineStory extends UserStory {
    startDate: Date;
    endDate: Date;
    duration: number;
    storyPoints: number;
    assignedDeveloper: number;
    sprintStartDate: Date;
}

// Helper function to check if all dependencies are completed
const areDependenciesCompleted = (dependencies: string[], completedStories: Set<string>): boolean => {
    return dependencies.every((dep) => completedStories.has(dep));
};

// Helper function to get next working day
const getNextWorkingDay = (date: Date): Date => {
    let nextDay = addDays(date, 1);
    while (isWeekend(nextDay)) {
        nextDay = addDays(nextDay, 1);
    }
    return nextDay;
};

// Helper function to get sprint start date
const getSprintStartDate = (date: Date): Date => {
    // Find the start of the current sprint (Monday of the week containing the date)
    const dayOfWeek = date.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday = 0, Monday = 1
    return addDays(date, -daysToMonday);
};

// Helper function to get sprint end date
const getSprintEndDate = (sprintStartDate: Date): Date => {
    let endDate = new Date(sprintStartDate);
    let workingDays = 0;

    while (workingDays < SPRINT_DURATION_DAYS) {
        endDate = getNextWorkingDay(endDate);
        workingDays++;
    }

    return endDate;
};

// Helper function to find available developer and sprint
const findAvailableDeveloperAndSprint = (
    story: UserStory,
    latestDependencyEndDate: Date,
    developerSprintAssignments: { [key: string]: number },
    teamSize: number,
    estimationType: "min" | "max"
) => {
    const storyPoints = estimationType === "min" ? story.minSP : story.maxSP;

    // Find the earliest sprint that can accommodate this story
    let currentSprintStart = getSprintStartDate(latestDependencyEndDate);
    let assignedDeveloper = -1;
    let assignedSprintStart: Date | null = null;

    // Try sprints until we find one with available capacity
    while (assignedDeveloper === -1) {
        const sprintEnd = getSprintEndDate(currentSprintStart);

        // Check each developer's capacity in this sprint
        for (let dev = 0; dev < teamSize; dev++) {
            const devSprintKey = `${dev}-${currentSprintStart.getTime()}`;
            const currentSP = developerSprintAssignments[devSprintKey] || 0;

            if (currentSP + storyPoints <= STORY_POINTS_PER_DEVELOPER_PER_SPRINT) {
                assignedDeveloper = dev;
                assignedSprintStart = currentSprintStart;
                break;
            }
        }

        if (assignedDeveloper === -1) {
            // Move to next sprint
            currentSprintStart = getNextWorkingDay(sprintEnd);
        }
    }

    return {
        assignedDeveloper,
        sprintStartDate: assignedSprintStart,
        storyPoints,
    };
};

// Main function to calculate timeline for all stories
export const calculateTimeline = (userStories: UserStory[], startDate: Date, estimationType: "min" | "max", teamSize: number): TimelineStory[] => {
    const timeline: TimelineStory[] = [];
    const completedStories = new Set<string>();
    const developerSprintAssignments: { [key: string]: number } = {}; // Track story points per developer per sprint

    // Process stories in dependency order
    const processStories = (): boolean => {
        let hasProgress = false;

        userStories.forEach((story) => {
            if (completedStories.has(story.id)) return;

            if (areDependenciesCompleted(story.dependencies, completedStories)) {
                // Find the latest end date of all dependencies
                let latestDependencyEndDate = startDate;
                if (story.dependencies.length > 0) {
                    const dependencyEndDates = story.dependencies.map((depId) => {
                        const depStory = timeline.find((s) => s.id === depId);
                        return depStory ? depStory.endDate : startDate;
                    });
                    latestDependencyEndDate = new Date(Math.max(...dependencyEndDates.map((d) => d.getTime())));
                    // Dependent stories start on the next working day
                    latestDependencyEndDate = getNextWorkingDay(latestDependencyEndDate);
                }

                // Find available developer and sprint
                const { assignedDeveloper, sprintStartDate, storyPoints } = findAvailableDeveloperAndSprint(
                    story,
                    latestDependencyEndDate,
                    developerSprintAssignments,
                    teamSize,
                    estimationType
                );

                // Calculate story start date (within the sprint)
                const storyStartDate = getNextWorkingDay(latestDependencyEndDate);

                // Calculate end date - duration equals story points in calendar days
                let endDate = new Date(storyStartDate);
                for (let i = 0; i < storyPoints - 1; i++) {
                    endDate = addDays(endDate, 1);
                }

                // If end date falls on weekend, move to next working day
                if (isWeekend(endDate)) {
                    endDate = getNextWorkingDay(endDate);
                }

                // Update developer sprint assignments
                if (assignedDeveloper !== -1 && sprintStartDate) {
                    const devSprintKey = `${assignedDeveloper}-${sprintStartDate.getTime()}`;
                    developerSprintAssignments[devSprintKey] = (developerSprintAssignments[devSprintKey] || 0) + storyPoints;

                    timeline.push({
                        ...story,
                        startDate: storyStartDate,
                        endDate,
                        duration: storyPoints,
                        storyPoints,
                        assignedDeveloper: assignedDeveloper + 1, // Developer number (1-based)
                        sprintStartDate,
                    });

                    completedStories.add(story.id);
                    hasProgress = true;
                }
            }
        });

        return hasProgress;
    };

    // Keep processing until all stories are scheduled
    while (completedStories.size < userStories.length) {
        const progress = processStories();
        if (!progress) break; // Prevent infinite loop
    }

    return timeline;
};

// Function to calculate just the end date (for App.js)
export const calculateProjectEndDate = (userStories: UserStory[], startDate: Date, estimationType: "min" | "max", teamSize: number): Date => {
    const timeline = calculateTimeline(userStories, startDate, estimationType, teamSize);
    return timeline.length > 0 ? new Date(Math.max(...timeline.map((story) => story.endDate.getTime()))) : startDate;
};
