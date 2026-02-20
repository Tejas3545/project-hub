export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto px-6 py-16 max-w-3xl">
        <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-muted-foreground mb-10">Last updated: February 10, 2026</p>

        <div className="space-y-8 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing and using Project Hub, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. Description of Service</h2>
            <p>
              Project Hub is an educational platform designed for students to discover, track, and work on real-world software projects across various domains including Web Development, Artificial Intelligence, Machine Learning, Data Science, and Cybersecurity.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. User Accounts</h2>
            <p>
              To access certain features of the platform, you may be required to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Use the platform for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to any part of the platform</li>
              <li>Interfere with or disrupt the platform or its servers</li>
              <li>Upload or transmit malicious code or content</li>
              <li>Impersonate any person or entity</li>
              <li>Scrape or collect data from the platform without permission</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Intellectual Property</h2>
            <p>
              The platform and its original content, features, and functionality are owned by Project Hub and are protected by international copyright, trademark, and other intellectual property laws. Projects listed on the platform are sourced from publicly available open-source repositories and remain under their respective licenses.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">6. Third-Party Content</h2>
            <p>
              Project Hub curates and displays projects from third-party sources. We do not claim ownership of these projects and are not responsible for their content, accuracy, or availability. Users should review the individual licenses of each project before use.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">7. Disclaimer of Warranties</h2>
            <p>
              The platform is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis without any warranties of any kind, either express or implied. We do not guarantee that the platform will be uninterrupted, secure, or error-free.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">8. Limitation of Liability</h2>
            <p>
              In no event shall Project Hub be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or relating to your use of the platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">9. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. We will notify users of any material changes by updating the &ldquo;Last updated&rdquo; date. Your continued use of the platform after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">10. Contact</h2>
            <p>
              If you have any questions about these Terms of Service, please reach out through the Help Center on our platform.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
