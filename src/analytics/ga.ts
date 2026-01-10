declare global {
    interface Window {
        dataLayer?: unknown[];
        gtag?: (...args: unknown[]) => void;
    }
}

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;

let isGAInitialized = false;

export function loadGA() {
    // Skip if no measurement ID configured
    if (!GA_ID) {
        console.warn("[Analytics] VITE_GA_MEASUREMENT_ID not configured");
        return;
    }
    
    // Prevent duplicate initialization
    if (isGAInitialized || document.getElementById("ga-gtag")) {
        console.debug("[Analytics] Already initialized, skipping");
        return;
    }
    
    isGAInitialized = true;
    
    const debugMode = import.meta.env.DEV || import.meta.env.VITE_GA_DEBUG === "true";
    console.debug("[Analytics] Initializing GA with ID:", GA_ID, "debug_mode:", debugMode);

    // Load gtag.js script
    const script = document.createElement("script");
    script.id = "ga-gtag";
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(script);

    // Initialize dataLayer if not present
    window.dataLayer = window.dataLayer || [];
    
    // Define gtag function exactly as Google specifies
    // Must use 'arguments' object, not spread syntax, for gtag.js compatibility
    if (!window.gtag) {
        window.gtag = function () {
            // eslint-disable-next-line prefer-rest-params
            window.dataLayer!.push(arguments);
        };
    }

    // Configure Google Analytics
    window.gtag("js", new Date());
    window.gtag("config", GA_ID, {
        anonymize_ip: true,      // Privacy: anonymize IP addresses
        send_page_view: false,   // SPA: we send page views manually via gaPageView()
        debug_mode: debugMode,
    });
}

/**
 * Send a page view event to Google Analytics
 * @param path - The path to track (e.g., "/playground")
 */
export function gaPageView(path: string) {
    if (!GA_ID) {
        console.debug("[Analytics] gaPageView skipped: no GA_ID");
        return;
    }
    
    if (!window.gtag) {
        console.debug("[Analytics] gaPageView skipped: gtag not loaded");
        return;
    }

    console.debug("[Analytics] Sending page_view:", path);
    
    window.gtag("event", "page_view", {
        page_path: path,
        page_location: window.location.origin + path,
    });
}