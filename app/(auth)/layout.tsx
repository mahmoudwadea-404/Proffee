import Link from "next/link"

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-background">
      <Link
        href="/"
        className="mb-10 text-3xl font-serif font-bold text-primary tracking-wider hover:text-primary-light transition-colors duration-300"
      >
        Proffee
      </Link>

      <div className="w-full max-w-md">
        {children}
      </div>

      <p className="mt-8 text-sm text-text-muted">
        <Link
          href="/"
          className="text-text-secondary hover:text-primary transition-colors duration-300"
        >
          ← Back to Home
        </Link>
      </p>
    </div>
  )
}
