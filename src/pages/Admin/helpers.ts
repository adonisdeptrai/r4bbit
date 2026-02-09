/**
 * Admin Dashboard Helper Functions
 */

import { ProductType } from '../../types';
import { Layers, Cpu, GraduationCap, Key, Tag } from 'lucide-react';

export const getProductStyles = (type: ProductType) => {
    switch (type) {
        case ProductType.SCRIPT:
            return {
                color: 'text-cyan-600',
                bg: 'bg-cyan-50',
                border: 'border-cyan-100',
                gradient: 'from-cyan-500 to-blue-600',
                icon: Layers,
                shadow: 'shadow-cyan-500/20'
            };
        case ProductType.TOOL:
            return {
                color: 'text-violet-600',
                bg: 'bg-violet-50',
                border: 'border-violet-100',
                gradient: 'from-violet-500 to-purple-600',
                icon: Cpu,
                shadow: 'shadow-violet-500/20'
            };
        case ProductType.COURSE:
            return {
                color: 'text-amber-600',
                bg: 'bg-amber-50',
                border: 'border-amber-100',
                gradient: 'from-amber-400 to-orange-500',
                icon: GraduationCap,
                shadow: 'shadow-amber-500/20'
            };
        case ProductType.KEY:
            return {
                color: 'text-emerald-600',
                bg: 'bg-emerald-50',
                border: 'border-emerald-100',
                gradient: 'from-emerald-400 to-green-600',
                icon: Key,
                shadow: 'shadow-emerald-500/20'
            };
        default:
            return {
                color: 'text-slate-600',
                bg: 'bg-slate-50',
                border: 'border-slate-100',
                gradient: 'from-slate-500 to-gray-600',
                icon: Tag,
                shadow: 'shadow-slate-500/20'
            };
    }
};
