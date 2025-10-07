import React from 'react';
import { Brain, Loader2 } from 'lucide-react';

export function LoadingSpinner({
    size = "default",
    text = "Loading...",
    subtitle = "Please wait",
    variant = "default",
    className = ""
}) {
    const sizeClasses = {
        sm: "w-8 h-8",
        default: "w-16 h-16",
        lg: "w-24 h-24"
    };

    const variantClasses = {
        default: {
            container: "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50",
            spinner: "border-blue-200 border-t-blue-600",
            text: "text-gray-700",
            subtitle: "text-gray-500"
        },
        admin: {
            container: "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50",
            spinner: "border-indigo-200 border-t-indigo-600",
            text: "text-gray-700",
            subtitle: "text-gray-500"
        },
        dark: {
            container: "bg-gray-900",
            spinner: "border-gray-600 border-t-blue-500",
            text: "text-white",
            subtitle: "text-gray-400"
        }
    };

    const classes = variantClasses[variant];

    return (
        <div className={`min-h-screen flex items-center justify-center ${classes.container} ${className}`}>
            <div className="text-center">
                <div className={`mx-auto mb-4 ${sizeClasses[size]}`}>
                    <div className={`${sizeClasses[size]} border-4 rounded-full animate-spin ${classes.spinner}`}></div>
                </div>
                <h2 className={`text-xl font-semibold mb-2 ${classes.text}`}>{text}</h2>
                <p className={classes.subtitle}>{subtitle}</p>
            </div>
        </div>
    );
}

export function LoadingSpinnerWithIcon({
    icon: Icon = Brain,
    text = "Loading...",
    subtitle = "Please wait",
    variant = "default",
    className = ""
}) {
    const variantClasses = {
        default: {
            container: "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50",
            icon: "bg-gradient-to-r from-blue-600 to-purple-600",
            text: "text-gray-700",
            subtitle: "text-gray-500"
        },
        admin: {
            container: "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50",
            icon: "bg-gradient-to-r from-indigo-600 to-purple-600",
            text: "text-gray-700",
            subtitle: "text-gray-500"
        }
    };

    const classes = variantClasses[variant];

    return (
        <div className={`min-h-screen flex items-center justify-center ${classes.container} ${className}`}>
            <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4">
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center shadow-lg ${classes.icon}`}>
                        <Icon className="w-8 h-8 text-white" />
                    </div>
                </div>
                <h2 className={`text-xl font-semibold mb-2 ${classes.text}`}>{text}</h2>
                <p className={classes.subtitle}>{subtitle}</p>
            </div>
        </div>
    );
}

export function LoadingSpinnerInline({ size = "sm", className = "" }) {
    const sizeClasses = {
        sm: "w-4 h-4",
        default: "w-6 h-6",
        lg: "w-8 h-8"
    };

    return (
        <div className={`inline-flex items-center justify-center ${className}`}>
            <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600`} />
        </div>
    );
}
