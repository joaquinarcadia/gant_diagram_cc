import type { UserStory } from "@/types/user-story.types";

// Storage keys
const STORAGE_KEYS = {
    STORIES: "gantt_chart_stories",
    THEME: "gantt_chart_theme",
    START_DATE: "gantt_chart_start_date",
} as const;

// Default values
const DEFAULT_STORIES: UserStory[] = [
    // Epic: Consultant
    {
        id: "consultant-job-ui",
        title: "Job opening UI",
        epic: "Consultant",
        minSP: 3,
        maxSP: 5,
        dependencies: [],
        priority: null,
    },
    {
        id: "consultant-job-integration",
        title: "Job opening integration",
        epic: "Consultant",
        minSP: 5,
        maxSP: 8,
        dependencies: ["consultant-job-ui"],
        priority: null,
    },
    {
        id: "consultant-payments",
        title: "Payments integration",
        epic: "Consultant",
        minSP: 5,
        maxSP: 8,
        dependencies: [],
        priority: null,
    },

    // Epic: Client
    {
        id: "client-interviews",
        title: "Interviews integration",
        epic: "Client",
        minSP: 5,
        maxSP: 8,
        dependencies: [],
        priority: null,
    },
    {
        id: "client-new-interview",
        title: "New interview integration",
        epic: "Client",
        minSP: 5,
        maxSP: 8,
        dependencies: ["client-interviews"],
        priority: null,
    },
    {
        id: "client-hire-contract",
        title: "(Hire) -> Complete and verify contract details",
        epic: "Client",
        minSP: 3,
        maxSP: 3,
        dependencies: ["client-new-interview"],
        priority: null,
    },
    {
        id: "client-docusign",
        title: "DocuSign integration",
        epic: "Client",
        minSP: 5,
        maxSP: 8,
        dependencies: ["client-hire-contract"],
        priority: null,
    },
    {
        id: "client-job-integration",
        title: "Job opening integration",
        epic: "Client",
        minSP: 5,
        maxSP: 8,
        dependencies: [],
        priority: null,
    },
    {
        id: "client-post-job",
        title: "Post new job opening integration",
        epic: "Client",
        minSP: 5,
        maxSP: 8,
        dependencies: ["client-job-integration"],
        priority: null,
    },
    {
        id: "client-search-ui",
        title: "Searching consultants UI",
        epic: "Client",
        minSP: 1,
        maxSP: 1,
        dependencies: [],
        priority: null,
    },
    {
        id: "client-projects-ui",
        title: "Projects UI",
        epic: "Client",
        minSP: 5,
        maxSP: 5,
        dependencies: [],
        priority: null,
    },
    {
        id: "client-projects-integration",
        title: "Projects integration",
        epic: "Client",
        minSP: 5,
        maxSP: 8,
        dependencies: ["client-projects-ui"],
        priority: null,
    },
    {
        id: "client-worklog-ui",
        title: "Projects work log UI",
        epic: "Client",
        minSP: 3,
        maxSP: 5,
        dependencies: ["client-projects-integration"],
        priority: null,
    },
    {
        id: "client-worklog-integration",
        title: "Projects work log integration",
        epic: "Client",
        minSP: 5,
        maxSP: 8,
        dependencies: ["client-worklog-ui"],
        priority: null,
    },
    {
        id: "client-payments",
        title: "Payments integration",
        epic: "Client",
        minSP: 5,
        maxSP: 8,
        dependencies: [],
        priority: null,
    },
    //Epic: SF Account Executive
    {
        id: "sf-account-executive-onboarding-ui",
        title: "Onboarding UI",
        epic: "SF Account Executive",
        minSP: 1,
        maxSP: 3,
        dependencies: [],
        priority: null,
    },
    {
        id: "sf-account-executive-profile-ui",
        title: "Profile UI",
        epic: "SF Account Executive",
        minSP: 3,
        maxSP: 5,
        dependencies: ["sf-account-executive-onboarding-ui"],
        priority: null,
    },
    {
        id: "sf-account-executive-profile-integration",
        title: "Profile integration",
        epic: "SF Account Executive",
        minSP: 5,
        maxSP: 8,
        dependencies: ["sf-account-executive-profile-ui"],
        priority: null,
    },
    {
        id: "sf-account-executive-searching-consultants-ui",
        title: "Searching consultants UI",
        epic: "SF Account Executive",
        minSP: 1,
        maxSP: 1,
        dependencies: [],
        priority: null,
    },
    {
        id: "sf-account-executive-interview-ui",
        title: "Interview UI",
        epic: "SF Account Executive",
        minSP: 3,
        maxSP: 5,
        dependencies: ["sf-account-executive-searching-consultants-ui"],
        priority: null,
    },
    {
        id: "sf-account-executive-interview-integration",
        title: "Interview integration",
        epic: "SF Account Executive",
        minSP: 5,
        maxSP: 8,
        dependencies: ["sf-account-executive-interview-ui"],
        priority: null,
    },
];

// Helper function to safely get item from localStorage
const getStorageItem = <T>(key: string, defaultValue: T): T => {
    try {
        const item = localStorage.getItem(key);
        if (item === null) {
            return defaultValue;
        }
        return JSON.parse(item);
    } catch (error) {
        console.error(`Error reading from localStorage for key ${key}:`, error);
        return defaultValue;
    }
};

// Helper function to safely set item in localStorage
const setStorageItem = <T>(key: string, value: T): void => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error writing to localStorage for key ${key}:`, error);
    }
};

// Stories storage
export const getStories = (): UserStory[] => {
    return getStorageItem(STORAGE_KEYS.STORIES, DEFAULT_STORIES);
};

export const setStories = (stories: UserStory[]): void => {
    setStorageItem(STORAGE_KEYS.STORIES, stories);
};

// Theme storage
export const getTheme = (): "light" | "dark" => {
    return getStorageItem(STORAGE_KEYS.THEME, "light");
};

export const setTheme = (theme: "light" | "dark"): void => {
    setStorageItem(STORAGE_KEYS.THEME, theme);
};

// Start date storage
export const getStartDate = (): Date | null => {
    const storedDate = getStorageItem<string | null>(STORAGE_KEYS.START_DATE, null);
    if (storedDate) {
        try {
            return new Date(storedDate);
        } catch (error) {
            console.error("Error parsing stored date:", error);
            return new Date();
        }
    }
    return new Date();
};

export const setStartDate = (date: Date | null): void => {
    setStorageItem(STORAGE_KEYS.START_DATE, date?.toISOString() || null);
};

// Clear all stored data (useful for resetting to defaults)
export const clearStorage = (): void => {
    try {
        localStorage.removeItem(STORAGE_KEYS.STORIES);
        localStorage.removeItem(STORAGE_KEYS.THEME);
        localStorage.removeItem(STORAGE_KEYS.START_DATE);
    } catch (error) {
        console.error("Error clearing localStorage:", error);
    }
};
