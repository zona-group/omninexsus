import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold gradient-text mb-8">Privacy Policy</h1>
        
        <div className="prose prose-invert max-w-none">
          <p className="text-muted-foreground text-lg mb-8">
            Last updated: April 11, 2025
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-muted-foreground mb-4">
              OmniNexus (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
              when you use our website and services.
            </p>
            <p className="text-muted-foreground">
              By accessing or using OmniNexus, you agree to the collection and use of information 
              in accordance with this policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
            <h3 className="text-xl font-medium mb-3">2.1 Personal Information</h3>
            <p className="text-muted-foreground mb-4">
              We may collect personal information that you voluntarily provide to us when you:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-2">
              <li>Register for an account</li>
              <li>Sign in using Google or other third-party services</li>
              <li>Contact us through our contact form</li>
              <li>Subscribe to newsletters or notifications</li>
              <li>Participate in discussions or comments</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              This information may include:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-2">
              <li>Name and email address</li>
              <li>Profile information (avatar, preferences)</li>
              <li>Saved articles and reading history</li>
              <li>Comments and interactions</li>
            </ul>

            <h3 className="text-xl font-medium mb-3">2.2 Usage Information</h3>
            <p className="text-muted-foreground mb-4">
              We automatically collect certain information about your device and how you interact with our services:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>IP address and browser type</li>
              <li>Device information (operating system, screen resolution)</li>
              <li>Pages visited and time spent</li>
              <li>Search queries and article interactions</li>
              <li>Referral sources</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
            <p className="text-muted-foreground mb-4">
              We use the collected information for various purposes:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Provide and maintain our services</strong> - To operate and improve OmniNexus</li>
              <li><strong>Personalization</strong> - To customize your news feed and recommendations</li>
              <li><strong>Communication</strong> - To send you updates, newsletters, and respond to inquiries</li>
              <li><strong>Analytics</strong> - To understand usage patterns and improve user experience</li>
              <li><strong>Security</strong> - To detect and prevent fraud and abuse</li>
              <li><strong>Legal compliance</strong> - To comply with applicable laws and regulations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Information Sharing</h2>
            <p className="text-muted-foreground mb-4">
              We do not sell or rent your personal information to third parties. We may share information in the following circumstances:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Service Providers</strong> - With trusted third parties who assist us in operating our services</li>
              <li><strong>Legal Requirements</strong> - When required by law or to protect our rights</li>
              <li><strong>Business Transfers</strong> - In connection with a merger, acquisition, or sale of assets</li>
              <li><strong>With Your Consent</strong> - When you explicitly authorize us to share information</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
            <p className="text-muted-foreground mb-4">
              We implement appropriate technical and organizational measures to protect your personal information:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security assessments and updates</li>
              <li>Access controls and authentication</li>
              <li>Secure data storage practices</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              However, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
            <p className="text-muted-foreground mb-4">
              Depending on your location, you may have the following rights regarding your personal data:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong>Access</strong> - Request a copy of your personal information</li>
              <li><strong>Correction</strong> - Request correction of inaccurate information</li>
              <li><strong>Deletion</strong> - Request deletion of your personal information</li>
              <li><strong>Portability</strong> - Request transfer of your data to another service</li>
              <li><strong>Objection</strong> - Object to certain processing of your data</li>
              <li><strong>Withdraw Consent</strong> - Withdraw consent where processing is based on consent</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              To exercise these rights, please contact us at privacy@omninexsus.com
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Cookies and Tracking</h2>
            <p className="text-muted-foreground mb-4">
              We use cookies and similar tracking technologies to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Maintain your session and preferences</li>
              <li>Remember your language and display settings</li>
              <li>Analyze site traffic and usage patterns</li>
              <li>Improve our services and user experience</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              You can control cookies through your browser settings. Disabling cookies may affect some features of our service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Third-Party Services</h2>
            <p className="text-muted-foreground mb-4">
              Our service may contain links to third-party websites and services. We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies.
            </p>
            <p className="text-muted-foreground">
              We use the following third-party services:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Google Analytics for usage analytics</li>
              <li>Google OAuth for authentication</li>
              <li>News API providers for content</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Children&apos;s Privacy</h2>
            <p className="text-muted-foreground">
              Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Changes to This Policy</h2>
            <p className="text-muted-foreground">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the &quot;Last updated&quot; date. You are advised to review this policy periodically for any changes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Contact Us</h2>
            <p className="text-muted-foreground mb-4">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Email: privacy@omninexsus.com</li>
              <li>Website: www.omninexsus.com</li>
              <li>Response time: Within 48 hours</li>
            </ul>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
