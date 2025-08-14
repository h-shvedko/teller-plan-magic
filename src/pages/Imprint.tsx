import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const Imprint = () => {
  return (
    <>
      <Helmet>
        <title>Imprint - TellerPlan</title>
        <meta name="description" content="Legal information and imprint for TellerPlan. Company details, contact information, and legal notices." />
        <link rel="canonical" href="/imprint" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border">
          <div className="container py-4">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
              ← Back to Home
            </Link>
          </div>
        </header>

        <main className="container py-12">
          <div className="max-w-4xl mx-auto prose prose-neutral dark:prose-invert">
            <h1>Imprint</h1>
            <p className="lead">Legal information according to § 5 TMG (German Telemedia Act)</p>

            <section>
              <h2>Company Information</h2>
              <p>
                <strong>TellerPlan GmbH</strong><br />
                Musterstraße 123<br />
                10115 Berlin<br />
                Germany
              </p>
            </section>

            <section>
              <h2>Contact</h2>
              <p>
                <strong>Phone:</strong> +49 (0) 123 456 789<br />
                <strong>Email:</strong> info@tellerplan.com<br />
                <strong>Website:</strong> https://tellerplan.com
              </p>
            </section>

            <section>
              <h2>Legal Representatives</h2>
              <p>
                <strong>Managing Director:</strong> Max Mustermann<br />
                <strong>Commercial Register:</strong> HRB 123456 B<br />
                <strong>Registration Court:</strong> Amtsgericht Charlottenburg<br />
                <strong>VAT ID:</strong> DE123456789
              </p>
            </section>

            <section>
              <h2>Responsible for Content</h2>
              <p>
                According to § 55 Abs. 2 RStV (German Interstate Broadcasting Agreement):<br />
                Max Mustermann<br />
                Musterstraße 123<br />
                10115 Berlin<br />
                Germany
              </p>
            </section>

            <section>
              <h2>Dispute Resolution</h2>
              <p>
                The European Commission provides a platform for online dispute resolution (ODR): 
                <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  https://ec.europa.eu/consumers/odr/
                </a>
              </p>
              <p>
                Our email address can be found above in the imprint. We are not willing or obliged to participate in dispute resolution proceedings before a consumer arbitration board.
              </p>
            </section>

            <section>
              <h2>Liability for Contents</h2>
              <p>
                As service providers, we are liable for own contents of these websites according to Sec. 7, Para. 1 German Telemedia Act (TMG). However, according to Sec. 8 to 10 German Telemedia Act (TMG), service providers are not under obligation to permanently monitor submitted or stored information or to search for evidences that indicate illegal activities.
              </p>
              <p>
                Legal obligations to removing information or to blocking the use of information remain unchallenged. In this case, liability is only possible at the time of knowledge about a specific violation of law. Illegal contents will be removed immediately at the time we get knowledge of them.
              </p>
            </section>

            <section>
              <h2>Liability for Links</h2>
              <p>
                Our offer includes links to external third party websites. We have no influence on the contents of those websites, therefore we cannot guarantee for those contents. Providers or administrators of linked websites are always responsible for the contents of the linked websites.
              </p>
              <p>
                The linked websites had been checked for possible violations of law at the time of the establishment of the link. Illegal contents were not detected at the time of the linking. A permanent monitoring of the contents of linked websites cannot be imposed without reasonable indications that there has been a violation of law.
              </p>
            </section>

            <section>
              <h2>Copyright</h2>
              <p>
                Contents and compilations published on these websites by the providers are subject to German copyright laws. Reproduction, editing, distribution as well as the use of any kind outside the scope of the copyright law require a written permission of the author or originator.
              </p>
              <p>
                Downloads and copies of these websites are permitted for private use only. The commercial use of our contents without permission of the originator is prohibited.
              </p>
            </section>

            <div className="mt-12 pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Last updated: {new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Imprint;