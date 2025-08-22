import React, { useState } from "react";

import {
    Autocomplete,
    Box,
    Button,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    MenuItem,
    OutlinedInput,
    Select,
    TextField,
} from "@mui/material";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import type { UserStory } from "@/types/user-story.types";
import { PRIORITIES } from "../../constants/storyPriorities";
import { StoryFormSchema, type StoryFormValues } from "./types/StoryForm.definition";

interface AddStoryFormProps {
    epics: string[];
    stories: Partial<UserStory>[];
    onAddStory: (story: Partial<UserStory>) => void;
    open: boolean;
    onClose: () => void;
}

const priorities = Object.values(PRIORITIES);

const StoryForm: React.FC<AddStoryFormProps> = ({ epics, stories, onAddStory, open, onClose }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const defaultValues = {
        title: "",
        minSP: 1,
        maxSP: 1,
        epic: "",
        dependencies: [],
        priority: undefined,
    };

    const {
        control,
        handleSubmit,
        reset,
        formState: { isValid },
    } = useForm({
        mode: "all",
        resolver: zodResolver(StoryFormSchema),
        defaultValues,
    });

    const handleClose = () => {
        reset(defaultValues);
        onClose();
    };

    const onSubmit = (data: StoryFormValues) => {
        setIsSubmitting(true);
        try {
            onAddStory(data);
            handleClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Add Story</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth margin="normal">
                        <Controller
                            name="title"
                            control={control}
                            rules={{ required: true }}
                            render={({ field, fieldState }) => (
                                <TextField
                                    {...field}
                                    label="Title"
                                    required
                                    variant="outlined"
                                    autoFocus
                                    error={!!fieldState.error}
                                    helperText={fieldState.error?.message}
                                />
                            )}
                        />
                    </FormControl>
                    <FormControl fullWidth margin="normal">
                        <Controller
                            name="minSP"
                            control={control}
                            rules={{ required: true, min: 1 }}
                            render={({ field, fieldState }) => (
                                <TextField
                                    {...field}
                                    type="number"
                                    label="Minimum Story Points"
                                    required
                                    variant="outlined"
                                    error={!!fieldState.error}
                                    helperText={fieldState.error?.message}
                                />
                            )}
                        />
                    </FormControl>
                    <FormControl fullWidth margin="normal">
                        <Controller
                            name="maxSP"
                            control={control}
                            rules={{ required: true, min: 1 }}
                            render={({ field, fieldState }) => (
                                <TextField
                                    {...field}
                                    type="number"
                                    label="Maximum Story Points"
                                    required
                                    variant="outlined"
                                    error={!!fieldState.error}
                                    helperText={fieldState.error?.message}
                                />
                            )}
                        />
                    </FormControl>
                    <FormControl fullWidth margin="normal">
                        <Controller
                            name="epic"
                            control={control}
                            render={({ field: { onChange, value }, fieldState }) => (
                                <Autocomplete
                                    freeSolo
                                    options={epics}
                                    value={value || null}
                                    onChange={(event, newValue) => {
                                        onChange(newValue);
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Epic"
                                            variant="outlined"
                                            error={!!fieldState.error}
                                            helperText={fieldState.error?.message}
                                        />
                                    )}
                                />
                            )}
                        />
                    </FormControl>
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="dependencies-label">Dependencies</InputLabel>
                        <Controller
                            name="dependencies"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    labelId="dependencies-label"
                                    multiple
                                    input={<OutlinedInput label="Dependencies" />}
                                    value={field.value || []}
                                    onChange={field.onChange}
                                    renderValue={(selected) => (
                                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                            {(selected as string[]).map((value) => (
                                                <Chip key={value} label={value} />
                                            ))}
                                        </Box>
                                    )}
                                >
                                    {stories.map((s, idx) => (
                                        <MenuItem key={s.title || idx} value={s.title}>
                                            {s.title}
                                        </MenuItem>
                                    ))}
                                </Select>
                            )}
                        />
                    </FormControl>
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="priority-label">Priority</InputLabel>
                        <Controller
                            name="priority"
                            control={control}
                            render={({ field }) => (
                                <Select {...field} labelId="priority-label" label="Priority" value={field.value || ""} onChange={field.onChange}>
                                    {priorities.map((p) => (
                                        <MenuItem key={p} value={p}>
                                            {p}
                                        </MenuItem>
                                    ))}
                                </Select>
                            )}
                        />
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button type="submit" variant="contained" disabled={!isValid || isSubmitting}>
                        {isSubmitting ? "Adding..." : "Add Story"}
                    </Button>
                </DialogActions>
            </Dialog>
        </form>
    );
};

export default StoryForm;
