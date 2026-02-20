'use client';

import Link from 'next/link';

export default function HelpCenterPage() {
  const faqs = [
    {
      q: 'How do I start a project?',
      a: 'Browse our project catalog from the Domains page, pick a project that interests you, and click "Start This Project". It will appear in your Workspace where you can track your progress.',
    },
    {
      q: 'How does progress tracking work?',
      a: 'Once you start a project, you can use the built-in timer, notes, and checklist in your workspace. All progress is saved automatically to your account and synced across devices.',
    },
    {
      q: 'Can I work on multiple projects at the same time?',
      a: 'Yes! You can start as many projects as you like. Use the Workspace Inventory to manage all your active, on-hold, and completed projects.',
    },
    {
      q: 'What are the difficulty levels?',
      a: 'Projects are rated Easy, Medium, or Hard based on the technical skills required and estimated completion time. Start with Easy projects if you\'re new to a domain.',
    },
    {
      q: 'How do I submit my own project?',
      a: 'Go to "My Projects (Uploaded)" from the sidebar or navigation, and use the submission form to share your project with the community.',
    },
    {
      q: 'How do I change my project status?',
      a: 'In the Workspace Inventory, use the status dropdown on any project card to switch between Not Started, In Progress, On Hold, and Completed.',
    },
    {
      q: 'Is my data saved if I log out?',
      a: 'Yes. All your progress, notes, and project data are stored securely in the cloud and will be available when you log back in from any device.',
    },
    {
      q: 'How do I contact support?',
      a: 'Send us an email at support@projecthub.com or use the feedback form in your profile settings. We typically respond within 24 hours.',
    },
  ];

  return (
    <main className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Help Center
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions about using Project Hub. Can&apos;t find what you need?
            Reach out to our support team.
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <Link
            href="/domains"
            className="bg-white rounded-xl border border-border shadow-sm p-6 text-center hover:border-primary/30 transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">Browse Projects</h3>
            <p className="text-sm text-muted-foreground mt-1">Explore our catalog of real-world projects</p>
          </Link>

          <Link
            href="/workspace"
            className="bg-white rounded-xl border border-border shadow-sm p-6 text-center hover:border-primary/30 transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">My Workspace</h3>
            <p className="text-sm text-muted-foreground mt-1">Track and manage your active projects</p>
          </Link>

          <Link
            href="/profile"
            className="bg-white rounded-xl border border-border shadow-sm p-6 text-center hover:border-primary/30 transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">My Profile</h3>
            <p className="text-sm text-muted-foreground mt-1">Manage your account and settings</p>
          </Link>
        </div>

        {/* FAQ */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <details
                key={idx}
                className="bg-white rounded-xl border border-border shadow-sm p-5 group cursor-pointer"
              >
                <summary className="font-bold text-foreground flex items-center justify-between list-none">
                  {faq.q}
                  <svg className="w-5 h-5 text-muted-foreground group-open:rotate-180 transition-transform flex-shrink-0 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="text-muted-foreground mt-3 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-xl border border-border shadow-sm p-8 mt-12 text-center">
          <h3 className="text-xl font-bold text-foreground mb-2">Still need help?</h3>
          <p className="text-muted-foreground mb-4">
            Our support team is here to assist you with any questions or issues.
          </p>
          <a
            href="mailto:support@projecthub.com"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Contact Support
          </a>
        </div>
      </div>
    </main>
  );
}
