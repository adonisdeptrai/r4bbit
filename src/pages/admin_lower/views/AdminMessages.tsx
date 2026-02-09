/**
 * Admin Messages
 * Support tickets view
 */

import React from 'react';
import { User as UserIcon } from 'lucide-react';
import { Badge, cn } from '../../../components/common';
import { MOCK_TICKETS } from '../types';

export const AdminMessages = () => (
    <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white">Support Tickets</h2>
        <div className="space-y-4">
            {MOCK_TICKETS.map((ticket) => (
                <div key={ticket.id} className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-lg hover:border-brand-cyan/50 transition-all cursor-pointer group">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-slate-500 group-hover:text-brand-cyan transition-colors">{ticket.id}</span>
                            <Badge className={cn(
                                "text-[10px]",
                                ticket.priority === 'High' ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                            )}>{ticket.priority}</Badge>
                        </div>
                        <span className="text-xs text-slate-500">{ticket.date}</span>
                    </div>
                    <h4 className="font-bold text-white mb-1 group-hover:text-brand-cyan transition-colors">{ticket.subject}</h4>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <UserIcon size={12} /> {ticket.user}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export default AdminMessages;
