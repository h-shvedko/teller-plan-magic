import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Sparkles, Shuffle, ShoppingCart, PiggyBank, Clock, BadgeCheck, Wand2, ListChecks, ChefHat } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { UserMenu } from "@/components/UserMenu";
import { useAuth } from "@/hooks/useAuth";
import { ContactForm } from "@/components/ContactForm";
import Hero from "./index/Hero";
import Pricing from "./index/Pricing";
import FAQ from "./index/FAQ";

const Index = () => {
  const { t, i18n } = useTranslation('landing');
  const { user } = useAuth();
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
          <span className="text-lg font-semibold">{t('brand.name')}</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/onboarding" className="text-sm text-foreground/70 hover:text-foreground transition-colors">{t('nav.how')}</Link>
          <Link to="/plan" className="text-sm text-foreground/70 hover:text-foreground transition-colors">{t('nav.demo')}</Link>
          {!user && (
            <Link to="/onboarding">
              <Button variant="hero" size="sm">{t('nav.getStarted')}</Button>
            </Link>
          )}
          <LanguageSwitcher />
          <UserMenu />
        </nav>
      </header>

      <main>
        <Hero />

        {/* Value Props */}
        <section className="border-t border-border bg-card/30">
          <div className="container py-12 md:py-20">
            <h2 className="text-2xl md:text-3xl font-semibold">{t('value.title')}</h2>
            <p className="text-muted-foreground mt-2">{t('value.subtitle')}</p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <article className="rounded-lg border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <PiggyBank className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">{t('value.items.saveMoney.title')}</h3>
                </div>
                <p className="text-muted-foreground mt-3">{t('value.items.saveMoney.desc')}</p>
              </article>
              <article className="rounded-lg border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">{t('value.items.planFast.title')}</h3>
                </div>
                <p className="text-muted-foreground mt-3">{t('value.items.planFast.desc')}</p>
              </article>
              <article className="rounded-lg border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <BadgeCheck className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">{t('value.items.flexible.title')}</h3>
                </div>
                <p className="text-muted-foreground mt-3">{t('value.items.flexible.desc')}</p>
              </article>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section>
          <div className="container py-12 md:py-20">
            <h2 className="text-2xl md:text-3xl font-semibold">{t('how.title')}</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              <article className="rounded-lg border bg-card p-6">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-md bg-accent/40 flex items-center justify-center">
                    <Wand2 className="h-5 w-5" />
                  </div>
                  <h3 className="font-medium">{t('how.steps.tastes.title')}</h3>
                </div>
                <p className="text-muted-foreground mt-3">{t('how.steps.tastes.desc')}</p>
              </article>
              <article className="rounded-lg border bg-card p-6">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-md bg-accent/40 flex items-center justify-center">
                    <ChefHat className="h-5 w-5" />
                  </div>
                  <h3 className="font-medium">{t('how.steps.plan.title')}</h3>
                </div>
                <p className="text-muted-foreground mt-3">{t('how.steps.plan.desc')}</p>
              </article>
              <article className="rounded-lg border bg-card p-6">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-md bg-accent/40 flex items-center justify-center">
                    <ListChecks className="h-5 w-5" />
                  </div>
                  <h3 className="font-medium">{t('how.steps.shop.title')}</h3>
                </div>
                <p className="text-muted-foreground mt-3">{t('how.steps.shop.desc')}</p>
              </article>
            </div>
          </div>
        </section>

        {/* Features grid */}
        <section className="border-t border-border">
          <div className="container py-12 md:py-20">
            <h2 className="text-2xl md:text-3xl font-semibold">{t('features.title')}</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <article className="rounded-lg border bg-card p-6">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">{t('features.ai.title')}</h3>
                </div>
                <p className="text-muted-foreground mt-3">{t('features.ai.desc')}</p>
              </article>
              <article className="rounded-lg border bg-card p-6">
                <div className="flex items-center gap-3">
                  <Shuffle className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">{t('features.swaps.title')}</h3>
                </div>
                <p className="text-muted-foreground mt-3">{t('features.swaps.desc')}</p>
              </article>
              <article className="rounded-lg border bg-card p-6">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">{t('features.list.title')}</h3>
                </div>
                <p className="text-muted-foreground mt-3">{t('features.list.desc')}</p>
              </article>
              <article className="rounded-lg border bg-card p-6">
                <div className="flex items-center gap-3">
                  <BadgeCheck className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">{t('features.prices.title')}</h3>
                </div>
                <p className="text-muted-foreground mt-3">{t('features.prices.desc')}</p>
              </article>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <Pricing />

        {/* Testimonials */}
        <section className="border-t border-border bg-card/30">
          <div className="container py-12 md:py-20">
            <h2 className="text-2xl md:text-3xl font-semibold">{t('testimonials.title')}</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              <blockquote className="rounded-lg border bg-card p-6 shadow-sm">
                <p className="text-foreground">&ldquo;{t('testimonials.sarah.text')}&rdquo;</p>
                <footer className="text-sm text-muted-foreground mt-4">{t('testimonials.sarah.footer')}</footer>
              </blockquote>
              <blockquote className="rounded-lg border bg-card p-6 shadow-sm">
                <p className="text-foreground">&ldquo;{t('testimonials.lukas.text')}&rdquo;</p>
                <footer className="text-sm text-muted-foreground mt-4">{t('testimonials.lukas.footer')}</footer>
              </blockquote>
              <blockquote className="rounded-lg border bg-card p-6 shadow-sm">
                <p className="text-foreground">&ldquo;{t('testimonials.anna.text')}&rdquo;</p>
                <footer className="text-sm text-muted-foreground mt-4">{t('testimonials.anna.footer')}</footer>
              </blockquote>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <FAQ />

        {/* Contact Us */}
        <section className="border-t border-border">
          <div className="container py-12 md:py-20">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-2xl md:text-3xl font-semibold">Get in Touch</h2>
                <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                  Have questions about TellerPlan? Need help getting started? We're here to help you on your meal planning journey.
                </p>
              </div>
              <ContactForm compact />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30">
        <div className="container py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <Link to="/" className="inline-flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-md" style={{ background: "var(--gradient-primary)" }} />
                <span className="text-lg font-semibold">{t('brand.name')}</span>
              </Link>
              <p className="text-muted-foreground mb-4">
                Simplify your meal planning with AI-powered recommendations, 
                smart shopping lists, and personalized nutrition tracking.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <div className="space-y-2">
                <Link to="/onboarding" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Getting Started
                </Link>
                <Link to="/plan" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Demo
                </Link>
                <Link to="/contact" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Support
                </Link>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <div className="space-y-2">
                <Link to="/privacy" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
                <Link to="/imprint" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Imprint
                </Link>
                <Link to="/contact" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
              </div>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} TellerPlan. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
