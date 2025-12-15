export const CANVAS_ID = "canvas";

export const WidgetCategory = {
    VARIABLES: "variables",
} as const;
export type WidgetCategoryType = typeof WidgetCategory[keyof typeof WidgetCategory];

export const WidgetRoles = {
    STATEMENT: "statement",
    EXPRESSION: "expression",
} as const;
export type WidgetRoleType = typeof WidgetRoles[keyof typeof WidgetRoles];

export const DroppableTypes = {
    CANVAS: "canvas",
    SLOT: "slot",
} as const;
export type DroppableType = typeof DroppableTypes[keyof typeof DroppableTypes];
