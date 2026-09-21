import { Apple, Dumbbell, Leaf, Lightbulb } from 'lucide-react'

const tips = [
  {
    title: 'Be specific',
    description: 'Include portion sizes for more accurate estimates.',
    icon: Apple,
  },
  {
    title: "Don't forget the details",
    description: 'Sauces, oils, and drinks count too!',
    icon: Dumbbell,
  },
  {
    title: 'Stay consistent',
    description: 'Regular logging helps you hit your goals faster.',
    icon: Leaf,
  },
]

export function MealTips() {
  return (
    <section className="rounded-[24px] border border-[#7482A4]/12 bg-white p-5 shadow-[0_8px_28px_rgba(56,50,63,0.045)] sm:p-6">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-[#C6A45D]" />
        <div>
          <h2 className="text-lg font-extrabold tracking-[-0.02em] text-[#38323F]">
            Meal Tips
          </h2>
          <p className="text-[11px] text-[#8B8690]">Small habits. Big results.</p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {tips.map(({ title, description, icon: Icon }) => (
          <div
            key={title}
            className="flex items-start gap-3 rounded-2xl border border-[#7482A4]/10 bg-[#FCFBFD] p-3"
          >
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-[#7482A4]/10 text-[#7482A4]">
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-[#38323F]">{title}</p>
              <p className="mt-0.5 text-[11px] leading-4 text-[#8B8690]">
                {description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
