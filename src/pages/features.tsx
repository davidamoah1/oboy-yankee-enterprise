import { Zap, Shield, BarChart3, Globe, Smartphone, CreditCard, Users, Store } from "lucide-react";

export default function FeaturesPage() {
  const features = [
    {
      title: "Private & Secure",
      desc: "Your business data is kept completely private. No one else can see your sales, customers, or items.",
      icon: Shield
    },
    {
      title: "Real-time Sales Tracking",
      desc: "Monitor every transaction as it happens. Built-in GHS currency support and tax calculation for Ghana businesses.",
      icon: BarChart3
    },
    {
      title: "Smart Inventory",
      desc: "Automatic restock alerts, item tracking, and low-stock predictions to keep your shelves always full.",
      icon: Zap
    },
    {
      title: "Mobile Money (MoMo)",
      desc: "Direct integration with major telcos for fast, reliable customer payments via Mobile Money.",
      icon: Smartphone
    },
    {
      title: "Staff Management",
      desc: "Control what staff can see—set specific access for employees, managers, and owners with activity records.",
      icon: Users
    },
    {
      title: "Anytime, Anywhere Sales",
      desc: "Sell products on any tablet, mobile, or desktop device. Works perfectly even with slow internet.",
      icon: Store
    }
  ];

  return (
    <div className="animate-in fade-in duration-700">
      <section className="bg-muted/10 py-24 border-b">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter mb-6 uppercase">Powerful Features.</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to run a modern shop in Ghana, built with advanced technology.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-6 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {features.map((feat, i) => (
            <div key={i} className="group p-8 rounded-3xl border border-border/50 bg-card hover:border-primary/30 transition-all hover:shadow-2xl">
              <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center mb-6 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                <feat.icon className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-bold mb-4">{feat.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-primary text-primary-foreground py-24">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="max-w-xl">
             <h2 className="text-4xl md:text-5xl font-black italic tracking-tight mb-6">Built for Africa, Scaled for the Globe.</h2>
             <p className="text-primary-foreground/80 text-lg">
                We've spent thousands of hours in markets and shops in Accra, Kumasi, and beyond to build a system that works exactly how you do.
             </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
             <div className="p-5 sm:p-8 bg-white/10 rounded-2xl backdrop-blur-md text-center sm:text-left flex-1 min-w-[120px]">
                <div className="text-2xl sm:text-4xl font-black mb-1 sm:mb-2 text-white">99.9%</div>
                <div className="text-xs sm:text-sm font-bold uppercase tracking-wider opacity-60">Uptime</div>
             </div>
             <div className="p-5 sm:p-8 bg-white/10 rounded-2xl backdrop-blur-md text-center sm:text-left flex-1 min-w-[120px]">
                <div className="text-2xl sm:text-4xl font-black mb-1 sm:mb-2 text-white">256-bit</div>
                <div className="text-xs sm:text-sm font-bold uppercase tracking-wider opacity-60">Security</div>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}
