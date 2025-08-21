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

// Helper function to convert story points to working days
const storyPointsToWorkingDays = (storyPoints: number): number => {
    switch (storyPoints) {
        case 1:
            return 1;
        case 3:
            return 3;
        case 5:
            return 5;
        case 8:
            return 10;
        default:
            return storyPoints; // fallback for other values
    }
};

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
    developerStoryAssignments: { [key: string]: { startDate: Date; endDate: Date }[] },
    teamSize: number,
    estimationType: "min" | "max"
) => {
    const storyPoints = estimationType === "min" ? story.minSP : story.maxSP;
    const workingDays = storyPointsToWorkingDays(storyPoints);

    // Find the earliest sprint that can accommodate this story
    let currentSprintStart = getSprintStartDate(latestDependencyEndDate);
    let assignedDeveloper = -1;
    let assignedSprintStart: Date | null = null;
    let assignedStoryStartDate: Date | null = null;

    // Try sprints until we find one with available capacity
    while (assignedDeveloper === -1) {
        const sprintEnd = getSprintEndDate(currentSprintStart);

        // Check each developer's capacity in this sprint
        for (let dev = 0; dev < teamSize; dev++) {
            const devSprintKey = `${dev}-${currentSprintStart.getTime()}`;
            const currentSP = developerSprintAssignments[devSprintKey] || 0;
            const devStoriesKey = `${dev}-${currentSprintStart.getTime()}`;
            const currentStories = developerStoryAssignments[devStoriesKey] || [];

            // Check if we can add this story's story points
            if (currentSP + storyPoints <= STORY_POINTS_PER_DEVELOPER_PER_SPRINT) {
                // If the developer has no stories in this sprint, the story can start on the latest dependency end date
                let earliestStartDate = latestDependencyEndDate;

                if (currentStories.length > 0) {
                    const lastStoryEndDate = new Date(Math.max(...currentStories.map((s) => s.endDate.getTime())));
                    earliestStartDate = getNextWorkingDay(lastStoryEndDate);
                }

                // Check if the story can fit within the sprint
                const storyEndDate = new Date(earliestStartDate);
                let workingDaysCount = 0;
                while (workingDaysCount < workingDays - 1) {
                    storyEndDate.setTime(getNextWorkingDay(storyEndDate).getTime());
                    workingDaysCount++;
                }

                if (storyEndDate <= sprintEnd) {
                    assignedDeveloper = dev;
                    assignedSprintStart = currentSprintStart;
                    assignedStoryStartDate = earliestStartDate;
                    break;
                }
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
        storyStartDate: assignedStoryStartDate,
        storyPoints,
        workingDays,
    };
};

// Main function to calculate timeline for all stories
export const calculateTimeline = (userStories: UserStory[], startDate: Date, estimationType: "min" | "max", teamSize: number): TimelineStory[] => {
    const timeline: TimelineStory[] = [];
    const completedStories = new Set<string>();
    const developerSprintAssignments: { [key: string]: number } = {}; // Track story points per developer per sprint
    const developerStoryAssignments: { [key: string]: { startDate: Date; endDate: Date }[] } = {}; // Track story assignments per developer per sprint

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
                const { assignedDeveloper, sprintStartDate, storyStartDate, storyPoints, workingDays } = findAvailableDeveloperAndSprint(
                    story,
                    latestDependencyEndDate,
                    developerSprintAssignments,
                    developerStoryAssignments,
                    teamSize,
                    estimationType
                );

                // Calculate story start date
                let finalStoryStartDate;
                if (story.dependencies.length === 0) {
                    // First story: start exactly on selected start date
                    finalStoryStartDate = startDate;
                } else {
                    finalStoryStartDate = storyStartDate!;
                }

                // Calculate end date based on working days
                let endDate = new Date(finalStoryStartDate);
                let workingDaysCount = 0;

                // Count working days until we reach the required working days
                while (workingDaysCount < workingDays - 1) {
                    endDate = getNextWorkingDay(endDate);
                    workingDaysCount++;
                }

                // Update developer sprint assignments
                if (assignedDeveloper !== -1 && sprintStartDate) {
                    const devSprintKey = `${assignedDeveloper}-${sprintStartDate.getTime()}`;
                    developerSprintAssignments[devSprintKey] = (developerSprintAssignments[devSprintKey] || 0) + storyPoints;

                    // Update developer story assignments
                    const devStoriesKey = `${assignedDeveloper}-${sprintStartDate.getTime()}`;
                    if (!developerStoryAssignments[devStoriesKey]) {
                        developerStoryAssignments[devStoriesKey] = [];
                    }
                    developerStoryAssignments[devStoriesKey].push({
                        startDate: finalStoryStartDate,
                        endDate: endDate,
                    });

                    timeline.push({
                        ...story,
                        startDate: finalStoryStartDate,
                        endDate,
                        duration: workingDays,
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
