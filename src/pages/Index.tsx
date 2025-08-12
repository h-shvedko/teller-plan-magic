import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Shuffle, ShoppingCart } from "lucide-react";
import heroImage from "@/assets/hero-tellerplan.jpg";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Tellerplan: Smart Meal Planning for Germany</title>
        <meta name="description" content="Personalized weekly meal plans, smart shopping lists and price comparison for Germany." />
        <link rel="canonical" href="/" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Tellerplan",
          url: "/",
          logo: "/favicon.ico",
          sameAs: ["https://lovable.dev"],
        })}</script>
      </Helmet>

      <header className="container py-6 flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-2">
          <div className="h-8 w-8 rounded-md" style={{ background: "var(--gradient-primary)" }} />
          <span className="text-lg font-semibold">Tellerplan</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/onboarding" className="text-sm text-foreground/70 hover:text-foreground transition-colors">How it works</Link>
          <Link to="/plan" className="text-sm text-foreground/70 hover:text-foreground transition-colors">See a demo</Link>
          <Link to="/onboarding">
            <Button variant="hero" size="sm">Get started</Button>
          </Link>
        </nav>
      </header>

      <main>
        <section className="container grid md:grid-cols-2 gap-10 items-center py-10 md:py-20">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
              <Sparkles className="h-4 w-4" /> Made for Germany
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Smart weekly meal plans that fit your life and budget
            </h1>
            <p className="text-muted-foreground text-lg">
              Tell us your tastes and goals, and we’ll craft a delicious plan with a combined shopping list and price comparison across supermarkets.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/onboarding">
                <Button variant="hero" size="xl" className="">
                  Create my plan <ArrowRight className="ml-1" />
                </Button>
              </Link>
              <Link to="/plan">
                <Button variant="subtle" size="xl">
                  Explore a demo
                </Button>
              </Link>
            </div>
            <ul className="grid sm:grid-cols-3 gap-2 text-sm text-foreground/80">
              <li className="flex items-center gap-2"><Shuffle className="h-4 w-4" /> Swap any meal</li>
              <li className="flex items-center gap-2"><ShoppingCart className="h-4 w-4" /> Smart shopping list</li>
              <li className="flex items-center gap-2"><Sparkles className="h-4 w-4" /> Price comparison</li>
            </ul>
          </div>
          <div className="relative">
            <img src={heroImage} alt="Tellerplan meal planning app hero image" loading="lazy" className="rounded-lg shadow-lg" />
            <div className="pointer-events-none absolute inset-0 rounded-lg" style={{ background: "radial-gradient(800px circle at 20% 10%, hsl(var(--brand) / 0.12), transparent 40%)" }} />
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
