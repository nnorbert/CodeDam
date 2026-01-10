import { useEffect, useState } from "react";
import { getAnalyticsConsent, setAnalyticsConsent } from "../../analytics/consent";
import { loadGA } from "../../analytics/ga";

export function AnalyticsConsentBanner() {
    const [consent, setConsent] = useState<"granted" | "denied" | "unknown">(
        "unknown"
    );
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const c = getAnalyticsConsent();
        setConsent(c);

        if (c === "granted") {
            loadGA();
        }
        
        // Trigger animation after mount
        if (c === "unknown") {
            const timer = setTimeout(() => setIsVisible(true), 100);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        setIsVisible(false);
        setTimeout(() => {
            setAnalyticsConsent("granted");
            setConsent("granted");
            loadGA();
        }, 200);
    };

    const handleDecline = () => {
        setIsVisible(false);
        setTimeout(() => {
            setAnalyticsConsent("denied");
            setConsent("denied");
        }, 200);
    };

    if (consent !== "unknown") return null;

    return (
        <div 
            className={`fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:w-[400px] z-50 transition-all duration-300 ease-out ${
                isVisible 
                    ? "opacity-100 translate-y-0" 
                    : "opacity-0 translate-y-4"
            }`}
        >
            {/* Wood plank styled container */}
            <div 
                className="rounded-xl p-5 shadow-2xl border-3"
                style={{
                    background: `
                        repeating-linear-gradient(
                            90deg,
                            transparent 0px,
                            transparent 2px,
                            rgba(93, 78, 55, 0.08) 2px,
                            rgba(93, 78, 55, 0.08) 4px
                        ),
                        linear-gradient(
                            180deg,
                            #F5DEB3 0%,
                            #DEB887 20%,
                            #D2B48C 80%,
                            #C4A574 100%
                        )
                    `,
                    border: "3px solid #8B7355",
                    boxShadow: `
                        inset 0 2px 4px rgba(255, 255, 255, 0.3),
                        inset 0 -2px 4px rgba(0, 0, 0, 0.08),
                        4px 6px 16px rgba(61, 40, 23, 0.3)
                    `,
                }}
            >
                <div className="flex items-start gap-4">
                    <div className="text-3xl flex-shrink-0">🦫</div>
                    <div className="flex-1">
                        <div 
                            className="font-bold text-lg"
                            style={{ color: "#3D2817" }}
                        >
                            Help improve CodeDam?
                        </div>
                        <p 
                            className="text-sm mt-2 leading-relaxed"
                            style={{ color: "#5D4E37" }}
                        >
                            We'd like to collect anonymous visit statistics to make the app better.
                            You can say no — we won't hold it against you!
                        </p>

                        <div className="mt-4 flex gap-3">
                            <button
                                onClick={handleAccept}
                                className="px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
                                style={{
                                    background: "linear-gradient(180deg, #7CB342 0%, #689F38 100%)",
                                    color: "#FFFFFF",
                                    border: "2px solid #558B2F",
                                    boxShadow: "0 2px 4px rgba(61, 40, 23, 0.2)",
                                    textShadow: "0 1px 2px rgba(0, 0, 0, 0.2)",
                                }}
                            >
                                Yes, that's okay
                            </button>

                            <button
                                onClick={handleDecline}
                                className="px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
                                style={{
                                    background: "linear-gradient(180deg, #FAEBD7 0%, #E8D5C4 100%)",
                                    color: "#5D4E37",
                                    border: "2px solid #8B7355",
                                    boxShadow: "0 2px 4px rgba(61, 40, 23, 0.15)",
                                }}
                            >
                                No thanks
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
