import {
    rectIntersection,
    pointerWithin,
    type CollisionDetection,
} from "@dnd-kit/core";

const CustomCollisionDetector: CollisionDetection = (args) => {
    // 1) Toolbox: prefer pointerWithin for precise "slot" dropping
    if (args.active.data.current?.isToolboxItem) {
        const pointerHits = pointerWithin(args);
        if (pointerHits.length > 0) return pointerHits;

        // fallback if pointerWithin finds nothing (e.g., fast drag)
        return rectIntersection(args);
    }

    // 2) Sorting existing canvas widgets: closestCenter works best for variable-height items
    // It measures distance from pointer to each item's center, making it height-agnostic
    return pointerWithin(args);
};

export default CustomCollisionDetector;
