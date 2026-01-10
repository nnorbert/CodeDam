export const CANVAS_ID = "canvas";

export const WidgetCategory = {
    VARIABLES: "variables",
    DECISIONS: "decisions",
    COMPARISONS: "comparisons",
    LOGIC: "logic",
    OPERATIONS: "operations",
    TEXT_OPERATIONS: "text operations",
    INTERACTIONS: "interactions",
} as const;
export type WidgetCategoryType = typeof WidgetCategory[keyof typeof WidgetCategory];

/** Defines the display order of widget categories in the toolbox */
export const WidgetCategoryOrder: WidgetCategoryType[] = [
    WidgetCategory.VARIABLES,
    WidgetCategory.OPERATIONS,
    WidgetCategory.TEXT_OPERATIONS,
    WidgetCategory.COMPARISONS,
    WidgetCategory.LOGIC,
    WidgetCategory.DECISIONS,
    WidgetCategory.INTERACTIONS,
];

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

export const CodeLanguages = {
    JAVASCRIPT: "javascript",
    PYTHON: "python",
} as const;
export type CodeLanguageType = typeof CodeLanguages[keyof typeof CodeLanguages];
