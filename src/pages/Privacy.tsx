import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const Privacy = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy - TellerPlan</title>
        <meta name="description" content="Privacy policy for TellerPlan. Learn how we collect, use, and protect your personal data in accordance with GDPR." />
        <link rel="canonical" href="/privacy" />
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
            <h1>Privacy Policy</h1>
            <p className="lead">
              This privacy policy explains how TellerPlan collects, uses, and protects your personal information 
              in accordance with the General Data Protection Regulation (GDPR).
            </p>

            <section>
              <h2>1. Data Controller</h2>
              <p>
                <strong>TellerPlan GmbH</strong><br />
                Musterstraße 123<br />
                10115 Berlin<br />
                Germany<br />
                Email: privacy@tellerplan.com<br />
                Phone: +49 (0) 123 456 789
              </p>
            </section>

            <section>
              <h2>2. Data We Collect</h2>
              
              <h3>2.1 Account Information</h3>
              <p>When you create an account, we collect:</p>
              <ul>
                <li>Email address</li>
                <li>First and last name (optional)</li>
                <li>Password (encrypted)</li>
                <li>Account creation date</li>
              </ul>

              <h3>2.2 Profile Information</h3>
              <p>To personalize your meal planning experience, you may provide:</p>
              <ul>
                <li>Dietary preferences and restrictions</li>
                <li>Health goals</li>
                <li>Cuisine preferences</li>
                <li>Household size</li>
              </ul>

              <h3>2.3 Usage Data</h3>
              <p>We automatically collect:</p>
              <ul>
                <li>IP address</li>
                <li>Browser type and version</li>
                <li>Operating system</li>
                <li>Pages visited and time spent</li>
                <li>Actions taken within the application</li>
              </ul>

              <h3>2.4 Meal Planning Data</h3>
              <p>When you use our service, we store:</p>
              <ul>
                <li>Your meal plans and recipes</li>
                <li>Shopping lists</li>
                <li>Meal swaps and preferences</li>
                <li>Nutrition tracking data</li>
              </ul>
            </section>

            <section>
              <h2>3. How We Use Your Data</h2>
              <p>We use your personal data to:</p>
              <ul>
                <li>Provide and maintain our meal planning service</li>
                <li>Create personalized meal recommendations</li>
                <li>Generate shopping lists based on your meal plans</li>
                <li>Improve our service and user experience</li>
                <li>Send important service updates and notifications</li>
                <li>Provide customer support</li>
                <li>Ensure platform security and prevent fraud</li>
              </ul>
            </section>

            <section>
              <h2>4. Legal Basis for Processing</h2>
              <p>We process your data based on:</p>
              <ul>
                <li><strong>Contract performance:</strong> To provide our meal planning services</li>
                <li><strong>Legitimate interest:</strong> To improve our service and ensure security</li>
                <li><strong>Consent:</strong> For marketing communications (where applicable)</li>
                <li><strong>Legal obligation:</strong> To comply with applicable laws</li>
              </ul>
            </section>

            <section>
              <h2>5. Data Sharing</h2>
              <p>We do not sell your personal data. We may share data with:</p>
              <ul>
                <li><strong>Service providers:</strong> Cloud hosting, analytics, and customer support tools</li>
                <li><strong>Legal authorities:</strong> When required by law or to protect our rights</li>
                <li><strong>Business transfers:</strong> In case of merger, acquisition, or asset sale</li>
              </ul>
            </section>

            <section>
              <h2>6. Data Security</h2>
              <p>We implement appropriate security measures including:</p>
              <ul>
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security assessments</li>
                <li>Access controls and authentication</li>
                <li>Employee training on data protection</li>
              </ul>
            </section>

            <section>
              <h2>7. Data Retention</h2>
              <p>We retain your data:</p>
              <ul>
                <li><strong>Account data:</strong> Until you delete your account</li>
                <li><strong>Usage data:</strong> For up to 2 years for analytics purposes</li>
                <li><strong>Legal compliance:</strong> As required by applicable laws</li>
              </ul>
            </section>

            <section>
              <h2>8. Your Rights</h2>
              <p>Under GDPR, you have the right to:</p>
              <ul>
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Rectification:</strong> Correct inaccurate or incomplete data</li>
                <li><strong>Erasure:</strong> Request deletion of your data ("right to be forgotten")</li>
                <li><strong>Portability:</strong> Receive your data in a machine-readable format</li>
                <li><strong>Restriction:</strong> Limit how we process your data</li>
                <li><strong>Objection:</strong> Object to processing based on legitimate interests</li>
                <li><strong>Withdraw consent:</strong> Where processing is based on consent</li>
              </ul>
              <p>To exercise these rights, contact us at privacy@tellerplan.com</p>
            </section>

            <section>
              <h2>9. Cookies and Tracking</h2>
              <p>We use cookies and similar technologies for:</p>
              <ul>
                <li>Essential functionality (authentication, preferences)</li>
                <li>Performance monitoring and analytics</li>
                <li>User experience improvements</li>
              </ul>
              <p>You can manage cookie preferences through your browser settings.</p>
            </section>

            <section>
              <h2>10. Third-Party Services</h2>
              <p>Our service may integrate with:</p>
              <ul>
                <li>Analytics providers (anonymized data)</li>
                <li>Payment processors (for premium features)</li>
                <li>Recipe and nutrition databases</li>
              </ul>
              <p>These services have their own privacy policies.</p>
            </section>

            <section>
              <h2>11. International Transfers</h2>
              <p>
                Your data may be processed in countries outside the EU. We ensure adequate protection 
                through standard contractual clauses or adequacy decisions.
              </p>
            </section>

            <section>
              <h2>12. Children's Privacy</h2>
              <p>
                Our service is not intended for children under 16. We do not knowingly collect 
                personal data from children under 16.
              </p>
            </section>

            <section>
              <h2>13. Changes to This Policy</h2>
              <p>
                We may update this privacy policy from time to time. We will notify you of 
                significant changes via email or through our service.
              </p>
            </section>

            <section>
              <h2>14. Contact Us</h2>
              <p>
                For privacy-related questions or to exercise your rights, contact us at:<br />
                <strong>Email:</strong> privacy@tellerplan.com<br />
                <strong>Address:</strong> TellerPlan GmbH, Musterstraße 123, 10115 Berlin, Germany
              </p>
              <p>
                You also have the right to lodge a complaint with a supervisory authority.
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

export default Privacy;