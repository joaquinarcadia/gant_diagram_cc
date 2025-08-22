import type { UserStory } from "@/types/user-story.types";

export const getEpicsFromStories = (stories: UserStory[]): string[] => {
    const epics = Array.from(new Set(stories.map((s) => s.epic)));
    return epics;
};
