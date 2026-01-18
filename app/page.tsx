import { Timeline } from "@/components/timeline"

export default function Page() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-black px-4">
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl">
        <h1 className="mb-16 text-center text-3xl font-bold tracking-tight text-white md:text-4xl">Our Journey</h1>
        <Timeline />
      </div>
    </main>
  )
}
