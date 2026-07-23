import type { Metadata } from "next"
import { Shield, Database, Cookie, Mail, Lock, Trash2, UserCheck } from "lucide-react"

export const metadata: Metadata = {
  title: "Privacy Policy | Proffee",
  description: "Learn how Proffee collects, uses, and protects your personal data when you use our website and services.",
}

const sections = [
  {
    icon: Shield,
    title: "1. Information We Collect",
    content:
      "When you use our website, we may collect the following information: your name, email address, phone number, shipping address, and payment details (processed through our secure payment gateway — we do not store card numbers). We also collect browsing data such as pages viewed and products added to cart to improve your experience.",
    details: [
      "Account registration data (name, email, password hash)",
      "Order details (products, quantities, shipping address)",
      "Payment confirmation tokens (no raw card data stored)",
      "Browsing behaviour via analytics cookies",
    ],
  },
  {
    icon: Database,
    title: "2. How We Use Your Data",
    content:
      "We use your data to process and fulfil orders, communicate with you about your purchases, improve our website and products, and send marketing communications if you have opted in. We do not sell your personal data to third parties.",
  },
  {
    icon: Cookie,
    title: "3. Cookies & Tracking",
    content:
      "We use essential cookies to operate our website (including session management via Supabase Auth) and analytics cookies to understand how visitors interact with the site. You can control cookie preferences through your browser settings. Disabling essential cookies may affect website functionality.",
  },
  {
    icon: Lock,
    title: "4. Data Storage & Security",
    content:
      "Your data is stored securely on Supabase (PostgreSQL) and hosted within secure data centres. We encrypt data in transit using TLS and follow industry best practices for access control. Our authentication is powered by Supabase Auth with password hashing and session management.",
  },
  {
    icon: UserCheck,
    title: "5. Your Rights",
    content:
      "You have the right to access, correct, or delete your personal data at any time. You can update your account details in your account settings or contact us to request data deletion. You may also withdraw consent for marketing communications at any time.",
  },
  {
    icon: Mail,
    title: "6. Contact Us",
    content:
      "If you have any questions about this privacy policy or wish to exercise your data rights, please contact us at proffee3@gmail.com. We will respond to your request within 30 days.",
  },
  {
    icon: Trash2,
    title: "7. Data Retention",
    content:
      "We retain your personal data for as long as your account is active or as needed to provide our services. Order records are retained for legal and accounting purposes even after account deletion, though personal identifiers are anonymised. Marketing data is retained until you opt out.",
  },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="max-w-4xl mx-auto px-6 py-20 relative z-10">
          <p className="text-3xl md:text-4xl text-primary font-script mb-2">Your Data Matters</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-text-primary mb-4">Privacy Policy</h1>
          <p className="text-lg text-text-secondary max-w-xl">
            We are committed to protecting your personal data and being transparent about how we use it.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <p className="text-sm text-text-muted mb-10">Last updated: July 2026</p>

        <div className="space-y-8">
          {sections.map((section) => (
            <div key={section.title} className="rounded-2xl border border-border bg-surface p-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <section.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-serif text-text-primary mb-3">{section.title}</h2>
                  <p className="text-sm text-text-secondary leading-relaxed mb-4">{section.content}</p>
                  {"details" in section && section.details && (
                    <ul className="space-y-1.5">
                      {section.details.map((detail, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-text-secondary">
                          <span className="text-primary mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 p-6 rounded-2xl border border-amber-200 bg-amber-50">
          <p className="text-sm text-amber-800 leading-relaxed">
            <strong>Disclaimer:</strong> This privacy policy is a general template and may not address all requirements under applicable data protection laws (e.g., GDPR, Law 151/2020). We recommend consulting a legal professional to ensure full compliance.
          </p>
        </div>
      </div>
    </div>
  )
}
