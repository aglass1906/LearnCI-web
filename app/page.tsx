import { createClient } from "@/utils/supabase/server";
import { Sparkles, Zap, Smartphone, BookOpen, Mic, Tv, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function Home() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/portal");
  }

  return (
    <div className="relative min-h-screen bg-brandDark text-white font-sans overflow-x-hidden">
      
      {/* Atmospheric Background Layers */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[radial-gradient(circle,rgba(56,97,251,0.12)_0%,rgba(56,97,251,0)_70%)] blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[radial-gradient(circle,rgba(0,229,255,0.08)_0%,rgba(0,229,255,0)_70%)] blur-[100px]"></div>
      </div>

      {/* Main Landing Container */}
      <main className="relative z-10 pt-16 max-w-7xl mx-auto px-6">
        
        {/* Hero Section */}
        <section className="py-12 md:py-20 flex flex-col items-center text-center max-w-5xl mx-auto">
          {/* New Release Badge */}
          <div className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
            <Sparkles className="h-4 w-4 text-primaryAccent" />
            <span className="font-labels text-[10px] font-extrabold tracking-wider text-primaryAccent uppercase">
              New: Japanese Immersion Roadmap
            </span>
          </div>

          {/* Hero Headline */}
          <h1 className="font-heading text-4xl md:text-7xl font-extrabold leading-tight tracking-tight max-w-4xl mb-6 bg-gradient-to-r from-primaryAccent via-white to-accentTeal bg-clip-text text-transparent">
            Master Languages via Comprehensible Input
          </h1>

          {/* Hero Subtitle */}
          <p className="text-white/60 font-sans text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
            Stop memorizing grammar rules. Start acquiring your target language naturally through immersive stories, cinematic podcasts, and interactive media tailored directly to your comprehension level.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Link href="/login">
              <button className="w-full sm:w-auto bg-primaryAccent text-brandDark shadow-lg shadow-primaryAccent/25 hover:shadow-primaryAccent/40 hover:scale-[1.02] active:scale-95 transition-all duration-200 px-8 py-4 rounded-xl font-heading text-base font-bold flex items-center justify-center gap-2">
                Start Learning in Your Browser
                <Zap className="h-5 w-5 fill-brandDark" />
              </button>
            </Link>
            <button className="glass-card px-8 py-4 rounded-xl font-heading text-base font-semibold text-white hover:bg-white/10 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2">
              Download on App Store
              <Smartphone className="h-5 w-5" />
            </button>
          </div>

          {/* Social Proof */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex -space-x-3">
              <img className="w-10 h-10 rounded-full border-2 border-brandDark object-cover" alt="Learner 1" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBugEcRjinthjzvSU7vIQT4-TUCGMywR0hds8DymDx4VhkJ8wVDUHqJw9hSo91LVRv5gyFWZkCvN3SAG3qxRyqTQDYUcfO7BJFVM9hkvaV1Ke1JesZLTAE-c9jh4OrMAD4Ak8z9xxhXakwvyWqhrKj-g-PBmjpxm5EkIZ-3Ooj4Jm-eqND_fNfL7tH9aJmwnD81sNKhEbV2lkrmRNRm9cjcuXsBUm5t4r6V-Xlz4VVx4gYAnygLteR89YzazwVie9CFzvJRsOK_SKw"/>
              <img className="w-10 h-10 rounded-full border-2 border-brandDark object-cover" alt="Learner 2" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBs_HAFiXQn3sRrVmeq5leJvsR8EQ1PoE7xvfLmAEWOfP5VXsB4Vi17yAHm9sz_sZ5WGPIt4DthVaoMDD-9qYi_apejexFkMrzKiUArkLI9dIEynA31EoJLLMWFUZpQsWxG0NBg0FoVkRGwtYfKTbjfbBLIPu_8PuL1714X9DNbYrEc3Z17i7MnOg0_Y2QYRjKmYPPglJDilfgTpWY8ot75STjLcgw5B5cISA7tSPiWDxqYVLrDfbq3YvzzHsbvFuJN0qbVwjiEKRs"/>
              <img className="w-10 h-10 rounded-full border-2 border-brandDark object-cover" alt="Learner 3" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAF7VJL-6SCAq5Mg7aQORRt96qiU6cBfZ91t3yXmt2eyGQeFvonE3MH-2TSyAXs5hT2JmVtPKQqLggPAsZOgpf9bYRiQLAm4sk-lbFHw78nvTPPu0cWQqBG_-eY212BvmdYApNmb2dNZiZ7i8V3vvnc3H5x23QkgRr4VyygMUAB6i1caUrhweZR-2lJJs-ra7Allt7Mc_j0zB6nHXi_aWyR3olTz0sOWWIXzpbv5_QpWQJNAs2UmDP10IcEOKk7xb_uONzCKlRxRyU"/>
              <img className="w-10 h-10 rounded-full border-2 border-brandDark object-cover" alt="Learner 4" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBKGOhZNQWaGW7htw9mqWcwbOOOe9pqKQgE4M0e2IOOMoX-mILhNCcLiiOeHi_30j16dSejY-n51tOiH3_ourQQdRMo5XBMF9rK9e1hUw2ehQW5JP3_k5AxhYi4r7RAFSmNCD-V-tXB_ZI9XHNP5mFSwn0aUBKN29GBCIb2hEoFqovDxvWumMQ74nWliJbNZyX1TBgAxLNETOZigicaXWyGw0-lEv4yuBlVxx-mhvvRcO9IigakcFT0auuO9rhtH-ecRoktmdmL1FU"/>
              <div className="w-10 h-10 rounded-full border-2 border-brandDark bg-brandSurface flex items-center justify-center text-[10px] font-bold text-accentTeal">+1k</div>
            </div>
            <p className="font-labels text-[10px] text-white/40 uppercase tracking-widest">
              Join 10,000+ fluent learners today
            </p>
          </div>
        </section>

        {/* Product Preview Bento/Mockup */}
        <section className="py-12">
          <div className="glass-card rounded-[32px] p-2 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-tr from-accentTeal/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
            {/* Interactive Visual Preview */}
            <img className="w-full h-auto rounded-[24px] shadow-2xl border border-white/5" alt="LearnCI Application Interface" src="/design/portal_dashboard_mockup.png"/>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Card 1: Stories */}
            <div className="glass-card p-8 rounded-[24px] hover:-translate-y-2 transition-transform duration-300">
              <div className="w-12 h-12 rounded-xl bg-primaryAccent/10 border border-primaryAccent/20 flex items-center justify-center mb-6">
                <BookOpen className="h-6 w-6 text-primaryAccent" />
              </div>
              <h3 className="font-heading text-xl font-bold mb-3 text-primaryAccent">Interactive Stories</h3>
              <p className="text-white/60 text-sm leading-relaxed font-sans">
                Engage with high-quality prose where every word is clickable. Real-time parallel translations and spaced repetition (SRS) card creation help you acquire vocabulary organically as you read.
              </p>
            </div>

            {/* Card 2: Podcasts */}
            <div className="glass-card p-8 rounded-[24px] hover:-translate-y-2 transition-transform duration-300">
              <div className="w-12 h-12 rounded-xl bg-accentTeal/10 border border-accentTeal/20 flex items-center justify-center mb-6">
                <Mic className="h-6 w-6 text-accentTeal" />
              </div>
              <h3 className="font-heading text-xl font-bold mb-3 text-accentTeal">Cinematic Podcasts</h3>
              <p className="text-white/60 text-sm leading-relaxed font-sans">
                Audio experiences designed to be understood. Multi-voice, dramatized conversations with progressive difficulty levels ensure you are always in the optimal zone of language acquisition.
              </p>
            </div>

            {/* Card 3: YouTube TV */}
            <div className="glass-card p-8 rounded-[24px] hover:-translate-y-2 transition-transform duration-300">
              <div className="w-12 h-12 rounded-xl bg-glowPurple/20 border border-glowPurple/40 flex items-center justify-center mb-6">
                <Tv className="h-6 w-6 text-glowPurple" />
              </div>
              <h3 className="font-heading text-xl font-bold mb-3 text-white">YouTube Immersion</h3>
              <p className="text-white/60 text-sm leading-relaxed font-sans">
                Turn your favorite YouTube videos into tracked learning sessions. Focus player, vocabulary lookups, and automated input minute sync to keep your learning records completely up to date.
              </p>
            </div>

          </div>
        </section>

        {/* Scientific Foundation Section */}
        <section className="py-16">
          <div className="glass-card rounded-[32px] p-8 md:p-12 flex flex-col md:flex-row items-center gap-12 bg-gradient-to-br from-brandSurface/50 to-brandDark">
            <div className="flex-1 space-y-6">
              <h2 className="font-heading text-3xl font-extrabold text-white">The Science of Comprehensible Input</h2>
              <p className="text-white/60 text-sm leading-relaxed font-sans">
                Comprehensible Input (CI) is based on the linguistic research of Dr. Stephen Krashen. We acquire languages when we understand messages. The LearnCI platform actively grooms story parameters to ensure you are continually exposed to content just slightly above your current level ($i + 1$).
              </p>
              <ul className="space-y-3 font-labels text-[11px] font-bold tracking-wider">
                <li className="flex items-center gap-3 text-primaryAccent">
                  <CheckCircle2 className="h-5 w-5 text-primaryAccent" />
                  <span>98% VOCABULARY COVERAGE RATIO</span>
                </li>
                <li className="flex items-center gap-3 text-accentTeal">
                  <CheckCircle2 className="h-5 w-5 text-accentTeal" />
                  <span>INTEGRATED SRS VOCABULARY MINING</span>
                </li>
                <li className="flex items-center gap-3 text-glowPurple">
                  <CheckCircle2 className="h-5 w-5 text-glowPurple" />
                  <span>CONTEXTUAL GRAMMAR PATTERNS</span>
                </li>
              </ul>
            </div>
            
            {/* Mini SRS Card Prototype Visualization */}
            <div className="w-full md:w-1/2 flex justify-center">
              <div className="w-64 h-80 glass-card rounded-2xl p-6 relative flex flex-col items-center justify-center border border-primaryAccent/30 rotate-3 shadow-2xl">
                <span className="absolute top-4 left-4 text-primaryAccent/40 font-labels text-[9px] tracking-widest font-bold">VOCAB HACKING</span>
                <div className="text-center space-y-2">
                  <p className="font-heading text-4xl font-extrabold text-white">木漏れ日</p>
                  <p className="text-white/40 text-xs italic font-sans">Komorebi</p>
                </div>
                <div className="absolute bottom-6 flex gap-2 w-full px-4 justify-center">
                  <div className="h-1.5 w-10 rounded-full bg-red-500/50"></div>
                  <div className="h-1.5 w-10 rounded-full bg-orange-500/50"></div>
                  <div className="h-1.5 w-10 rounded-full bg-green-500/50"></div>
                  <div className="h-1.5 w-10 rounded-full bg-accentTeal/50"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-white/5 py-12 bg-brandSurface/20 backdrop-blur-md relative z-10 text-xs text-white/50">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-4">
            <span className="font-heading text-xl font-extrabold text-primaryAccent block">LearnCI</span>
            <p className="max-w-sm leading-relaxed font-sans">
              Re-imagining language acquisition as an immersive, technical skill-learning process. Built for the modern operative.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="font-labels font-semibold text-white uppercase tracking-wider">Product</h4>
            <ul className="space-y-2 font-sans">
              <li><Link href="/portal/stories" className="hover:text-primaryAccent transition-colors">Library Catalog</Link></li>
              <li><Link href="/portal/review" className="hover:text-primaryAccent transition-colors">Vocab SRS</Link></li>
              <li><Link href="/portal/profile" className="hover:text-primaryAccent transition-colors">Learner Settings</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-labels font-semibold text-white uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2 font-sans">
              <li><a href="#" className="hover:text-primaryAccent transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primaryAccent transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-12 pt-6 border-t border-white/5 text-center text-[10px] font-labels tracking-widest text-white/30 uppercase">
          © 2026 LearnCI Language Operative Systems. All rights reserved.
        </div>
      </footer>

    </div>
  );
}
