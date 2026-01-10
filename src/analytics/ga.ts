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
        return;
    }
    
    isGAInitialized = true;

    // Load gtag.js script
    const script = document.createElement("script");
    script.id = "ga-gtag";
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(script);

    // Initialize dataLayer if not present
    window.dataLayer = window.dataLayer || [];
    
    // Define gtag function if not already defined
    if (!window.gtag) {
        window.gtag = function gtag(...args: unknown[]) {
            window.dataLayer!.push(args);
        };
    }

    // Configure Google Analytics
    window.gtag("js", new Date());
    window.gtag("config", GA_ID, {
        anonymize_ip: true,      // Privacy: anonymize IP addresses
        send_page_view: false,   // SPA: we send page views manually via gaPageView()
        debug_mode: import.meta.env.DEV || import.meta.env.VITE_GA_DEBUG === "true",
    });
}

/**
 * Send a page view event to Google Analytics
 * @param path - The path to track (e.g., "/playground")
 */
export function gaPageView(path: string) {
    if (!GA_ID || !window.gtag) {
        return;
    }

    window.gtag("event", "page_view", {
        page_path: path,
        page_location: window.location.origin + path,
    });
}