import { PRIORITIES } from "../constants/storyPriorities";

export type UserStory = {
    id: string;
    title: string;
    epic: string;
    minSP: number;
    maxSP: number;
    dependencies: string[];
    priority: (typeof PRIORITIES)[keyof typeof PRIORITIES] | null;
};
