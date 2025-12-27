'use client';

import { 
    Bot, 
    Dribbble, 
    Linkedin, 
    Twitter, 
    Youtube,
    Mail,
    MapPin,
    Phone,
    ArrowRight,
    Sparkles,
    Heart,
    Globe,
    Shield,
    Zap
} from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="relative bg-black text-white overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0">
                <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[200px] bg-green-500/10"></div>
                <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full blur-[200px] bg-emerald-500/10"></div>
            </div>

            {/* Top Border Glow */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent"></div>

            {/* Newsletter Section */}
            <div className="relative z-10 border-b border-white/[0.06]">
                <div className="max-w-7xl mx-auto px-6 py-16">
                    <div className="max-w-2xl mx-auto text-center">
                        {/* Glass Card */}
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-3xl blur-xl opacity-50 group-hover:opacity-70 transition duration-500"></div>
                            <div className="relative bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/20 mb-4">
                                    <Mail className="w-6 h-6 text-green-400" />
                                </div>
                                <h3 className="text-2xl font-bold mb-2 bg-gradient-to-b from-white to-white/70 text-transparent bg-clip-text">
                                    Stay Updated
                                </h3>
                                <p className="text-white/40 text-sm mb-6">
                                    Get the latest news, updates and tips delivered to your inbox
                                </p>
                                
                                <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                                    <div className="flex-1 relative">
                                        <input 
                                            type="email" 
                                            placeholder="Enter your email"
                                            className="w-full px-4 py-3 rounded-xl bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] text-white placeholder-white/30 focus:outline-none focus:border-green-500/50 transition-all"
                                        />
                                    </div>
                                    <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 font-semibold flex items-center justify-center gap-2 transition-all hover:scale-105">
                                        Subscribe
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Footer Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 text-center md:text-left">
                    
                    {/* Brand Section */}
                    <div className="lg:col-span-2 flex flex-col items-center md:items-start">
                        {/* Logo */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className="relative">
                                <div className="absolute inset-0 bg-green-500/30 rounded-xl blur-md"></div>
                                <div className="relative w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <Bot className="w-7 h-7 text-white" />
                                </div>
                            </div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-white to-white/70 text-transparent bg-clip-text">
                                ChatBot AI
                            </span>
                        </div>
                        
                        <p className="text-white/40 text-sm leading-relaxed mb-6 max-w-xs">
                            Empowering businesses with intelligent AI chatbot solutions for exceptional customer experiences.
                        </p>

                        {/* Contact Info */}
                        <div className="space-y-3">
                            <a href="mailto:hello@chatbotai.com" className="flex items-center justify-center md:justify-start gap-2 text-sm text-white/40 hover:text-green-400 transition-colors">
                                <Mail className="w-4 h-4" />
                                <span>hello@chatbotai.com</span>
                            </a>
                            <a href="tel:+1234567890" className="flex items-center justify-center md:justify-start gap-2 text-sm text-white/40 hover:text-green-400 transition-colors">
                                <Phone className="w-4 h-4" />
                                <span>+1 (234) 567-890</span>
                            </a>
                            <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-white/40">
                                <MapPin className="w-4 h-4" />
                                <span>San Francisco, CA</span>
                            </div>
                        </div>
                    </div>

                    {/* Product Links */}
                    <div className="flex flex-col items-center md:items-start">
                        <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-green-400" />
                            Product
                        </h4>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/" className="text-sm text-white/40 hover:text-green-400 transition-colors">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link href="/features" className="text-sm text-white/40 hover:text-green-400 transition-colors">
                                    Features
                                </Link>
                            </li>
                            <li>
                                <Link href="/pricing" className="text-sm text-white/40 hover:text-green-400 transition-colors">
                                    Pricing
                                </Link>
                            </li>
                            <li>
                                <Link href="/demo" className="text-sm text-white/40 hover:text-green-400 transition-colors">
                                    Live Demo
                                </Link>
                            </li>
                            <li>
                                <Link href="/integrations" className="text-sm text-white/40 hover:text-green-400 transition-colors">
                                    Integrations
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Resources Links */}
                    <div className="flex flex-col items-center md:items-start">
                        <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                            <Globe className="w-4 h-4 text-green-400" />
                            Resources
                        </h4>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/about" className="text-sm text-white/40 hover:text-green-400 transition-colors">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/blog" className="text-sm text-white/40 hover:text-green-400 transition-colors">
                                    Blog
                                </Link>
                            </li>
                            <li>
                                <Link href="/docs" className="text-sm text-white/40 hover:text-green-400 transition-colors">
                                    Documentation
                                </Link>
                            </li>
                            <li>
                                <Link href="/support" className="text-sm text-white/40 hover:text-green-400 transition-colors">
                                    Support Center
                                </Link>
                            </li>
                            <li>
                                <Link href="/careers" className="text-sm text-white/40 hover:text-green-400 transition-colors inline-flex items-center gap-2">
                                    Careers
                                    <span className="text-[10px] text-white bg-green-600 rounded-md px-1.5 py-0.5 font-medium">
                                        Hiring
                                    </span>
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Legal Links */}
                    <div className="flex flex-col items-center md:items-start">
                        <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                            <Shield className="w-4 h-4 text-green-400" />
                            Legal
                        </h4>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/privacy" className="text-sm text-white/40 hover:text-green-400 transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="text-sm text-white/40 hover:text-green-400 transition-colors">
                                    Terms of Service
                                </Link>
                            </li>
                            <li>
                                <Link href="/cookies" className="text-sm text-white/40 hover:text-green-400 transition-colors">
                                    Cookie Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/security" className="text-sm text-white/40 hover:text-green-400 transition-colors">
                                    Security
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="relative z-10 border-t border-white/[0.06]">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        
                        {/* Copyright */}
                        <div className="flex items-center gap-1 text-sm text-white/30">
                            <span>© {currentYear}</span>
                            <Link href="/" className="text-green-400 hover:text-green-300 transition-colors font-medium">
                                ChatBot AI
                            </Link>
                            <span>• Made with</span>
                            <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400 mx-0.5" />
                            <span>for better conversations</span>
                        </div>

                        {/* Social Links */}
                        <div className="flex items-center gap-2">
                            <a 
                                href="https://dribbble.com" 
                                target="_blank" 
                                rel="noreferrer"
                                className="group relative w-10 h-10 flex items-center justify-center"
                            >
                                <div className="absolute inset-0 bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/[0.06] group-hover:border-green-500/30 group-hover:bg-green-500/10 transition-all"></div>
                                <Dribbble className="relative w-5 h-5 text-white/40 group-hover:text-green-400 transition-colors" />
                            </a>
                            <a 
                                href="https://linkedin.com" 
                                target="_blank" 
                                rel="noreferrer"
                                className="group relative w-10 h-10 flex items-center justify-center"
                            >
                                <div className="absolute inset-0 bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/[0.06] group-hover:border-green-500/30 group-hover:bg-green-500/10 transition-all"></div>
                                <Linkedin className="relative w-5 h-5 text-white/40 group-hover:text-green-400 transition-colors" />
                            </a>
                            <a 
                                href="https://twitter.com" 
                                target="_blank" 
                                rel="noreferrer"
                                className="group relative w-10 h-10 flex items-center justify-center"
                            >
                                <div className="absolute inset-0 bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/[0.06] group-hover:border-green-500/30 group-hover:bg-green-500/10 transition-all"></div>
                                <Twitter className="relative w-5 h-5 text-white/40 group-hover:text-green-400 transition-colors" />
                            </a>
                            <a 
                                href="https://youtube.com" 
                                target="_blank" 
                                rel="noreferrer"
                                className="group relative w-10 h-10 flex items-center justify-center"
                            >
                                <div className="absolute inset-0 bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/[0.06] group-hover:border-green-500/30 group-hover:bg-green-500/10 transition-all"></div>
                                <Youtube className="relative w-5 h-5 text-white/40 group-hover:text-green-400 transition-colors" />
                            </a>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] backdrop-blur-sm border border-white/[0.06]">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-xs text-white/40">All systems operational</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Decorative Bottom Glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-green-500/30 to-transparent"></div>
        </footer>
    );
}