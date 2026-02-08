import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      
      {/* Top Navigation */}
      <header className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="text-xl font-semibold text-gray-900">
          Sentinel
        </div>

        <Link
          href="/login"
          className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2
                     text-sm font-medium text-white hover:bg-blue-700 transition"
        >
          Login
        </Link>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-8 pt-24 pb-20 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
          Integrity-first clinical trials,
          <br />
          <span className="text-blue-600">verified in real time</span>
        </h1>

        <p className="mt-6 text-lg text-gray-600 max-w-3xl mx-auto">
          Sentinel is a regulator-focused platform that ensures clinical trial
          data cannot be silently altered, manipulated, or backdated — using
          cryptographic immutability and continuous analysis.
        </p>

        <div className="mt-10 flex justify-center gap-4">
          <Link
            href="/login"
            className="rounded-md bg-blue-600 px-6 py-3 text-white
                       text-sm font-medium hover:bg-blue-700 transition"
          >
            Get Started
          </Link>

          <a
            href="#how-it-works"
            className="rounded-md border border-gray-300 px-6 py-3
                       text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
          >
            Learn More
          </a>
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="max-w-6xl mx-auto px-8 py-20"
      >
        <h2 className="text-2xl font-semibold text-gray-900 text-center">
          How Sentinel works
        </h2>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-medium text-gray-900">
              Immutable Data Capture
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Every patient visit is cryptographically hashed and locked at
              submission time, making post-entry data manipulation detectable.
            </p>
          </div>

          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-medium text-gray-900">
              Continuous Oversight
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Regulators gain real-time visibility into trial data instead of
              relying solely on delayed, retrospective audits.
            </p>
          </div>

          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-medium text-gray-900">
              Anomaly Detection
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Statistical and behavioral analysis highlights suspicious patterns
              across sites, visits, and patients — without blocking workflows.
            </p>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-gray-500">
        Sentinel • Trial Integrity Intelligence Engine
      </footer>

    </main>
  );
}
