import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  ChevronDown,
  Layers,
  MessageSquare,
  Package,
  Palette,
  Shield,
  ShoppingBag,
  Star,
  Wand2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// ── Data ───────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: <Wand2 className="size-6" />,
    title: "3D Live Customizer",
    desc: "Design your monument in real-time with interactive 3D tools. Add text, images, and decorative elements directly on the stone surface.",
    accent: true,
  },
  {
    icon: <Package className="size-6" />,
    title: "Multiple Stone Types",
    desc: "Choose from Gravestones, Urns, Table Signs, and Base Stones. Each available in Granite, Marble, Black Granite, and Sandstone finishes.",
  },
  {
    icon: <Palette className="size-6" />,
    title: "Design Templates",
    desc: "Browse a curated library of professional templates crafted by our artisans. Use them as-is or as a starting point for your custom design.",
  },
  {
    icon: <MessageSquare className="size-6" />,
    title: "Real-time Support",
    desc: "Chat directly with our team throughout the design and order process. We guide you from design to delivery.",
  },
  {
    icon: <ShoppingBag className="size-6" />,
    title: "Easy Order Tracking",
    desc: "Track your order status in real-time. Upload payment proof, view receipts, and get notified at every step.",
  },
  {
    icon: <Shield className="size-6" />,
    title: "Secure Payments",
    desc: "Pay safely via GCash or BPI. Flexible payment options including 50% down payment for qualifying orders.",
  },
];

const STATS = [
  { value: "500+", label: "Monuments Crafted" },
  { value: "12+", label: "Years of Experience" },
  { value: "100%", label: "Customer Satisfaction" },
  { value: "3–7", label: "Days Average Completion" },
];

const TESTIMONIALS = [
  {
    name: "Rosario Dela Cruz",
    role: "Family Client",
    text: "The 3D preview gave us peace of mind. We knew exactly how the lapida would look before it was carved. Exceptional quality and service.",
    rating: 5,
  },
  {
    name: "Engr. Miguel Santos",
    role: "Business Owner",
    text: "Ordered a custom table sign for our office. The online customizer made it so easy to get exactly what we envisioned. Highly recommend.",
    rating: 5,
  },
  {
    name: "Ana Reyes",
    role: "Family Client",
    text: "From the first message to delivery, the team was professional and caring. The final monument exceeded our expectations.",
    rating: 5,
  },
];

/**
 * LandingPage
 * Public marketing page with hero, features, stats, testimonials, and CTA.
 */
export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col">
      {/* ══ HERO SECTION ═══════════════════════════════════════════════════ */}
      <section
        className="relative min-h-[90vh] flex items-center justify-center
                          overflow-hidden px-4 py-24"
      >
        {/* Background: layered radial gradients */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2
                          w-200 h-200 rounded-full
                          bg-accent-500/5 blur-3xl"
          />
          <div
            className="absolute bottom-0 left-1/4
                          w-100 h-100 rounded-full
                          bg-brand-800/60 blur-3xl"
          />
          {/* Subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `
                linear-gradient(var(--color-brand-500) 1px, transparent 1px),
                linear-gradient(90deg, var(--color-brand-500) 1px, transparent 1px)
              `,
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Eyebrow */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                          bg-accent-500/10 border border-accent-500/20
                          text-accent-400 text-xs font-medium font-sans mb-8
                          animate-fade-in"
          >
            <Layers className="size-3.5" />
            Now with 3D Live Preview
          </div>

          {/* Headline */}
          <h1
            className={cn(
              "font-display font-bold leading-tight",
              "text-4xl sm:text-5xl md:text-6xl lg:text-7xl",
              "text-brand-50 mb-6 animate-fade-in",
            )}
            style={{ animationDelay: "0.1s" }}
          >
            Design Your{" "}
            <span className="relative">
              <span
                className="text-transparent bg-clip-text
                               bg-linear-to-r from-accent-400 to-accent-300"
              >
                Monument
              </span>
              {/* Underline accent */}
              <span
                className="absolute -bottom-2 left-0 right-0 h-px
                               bg-linear-to-r from-accent-500/0 via-accent-500 to-accent-500/0"
              />
            </span>{" "}
            in 3D
          </h1>

          {/* Subheadline */}
          <p
            className={cn(
              "text-lg sm:text-xl text-brand-400 font-sans",
              "max-w-2xl mx-auto leading-relaxed mb-10",
              "animate-fade-in",
            )}
            style={{ animationDelay: "0.2s" }}
          >
            Double Seven brings the lapida and monument design process online.
            Customize, preview, order, and track — all from one platform.
          </p>

          {/* CTA Buttons */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-3
                          animate-fade-in"
            style={{ animationDelay: "0.3s" }}
          >
            <Button
              variant="solid"
              size="lg"
              iconRight={<ArrowRight className="size-4" />}
              onClick={() => navigate("/register")}
              className="shadow-glow"
            >
              Start Designing Free
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/login")}
            >
              Sign In to Your Account
            </Button>
          </div>

          {/* Scroll hint */}
          <div
            className="mt-16 flex flex-col items-center gap-2 text-brand-600
                          animate-fade-in"
            style={{ animationDelay: "0.5s" }}
          >
            <span className="text-xs font-sans">Explore features</span>
            <ChevronDown className="size-4 animate-bounce" />
          </div>
        </div>
      </section>

      {/* ══ STATS BAR ══════════════════════════════════════════════════════ */}
      <section className="border-y border-brand-800 bg-brand-900/50 py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, i) => (
              <div
                key={i}
                className="flex flex-col items-center text-center gap-1"
              >
                <span
                  className="font-display text-3xl md:text-4xl font-bold
                                 text-accent-400"
                >
                  {stat.value}
                </span>
                <span className="text-sm text-brand-400 font-sans">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FEATURES ═══════════════════════════════════════════════════════ */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-16">
            <p
              className="text-xs text-accent-400 font-sans font-semibold
                          uppercase tracking-widest mb-3"
            >
              Everything you need
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-100 mb-4">
              A Complete Monument Platform
            </h2>
            <p className="text-brand-400 font-sans max-w-xl mx-auto">
              From design to delivery, Double Seven handles every step of the
              monument creation process digitally.
            </p>
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className={cn(
                  "flex flex-col gap-4 p-6 rounded-2xl",
                  "border transition-all duration-200",
                  "hover:shadow-panel hover:-translate-y-0.5",
                  f.accent
                    ? "bg-linear-to-br from-accent-500/10 to-brand-900 border-accent-500/20"
                    : "bg-brand-900 border-brand-800 hover:border-brand-700",
                )}
              >
                {/* Icon */}
                <div
                  className={cn(
                    "size-12 rounded-xl flex items-center justify-center",
                    f.accent
                      ? "bg-accent-500/20 text-accent-400 border border-accent-500/30"
                      : "bg-brand-800 text-brand-400 border border-brand-700",
                  )}
                >
                  {f.icon}
                </div>

                {/* Content */}
                <div>
                  <h3 className="font-display text-base font-semibold text-brand-100 mb-2">
                    {f.title}
                  </h3>
                  <p className="text-sm text-brand-400 font-sans leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ═══════════════════════════════════════════════════ */}
      <section className="py-24 px-4 bg-brand-900/40 border-y border-brand-800">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p
              className="text-xs text-accent-400 font-sans font-semibold
                          uppercase tracking-widest mb-3"
            >
              Simple process
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-100">
              From Design to Delivery
            </h2>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* Connector line (desktop) */}
            <div
              className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%]
                            h-px bg-linear-to-r from-brand-800 via-accent-500/40 to-brand-800"
            />

            {[
              {
                step: "01",
                title: "Create Account",
                desc: "Register in seconds — no credit card required.",
              },
              {
                step: "02",
                title: "Design in 3D",
                desc: "Use our live customizer to craft your monument.",
              },
              {
                step: "03",
                title: "Place Order",
                desc: "Submit your design with flexible payment options.",
              },
              {
                step: "04",
                title: "Track & Receive",
                desc: "Monitor progress and receive your finished monument.",
              },
            ].map((s, i) => (
              <div
                key={i}
                className="flex flex-col items-center text-center gap-4 relative"
              >
                {/* Step number */}
                <div
                  className="size-16 rounded-2xl flex items-center justify-center
                                bg-brand-900 border border-brand-700 relative z-10"
                >
                  <span className="font-display text-lg font-bold text-accent-400">
                    {s.step}
                  </span>
                </div>
                <div>
                  <h3 className="font-display text-base font-semibold text-brand-100 mb-1">
                    {s.title}
                  </h3>
                  <p className="text-sm text-brand-400 font-sans leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ═══════════════════════════════════════════════════ */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p
              className="text-xs text-accent-400 font-sans font-semibold
                          uppercase tracking-widest mb-3"
            >
              Trusted by families
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-brand-100">
              What Our Clients Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                className="flex flex-col gap-5 p-6 rounded-2xl
                           bg-brand-900 border border-brand-800
                           hover:border-brand-700 transition-all duration-200"
              >
                {/* Stars */}
                <div className="flex gap-1">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star
                      key={j}
                      className="size-4 fill-accent-400 text-accent-400"
                    />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-sm text-brand-300 font-sans leading-relaxed flex-1">
                  "{t.text}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-2 border-t border-brand-800">
                  <div
                    className="size-9 rounded-full bg-linear-to-br
                                  from-accent-700 to-accent-900
                                  flex items-center justify-center shrink-0"
                  >
                    <span className="text-xs font-display font-bold text-accent-200">
                      {t.name
                        .split(" ")
                        .map((w) => w[0])
                        .slice(0, 2)
                        .join("")}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-brand-100 font-sans">
                      {t.name}
                    </p>
                    <p className="text-xs text-brand-500 font-sans">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FINAL CTA ══════════════════════════════════════════════════════ */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <div
            className="relative rounded-3xl overflow-hidden
                          bg-linear-to-br from-brand-900 via-brand-900 to-accent-950/30
                          border border-accent-500/20 p-10 md:p-16 text-center"
          >
            {/* Glow */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2
                            w-64 h-32 bg-accent-500/10 blur-3xl pointer-events-none"
            />

            <div className="relative">
              <div
                className="size-16 rounded-2xl bg-accent-500/20 border border-accent-500/30
                              flex items-center justify-center mx-auto mb-6"
              >
                <Layers className="size-7 text-accent-400" />
              </div>

              <h2
                className="font-display text-3xl md:text-4xl font-bold
                             text-brand-50 mb-4"
              >
                Ready to Begin?
              </h2>
              <p className="text-brand-400 font-sans mb-8 max-w-md mx-auto leading-relaxed">
                Join hundreds of families who have trusted Double Seven to
                create meaningful, lasting monuments.
              </p>

              <div
                className="flex flex-col sm:flex-row items-center
                              justify-center gap-3"
              >
                <Button
                  variant="solid"
                  size="lg"
                  iconRight={<ArrowRight className="size-4" />}
                  onClick={() => navigate("/register")}
                  className="shadow-glow"
                >
                  Create Free Account
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => navigate("/login")}
                >
                  Sign In
                </Button>
              </div>

              <p className="text-xs text-brand-600 font-sans mt-6">
                No credit card required · Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
