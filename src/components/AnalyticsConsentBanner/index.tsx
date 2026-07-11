import { useEffect, useState } from "react";
import { getAnalyticsConsent, setAnalyticsConsent } from "../../analytics/consent";
import { loadGA } from "../../analytics/ga";
import "./AnalyticsConsentBanner.scss";

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
            className={`analytics-consent-banner ${
                isVisible ? "analytics-consent-banner--visible" : "analytics-consent-banner--hidden"
            }`}
            role="dialog"
            aria-labelledby="analytics-consent-title"
            aria-describedby="analytics-consent-description"
        >
            <div className="analytics-consent-banner__inner">
                <div className="analytics-consent-banner__content">
                    <p id="analytics-consent-title" className="analytics-consent-banner__title">
                        We use cookies
                    </p>
                    <p id="analytics-consent-description" className="analytics-consent-banner__text">
                        We use cookies and analytics to understand how visitors use our site and to
                        improve your experience. You can accept or decline non-essential cookies.
                    </p>
                </div>

                <div className="analytics-consent-banner__actions">
                    <button
                        type="button"
                        onClick={handleAccept}
                        className="analytics-consent-banner__button analytics-consent-banner__button--accept"
                    >
                        Accept
                    </button>

                    <button
                        type="button"
                        onClick={handleDecline}
                        className="analytics-consent-banner__button analytics-consent-banner__button--decline"
                    >
                        Decline
                    </button>
                </div>
            </div>
        </div>
    );
}
