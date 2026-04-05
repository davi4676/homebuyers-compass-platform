import { CheckCircle2 } from 'lucide-react'

export type RevenueConfirmationProps = {
  partnerName: string
  message: string
  nextSteps?: string[]
  onDone: () => void
}

export default function RevenueConfirmation({
  partnerName,
  message,
  nextSteps,
  onDone,
}: RevenueConfirmationProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <CheckCircle2
        className="h-[48px] w-[48px] shrink-0 text-emerald-500"
        strokeWidth={1.75}
        aria-hidden
      />
      <h3 className="mt-4 text-xl font-semibold text-gray-900">Request Sent!</h3>
      <p className="mt-1 text-sm font-medium text-gray-800">{partnerName}</p>
      <p className="mt-2 text-gray-600">{message}</p>

      {nextSteps && nextSteps.length > 0 ? (
        <ol className="mt-6 w-full list-decimal space-y-2 pl-5 text-left text-sm text-gray-500">
          {nextSteps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      ) : null}

      <button
        type="button"
        onClick={onDone}
        className="mt-8 w-full rounded-lg border-2 border-teal-600 bg-transparent py-2.5 text-sm font-medium text-teal-700 transition-colors hover:bg-teal-50"
      >
        Done
      </button>
    </div>
  )
}
