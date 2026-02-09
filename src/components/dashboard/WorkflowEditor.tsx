import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Play, Square, MousePointer, FileText, Type,
    Search, Code, Clock, GitFork, Globe, Settings, Zap,
    UploadCloud, Bell, CheckCircle, ArrowDown, ChevronRight,
    CornerDownRight
} from 'lucide-react';
import { cn } from '../common';

// --- Types ---
type NodeType = 'START' | 'STOP' | 'ACTION' | 'IF' | 'VARIABLE';

interface WrapperNode {
    id: string;
    type: NodeType;
    label: string;
    icon?: React.ElementType;
    x: number;
    y: number;
    subLabel?: string;
}

// --- Configuration ---
const NODE_WIDTH = 180;
const NODE_HEIGHT = 60;
// Compact Layout Calculation
// Canvas Size: 1000px width (centered in container)
const LEFT_MARGIN = 100;
const ROW_Height = 120; // Reduced from 160
const COL_Width = 240;

const NODES_OPTIMIZED: WrapperNode[] = [
    // Row 1: Left to Right
    { id: 'start', type: 'START', label: 'Start', x: LEFT_MARGIN, y: 60 },
    { id: 'open-url', type: 'ACTION', label: 'Open Browser', icon: Globe, subLabel: 'target.com', x: LEFT_MARGIN + COL_Width, y: 60 },
    { id: 'click', type: 'ACTION', label: 'Click', icon: MousePointer, subLabel: 'Button', x: LEFT_MARGIN + COL_Width * 2, y: 60 },
    { id: 'read-file', type: 'ACTION', label: 'Read File', icon: FileText, subLabel: 'data.xlsx', x: LEFT_MARGIN + COL_Width * 3, y: 60 },

    // Row 2: Right to Left
    { id: 'type-text', type: 'ACTION', label: 'Type Text', icon: Type, subLabel: 'credentials', x: LEFT_MARGIN + COL_Width * 3, y: 60 + ROW_Height },
    { id: 'exists', type: 'ACTION', label: 'Check Element', icon: Search, subLabel: 'Menu', x: LEFT_MARGIN + COL_Width * 2, y: 60 + ROW_Height },
    { id: 'js', type: 'ACTION', label: 'Execute JS', icon: Code, subLabel: 'Anti-detect', x: LEFT_MARGIN + COL_Width, y: 60 + ROW_Height },
    { id: 'sleep', type: 'ACTION', label: 'Sleep', icon: Clock, subLabel: 'Random(1s, 5s)', x: LEFT_MARGIN, y: 60 + ROW_Height },

    // Row 3: Logic Branching
    // Condition is at Start of Row 3
    { id: 'if', type: 'IF', label: 'Condition', icon: GitFork, subLabel: 'Is Locked?', x: LEFT_MARGIN, y: 60 + ROW_Height * 2 },

    // FALSE Branch (Down -> Stop) - Adjusted position
    { id: 'stop', type: 'STOP', label: 'Stop', x: LEFT_MARGIN, y: 60 + ROW_Height * 3 + 20 },

    // TRUE Branch (Right -> More Actions)
    { id: 'upload', type: 'ACTION', label: 'Upload Data', icon: UploadCloud, subLabel: 'S3 Bucket', x: LEFT_MARGIN + COL_Width, y: 60 + ROW_Height * 2 },
    { id: 'notify', type: 'ACTION', label: 'Notify', icon: Bell, subLabel: 'Telegram', x: LEFT_MARGIN + COL_Width * 2, y: 60 + ROW_Height * 2 },
    { id: 'success', type: 'ACTION', label: 'Success', icon: CheckCircle, subLabel: 'Finished', x: LEFT_MARGIN + COL_Width * 3, y: 60 + ROW_Height * 2 },

    // Variables Node (Grid Position - Aligned with Stop)
    { id: 'var', type: 'VARIABLE', label: 'Variables', icon: Settings, subLabel: 'Config', x: LEFT_MARGIN + COL_Width, y: 60 + ROW_Height * 3 + 20 },
];

function useMediaQuery(query: string) {
    const [matches, setMatches] = useState(false);
    useEffect(() => {
        const media = window.matchMedia(query);
        const listener = () => setMatches(media.matches);
        setMatches(media.matches);
        window.addEventListener('resize', listener);
        return () => window.removeEventListener('resize', listener);
    }, [query]);
    return matches;
}

// --- Mobile Minimalist List Component ---
const MobileWorkflowTimeline = ({ nodes }: { nodes: WrapperNode[] }) => {
    // Linearize nodes with visual hierarchy
    const linearNodes = [
        nodes.find(n => n.id === 'start'),
        nodes.find(n => n.id === 'open-url'),
        nodes.find(n => n.id === 'click'),
        nodes.find(n => n.id === 'read-file'),
        nodes.find(n => n.id === 'type-text'),
        nodes.find(n => n.id === 'exists'),
        nodes.find(n => n.id === 'js'),
        nodes.find(n => n.id === 'sleep'),
        nodes.find(n => n.id === 'if'),
        // Branch Split Visual
        nodes.find(n => n.id === 'upload'), // True branch
        nodes.find(n => n.id === 'notify'),
        nodes.find(n => n.id === 'success'),
        // Stop
        nodes.find(n => n.id === 'stop'),
    ].filter(Boolean) as WrapperNode[];

    const [expandedId, setExpandedId] = useState<string | null>(null);

    return (
        <div className="w-full py-4 px-4 flex flex-col items-center">
            <div className="w-full max-w-sm">
                {linearNodes.map((node, index) => {
                    const isStart = node.type === 'START';
                    const isStop = node.type === 'STOP';
                    const isIf = node.type === 'IF';
                    const isExpanded = expandedId === node.id;
                    const isBranchNode = ['upload', 'notify', 'success'].includes(node.id);

                    return (
                        <motion.div
                            key={node.id}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-5% 0px" }}
                            transition={{ delay: index * 0.02 }}
                            className={cn(
                                "mb-2 overflow-hidden rounded-xl border transition-all duration-300",
                                isExpanded ? "bg-white/10 border-brand-cyan/30 shadow-[0_0_15px_rgba(34,211,238,0.1)]" : "bg-white/5 border-white/5 hover:bg-white/10"
                            )}
                        >
                            <div
                                onClick={() => setExpandedId(isExpanded ? null : node.id)}
                                className="flex items-center p-3 cursor-pointer h-[56px]"
                            >
                                {/* Minimalist Identifier */}
                                {isBranchNode && (
                                    <div className="mr-2 text-slate-600">
                                        <CornerDownRight size={14} />
                                    </div>
                                )}

                                <div className={cn(
                                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors mr-3",
                                    isStart ? "text-green-400" :
                                        isStop ? "text-red-400" :
                                            isIf ? "text-yellow-400" :
                                                "text-brand-cyan"
                                )}>
                                    {node.icon ? <node.icon size={20} strokeWidth={isExpanded ? 2.5 : 2} /> : (isStart ? <Play size={20} /> : <Square size={20} />)}
                                </div>

                                <div className="flex-1 min-w-0 flex items-center justify-between">
                                    <span className={cn(
                                        "text-sm font-medium truncate",
                                        isExpanded ? "text-white" : "text-slate-300"
                                    )}>
                                        {node.label}
                                    </span>

                                    {!isExpanded && (
                                        <span className="text-[10px] bg-black/30 px-2 py-0.5 rounded text-slate-500 font-mono truncate max-w-[80px]">
                                            {node.subLabel}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Expanded Details */}
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: "auto" }}
                                        exit={{ height: 0 }}
                                        className="px-3 pb-3"
                                    >
                                        <div className="pt-2 border-t border-white/5 flex flex-col gap-2">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-slate-500">Target</span>
                                                <span className="text-brand-cyan font-mono bg-brand-cyan/5 px-2 py-0.5 rounded border border-brand-cyan/10">
                                                    {node.subLabel}
                                                </span>
                                            </div>
                                            {isIf && (
                                                <div className="flex gap-2">
                                                    <div className="flex-1 text-[10px] text-center py-1 bg-green-500/5 text-green-500 rounded border border-green-500/10">True Path</div>
                                                    <div className="flex-1 text-[10px] text-center py-1 bg-red-500/5 text-red-500 rounded border border-red-500/10">False Path</div>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )
                })}

                {/* Visual End Marker */}
                <div className="flex justify-center mt-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
                </div>
            </div>
        </div>
    )
}

export const WorkflowEditor = () => {
    const isMobile = useMediaQuery('(max-width: 768px)');

    const renderConnection = (start: WrapperNode, end: WrapperNode, label?: string, color: string = '#22d3ee') => {
        if (start.type === 'VARIABLE' || end.type === 'VARIABLE') return null;

        const startIsCircle = start.type === 'START' || start.type === 'STOP';
        const endIsCircle = end.type === 'START' || end.type === 'STOP';

        let startX, startY, endX, endY;
        let controlPoint1X, controlPoint1Y, controlPoint2X, controlPoint2Y;

        const isMovingRight = end.x > start.x;
        const isMovingDown = end.y > start.y;

        const isVerticalNeighbor = Math.abs(end.x - start.x) < 50 && isMovingDown;

        if (isVerticalNeighbor) {
            // Straight down connection (IF -> STOP)
            startX = start.x + (startIsCircle ? 32 : NODE_WIDTH / 2);
            startY = start.y + (startIsCircle ? 64 : NODE_HEIGHT);

            endX = end.x + (endIsCircle ? 32 : NODE_WIDTH / 2);
            endY = end.y + (endIsCircle ? -10 : -10);

            controlPoint1X = startX;
            controlPoint1Y = startY + 20;
            controlPoint2X = endX;
            controlPoint2Y = endY - 20;

        } else if (isMovingDown) {
            // Row Wrap Logic
            startX = start.x + (startIsCircle ? 32 : NODE_WIDTH / 2);
            startY = start.y + (startIsCircle ? 64 : NODE_HEIGHT);

            endX = end.x + (endIsCircle ? 32 : NODE_WIDTH / 2);
            endY = end.y + (endIsCircle ? -10 : -10);

            controlPoint1X = startX;
            controlPoint1Y = startY + 40;
            controlPoint2X = endX;
            controlPoint2Y = endY - 40;

        } else if (!isMovingRight) {
            // Move Left
            startX = start.x - 10;
            startY = start.y + (startIsCircle ? 32 : NODE_HEIGHT / 2);

            endX = end.x + (endIsCircle ? 70 : NODE_WIDTH) + 10;
            endY = end.y + (endIsCircle ? 32 : NODE_HEIGHT / 2);

            controlPoint1X = startX - 40;
            controlPoint1Y = startY;
            controlPoint2X = endX + 40;
            controlPoint2Y = endY;

        } else {
            // Move Right
            startX = start.x + (startIsCircle ? 64 : NODE_WIDTH) + 10;
            startY = start.y + (startIsCircle ? 32 : NODE_HEIGHT / 2);

            endX = end.x - 10;
            endY = end.y + (endIsCircle ? 32 : NODE_HEIGHT / 2);

            controlPoint1X = startX + 40;
            controlPoint1Y = startY;
            controlPoint2X = endX - 40;
            controlPoint2Y = endY;
        }

        const path = `M ${startX} ${startY} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${endX} ${endY}`;

        return (
            <g key={`conn-${start.id}-${end.id}`}>
                <path
                    d={path}
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    className="drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]"
                    strokeDasharray={label === 'False' ? "5,5" : "none"}
                />
                {label && (
                    <text x={(startX + endX) / 2} y={(startY + endY) / 2 - 10} fill={color} fontSize="10" fontWeight="bold" textAnchor="middle" className="bg-black/50 px-1 py-0.5 rounded backdrop-blur-sm">
                        {label}
                    </text>
                )}
                {/* Arrowhead or Dot */}
                <circle cx={endX} cy={endY} r="3" fill={color} className="drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]" />
            </g>
        );
    };

    return (
        <section className="w-full relative py-20 bg-[#020617] relative z-10 overflow-hidden">
            {/* --- Premium Animated Background --- */}

            {/* 1. Deep Radial Glow (Pulse) */}
            <motion.div
                animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.1, 1] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-brand-cyan/10 rounded-[100%] blur-[100px] pointer-events-none"
            ></motion.div>

            {/* 2. Moving Grid Effect */}
            <div className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                    backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                    maskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)'
                }}
            ></div>

            {/* 3. Scanning Beam Line */}
            <motion.div
                initial={{ top: '0%', opacity: 0 }}
                animate={{ top: ['0%', '100%'], opacity: [0, 1, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-[100px] bg-gradient-to-b from-transparent via-brand-cyan/10 to-transparent pointer-events-none blur-xl"
            ></motion.div>

            {/* 4. Floating Particles (Simple CSS) */}
            <div className="absolute top-20 left-20 w-32 h-32 bg-purple-500/10 rounded-full blur-[60px] animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-500/10 rounded-full blur-[60px] animate-pulse delay-1000"></div>

            <div className="max-w-7xl mx-auto px-4 relative min-h-[600px]"> {/* Reduced Height */}

                {/* Header UI - Simplified & Clean */}
                <div className="relative z-20 mb-12 text-center">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
                        <span className="text-white">Visual </span>
                        <span className="text-slate-500">Workflow Builder.</span>
                    </h2>
                    <p className="text-slate-400 max-w-xl mx-auto text-base">
                        Drag, drop, and connect nodes to create powerful automation logic.
                    </p>
                    <div className="mt-6 md:hidden">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-cyan/10 text-brand-cyan text-[10px] font-bold uppercase tracking-wider border border-brand-cyan/20">
                            <Zap size={10} /> Mobile Optimized View
                        </span>
                    </div>
                </div>

                {/* Canvas or Timeline Switch */}
                {isMobile ? (
                    <MobileWorkflowTimeline nodes={NODES_OPTIMIZED} />
                ) : (
                    <div className="relative w-full h-[550px] overflow-x-auto overflow-y-visible scrollbar-hide flex justify-center">
                        <div className="min-w-[1000px] h-full relative">

                            {/* Rendering Connections - SVG Layer */}
                            <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none">
                                {/* Sequence */}
                                {renderConnection(NODES_OPTIMIZED[0], NODES_OPTIMIZED[1])}
                                {renderConnection(NODES_OPTIMIZED[1], NODES_OPTIMIZED[2])}
                                {renderConnection(NODES_OPTIMIZED[2], NODES_OPTIMIZED[3])}

                                {/* Wrap Row 1 -> Row 2 */}
                                {renderConnection(NODES_OPTIMIZED[3], NODES_OPTIMIZED[4])}

                                {/* Row 2 Reverse */}
                                {renderConnection(NODES_OPTIMIZED[4], NODES_OPTIMIZED[5])}
                                {renderConnection(NODES_OPTIMIZED[5], NODES_OPTIMIZED[6])}
                                {renderConnection(NODES_OPTIMIZED[6], NODES_OPTIMIZED[7])}

                                {/* Wrap Row 2 -> Row 3 */}
                                {renderConnection(NODES_OPTIMIZED[7], NODES_OPTIMIZED[8])}

                                {/* Row 3 - Conditional Logic */}
                                {renderConnection(NODES_OPTIMIZED[8], NODES_OPTIMIZED[10], "True", '#22c55e')}
                                {renderConnection(NODES_OPTIMIZED[8], NODES_OPTIMIZED[9], "False", '#ef4444')}

                                {/* True Path Continuation */}
                                {renderConnection(NODES_OPTIMIZED[10], NODES_OPTIMIZED[11])}
                                {renderConnection(NODES_OPTIMIZED[11], NODES_OPTIMIZED[12])}
                            </svg>

                            {/* Rendering Nodes */}
                            {NODES_OPTIMIZED.map((node, i) => {
                                if (node.type === 'START') {
                                    return (
                                        <motion.div key={node.id}
                                            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.05 }}
                                            className="absolute w-16 h-16 rounded-full bg-green-500 border-4 border-green-400/50 shadow-[0_0_30px_rgba(34,197,94,0.4)] flex items-center justify-center z-10 hover:scale-110 transition-transform cursor-pointer group"
                                            style={{ left: node.x, top: node.y }}
                                        >
                                            <Play fill="white" size={24} className="text-white ml-1 group-hover:animate-pulse" />
                                        </motion.div>
                                    );
                                }
                                if (node.type === 'STOP') {
                                    return (
                                        <motion.div key={node.id}
                                            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.05 }}
                                            className="absolute w-16 h-16 rounded-full bg-red-600 border-4 border-red-500/50 shadow-[0_0_30px_rgba(220,38,38,0.4)] flex items-center justify-center z-10 hover:scale-110 transition-transform cursor-pointer"
                                            style={{ left: node.x, top: node.y }}
                                        >
                                            <Square fill="white" size={20} className="text-white" />
                                        </motion.div>
                                    );
                                }
                                if (node.type === 'VARIABLE') {
                                    return (
                                        <motion.button key={node.id}
                                            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.05 }}
                                            className="absolute h-[60px] px-8 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold shadow-[0_0_20px_rgba(249,115,22,0.3)] flex items-center gap-3 z-10 hover:scale-105 transition-all ring-1 ring-white/20 border border-white/10"
                                            style={{ left: node.x, top: node.y }}
                                        >
                                            <Settings size={20} />
                                            <span>Variables</span>
                                        </motion.button>
                                    );
                                }

                                return (
                                    <motion.div key={node.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className={cn(
                                            "absolute h-[60px] w-[180px] rounded-2xl border flex items-center p-3 gap-3 shadow-xl z-10 cursor-pointer hover:-translate-y-1 transition-all group backdrop-blur-xl",
                                            node.type === 'IF'
                                                ? "bg-slate-800/80 border-yellow-500/30 shadow-yellow-500/5 hover:shadow-yellow-500/20 hover:border-yellow-500/50"
                                                : "bg-[#0F172A]/80 border-white/10 hover:border-brand-cyan/50 hover:shadow-[0_0_20px_rgba(34,211,238,0.1)]"
                                        )}
                                        style={{ left: node.x, top: node.y }}
                                    >
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center shadow-inner ring-1 ring-white/5",
                                            node.type === 'IF' ? "bg-yellow-500/10 text-yellow-400" : "bg-brand-cyan/10 text-brand-cyan"
                                        )}>
                                            {node.icon && <node.icon size={20} />}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className={cn(
                                                "text-xs font-bold leading-tight transition-colors",
                                                node.type === 'IF' ? "text-yellow-100 group-hover:text-yellow-400" : "text-slate-100 group-hover:text-brand-cyan"
                                            )}>{node.label}</span>
                                            <span className="text-[10px] text-slate-500 font-mono group-hover:text-slate-400 transition-colors">{node.subLabel}</span>
                                        </div>

                                        {/* Connection Dots (Decorative - Only show on hover or always?) -> Subtle */}
                                        <div className="absolute -left-1 w-2 h-2 rounded-full bg-slate-700 border border-slate-600"></div>
                                        <div className="absolute -right-1 w-2 h-2 rounded-full bg-slate-700 border border-slate-600"></div>

                                        {node.type === 'IF' && (
                                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-slate-700 border border-slate-600"></div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};
