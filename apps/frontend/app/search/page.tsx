import GlobalSearch from '@/components/global-search'

/**
 * Home Page Component
 * Renders the main page of the Global Search UI Demo
 */
export default function Home() {
  return (
    <main className="flex h-full w-full flex-col items-center justify-center gap-6 p-8">
      <header className="flex flex-col items-center justify-center gap-2 text-center">
        <h1 className="text-2xl font-bold">調べるぞ🐤</h1>
      </header>

      <section
        className="flex w-full items-start justify-center"
        aria-label="Global Search"
      >
        <div className="flex w-full max-w-[750px] items-start justify-center rounded-md border border-stone-200 bg-gradient-to-r from-stone-100 to-stone-50 p-2">
          <GlobalSearch />
        </div>
      </section>
    </main>
  )
}
