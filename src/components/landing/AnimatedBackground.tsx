import React from 'react';
import { motion } from 'framer-motion';

export const AnimatedBackground = React.memo(() => {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#020617]">
            {/* 1. Static Grid */}
            <div className="absolute inset-0 bg-grid-pattern opacity-40"></div>

            {/* 2. Floating Blobs with Breathing Animation */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    x: [0, 50, 0],
                    y: [0, 30, 0],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-brand-cyan/20 rounded-full blur-[120px] mix-blend-screen opacity-30"
            />
            <motion.div
                animate={{
                    scale: [1, 1.1, 1],
                    x: [0, -30, 0],
                    y: [0, 50, 0],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2
                }}
                className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[128px] mix-blend-screen opacity-20"
            />
            <motion.div
                animate={{
                    scale: [1, 1.3, 1],
                    x: [0, 40, 0],
                    y: [0, -40, 0],
                }}
                transition={{
                    duration: 30,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 5
                }}
                className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[150px] mix-blend-screen opacity-10"
            />

            {/* 3. Floating Particles */}
            <div className="absolute inset-0">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute bg-white rounded-full opacity-20"
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            width: Math.random() < 0.5 ? '2px' : '3px',
                            height: Math.random() < 0.5 ? '2px' : '3px',
                        }}
                        animate={{
                            y: [0, -100, 0],
                            opacity: [0.2, 0.8, 0.2]
                        }}
                        transition={{
                            duration: 10 + Math.random() * 20,
                            repeat: Infinity,
                            ease: "linear",
                            delay: Math.random() * 10
                        }}
                    />
                ))}
            </div>
        </div>
    );
});
