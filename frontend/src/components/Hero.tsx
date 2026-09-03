import { ArrowRight, Sparkles } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background layers */}
      <div className="absolute inset-0 bg-grid-pattern" />
      <div className="absolute inset-0 bg-radial-gold" />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-gold/40 rounded-full animate-float"
            style={{
              left: `${8 + (i * 7.5)}%`,
              top: `${15 + (i % 5) * 15}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${4 + (i % 3) * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Decorative corner accents */}
      <div className="absolute top-24 left-8 w-32 h-32 border-l border-t border-gold/10 rounded-tl-lg" />
      <div className="absolute bottom-12 right-8 w-32 h-32 border-r border-b border-gold/10 rounded-br-lg" />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full border border-gold/20 bg-gold/5 text-gold text-xs sm:text-sm font-medium tracking-wide animate-fade-in-up">
          <Sparkles className="w-4 h-4" />
          Powered by Advanced Multi-Agent AI
        </div>

        {/* Headline */}
        <h1 className="font-heading font-extrabold tracking-tight leading-[1.1] animate-fade-in-up delay-100">
          <span className="block text-4xl sm:text-6xl lg:text-7xl xl:text-8xl text-white">
            16-Agent AI Swarm
          </span>
          <span className="block text-3xl sm:text-5xl lg:text-6xl xl:text-7xl mt-2 sm:mt-4">
            <span className="text-white">Supercharge Your </span>
            <span className="text-gold-shimmer">X &amp; LinkedIn</span>
            <span className="text-white"> Growth</span>
          </span>
        </h1>

        {/* Subtext */}
        <p className="mt-6 sm:mt-8 text-base sm:text-lg lg:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-300">
          Harness the power of 16 specialized AI agents working in perfect
          harmony. Automate content, analyze trends, engage audiences, and
          dominate both X and LinkedIn — all from a single command center.
        </p>

        {/* CTA */}
        <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-400">
          <a
            href="#"
            className="group relative inline-flex items-center gap-2 px-8 py-4 text-base sm:text-lg font-bold text-black bg-gold-gradient rounded-lg transition-all duration-300 hover:brightness-110 animate-pulse-glow"
          >
            Start Growing
            <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
          </a>
          <a
            href="#features"
            className="inline-flex items-center gap-2 px-8 py-4 text-base sm:text-lg font-semibold text-gray-300 border border-white/10 rounded-lg transition-all duration-300 hover:text-gold hover:border-gold/30 hover:bg-white/5"
          >
            Explore Features
          </a>
        </div>

        {/* Trust indicators */}
        <div className="mt-16 sm:mt-20 flex flex-wrap items-center justify-center gap-8 sm:gap-12 text-gray-500 text-xs sm:text-sm animate-fade-in-up delay-600">
          {[
            { value: "16", label: "AI Agents" },
            { value: "2", label: "Platforms" },
            { value: "24/7", label: "Automation" },
            { value: "∞", label: "Possibilities" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-heading text-2xl sm:text-3xl font-bold text-gold-gradient">
                {stat.value}
              </div>
              <div className="mt-1 tracking-wide uppercase text-[11px] sm:text-xs">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0A0A0A] to-transparent" />
    </section>
  );
}
