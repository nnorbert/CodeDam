const KEY = "codedam_analytics_consent"; // "granted" | "denied"

export function getAnalyticsConsent(): "granted" | "denied" | "unknown" {
    const v = localStorage.getItem(KEY);
    if (v === "granted" || v === "denied") return v;
    return "unknown";
}

export function setAnalyticsConsent(v: "granted" | "denied") {
    localStorage.setItem(KEY, v);
}