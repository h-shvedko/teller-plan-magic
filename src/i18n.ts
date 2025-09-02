import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

const resources = {
  en: {
    landing: {
      seo: {
        title: "Tellerplan — Smart Meal Planning for Germany",
        description: "Personalized weekly meal plans, smart shopping lists and price comparison for Germany."
      },
      brand: { name: "Tellerplan" },
      nav: {
        how: "How it works",
        demo: "See a demo",
        getStarted: "Get started"
      },
      hero: {
        badge: "Made for Germany",
        h1: "Smart weekly meal plans that fit your life and budget",
        p: "Tell us your tastes and goals, and we’ll craft a delicious plan with a combined shopping list and price comparison across supermarkets.",
        ctaCreate: "Create my plan",
        ctaDemo: "Explore a demo",
        bullets: {
          swap: "Swap any meal",
          list: "Smart shopping list",
          prices: "Price comparison"
        },
        imageAlt: "Tellerplan meal planning app hero image"
      },
      value: {
        title: "Why Tellerplan",
        subtitle: "Meal planning built for busy people in Germany.",
        items: {
          saveMoney: {
            title: "Save money every week",
            desc: "Combined shopping lists and price comparison help you shop smarter."
          },
          planFast: {
            title: "Plan in minutes",
            desc: "Tell us your tastes, we build a plan you can adjust in seconds."
          },
          flexible: {
            title: "Delicious and flexible",
            desc: "Swap any meal and adapt to cooking styles from daily to batch-cooking."
          }
        }
      },
      how: {
        title: "How it works",
        steps: {
          tastes: { title: "Tell us your tastes", desc: "Choose diets, cuisines, goals, and cooking style." },
          plan: { title: "Get your weekly plan", desc: "A balanced plan tailored for your week—swap anything." },
          shop: { title: "Shop smarter", desc: "One combined list with aisle categories and price comparison." }
        }
      },
      features: {
        title: "What you get",
        ai: { title: "AI-powered plans", desc: "Smart recommendations from a rich recipe library." },
        swaps: { title: "One-click swaps", desc: "Instant alternatives that match your tastes and goals." },
        list: { title: "Smart shopping list", desc: "Combined ingredients, categorized by aisle, ready for checkout." },
        prices: { title: "Price comparison", desc: "See where to buy for less at major supermarkets." }
      },
      pricing: {
        title: "Simple, fair pricing",
        subtitle: "Start free. Upgrade anytime.",
        free: {
          title: "Free",
          price: "€0",
          period: "/month",
          cta: "Start free",
          features: [
            "Weekly plan preview",
            "Smart shopping list",
            "20 recipes per month"
          ]
        },
        pro: {
          title: "Pro",
          price: "€7",
          period: "/month",
          cta: "Choose Pro",
          features: [
            "Unlimited AI swaps",
            "Full recipe library",
            "Price comparison"
          ]
        },
        family: {
          title: "Family",
          price: "€12",
          period: "/month",
          cta: "Choose Family",
          features: [
            "Up to 4 members",
            "Shared plans",
            "Shared shopping list"
          ]
        }
      },
      testimonials: {
        title: "Loved by busy cooks",
        sarah: { text: "I stopped overstressing dinner. The weekly plan just works.", footer: "Sarah, Göttingen" },
        lukas: { text: "Swapping meals is so easy—and the shopping list saves me money.", footer: "Lukas, Berlin" },
        anna: { text: "Weekend Pro fits my schedule. Prep Sunday, 10-minute dinners all week.", footer: "Anna, Munich" }
      },
      faq: {
        title: "Frequently asked questions",
        q1: { q: "How does Tellerplan create my weekly meal plan?", a: "We use your tastes, dietary needs, and goals to recommend balanced recipes for the week. You can swap any meal with one click." },
        q2: { q: "Can I save money with Tellerplan?", a: "Yes. We combine ingredients into one smart list and compare prices across supermarkets to help you pick the best deals." },
        q3: { q: "What cooking styles are supported?", a: "Daily Chef for new recipes each day, Clever Cook for leftovers, and Weekend Pro for batch-cooking with quick weekday assembly." },
        q4: { q: "Is Tellerplan available in Germany?", a: "Yes, Tellerplan is built for Germany and supports local supermarket price comparison." }
      },
      lang: { label: "Language" }
    }
  },
  de: {
    landing: {
      seo: {
        title: "Tellerplan — Intelligente Essensplanung für Deutschland",
        description: "Personalisierte Wochenpläne, smarte Einkaufslisten und Preisvergleich – speziell für Deutschland."
      },
      brand: { name: "Tellerplan" },
      nav: {
        how: "So funktioniert's",
        demo: "Demo ansehen",
        getStarted: "Jetzt starten"
      },
      hero: {
        badge: "Gemacht für Deutschland",
        h1: "Intelligente Wochenpläne, die zu Leben und Budget passen",
        p: "Erzähl uns deine Vorlieben und Ziele – wir erstellen einen köstlichen Plan mit kombinierter Einkaufsliste und Preisvergleich über Supermärkte.",
        ctaCreate: "Meinen Plan erstellen",
        ctaDemo: "Demo erkunden",
        bullets: {
          swap: "Jedes Gericht austauschbar",
          list: "Smarte Einkaufsliste",
          prices: "Preisvergleich"
        },
        imageAlt: "Tellerplan App – Hero Bild zur Essensplanung"
      },
      value: {
        title: "Warum Tellerplan",
        subtitle: "Essensplanung für vielbeschäftigte Menschen in Deutschland.",
        items: {
          saveMoney: {
            title: "Wöchentlich Geld sparen",
            desc: "Kombinierte Einkaufslisten und Preisvergleich helfen dir günstiger einzukaufen."
          },
          planFast: {
            title: "In Minuten planen",
            desc: "Sag uns, was du magst – wir bauen einen Plan, den du in Sekunden anpasst."
          },
          flexible: {
            title: "Lecker und flexibel",
            desc: "Tausche jedes Gericht und passe Kochstile von täglich bis Batch-Cooking an."
          }
        }
      },
      how: {
        title: "So funktioniert's",
        steps: {
          tastes: { title: "Erzähl uns deine Vorlieben", desc: "Wähle Ernährungsweisen, Küchen, Ziele und Kochstil." },
          plan: { title: "Dein Wochenplan", desc: "Ein ausgewogener Plan für deine Woche – alles austauschbar." },
          shop: { title: "Clever einkaufen", desc: "Eine kombinierte Liste, nach Gängen sortiert – mit Preisvergleich." }
        }
      },
      features: {
        title: "Das bekommst du",
        ai: { title: "KI-gestützte Pläne", desc: "Kluge Empfehlungen aus einer großen Rezeptbibliothek." },
        swaps: { title: "Ein-Klick-Tausch", desc: "Sofortige Alternativen passend zu deinen Vorlieben und Zielen." },
        list: { title: "Smarte Einkaufsliste", desc: "Kombinierte Zutaten, nach Gängen sortiert – bereit zum Einkaufen." },
        prices: { title: "Preisvergleich", desc: "Sieh, wo du bei großen Supermärkten günstiger kaufst." }
      },
      pricing: {
        title: "Einfach, fair – unsere Preise",
        subtitle: "Starte kostenlos. Upgrade jederzeit.",
        free: {
          title: "Kostenlos",
          price: "0 €",
          period: "/Monat",
          cta: "Kostenlos starten",
          features: [
            "Wochenplan-Vorschau",
            "Smarte Einkaufsliste",
            "20 Rezepte pro Monat"
          ]
        },
        pro: {
          title: "Pro",
          price: "7 €",
          period: "/Monat",
          cta: "Pro wählen",
          features: [
            "Unbegrenzte KI-Tausche",
            "Komplette Rezeptbibliothek",
            "Preisvergleich"
          ]
        },
        family: {
          title: "Familie",
          price: "12 €",
          period: "/Monat",
          cta: "Familie wählen",
          features: [
            "Bis zu 4 Mitglieder",
            "Gemeinsame Pläne",
            "Geteilte Einkaufsliste"
          ]
        }
      },
      testimonials: {
        title: "Geliebt von Vielbeschäftigten",
        sarah: { text: "Ich stresse mich nicht mehr mit dem Abendessen. Der Wochenplan funktioniert einfach.", footer: "Sarah, Göttingen" },
        lukas: { text: "Gerichte tauschen ist super einfach – und die Einkaufsliste spart mir Geld.", footer: "Lukas, Berlin" },
        anna: { text: "Weekend Pro passt zu meinem Alltag. Sonntag vorkochen, unter der Woche 10-Minuten-Gerichte.", footer: "Anna, München" }
      },
      faq: {
        title: "Häufige Fragen",
        q1: { q: "Wie erstellt Tellerplan meinen Wochenplan?", a: "Wir nutzen deine Vorlieben, Ernährungsweisen und Ziele, um ausgewogene Rezepte für die Woche zu empfehlen. Jedes Gericht ist mit einem Klick austauschbar." },
        q2: { q: "Kann ich mit Tellerplan Geld sparen?", a: "Ja. Wir kombinieren Zutaten zu einer smarten Liste und vergleichen Preise verschiedener Supermärkte, damit du die besten Angebote findest." },
        q3: { q: "Welche Kochstile werden unterstützt?", a: "Daily Chef (täglich neu), Clever Cook (Reste smart nutzen) und Weekend Pro (Batch-Cooking mit schnellen Gerichten unter der Woche)." },
        q4: { q: "Ist Tellerplan in Deutschland verfügbar?", a: "Ja, Tellerplan ist für Deutschland gebaut und unterstützt den lokalen Supermarkt-Preisvergleich." }
      },
      lang: { label: "Sprache" }
    }
  }
} as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    supportedLngs: ["en", "de"],
    ns: ["landing"],
    defaultNS: "landing",
    detection: {
      order: ["querystring", "localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
    },
    interpolation: { escapeValue: false },
  });

export default i18n;
