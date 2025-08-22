# Local Storage Implementation

This application uses browser localStorage to persist data until a database connection is established.

## What's Stored

### 1. **User Stories** (`gantt_chart_stories`)

-   All user stories with their properties (id, title, epic, story points, dependencies, priority)
-   Automatically saved when stories are added, modified, or deleted
-   Loaded on application startup

### 2. **Theme Preference** (`gantt_chart_theme`)

-   User's theme choice: "light" or "dark"
-   Automatically saved when theme is changed
-   Loaded on application startup

### 3. **Start Date** (`gantt_chart_start_date`)

-   Selected project start date
-   Automatically saved when date is changed
-   Loaded on application startup

## How It Works

### Storage Utilities (`src/utils/storage.ts`)

-   **Safe Storage**: All localStorage operations are wrapped in try-catch blocks
-   **Default Values**: If no data exists, default values are used
-   **Type Safety**: Full TypeScript support with proper typing
-   **Error Handling**: Graceful fallbacks if localStorage is unavailable

### Automatic Persistence

-   Stories are saved whenever the stories array changes
-   Theme is saved whenever the theme mode changes
-   Start date is saved whenever the date changes
-   All persistence happens automatically via React useEffect hooks

### Data Reset

-   **Reset Button**: Click "Reset Data" to clear all stored data and return to defaults
-   **Confirmation**: Reset requires user confirmation to prevent accidental data loss
-   **Page Reload**: After reset, the page reloads to ensure clean state

## Migration to Database

When you're ready to connect to a database:

1. **Replace Storage Functions**: Update the storage utility functions to call your API instead of localStorage
2. **Add Loading States**: Implement proper loading states for async database operations
3. **Error Handling**: Add comprehensive error handling for network requests
4. **Offline Support**: Consider keeping localStorage as a fallback for offline scenarios

## Example Database Integration

```typescript
// Replace localStorage functions with API calls
export const getStories = async (): Promise<UserStory[]> => {
    try {
        const response = await fetch("/api/stories");
        return await response.json();
    } catch (error) {
        // Fallback to localStorage or default values
        return getStorageItem(STORAGE_KEYS.STORIES, DEFAULT_STORIES);
    }
};

export const setStories = async (stories: UserStory[]): Promise<void> => {
    try {
        await fetch("/api/stories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(stories),
        });
    } catch (error) {
        // Fallback to localStorage
        setStorageItem(STORAGE_KEYS.STORIES, stories);
    }
};
```

## Browser Compatibility

-   **Modern Browsers**: Full support for localStorage
-   **Private Browsing**: Data persists during session but clears when browser is closed
-   **Storage Limits**: Typically 5-10MB per domain (sufficient for this application)
-   **Fallbacks**: Graceful degradation if localStorage is unavailable
