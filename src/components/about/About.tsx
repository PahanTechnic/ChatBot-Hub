'use client';

import { 
    ChevronLeft, 
    MoreVertical, 
    Paperclip, 
    Smile, 
    Send, 
    Sparkles, 
    Bot, 
    Zap, 
    Palette, 
    Puzzle,
    Check,
    MessageCircle,
    Clock,
    Shield,
    Users
} from 'lucide-react';

export default function About() {
    return (
        <div className="relative min-h-screen bg-black text-white py-20 overflow-hidden">
            {/* Green gradient background blur */}
            <div 
                className="absolute top-0 left-0 w-full h-full bg-cover bg-top bg-no-repeat opacity-40"
                style={{
                    backgroundImage: "url('https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/hero/green-gradient-bg.svg')"
                }}
            />
            
            {/* Additional green blur effect */}
            <div className="w-[520px] h-[520px] rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 blur-[200px] -z-10 bg-green-500/20"></div>
            
            <div className="relative z-10 max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-3xl md:text-4xl font-semibold bg-gradient-to-r from-white to-slate-400 text-transparent bg-clip-text">
                        About Our AI Chatbot Platform
                    </h1>
                    <p className="text-sm md:text-base text-slate-400 text-center mt-3 max-w-2xl mx-auto">
                        Empowering businesses with intelligent automation - each solution crafted with cutting-edge AI technology, innovation and seamless integration.
                    </p>
                </div>

                {/* Main Content */}
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center gap-12 px-4">
                    {/* Chatbot Preview */}
                    <div className="relative max-w-sm w-full">
                        <div className="absolute inset-0 bg-green-500/20 rounded-2xl blur-2xl"></div>
                        <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 border border-green-500/30 rounded-3xl shadow-2xl overflow-hidden">
                            {/* Chat Header */}
                            <div className="bg-gradient-to-r from-green-600 to-green-700 px-4 py-3.5 flex items-center justify-between backdrop-blur-xl border-b border-white/10">
                                <div className="flex items-center gap-3">
                                    <button className="text-white/90 hover:text-white hover:bg-white/20 p-1.5 rounded-lg transition-all duration-300">
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    
                                    <div className="relative w-10 h-10 rounded-full flex items-center justify-center bg-white/20 backdrop-blur-sm shadow-lg ring-2 ring-white/30">
                                        <Bot className="w-6 h-6 text-white" />
                                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                                    </div>
                                    
                                    <div>
                                        <h3 className="text-white font-bold text-sm flex items-center gap-1.5">
                                            <span>AI Assistant</span>
                                            <Sparkles className="w-4 h-4 text-yellow-300" />
                                        </h3>
                                        <p className="text-white/80 text-xs font-medium">Always here to help</p>
                                    </div>
                                </div>
                                
                                <button className="text-white/90 hover:text-white hover:bg-white/20 p-1.5 rounded-lg transition-all duration-300">
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                            </div>
                            
                            {/* Chat Messages */}
                            <div className="p-4 space-y-4 h-80 overflow-y-auto chatbot-scrollbar bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-sm" style={{
                                backgroundImage: 'radial-gradient(circle at 20px 20px, rgba(148, 163, 184, 0.03) 1px, transparent 0), radial-gradient(circle at 80px 80px, rgba(148, 163, 184, 0.03) 1px, transparent 0)',
                                backgroundSize: '100px 100px'
                            }}>
                                {/* Date Separator */}
                                <div className="flex items-center justify-center gap-2 py-2">
                                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-600 to-transparent"></div>
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-800/50 backdrop-blur-sm rounded-full border border-slate-700/50">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                        <span className="text-xs font-semibold text-slate-300">Connected</span>
                                    </div>
                                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-600 to-transparent"></div>
                                </div>
                                
                                {/* Bot Message */}
                                <div className="flex gap-2.5 animate-fade-in">
                                    <div className="w-9 h-9 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white/20 flex-shrink-0">
                                        <Bot className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="bg-slate-800/90 backdrop-blur-sm border border-slate-700/50 rounded-2xl rounded-tl-md p-3 max-w-[80%] shadow-lg">
                                        <p className="text-sm text-slate-200 leading-relaxed">Hello! How can I help you today?</p>
                                        <div className="flex items-center gap-1 mt-1.5">
                                            <span className="text-xs text-slate-500 font-medium">10:30 AM</span>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* User Message */}
                                <div className="flex gap-2.5 justify-end animate-fade-in">
                                    <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl rounded-tr-md p-3 max-w-[80%] shadow-lg">
                                        <p className="text-sm text-white leading-relaxed">What features do you offer?</p>
                                        <div className="flex items-center gap-1 mt-1.5 justify-end">
                                            <span className="text-xs text-white/70 font-medium">10:30 AM</span>
                                            <Check className="w-3.5 h-3.5 text-white/70" />
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Bot Message with list */}
                                <div className="flex gap-2.5 animate-fade-in">
                                    <div className="w-9 h-9 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white/20 flex-shrink-0">
                                        <Bot className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="bg-slate-800/90 backdrop-blur-sm border border-slate-700/50 rounded-2xl rounded-tl-md p-3 max-w-[80%] shadow-lg">
                                        <p className="text-sm text-slate-200 leading-relaxed mb-2">We offer amazing features:</p>
                                        <ul className="text-xs text-slate-300 space-y-1.5 ml-1">
                                            <li className="flex items-center gap-2">
                                                <Bot className="w-3 h-3 text-green-400 flex-shrink-0" />
                                                <span>AI-powered responses</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Clock className="w-3 h-3 text-green-400 flex-shrink-0" />
                                                <span>24/7 availability</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Palette className="w-3 h-3 text-green-400 flex-shrink-0" />
                                                <span>Custom branding</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <MessageCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
                                                <span>Analytics dashboard</span>
                                            </li>
                                        </ul>
                                        <div className="flex items-center gap-1 mt-2">
                                            <span className="text-xs text-slate-500 font-medium">10:31 AM</span>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Typing Indicator */}
                                <div className="flex gap-2.5 animate-fade-in">
                                    <div className="w-9 h-9 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white/20 flex-shrink-0">
                                        <Bot className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="bg-slate-800/90 backdrop-blur-sm border border-slate-700/50 rounded-2xl rounded-tl-md p-3 shadow-lg">
                                        <div className="flex gap-1">
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Chat Input */}
                            <div className="p-4 bg-slate-900/90 backdrop-blur-xl border-t border-slate-700/50">
                                <div className="flex gap-2 items-end">
                                    <div className="flex-1 bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-700/50 focus-within:border-green-500/50 transition-all shadow-sm">
                                        <div className="flex items-center px-4 py-3 gap-2">
                                            <input 
                                                type="text" 
                                                placeholder="Type your message..."
                                                className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
                                            />
                                            <div className="flex gap-1 items-center">
                                                <button className="text-slate-400 hover:text-slate-300 p-1 rounded-lg transition-all">
                                                    <Paperclip className="w-4 h-4" />
                                                </button>
                                                <button className="text-slate-400 hover:text-slate-300 p-1 rounded-lg transition-all">
                                                    <Smile className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <button className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-3 shadow-lg hover:shadow-xl hover:shadow-green-500/30 transition-all duration-300 hover:scale-105 active:scale-95">
                                        <Send className="w-5 h-5 text-white" />
                                    </button>
                                </div>
                                
                                {/* Footer */}
                                <div className="mt-3 flex items-center justify-center">
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                        <div className="w-4 h-4 rounded-lg bg-gradient-to-r from-green-600 to-green-700 flex items-center justify-center shadow-sm">
                                            <Sparkles className="w-2.5 h-2.5 text-white" />
                                        </div>
                                        <span>Powered by <span className="font-bold text-slate-400">ChatBot AI</span></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="max-w-xl">
                        <h2 className="text-3xl md:text-4xl font-semibold mb-3">
                            Why Choose Our Platform
                        </h2>
                        <p className="text-sm md:text-base text-slate-300 mb-8">
                            Build powerful AI chatbots without complexity. Our platform combines enterprise-grade AI with developer-friendly tools to deliver exceptional customer experiences.
                        </p>

                        {/* Features */}
                        <div className="flex flex-col gap-8">
                            {/* Feature 1 */}
                            <div className="flex items-start gap-4 group">
                                <div className="min-w-[44px] h-11 bg-green-500/10 border border-green-500/30 rounded-xl group-hover:bg-green-500/20 transition backdrop-blur-sm flex items-center justify-center">
                                    <Zap className="w-5 h-5 text-green-400" />
                                </div>
                                <div>
                                    <h3 className="text-base md:text-lg font-medium text-white mb-1">
                                        Lightning-Fast AI Responses
                                    </h3>
                                    <p className="text-sm text-slate-400">
                                        Powered by Groq AI - delivering instant, accurate responses with minimal latency for superior user experience.
                                    </p>
                                </div>
                            </div>

                            {/* Feature 2 */}
                            <div className="flex items-start gap-4 group">
                                <div className="min-w-[44px] h-11 bg-green-500/10 border border-green-500/30 rounded-xl group-hover:bg-green-500/20 transition backdrop-blur-sm flex items-center justify-center">
                                    <Palette className="w-5 h-5 text-green-400" />
                                </div>
                                <div>
                                    <h3 className="text-base md:text-lg font-medium text-white mb-1">
                                        Fully Customizable Design
                                    </h3>
                                    <p className="text-sm text-slate-400">
                                        Beautiful, modern chat widgets with custom branding, colors, and styles that match your brand identity perfectly.
                                    </p>
                                </div>
                            </div>

                            {/* Feature 3 */}
                            <div className="flex items-start gap-4 group">
                                <div className="min-w-[44px] h-11 bg-green-500/10 border border-green-500/30 rounded-xl group-hover:bg-green-500/20 transition backdrop-blur-sm flex items-center justify-center">
                                    <Puzzle className="w-5 h-5 text-green-400" />
                                </div>
                                <div>
                                    <h3 className="text-base md:text-lg font-medium text-white mb-1">
                                        Seamless Integration
                                    </h3>
                                    <p className="text-sm text-slate-400">
                                        Simple embed code, Google Sheets sync, document uploads, and API integration ready in minutes.
                                    </p>
                                </div>
                            </div>

                            {/* Feature 4 */}
                            <div className="flex items-start gap-4 group">
                                <div className="min-w-[44px] h-11 bg-green-500/10 border border-green-500/30 rounded-xl group-hover:bg-green-500/20 transition backdrop-blur-sm flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-green-400" />
                                </div>
                                <div>
                                    <h3 className="text-base md:text-lg font-medium text-white mb-1">
                                        Enterprise Security
                                    </h3>
                                    <p className="text-sm text-slate-400">
                                        Bank-level encryption and data protection ensuring your conversations stay private and secure.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                    <div className="text-center group">
                        <div className="w-14 h-14 mx-auto mb-3 bg-green-500/10 border border-green-500/30 rounded-2xl flex items-center justify-center group-hover:bg-green-500/20 transition">
                            <Users className="w-7 h-7 text-green-400" />
                        </div>
                        <div className="text-3xl md:text-4xl font-bold text-green-400 mb-1">10k+</div>
                        <div className="text-sm text-slate-400">Active Users</div>
                    </div>
                    <div className="text-center group">
                        <div className="w-14 h-14 mx-auto mb-3 bg-green-500/10 border border-green-500/30 rounded-2xl flex items-center justify-center group-hover:bg-green-500/20 transition">
                            <Shield className="w-7 h-7 text-green-400" />
                        </div>
                        <div className="text-3xl md:text-4xl font-bold text-green-400 mb-1">99.9%</div>
                        <div className="text-sm text-slate-400">Uptime</div>
                    </div>
                    <div className="text-center group">
                        <div className="w-14 h-14 mx-auto mb-3 bg-green-500/10 border border-green-500/30 rounded-2xl flex items-center justify-center group-hover:bg-green-500/20 transition">
                            <MessageCircle className="w-7 h-7 text-green-400" />
                        </div>
                        <div className="text-3xl md:text-4xl font-bold text-green-400 mb-1">1M+</div>
                        <div className="text-sm text-slate-400">Messages</div>
                    </div>
                    <div className="text-center group">
                        <div className="w-14 h-14 mx-auto mb-3 bg-green-500/10 border border-green-500/30 rounded-2xl flex items-center justify-center group-hover:bg-green-500/20 transition">
                            <Clock className="w-7 h-7 text-green-400" />
                        </div>
                        <div className="text-3xl md:text-4xl font-bold text-green-400 mb-1">24/7</div>
                        <div className="text-sm text-slate-400">Support</div>
                    </div>
                </div>
            </div>
            
            <style>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .animate-fade-in {
                    animation: fade-in 0.4s ease-out;
                }
                
                .chatbot-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                
                .chatbot-scrollbar::-webkit-scrollbar-track {
                    background: rgba(30, 41, 59, 0.3);
                    border-radius: 10px;
                }
                
                .chatbot-scrollbar::-webkit-scrollbar-thumb {
                    background: linear-gradient(135deg, #10b981, #059669);
                    border-radius: 10px;
                    transition: all 0.3s ease;
                }
                
                .chatbot-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(135deg, #059669, #047857);
                    box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
                }
            `}</style>
        </div>
    );
}