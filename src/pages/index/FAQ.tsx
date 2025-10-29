import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { useTranslation } from "react-i18next";

const FAQ = () => {
  const { t } = useTranslation('landing');
  return (
    <section className="border-t border-border">
      <div className="container py-12 md:py-20">
        <h2 className="text-2xl md:text-3xl font-semibold">{t('faq.title')}</h2>
        <div className="mt-6">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="faq-1">
              <AccordionTrigger>{t('faq.q1.q')}</AccordionTrigger>
              <AccordionContent>
                {t('faq.q1.a')}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq-2">
              <AccordionTrigger>{t('faq.q2.q')}</AccordionTrigger>
              <AccordionContent>
                {t('faq.q2.a')}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq-3">
              <AccordionTrigger>{t('faq.q3.q')}</AccordionTrigger>
              <AccordionContent>
                {t('faq.q3.a')}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq-4">
              <AccordionTrigger>{t('faq.q4.q')}</AccordionTrigger>
              <AccordionContent>
                {t('faq.q4.a')}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        <div className="mt-8">
          <Link to="/onboarding">
            <Button variant="hero" size="lg">
              {t('pricing.free.cta')} <ArrowRight className="ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
