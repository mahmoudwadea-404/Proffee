import Link from "next/link"
import { Mail, Phone, MapPin } from "lucide-react"
import { NewsletterForm } from "./FooterNewsletter"

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

export default function Footer() {
  return (
    <footer className="w-full bg-surface border-t border-border py-16 px-6 md:px-12 mt-auto text-text-secondary">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
        <div className="space-y-6">
          <h3 className="text-lg font-serif font-semibold text-text-primary">Stay in the Loop</h3>
          <p className="text-sm leading-relaxed">
            Subscribe to receive exclusive offers and latest updates.
          </p>
          <NewsletterForm />
          <div className="flex items-center gap-4 pt-2">
            <a href="https://www.facebook.com/share/1TWSGoBDpk/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors duration-300" aria-label="Facebook">
              <FacebookIcon className="w-5 h-5" />
            </a>
            <a href="https://www.instagram.com/_proffee_?igsh=MXJqb3ZpZG90dTJrOA==" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors duration-300" aria-label="Instagram">
              <InstagramIcon className="w-5 h-5" />
            </a>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-serif font-semibold text-text-primary">Quick Links</h3>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/" className="hover:text-primary transition-colors duration-300">Home</Link></li>
            <li><Link href="/products" className="hover:text-primary transition-colors duration-300">Menu</Link></li>
            <li><Link href="/about" className="hover:text-primary transition-colors duration-300">About Us</Link></li>
            <li><Link href="/about" className="hover:text-primary transition-colors duration-300">Our Story</Link></li>
            <li><Link href="/contact" className="hover:text-primary transition-colors duration-300">Contact</Link></li>
          </ul>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-serif font-semibold text-text-primary">Customer Care</h3>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/faqs" className="hover:text-primary transition-colors duration-300">FAQs</Link></li>
            <li><Link href="/shipping" className="hover:text-primary transition-colors duration-300">Shipping &amp; Delivery</Link></li>
            <li><Link href="/returns" className="hover:text-primary transition-colors duration-300">Returns &amp; Refunds</Link></li>
            <li><Link href="/terms" className="hover:text-primary transition-colors duration-300">Terms &amp; Conditions</Link></li>
            <li><Link href="/privacy" className="hover:text-primary transition-colors duration-300">Privacy Policy</Link></li>
          </ul>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-serif font-semibold text-text-primary">Contact Us</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-primary shrink-0" />
              <span>01016165218</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-primary shrink-0" />
              <span>proffee3@gmail.com</span>
            </li>
            <li className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              <span>Al-Husseiniya, Alsharqia, Egypt</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-6xl mx-auto border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-text-muted gap-4">
        <div>
          <span>&copy; 2026 Proffee. All rights reserved.</span>
        </div>
        <div className="flex gap-4">
          <Link href="/privacy" className="hover:text-text-secondary transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-text-secondary transition-colors">Terms &amp; Conditions</Link>
        </div>
      </div>
    </footer>
  )
}
