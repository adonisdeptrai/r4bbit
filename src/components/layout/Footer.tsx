import React from 'react';
import { Code, Github, Twitter, MessageSquare, Heart, Shield, Terminal, Zap } from 'lucide-react';
import { cn } from '../common/utils'; // Assuming this exists, based on LandingPage usage

// Reusing Logo component or similar if available, but I'll redefine a small one or import if I could find it.
// LandingPage has a local Logo. I should probably make it shared later, but for now I'll recreate a consistent look or just use text/icon.
// Actually, `LandingPage.tsx` defines `Logo` inline (lines 29-36).
// For Clean Architecture/refactoring, I *should* have moved Logo to a shared place, but I'm restricted to "make footer".
// I will create a simple Logo representation here matching the style.

const SocialLink = ({ href, icon: Icon }: { href: string; icon: any }) => (
    <a
        href={href}
        className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-brand-cyan/20 transition-all duration-300 border border-white/5 hover:border-brand-cyan/30 group"
    >
        <Icon size={18} className="group-hover:scale-110 transition-transform" />
    </a>
);

const FooterColumn = ({ title, links }: { title: string; links: string[] }) => (
    <div className="flex flex-col gap-4">
        <h4 className="font-bold text-white tracking-wide text-sm uppercase">{title}</h4>
        <ul className="flex flex-col gap-2">
            {links.map((link) => (
                <li key={link}>
                    <a
                        href="#"
                        className="text-slate-400 text-sm hover:text-brand-cyan transition-colors hover:translate-x-1 inline-block duration-200"
                    >
                        {link}
                    </a>
                </li>
            ))}
        </ul>
    </div>
);

export const Footer = () => {
    return (
        <footer className="relative bg-[#020617] border-t border-white/5 pt-20 pb-10 overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-cyan/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand Column */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-cyan to-blue-600 flex items-center justify-center text-white shadow-lg shadow-brand-cyan/20">
                                <Code size={18} />
                            </div>
                            <span className="font-bold text-xl text-white tracking-tight">R4B</span>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Empowering developers and entrepreneurs to build, scale, and dominate with intelligent automation tools.
                        </p>
                        <div className="flex gap-4">
                            <SocialLink href="#" icon={Github} />
                            <SocialLink href="#" icon={Twitter} />
                            <SocialLink href="#" icon={MessageSquare} />
                        </div>
                    </div>

                    {/* Product Column */}
                    <FooterColumn
                        title="Product"
                        links={['Visual Builder', 'Marketplace', 'Features', 'Enterprise', 'Pricing']}
                    />

                    {/* Resources Column */}
                    <FooterColumn
                        title="Resources"
                        links={['Documentation', 'API Reference', 'Community Guide', 'Blog', 'Status']}
                    />

                    {/* Company Column */}
                    <FooterColumn
                        title="Company"
                        links={['About Us', 'Careers', 'Legal', 'Privacy Policy', 'Contact']}
                    />
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-slate-500 text-sm">
                        © 2024 R4B Solutions. Ready For Business.
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-slate-500 text-xs font-medium px-3 py-1 bg-white/5 rounded-full border border-white/5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            All Systems Operational
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};
