/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            colors: {
                brand: {
                    cyan: '#22d3ee', // Electric Cyan
                    purple: '#a855f7', // Vivid Purple
                    dark: '#020617', // Deep Slate/Black
                    surface: '#0f172a', // Card Surface
                    muted: '#94a3b8', // Muted Text
                }
            },
            animation: {
                'float': 'float 8s ease-in-out infinite',
                'pulse-slow': 'pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'shine': 'shine 3s linear infinite',
                'twinkle': 'twinkle 4s ease-in-out infinite',
                'scan': 'scan 4s linear infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                shine: {
                    '0%': { backgroundPosition: '200% center' },
                    '100%': { backgroundPosition: '-200% center' },
                },
                twinkle: {
                    '0%, 100%': { opacity: 1, transform: 'scale(1)' },
                    '50%': { opacity: 0.3, transform: 'scale(0.8)' },
                },
                scan: {
                    '0%': { transform: 'translateY(-100%)', opacity: 0 },
                    '50%': { opacity: 1 },
                    '100%': { transform: 'translateY(100vh)', opacity: 0 },
                }
            }
        },
    },
    plugins: [],
}
