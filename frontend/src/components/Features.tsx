import {
  Brain,
  Globe,
  BarChart3,
  PenTool,
  TrendingUp,
  Eye,
  FlaskConical,
  UserPlus,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "16-Agent AI Swarm",
    description:
      "Orchestrate 16 specialized AI agents working in unison — each one purpose-built for a unique growth function.",
  },
  {
    icon: Globe,
    title: "Cross-Platform Orchestration",
    description:
      "Unified strategy across X and LinkedIn with synchronized posting, engagement, and analytics.",
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description:
      "Live engagement metrics, follower insights, and performance dashboards that update in real time.",
  },
  {
    icon: PenTool,
    title: "Smart Content Generation",
    description:
      "AI-crafted threads, carousels, polls, and long-form posts tailored to your brand voice and audience.",
  },
  {
    icon: TrendingUp,
    title: "Trend Analysis",
    description:
      "Stay ahead with real-time trend detection across hashtags, topics, and viral conversations.",
  },
  {
    icon: Eye,
    title: "Competitor Monitoring",
    description:
      "Track competitor strategies, benchmark performance, and identify gaps to outperform them.",
  },
  {
    icon: FlaskConical,
    title: "A/B Testing",
    description:
      "Optimize content with automated split testing on headlines, formats, posting times, and CTAs.",
  },
  {
    icon: UserPlus,
    title: "Lead Generation",
    description:
      "Intelligent prospecting across platforms — identify, qualify, and nurture high-value leads automatically.",
  },
];

export default function Features() {
  return (
    <section id="features" className="relative py-24 sm:py-32 overflow-hidden">
      {/* Subtle top accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16 sm:mb-20">
          <span className="inline-block px-3 py-1 text-xs font-semibold tracking-widest uppercase text-gold border border-gold/20 rounded-full bg-gold/5 mb-4">
            Capabilities
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
            Powerful{" "}
            <span className="text-gold-gradient">Features</span>
          </h2>
          <p className="mt-4 text-gray-400 text-base sm:text-lg max-w-xl mx-auto">
            Everything you need to dominate social media, powered by a
            coordinated swarm of intelligent agents.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {features.map((feat) => (
            <div
              key={feat.title}
              className="group relative bg-[#1A1A1A] border border-white/5 rounded-xl p-6 transition-all duration-500 hover:border-gold/30 hover:bg-[#1f1f1f] hover:shadow-[0_0_40px_rgba(212,175,55,0.06)]"
            >
              {/* Icon */}
              <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gold/10 text-gold transition-all duration-300 group-hover:bg-gold/15 group-hover:shadow-[0_0_20px_rgba(212,175,55,0.15)]">
                <feat.icon className="w-6 h-6" />
              </div>

              {/* Text */}
              <h3 className="font-heading text-lg font-bold text-white mb-2">
                {feat.title}
              </h3>
              <p className="text-sm leading-relaxed text-gray-400">
                {feat.description}
              </p>

              {/* Hover corner accent */}
              <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-transparent rounded-tr-xl transition-all duration-500 group-hover:border-gold/20" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
