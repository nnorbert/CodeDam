export function pageview(path: string) {
    // @ts-ignore
    window.gtag?.("event", "page_view", {
        page_location: window.location.origin + path,
    });
}