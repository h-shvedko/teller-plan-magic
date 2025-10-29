import { Helmet } from 'react-helmet-async';
import { ContactForm } from '@/components/ContactForm';
import { Header } from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const Contact = () => {
  return (
    <>
      <Helmet>
        <title>Contact Us - TellerPlan</title>
        <meta name="description" content="Get in touch with TellerPlan. We're here to help with your meal planning needs. Contact us for support, questions, or feedback." />
        <link rel="canonical" href="/contact" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Header showGetStarted={false} />
        <main className="container py-12">
          <div className="max-w-6xl mx-auto">
            {/* Page Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Have a question or need help? We're here to assist you with your meal planning journey.
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
              {/* Contact Form */}
              <div className="lg:col-span-2">
                <ContactForm 
                  title="Send us a Message"
                  description="Fill out the form below and we'll get back to you as soon as possible."
                />
              </div>

              {/* Contact Information */}
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Contact Information</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Mail className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium">Email</p>
                          <p className="text-sm text-muted-foreground">support@tellerplan.com</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Phone className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium">Phone</p>
                          <p className="text-sm text-muted-foreground">+49 (0) 123 456 789</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium">Address</p>
                          <p className="text-sm text-muted-foreground">
                            TellerPlan GmbH<br />
                            Musterstraße 123<br />
                            10115 Berlin, Germany
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Clock className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium">Support Hours</p>
                          <p className="text-sm text-muted-foreground">
                            Monday - Friday: 9:00 AM - 6:00 PM CET<br />
                            Weekend: Email support only
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Quick Links</h3>
                    <div className="space-y-2">
                      <Link to="/help" className="block text-sm text-primary hover:underline">
                        Help Center
                      </Link>
                      <Link to="/privacy" className="block text-sm text-primary hover:underline">
                        Privacy Policy
                      </Link>
                      <Link to="/imprint" className="block text-sm text-primary hover:underline">
                        Imprint
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Contact;