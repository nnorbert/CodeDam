import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { getAnalyticsConsent } from "./consent";
import { gaPageView, loadGA } from "./ga";

export function PageViewTracker() {
    const location = useLocation();
    const lastTrackedPath = useRef<string | null>(null);

    useEffect(() => {
        if (getAnalyticsConsent() !== "granted") return;

        const currentPath = location.pathname + location.search;
        
        // Prevent duplicate tracking of the same path (can happen with React Strict Mode)
        if (lastTrackedPath.current === currentPath) return;
        lastTrackedPath.current = currentPath;

        // Ensure GA is loaded (idempotent)
        loadGA();

        // Track the page view
        gaPageView(currentPath);
    }, [location]);

    return null;
}
