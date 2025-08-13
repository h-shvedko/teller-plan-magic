import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Shuffle, ShoppingCart, PiggyBank, Clock, BadgeCheck, Wand2, ListChecks, ChefHat } from "lucide-react";
import heroImage from "@/assets/hero-tellerplan.jpg";
import { Link } from "react-router-dom";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const Index = () => {
  const { t, i18n } = useTranslation('landing');
  return (
    <div className="min-h-screen bg-background">
      <Helmet htmlAttributes={{ lang: i18n.language.split('-')[0] }}>
        <title>{t('seo.title')}</title>
        <meta name="description" content={t('seo.description')} />
        <link rel="canonical" href="/" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: t('brand.name'),
          url: "/",
          logo: "/favicon.ico",
          sameAs: ["https://lovable.dev"],
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            { "@type": "Question", name: t('faq.q1.q'), acceptedAnswer: { "@type": "Answer", text: t('faq.q1.a') } },
            { "@type": "Question", name: t('faq.q2.q'), acceptedAnswer: { "@type": "Answer", text: t('faq.q2.a') } },
            { "@type": "Question", name: t('faq.q3.q'), acceptedAnswer: { "@type": "Answer", text: t('faq.q3.a') } },
            { "@type": "Question", name: t('faq.q4.q'), acceptedAnswer: { "@type": "Answer", text: t('faq.q4.a') } }
          ]
        })}</script>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          name: t('brand.name'),
          description: t('seo.description'),
          offers: [
            {"@type":"Offer","name": t('pricing.free.title'), price: "0", priceCurrency: "EUR", priceValidUntil: "2026-12-31", availability: "https://schema.org/InStock"},
            {"@type":"Offer","name": t('pricing.pro.title'), price: "7", priceCurrency: "EUR", priceValidUntil: "2026-12-31", availability: "https://schema.org/InStock"},
            {"@type":"Offer","name": t('pricing.family.title'), price: "12", priceCurrency: "EUR", priceValidUntil: "2026-12-31", availability: "https://schema.org/InStock"}
          ]
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

        {/* Value Props */}
        <section className="border-t border-border bg-card/30">
          <div className="container py-12 md:py-20">
            <h2 className="text-2xl md:text-3xl font-semibold">Why Tellerplan</h2>
            <p className="text-muted-foreground mt-2">Meal planning built for busy people in Germany.</p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <article className="rounded-lg border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <PiggyBank className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">Save money every week</h3>
                </div>
                <p className="text-muted-foreground mt-3">Combined shopping lists and price comparison help you shop smarter.</p>
              </article>
              <article className="rounded-lg border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">Plan in minutes</h3>
                </div>
                <p className="text-muted-foreground mt-3">Tell us your tastes, we build a plan you can adjust in seconds.</p>
              </article>
              <article className="rounded-lg border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <BadgeCheck className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">Delicious and flexible</h3>
                </div>
                <p className="text-muted-foreground mt-3">Swap any meal and adapt to cooking styles from daily to batch-cooking.</p>
              </article>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section>
          <div className="container py-12 md:py-20">
            <h2 className="text-2xl md:text-3xl font-semibold">How it works</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              <article className="rounded-lg border bg-card p-6">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-md bg-accent/40 flex items-center justify-center">
                    <Wand2 className="h-5 w-5" />
                  </div>
                  <h3 className="font-medium">Tell us your tastes</h3>
                </div>
                <p className="text-muted-foreground mt-3">Choose diets, cuisines, goals, and cooking style.</p>
              </article>
              <article className="rounded-lg border bg-card p-6">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-md bg-accent/40 flex items-center justify-center">
                    <ChefHat className="h-5 w-5" />
                  </div>
                  <h3 className="font-medium">Get your weekly plan</h3>
                </div>
                <p className="text-muted-foreground mt-3">A balanced plan tailored for your week—swap anything.</p>
              </article>
              <article className="rounded-lg border bg-card p-6">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-md bg-accent/40 flex items-center justify-center">
                    <ListChecks className="h-5 w-5" />
                  </div>
                  <h3 className="font-medium">Shop smarter</h3>
                </div>
                <p className="text-muted-foreground mt-3">One combined list with aisle categories and price comparison.</p>
              </article>
            </div>
          </div>
        </section>

        {/* Features grid */}
        <section className="border-t border-border">
          <div className="container py-12 md:py-20">
            <h2 className="text-2xl md:text-3xl font-semibold">What you get</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <article className="rounded-lg border bg-card p-6">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">AI-powered plans</h3>
                </div>
                <p className="text-muted-foreground mt-3">Smart recommendations from a rich recipe library.</p>
              </article>
              <article className="rounded-lg border bg-card p-6">
                <div className="flex items-center gap-3">
                  <Shuffle className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">One-click swaps</h3>
                </div>
                <p className="text-muted-foreground mt-3">Instant alternatives that match your tastes and goals.</p>
              </article>
              <article className="rounded-lg border bg-card p-6">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">Smart shopping list</h3>
                </div>
                <p className="text-muted-foreground mt-3">Combined ingredients, categorized by aisle, ready for checkout.</p>
              </article>
              <article className="rounded-lg border bg-card p-6">
                <div className="flex items-center gap-3">
                  <BadgeCheck className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">Price comparison</h3>
                </div>
                <p className="text-muted-foreground mt-3">See where to buy for less at major supermarkets.</p>
              </article>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="border-t border-border bg-card/30">
          <div className="container py-12 md:py-20">
            <h2 className="text-2xl md:text-3xl font-semibold">Loved by busy cooks</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              <blockquote className="rounded-lg border bg-card p-6 shadow-sm">
                <p className="text-foreground">&ldquo;I stopped overstressing dinner. The weekly plan just works.&rdquo;</p>
                <footer className="text-sm text-muted-foreground mt-4">Sarah, Göttingen</footer>
              </blockquote>
              <blockquote className="rounded-lg border bg-card p-6 shadow-sm">
                <p className="text-foreground">&ldquo;Swapping meals is so easy—and the shopping list saves me money.&rdquo;</p>
                <footer className="text-sm text-muted-foreground mt-4">Lukas, Berlin</footer>
              </blockquote>
              <blockquote className="rounded-lg border bg-card p-6 shadow-sm">
                <p className="text-foreground">&ldquo;Weekend Pro fits my schedule. Prep Sunday, 10-minute dinners all week.&rdquo;</p>
                <footer className="text-sm text-muted-foreground mt-4">Anna, Munich</footer>
              </blockquote>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-border">
          <div className="container py-12 md:py-20">
            <h2 className="text-2xl md:text-3xl font-semibold">Frequently asked questions</h2>
            <div className="mt-6">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="faq-1">
                  <AccordionTrigger>How does Tellerplan create my weekly meal plan?</AccordionTrigger>
                  <AccordionContent>
                    We use your tastes, dietary needs, and goals to recommend balanced recipes for the week. You can swap any meal with one click.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="faq-2">
                  <AccordionTrigger>Can I save money with Tellerplan?</AccordionTrigger>
                  <AccordionContent>
                    Yes. We combine ingredients into one smart list and compare prices across supermarkets to help you pick the best deals.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="faq-3">
                  <AccordionTrigger>What cooking styles are supported?</AccordionTrigger>
                  <AccordionContent>
                    Daily Chef for new recipes each day, Clever Cook for leftovers, and Weekend Pro for batch-cooking with quick weekday assembly.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="faq-4">
                  <AccordionTrigger>Is Tellerplan available in Germany?</AccordionTrigger>
                  <AccordionContent>
                    Yes, Tellerplan is built for Germany and supports local supermarket price comparison.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
            <div className="mt-8">
              <Link to="/onboarding">
                <Button variant="hero" size="lg">
                  Start free <ArrowRight className="ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
