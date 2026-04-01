import type { Metadata } from 'next'
import SaaSLayout from '@/components/saas/SaaSLayout'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function SaasLayout({ children }: { children: React.ReactNode }) {
  return <SaaSLayout>{children}</SaaSLayout>
}
