'use client';

import { 
    Star, 
    BadgeCheck, 
    Quote,
    Sparkles,
    MessageSquareQuote,
    ArrowRight,
    Users,
    Building2,
    TrendingUp
} from 'lucide-react';

export default function Testimonials() {
    const testimonialsData = [
        {
            image: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200',
            name: 'Sarah Mitchell',
            handle: '@sarahmitchell',
            role: 'CEO, TechStart',
            date: 'April 20, 2025',
            rating: 5,
            text: 'This AI chatbot platform transformed our customer support. Response times dropped by 80% and customer satisfaction is at an all-time high!'
        },
        {
            image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200',
            name: 'Michael Chen',
            handle: '@michaelchen',
            role: 'Product Manager, InnovateCo',
            date: 'May 10, 2025',
            rating: 5,
            text: 'The customization options are incredible. We integrated it seamlessly with our brand, and our customers love the instant responses.'
        },
        {
            image: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&auto=format&fit=crop&q=60',
            name: 'Emily Rodriguez',
            handle: '@emilyrodriguez',
            role: 'CTO, DataFlow',
            date: 'June 5, 2025',
            rating: 5,
            text: 'Implementation was a breeze. The Google Sheets integration and document upload features saved us countless hours of setup time.'
        },
        {
            image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=60',
            name: 'David Thompson',
            handle: '@davidthompson',
            role: 'Founder, StartupHub',
            date: 'July 15, 2025',
            rating: 5,
            text: 'Best investment we made this year. The AI is incredibly accurate and the analytics dashboard provides invaluable insights.'
        },
        {
            image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&auto=format&fit=crop&q=60',
            name: 'Jessica Park',
            handle: '@jessicapark',
            role: 'Marketing Director, GrowthLab',
            date: 'August 3, 2025',
            rating: 5,
            text: 'Our conversion rates increased by 45% after implementing this chatbot. The 24/7 availability is a game-changer for our global customers.'
        },
        {
            image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=60',
            name: 'Alex Johnson',
            handle: '@alexjohnson',
            role: 'Operations Lead, ScaleUp',
            date: 'September 12, 2025',
            rating: 5,
            text: 'The platform paid for itself within the first month. Customer inquiries are handled instantly, freeing up our team for complex issues.'
        },
    ];

    const TestimonialCard = ({ testimonial }: { testimonial: typeof testimonialsData[0] }) => (
        <div className="group relative p-6 mx-4 w-80 shrink-0 rounded-2xl transition-all duration-500 hover:scale-[1.02]">
            {/* Glass background */}
            <div className="absolute inset-0 bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)]"></div>
            
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-green-500/[0.08] to-emerald-500/[0.05] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            {/* Inner glow */}
            <div className="absolute inset-0 rounded-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"></div>
            
            {/* Content */}
            <div className="relative z-10">
                {/* Header */}
                <div className="flex gap-3 mb-4">
                    <div className="relative">
                        <div className="absolute inset-0 bg-green-500/30 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <img 
                            className="relative w-12 h-12 rounded-full object-cover ring-2 ring-white/10 group-hover:ring-green-500/40 transition-all" 
                            src={testimonial.image} 
                            alt={testimonial.name} 
                        />
                    </div>
                    <div className="flex flex-col flex-1">
                        <div className="flex items-center gap-1.5">
                            <p className="font-semibold text-white/90">{testimonial.name}</p>
                            <BadgeCheck className="w-4 h-4 text-green-400 flex-shrink-0" />
                        </div>
                        <span className="text-xs text-white/40">{testimonial.handle}</span>
                        <span className="text-xs text-green-400/80 font-medium">{testimonial.role}</span>
                    </div>
                    <Quote className="w-8 h-8 text-green-500/20 group-hover:text-green-500/40 transition-colors" />
                </div>
                
                {/* Rating Stars */}
                <div className="flex gap-0.5 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400/90 text-yellow-400/90" />
                    ))}
                </div>
                
                {/* Text */}
                <p className="text-sm leading-relaxed text-white/70 mb-4">
                    {testimonial.text}
                </p>
                
                {/* Footer */}
                <div className="flex items-center justify-between text-white/30 text-xs pt-3 border-t border-white/[0.06]">
                    <div className="flex items-center gap-1.5">
                        <span>Posted on</span>
                        <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="hover:text-green-400 transition">
                            <svg width="11" height="10" viewBox="0 0 11 10" fill="none">
                                <path d="m.027 0 4.247 5.516L0 10h.962l3.742-3.926L7.727 10H11L6.514 4.174 10.492 0H9.53L6.084 3.616 3.3 0zM1.44.688h1.504l6.64 8.624H8.082z" fill="currentColor" />
                            </svg>
                        </a>
                    </div>
                    <p className="text-white/40">{testimonial.date}</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="relative min-h-screen bg-black text-white py-20 overflow-hidden">
            {/* Animated gradient background */}
            <div className="absolute inset-0">
                <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-[200px] bg-green-500/15 animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-[200px] bg-emerald-500/10 animate-pulse" style={{animationDelay: '1s'}}></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[250px] bg-green-600/10"></div>
            </div>

            {/* Noise texture overlay */}
            <div className="absolute inset-0 opacity-[0.015]" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            }}></div>
            
            <div className="relative z-10 max-w-7xl mx-auto px-4 mb-16">
                {/* Header */}
                <div className="text-center mb-12">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
                        <MessageSquareQuote className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-green-400/90 font-medium">Customer Stories</span>
                    </div>
                    
                    <h1 className="text-3xl md:text-5xl font-semibold bg-gradient-to-b from-white via-white/90 to-white/50 text-transparent bg-clip-text mb-4">
                        What Our Customers Say
                    </h1>
                    <p className="text-sm md:text-base text-white/40 max-w-2xl mx-auto">
                        Join thousands of businesses that transformed their customer support with our AI chatbot platform. Here&apos;s what they have to say.
                    </p>
                </div>

                {/* Stats Section - Glass Cards */}
                <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-12">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/[0.06]"></div>
                        <div className="relative px-6 py-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                                <Users className="w-5 h-5 text-green-400" />
                            </div>
                            <div>
                                <div className="text-xl font-bold text-white/90">10,000+</div>
                                <div className="text-xs text-white/40">Happy Customers</div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="relative group">
                        <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/[0.06]"></div>
                        <div className="relative px-6 py-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-green-400" />
                            </div>
                            <div>
                                <div className="text-xl font-bold text-white/90">500+</div>
                                <div className="text-xs text-white/40">Enterprise Clients</div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="relative group">
                        <div className="absolute inset-0 bg-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/[0.06]"></div>
                        <div className="relative px-6 py-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-green-400" />
                            </div>
                            <div>
                                <div className="text-xl font-bold text-white/90">4.9/5</div>
                                <div className="text-xs text-white/40">Average Rating</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Marquee Row 1 - Left to Right */}
            <div className="marquee-row w-full overflow-hidden relative mb-6">
                <div className="absolute left-0 top-0 h-full w-20 md:w-48 z-10 pointer-events-none bg-gradient-to-r from-black via-black/80 to-transparent"></div>
                <div className="marquee-inner flex transform-gpu min-w-[200%] py-4">
                    {[...testimonialsData, ...testimonialsData].map((testimonial, index) => (
                        <TestimonialCard key={`row1-${index}`} testimonial={testimonial} />
                    ))}
                </div>
                <div className="absolute right-0 top-0 h-full w-20 md:w-48 z-10 pointer-events-none bg-gradient-to-l from-black via-black/80 to-transparent"></div>
            </div>

            {/* Marquee Row 2 - Right to Left */}
            <div className="marquee-row w-full overflow-hidden relative">
                <div className="absolute left-0 top-0 h-full w-20 md:w-48 z-10 pointer-events-none bg-gradient-to-r from-black via-black/80 to-transparent"></div>
                <div className="marquee-inner marquee-reverse flex transform-gpu min-w-[200%] py-4">
                    {[...testimonialsData, ...testimonialsData].map((testimonial, index) => (
                        <TestimonialCard key={`row2-${index}`} testimonial={testimonial} />
                    ))}
                </div>
                <div className="absolute right-0 top-0 h-full w-20 md:w-48 z-10 pointer-events-none bg-gradient-to-l from-black via-black/80 to-transparent"></div>
            </div>

            {/* CTA Section - Glass Card */}
            <div className="relative z-10 mt-20 px-4">
                <div className="max-w-2xl mx-auto relative group">
                    {/* Glow effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-green-600/30 to-emerald-600/30 rounded-3xl blur-2xl opacity-50 group-hover:opacity-70 transition duration-500"></div>
                    
                    {/* Glass card */}
                    <div className="relative bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-8 md:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden">
                        {/* Inner reflections */}
                        <div className="absolute inset-0 rounded-3xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"></div>
                        <div className="absolute top-0 left-1/4 w-1/2 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                        
                        {/* Decorative blurs */}
                        <div className="absolute -top-20 -right-20 w-40 h-40 bg-green-500/20 rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl"></div>
                        
                        <div className="relative text-center">
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 mb-6 backdrop-blur-sm">
                                <Sparkles className="w-7 h-7 text-green-400" />
                            </div>
                            
                            <h2 className="text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-b from-white to-white/70 text-transparent bg-clip-text">
                                Ready to Transform Your Customer Support?
                            </h2>
                            <p className="text-white/50 mb-8">
                                Join thousands of satisfied customers and start your free trial today.
                            </p>
                            
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                                <button className="group/btn relative px-8 py-3.5 rounded-full font-semibold transition-all duration-300 hover:scale-105 overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600"></div>
                                    <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                                    <span className="relative flex items-center gap-2 text-white">
                                        Get Started Free
                                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                    </span>
                                </button>
                                
                                <button className="px-8 py-3.5 rounded-full font-semibold bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] text-white/80 hover:bg-white/[0.06] hover:border-white/[0.12] transition-all">
                                    Schedule Demo
                                </button>
                            </div>
                            
                            <p className="mt-6 text-xs text-white/30">
                                No credit card required • 14-day free trial • Cancel anytime
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes marqueeScroll {
                    0% { transform: translateX(0%); }
                    100% { transform: translateX(-50%); }
                }

                .marquee-inner {
                    animation: marqueeScroll 45s linear infinite;
                }

                .marquee-reverse {
                    animation-direction: reverse;
                }

                .marquee-inner:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </div>
    );
}