import type { Config } from "tailwindcss";

export default {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // "Midnight & Bronze" - Professional, Clean, Efficient
                'bg-primary': '#0F1115',      // Deep charcoal/midnight
                'bg-secondary': '#161920',    // Slightly lighter for contrast
                'bg-card': '#1C2028',         // distinct card background

                'primary': '#D4AF37',         // Metallic Gold/Bronze (Professional)
                'primary-light': '#E5C558',   // Lighter gold
                'primary-dark': '#AA8C2C',    // Darker gold/bronze

                'accent-warm': '#C88D65',     // Terracotta/Warm accent

                'text-primary': '#F3F4F6',    // Off-white for readability
                'text-secondary': '#9CA3AF',  // Cool gray
                'text-muted': '#6B7280',      // Muted gray

                'border-subtle': '#2B303B',   // Subtle border
                'border-light': '#374151',    // Lighter border
            },
            fontFamily: {
                // SF Pro / System Stack as primary
                sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
                display: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                // Subtle, professional grain or noise can be added here if needed, 
                // but keeping it clean for now as requested.
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
                'fade-in-up': 'fadeInUp 0.5s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
        },
    },
    plugins: [],
} satisfies Config;
