// export default function PendingApprovalPage() {
//   return (
//     <main style={{ padding: 40 }}>
//       <h1>Approval Pending</h1>
//       <p>
//         Your hospital registration is under review by the regulator.
//         You will gain full access once approved.
//       </p>
//     </main>
//   );
// }


'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Clock, LogOut, ShieldCheck, Loader2 } from 'lucide-react';

export default function PendingApprovalPage() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans selection:bg-blue-100 selection:text-blue-900 relative overflow-hidden">
      
      {/* Subtle Background Styling */}
      <div className="absolute top-0 w-full h-1/2 bg-gradient-to-b from-slate-100 to-slate-50 -z-10"></div>
      
      <div className="w-full max-w-md relative">
        
        {/* Decorative background glow */}
        <div className="absolute -inset-1 bg-gradient-to-b from-amber-100 to-amber-50 rounded-[2rem] blur-lg opacity-50 -z-10"></div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 sm:p-10 border border-slate-100 text-center">
          
          {/* Status Icon */}
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 bg-amber-100 rounded-full animate-pulse opacity-50"></div>
            <div className="relative w-full h-full bg-amber-50 border-2 border-amber-200 rounded-full flex items-center justify-center shadow-inner">
              <Clock className="w-8 h-8 text-amber-600" />
            </div>
            {/* Small trusted badge indicator */}
            <div className="absolute bottom-0 right-0 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-3">
            Approval Pending
          </h1>
          
          <p className="text-slate-600 text-sm leading-relaxed mb-8">
            Your clinical site registration has been securely received and is currently under review by the regulatory authority. 
            <br /><br />
            You will gain full access to your trial workspaces once your institutional credentials are verified.
          </p>

          <div className="space-y-4">
            {/* Disabled visual placeholder for what they will access later */}
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 text-left flex items-center gap-3 opacity-60 grayscale cursor-not-allowed">
              <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-700">Hospital Dashboard</div>
                <div className="text-xs text-slate-500">Access locked pending review</div>
              </div>
            </div>

            {/* Logout Action */}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isLoggingOut 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm hover:shadow active:scale-[0.98]'
              }`}
            >
              {isLoggingOut ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing Out...
                </>
              ) : (
                <>
                  <LogOut className="w-4 h-4 text-slate-500" />
                  Sign Out to Homepage
                </>
              )}
            </button>
          </div>

        </div>

        {/* Footer info */}
        <p className="text-center text-xs font-medium text-slate-400 mt-8">
          Sentinel • Cryptographic Oversight System
        </p>

      </div>
    </main>
  );
}