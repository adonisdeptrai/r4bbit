/**
 * Admin Customers
 * Customer management view with user cards
 */

import React from 'react';
import { Search, ShieldCheck, MoreHorizontal } from 'lucide-react';
import { User } from '../../../types';
import { Button, Badge, cn } from '../../../components/common';

interface AdminCustomersProps {
    users: User[];
    onUpdateRole: (id: string, role: string) => void;
}

export const AdminCustomers = ({ users, onUpdateRole }: AdminCustomersProps) => (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Customers Management</h2>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input type="text" placeholder="Search users..." className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-brand-cyan text-white placeholder:text-slate-600 focus:bg-white/10 transition-colors" />
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user) => (
                <div key={user.id} className="group bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-lg flex flex-col gap-4 hover:border-white/20 transition-all">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-cyan/20 to-blue-600/20 flex items-center justify-center text-brand-cyan font-bold border border-white/5 uppercase shrink-0">
                            {user.username.substring(0, 2)}
                        </div>
                        <div className="min-w-0">
                            <h4 className="font-bold text-white truncate flex items-center gap-2">
                                {user.username}
                                {user.role === 'admin' && <ShieldCheck size={14} className="text-brand-cyan" />}
                            </h4>
                            <p className="text-xs text-slate-400 truncate">{user.email}</p>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-white/5 flex items-center justify-between mt-auto">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Role</span>
                            <Badge className={cn(
                                "text-[10px] py-0.5",
                                user.role === 'admin' ? "bg-brand-cyan/10 text-brand-cyan border-brand-cyan/20" : "bg-white/5 text-slate-400 border-white/10"
                            )}>
                                {user.role.toUpperCase()}
                            </Badge>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Balance</span>
                            <span className="text-sm font-bold text-white">${user.balance}</span>
                        </div>
                    </div>

                    <div className="flex gap-2 mt-2">
                        {user.role === 'user' ? (
                            <Button
                                size="sm"
                                onClick={() => onUpdateRole(user.id, 'admin')}
                                className="w-full bg-brand-cyan/10 hover:bg-brand-cyan/20 text-brand-cyan text-xs font-bold border border-brand-cyan/20 h-9"
                            >
                                Promote to Admin
                            </Button>
                        ) : (
                            <Button
                                size="sm"
                                onClick={() => onUpdateRole(user.id, 'user')}
                                className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/20 h-9"
                            >
                                Demote to User
                            </Button>
                        )}
                        <Button variant="ghost" size="sm" className="px-2 text-slate-500 hover:text-white border border-white/5">
                            <MoreHorizontal size={18} />
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export default AdminCustomers;
