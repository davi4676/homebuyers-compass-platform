import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy and cookie usage for NestQuest Platform.',
}

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-gray-300">
      <h1 className="text-3xl font-bold text-gray-100 mb-6">Privacy Policy</h1>
      <p className="mb-4">
        This is a placeholder. Replace with your actual privacy policy: how you collect, use, and protect user data,
        cookie usage, and any third-party services (e.g. analytics, Stripe).
      </p>
      <p className="mb-4">
        We use cookies to remember your preferences and improve your experience. By using this site you consent to our use of cookies
        as described in this policy.
      </p>
      <Link href="/" className="text-cyan-400 hover:underline">← Back to home</Link>
    </div>
  )
}
