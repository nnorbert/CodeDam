import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getAnalyticsConsent } from "./consent";
import { gaPageView, loadGA } from "./ga";

export function PageViewTracker() {
    const location = useLocation();

    useEffect(() => {
        if (getAnalyticsConsent() !== "granted") return;

        // In case user accepted earlier and refreshed:
        loadGA();

        gaPageView(location.pathname + location.search);
    }, [location]);

    return null;
}
