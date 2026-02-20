export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto px-6 py-16 max-w-3xl">
        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-10">Last updated: February 10, 2026</p>

        <div className="space-y-8 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. Information We Collect</h2>
            <p>We collect the following types of information when you use Project Hub:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong className="text-foreground">Account Information:</strong> Name, email address, and profile details when you create an account or sign in via Google OAuth.</li>
              <li><strong className="text-foreground">Usage Data:</strong> Pages visited, projects viewed, time spent on projects, and workspace activity.</li>
              <li><strong className="text-foreground">Device Information:</strong> Browser type, operating system, and IP address for analytics and security purposes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Provide, maintain, and improve the platform</li>
              <li>Track your project progress and workspace activity</li>
              <li>Personalize your experience and recommend relevant projects</li>
              <li>Send notifications about your projects and achievements</li>
              <li>Ensure the security and integrity of the platform</li>
              <li>Analyze usage patterns to improve our services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. Data Storage</h2>
            <p>
              Your data is stored securely using industry-standard practices. We use encrypted connections (HTTPS) for all data transmission. Account data and project progress are stored in our database. Some workspace data such as timer state and notes may be stored locally in your browser.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Data Sharing</h2>
            <p>
              We do not sell, trade, or rent your personal information to third parties. We may share anonymized, aggregate data for analytical purposes. We may disclose information when required by law or to protect our rights and safety.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Third-Party Services</h2>
            <p>
              Our platform integrates with third-party services including Google OAuth for authentication. These services have their own privacy policies, and we encourage you to review them. We are not responsible for the privacy practices of third-party services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">6. Cookies and Local Storage</h2>
            <p>
              We use cookies for authentication and session management. We also use browser local storage to save your workspace progress, timer data, and preferences. You can clear this data through your browser settings at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your account and associated data</li>
              <li>Opt out of non-essential communications</li>
              <li>Export your data in a portable format</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">8. Data Retention</h2>
            <p>
              We retain your personal data for as long as your account is active or as needed to provide services. If you delete your account, we will remove your personal data within 30 days, except where we are required to retain it by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">9. Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by updating the &ldquo;Last updated&rdquo; date. We encourage you to review this policy periodically.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">11. Contact</h2>
            <p>
              If you have any questions about this Privacy Policy or our data practices, please reach out through the Help Center on our platform.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
