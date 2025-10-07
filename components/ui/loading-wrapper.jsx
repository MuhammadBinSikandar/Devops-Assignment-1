"use client";

import { useState, useEffect } from "react";
import AppLoader from "@/components/ui/app-loader";

export default function LoadingWrapper({ children }) {
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [minimumLoadTime, setMinimumLoadTime] = useState(true);
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        // Mark as hydrated once this effect runs (client-side)
        setIsHydrated(true);

        // Ensure minimum loading time for smooth UX (2 seconds)
        const minimumTimer = setTimeout(() => {
            setMinimumLoadTime(false);
        }, 2000);

        // Check if DOM and all resources are fully loaded
        const checkPageLoad = () => {
            if (document.readyState === 'complete') {
                // Wait for any dynamic imports and initial renders
                setTimeout(() => {
                    setIsPageLoading(false);
                }, 500);
            } else {
                // Keep checking until page is loaded
                setTimeout(checkPageLoad, 100);
            }
        };

        checkPageLoad();

        // Also listen for the load event
        const handleLoad = () => {
            setTimeout(() => {
                setIsPageLoading(false);
            }, 300);
        };

        window.addEventListener('load', handleLoad);

        return () => {
            clearTimeout(minimumTimer);
            window.removeEventListener('load', handleLoad);
        };
    }, []);

    // Show loader if any condition is true or if not hydrated yet
    const showLoader = !isHydrated || isPageLoading || minimumLoadTime;

    return (
        <>
            <AppLoader isLoading={showLoader} />
            <div
                className={`min-h-screen transition-opacity duration-700 ${showLoader ? 'opacity-0 pointer-events-none' : 'opacity-100'
                    }`}
            >
                {children}
            </div>
        </>
    );
}
