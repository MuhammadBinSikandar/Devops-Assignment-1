// Centralized platform color scheme and gradients
// Import and use in components to ensure consistent styling

export const Theme = {
    // Brand colors (primary identity)
    brand: {
        primary: '#2563EB',      // blue-600
        primaryDark: '#1D4ED8',  // blue-700
        secondary: '#4F46E5',    // indigo-600
        secondaryDark: '#4338CA',// indigo-700
        accent: '#10B981',       // emerald-500/600 family
        accentDark: '#059669',
    },

    // Neutrals
    neutral: {
        foreground: '#111827',   // gray-900
        text: '#374151',         // gray-700
        subtext: '#6B7280',      // gray-500
        border: '#E5E7EB',       // gray-200
        surface: '#FFFFFF',
        surfaceAlt: '#F9FAFB',   // gray-50
    },

    // Semantic colors
    semantic: {
        success: '#10B981',  // emerald-500/600
        warning: '#F59E0B',  // amber-500
        danger: '#EF4444',   // red-500
        info: '#3B82F6',     // blue-500
    },

    // Gradients (hex tuples for custom CSS or Tailwind class strings)
    gradients: {
        primaryTuple: ['#2563EB', '#4F46E5'],
        primary: 'from-blue-600 to-indigo-600',
        primaryHover: 'from-blue-700 to-indigo-700',

        accentTuple: ['#10B981', '#059669'],
        accent: 'from-emerald-600 to-green-600',
        accentHover: 'from-emerald-700 to-green-700',

        subtleBlue: 'from-blue-50 via-indigo-50 to-purple-50',
    },

    // Component-level defaults
    components: {
        button: {
            primary: {
                bg: 'bg-gradient-to-r from-blue-600 to-indigo-600',
                hover: 'hover:from-blue-700 hover:to-indigo-700',
                text: 'text-white',
            },
            accent: {
                bg: 'bg-gradient-to-r from-emerald-600 to-green-600',
                hover: 'hover:from-emerald-700 hover:to-green-700',
                text: 'text-white',
            },
            outline: {
                bg: 'bg-transparent',
                border: 'border border-gray-300',
                text: 'text-gray-700',
                hover: 'hover:bg-gray-50',
            },
        },
        badge: {
            ready: 'bg-green-600 text-white',
            generate: 'bg-gray-500 text-white',
        },
        card: {
            surface: 'bg-white border border-gray-200',
            header: 'bg-gradient-to-r from-blue-600 to-indigo-600',
            shadow: 'shadow-sm',
        },
    },
};

export default Theme;






