// import Link from 'next/link';

// export default function Home() {
//   return (
//     <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      
//       {/* Top Navigation */}
//       <header className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
//         <div className="text-xl font-semibold text-gray-900">
//           Sentinel
//         </div>

//         <Link
//           href="/login"
//           className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2
//                      text-sm font-medium text-white hover:bg-blue-700 transition"
//         >
//           Login
//         </Link>
//       </header>

//       {/* Hero Section */}
//       <section className="max-w-5xl mx-auto px-8 pt-24 pb-20 text-center">
//         <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
//           Integrity-first clinical trials,
//           <br />
//           <span className="text-blue-600">verified in real time</span>
//         </h1>

//         <p className="mt-6 text-lg text-gray-600 max-w-3xl mx-auto">
//           Sentinel is a regulator-focused platform that ensures clinical trial
//           data cannot be silently altered, manipulated, or backdated — using
//           cryptographic immutability and continuous analysis.
//         </p>

//         <div className="mt-10 flex justify-center gap-4">
//           <Link
//             href="/login"
//             className="rounded-md bg-blue-600 px-6 py-3 text-white
//                        text-sm font-medium hover:bg-blue-700 transition"
//           >
//             Get Started
//           </Link>

//           <a
//             href="#how-it-works"
//             className="rounded-md border border-gray-300 px-6 py-3
//                        text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
//           >
//             Learn More
//           </a>
//         </div>
//       </section>

//       {/* How It Works */}
//       <section
//         id="how-it-works"
//         className="max-w-6xl mx-auto px-8 py-20"
//       >
//         <h2 className="text-2xl font-semibold text-gray-900 text-center">
//           How Sentinel works
//         </h2>

//         <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          
//           <div className="bg-white border rounded-xl p-6 shadow-sm">
//             <h3 className="text-lg font-medium text-gray-900">
//               Immutable Data Capture
//             </h3>
//             <p className="mt-2 text-sm text-gray-600">
//               Every patient visit is cryptographically hashed and locked at
//               submission time, making post-entry data manipulation detectable.
//             </p>
//           </div>

//           <div className="bg-white border rounded-xl p-6 shadow-sm">
//             <h3 className="text-lg font-medium text-gray-900">
//               Continuous Oversight
//             </h3>
//             <p className="mt-2 text-sm text-gray-600">
//               Regulators gain real-time visibility into trial data instead of
//               relying solely on delayed, retrospective audits.
//             </p>
//           </div>

//           <div className="bg-white border rounded-xl p-6 shadow-sm">
//             <h3 className="text-lg font-medium text-gray-900">
//               Anomaly Detection
//             </h3>
//             <p className="mt-2 text-sm text-gray-600">
//               Statistical and behavioral analysis highlights suspicious patterns
//               across sites, visits, and patients — without blocking workflows.
//             </p>
//           </div>

//         </div>
//       </section>

//       {/* Footer */}
//       <footer className="border-t py-8 text-center text-sm text-gray-500">
//         Sentinel • Trial Integrity Intelligence Engine
//       </footer>

//     </main>
//   );
// }


import Link from 'next/link';
import { 
  ShieldCheck, 
  Activity, 
  LockKeyhole, 
  ArrowRight, 
  Link as LinkIcon, 
  Database 
} from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* Fixed Glassmorphic Navigation */}
      <nav className="fixed w-full z-50 top-0 transition-all backdrop-blur-md bg-white/70 border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-inner">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Sentinel
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 transition-all"
              >
                System Login
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Subtle Background Glow */}
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-blue-100 to-indigo-50 opacity-50 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold uppercase tracking-wide mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Cryptographic Oversight Active
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
            Integrity-first clinical trials, <br className="hidden md:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              verified in real time
            </span>
          </h1>

          <p className="mt-8 text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Sentinel is a regulator-focused platform ensuring clinical trial data cannot be silently altered, manipulated, or backdated—powered by cryptographic immutability and continuous AI analysis.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/login"
              className="rounded-full bg-blue-600 px-8 py-4 text-base font-medium text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:shadow-blue-600/30 transition-all active:scale-95"
            >
              Access Dashboard
            </Link>
            <a
              href="#how-it-works"
              className="rounded-full bg-white border border-slate-200 px-8 py-4 text-base font-medium text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95"
            >
              Explore Architecture
            </a>
          </div>
        </div>
      </section>

      {/* Cryptographic Proof Banner (UI Flourish) */}
      <div className="border-y border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6 flex flex-wrap justify-center items-center gap-x-12 gap-y-6 text-sm font-medium text-slate-400 uppercase tracking-widest">
          <div className="flex items-center gap-2"><LockKeyhole className="w-4 h-4" /> SHA-256 Hashing</div>
          <div className="flex items-center gap-2"><LinkIcon className="w-4 h-4" /> Merkle Trees</div>
          <div className="flex items-center gap-2"><Database className="w-4 h-4" /> Polygon Anchoring</div>
        </div>
      </div>

      {/* How It Works Section */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-6 lg:px-8 py-24 sm:py-32">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Closing the Phase 3 Integrity Gap
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Current systems rely on internal logs. Sentinel provides independent, tamper-evident proof of every clinical data point.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature Card 1 */}
          <div className="group relative bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-100 transition-all">
              <LockKeyhole className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">
              Immutable Data Capture
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Every patient visit is cryptographically hashed and chained to previous records at submission time, making post-entry data manipulation instantly detectable.
            </p>
          </div>

          {/* Feature Card 2 */}
          <div className="group relative bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all duration-300 md:-translate-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-100 transition-all">
              <Activity className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">
              Anomaly Intelligence
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Our forensic AI engines (TIIE) run deterministic statistical and behavioral analyses to highlight suspicious patterns across sites—without blocking workflows.
            </p>
          </div>

          {/* Feature Card 3 */}
          <div className="group relative bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-300">
            <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-slate-100 transition-all">
              <ShieldCheck className="w-6 h-6 text-slate-700" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">
              Continuous Oversight
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Regulators gain real-time, risk-prioritized visibility into trial data integrity instead of relying solely on delayed, retrospective manual audits.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center md:order-2">
            <p className="text-sm font-medium text-slate-400">
              Regulatory Grade Infrastructure
            </p>
          </div>
          <div className="mt-8 md:order-1 md:mt-0">
            <p className="text-center text-sm text-slate-500 flex items-center justify-center md:justify-start gap-2">
              <ShieldCheck className="w-4 h-4" /> 
              Sentinel • Trial Integrity Intelligence Engine
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}