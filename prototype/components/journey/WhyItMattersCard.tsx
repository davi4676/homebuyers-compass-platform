'use client'

type WhyItMattersCardProps = {
  text: string
}

export default function WhyItMattersCard({ text }: WhyItMattersCardProps) {
  return (
    <section className="rounded-2xl border border-teal-200/80 bg-teal-50/55 p-4 shadow-sm sm:p-5">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-800">Here is what this means for you</p>
      <p className="mt-2 text-sm text-slate-700 sm:text-base">{text}</p>
    </section>
  )
}

