export const CANVAS_ID = "canvas";

export const WidgetCategory = {
    VARIABLES: "variables",
} as const;

export type WidgetCategoryType = typeof WidgetCategory[keyof typeof WidgetCategory];