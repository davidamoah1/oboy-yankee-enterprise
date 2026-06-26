import React, { useState } from "react";
import { 
  Mail, 
  Phone, 
  MessageSquare, 
  ArrowRight, 
  CheckCircle2, 
  Loader2,
  HelpCircle,
  ExternalLink,
  Clock,
  Shield
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    question: "How do I register my business on the platform?",
    answer: "Registration is simple. Click the 'Get Started' button on our homepage, provide your business registration details (including TIN if available), and follow the verification steps. You can be up and running in under 5 minutes."
  },
  {
    question: "How does the POS system work with local payments?",
    answer: "Our POS system is natively integrated with MoMo (MTN and Telecel). When you process a sale, your customers can pay directly via their mobile wallets, and the transaction is automatically reconciled in your business ledger."
  },
  {
    question: "Can I use the platform on my mobile phone?",
    answer: "Yes! The entire platform is fully responsive and optimized for mobile devices. We also have a specialized Lite mode for areas with low internet connectivity, ensuring you can manage your inventory even on the go."
  },
  {
    question: "Is my business data secure?",
    answer: "Security is our top priority. We use bank-grade encryption for all data storage and transmissions. Your financial records are isolated and protected by the Nexus security protocol, ensuring only authorized agents can access them."
  }
];

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketRef, setTicketRef] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    businessName: "",
    phone: "",
    category: "",
    message: ""
  });

  const getCategoryDetails = (cat: string) => {
    switch (cat) {
      case "support":
        return {
          label: "Technical Support Desk",
          eta: "Within 2 Hours",
          priority: "Critical Priority",
          description: "Our systems core development & hardware operations teams have been alerted."
        };
      case "sales":
        return {
          label: "Enterprise Sales Desk",
          eta: "Within 4 Hours",
          priority: "High Priority",
          description: "Our regional platform consultants will review your SME operating profile."
        };
      case "partnership":
        return {
          label: "Strategic Partnership Desk",
          eta: "Within 12 Hours",
          priority: "Medium Priority",
          description: "Alliance and expansion managers scheduled for proposal ledger evaluation."
        };
      default:
        return {
          label: "General Platform Desk",
          eta: "Within 24 Hours",
          priority: "Standard Priority",
          description: "Our general customer relationship agents have queued your request in the registry."
        };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.message || !formData.category) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    
    // Simulate API request
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log("Contact Form Payload:", formData);
      
      // Dynamic reference designation
      const randomDigits = Math.floor(10000 + Math.random() * 90000);
      const categoryAbbr = (formData.category || "other").slice(0, 3).toUpperCase();
      setTicketRef(`NEX-${categoryAbbr}-${randomDigits}`);
      
      setSubmitted(true);
      toast.success("Message sent successfully!");
    } catch (error) {
      toast.error("Deployment failure in transmission. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppClick = () => {
    // Standard WhatsApp link for Ghana business support
    window.open("https://wa.me/233000000000", "_blank");
  };

  if (submitted) {
    const details = getCategoryDetails(formData.category);
    return (
      <div className="min-h-screen pt-32 pb-20 px-6 sm:px-10 flex flex-col items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-2xl w-full bg-slate-900/50 border border-white/5 shadow-2xl rounded-[40px] p-8 sm:p-12 backdrop-blur-3xl overflow-hidden relative"
        >
          {/* Subtle Background Glows */}
          <div className="absolute -top-12 -right-12 min-h-[160px] min-w-[160px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 min-h-[160px] min-w-[160px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />

          {/* Icon and Core Success Tag */}
          <div className="flex flex-col items-center text-center">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 100 }}
              className="h-16 w-16 bg-emerald-500/10 rounded-3xl flex items-center justify-center text-emerald-400 mb-6 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
            >
              <CheckCircle2 className="h-8 w-8" />
            </motion.div>
            
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500/85 mb-2">Transmission Secure</span>
            <h1 className="text-3xl sm:text-4xl font-black italic tracking-tighter uppercase mb-2 text-slate-100">
              Thank You, {formData.name.split(" ")[0]}
            </h1>
            <p className="text-slate-400 font-medium text-sm max-w-md mx-auto mb-8">
              We have successfully buffered your request inside the Nexa intelligence support system.
            </p>
          </div>

          {/* Reference Receipt Identifier */}
          <div className="bg-black/40 border border-white/5 rounded-3xl p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-1">Support Ticket Code</span>
              <code className="text-sm font-black tracking-widest text-slate-300 font-mono select-all">
                {ticketRef}
              </code>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/15 rounded-2xl px-5 py-3 flex items-center gap-3">
              <Clock className="h-4 w-4 text-emerald-500 animate-pulse" />
              <div className="text-left">
                <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500/70 block leading-none">Response Time</span>
                <span className="text-xs font-black uppercase tracking-wider text-emerald-400 font-sans leading-none block mt-1">
                  {details.eta}
                </span>
              </div>
            </div>
          </div>

          {/* Queue Parameter Profile */}
          <div className="space-y-6 mb-10 text-[11px] font-black uppercase tracking-widest text-slate-500">
            <div className="border-b border-white/5 pb-4">
              <span className="italic block mb-2 text-slate-500">Routing Target</span>
              <div className="flex items-center justify-between">
                <span className="text-slate-200 font-extrabold normal-case tracking-normal text-sm">{details.label}</span>
                <span className="bg-white/5 border border-white/10 text-slate-400 text-[8px] px-2.5 py-1 rounded-lg">
                  {details.priority}
                </span>
              </div>
              <p className="text-[10px] font-medium leading-relaxed text-slate-500 normal-case tracking-normal mt-2">
                {details.description}
              </p>
            </div>

            {/* Submitted Contact Brief */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="italic block mb-1">Company Ledger</span>
                <span className="text-slate-300 text-xs font-extrabold font-sans normal-case tracking-normal block truncate">
                  {formData.businessName || "Individual Account"}
                </span>
              </div>
              <div>
                <span className="italic block mb-1">Callback Terminal</span>
                <span className="text-slate-300 text-xs font-extrabold font-sans normal-case tracking-normal block truncate">
                  {formData.phone || "No phone added"}
                </span>
              </div>
            </div>

            {/* Stepper Progression Matrix */}
            <div className="pt-6 border-t border-white/5">
              <span className="italic block mb-4">Pipeline Protocol Status</span>
              <div className="space-y-4">
                {/* Step 1 */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-[9px] font-black">✓</div>
                    <div className="h-8 w-0.5 bg-emerald-500/30" />
                  </div>
                  <div className="normal-case tracking-normal text-left">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-300 block">Verification and Authentication Complete</span>
                    <span className="text-[10px] font-bold text-slate-500 block -mt-1">Request successfully decrypted on host servers</span>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="h-5 w-5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-[9px] font-black animate-pulse">2</div>
                    <div className="h-8 w-0.5 bg-white/5" />
                  </div>
                  <div className="normal-case tracking-normal text-left">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block">Queue Placement & Agent Handshake</span>
                    <span className="text-[10px] font-bold text-slate-400 block -mt-1">Assigned to {details.label} ({details.priority})</span>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="h-5 w-5 rounded-full bg-slate-800 text-slate-600 border border-white/5 flex items-center justify-center text-[9px] font-black">3</div>
                  </div>
                  <div className="normal-case tracking-normal text-left">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 block">Resolution Closeout & Update</span>
                    <span className="text-[10px] font-bold text-slate-600 block -mt-1">Notification ticket will be emailed to {formData.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              type="button"
              variant="outline" 
              onClick={() => {
                setSubmitted(false);
                setFormData({ name: "", email: "", businessName: "", phone: "", category: "", message: "" });
              }}
              className="flex-1 h-14 rounded-2xl border-white/5 hover:border-white/10 font-black uppercase tracking-widest text-[9px] bg-white/5 hover:bg-white/10 transition-all text-slate-200"
            >
              Submit Another Inquiry
            </Button>
            <Button 
              type="button"
              onClick={handleWhatsAppClick}
              className="flex-1 h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-black font-black uppercase tracking-widest text-[9px] transition-all shadow-[0_4px_20px_rgba(16,185,129,0.2)]"
            >
              Emergency WhatsApp Hub
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        
        {/* Hero Section */}
        <div className="max-w-3xl mb-16 sm:mb-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="h-6 w-1 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500">Contact Support</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl sm:text-7xl font-black italic tracking-tighter uppercase leading-[0.9] text-slate-100 mb-8"
          >
            We are here to help your <span className="text-emerald-500 underline decoration-white/10 underline-offset-8">business grow.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 font-bold text-lg sm:text-xl max-w-xl leading-relaxed"
          >
            Whether you are a retail shop in Accra or a service provider in Kumasi, our team is ready to scale your operations.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          
          {/* Main Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-7"
          >
            <div className="bg-slate-900/40 backdrop-blur-xl rounded-[40px] border border-white/5 p-8 sm:p-12 shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                  <MessageSquare className="h-32 w-32 rotate-12 text-emerald-500" />
               </div>
               
               <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-[11px] font-black uppercase tracking-widest text-slate-500">
                     <div className="space-y-3">
                        <Label htmlFor="name" className="ml-1 italic">Full Name <span className="text-emerald-500">*</span></Label>
                        <Input 
                           id="name"
                           value={formData.name}
                           onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                           placeholder="Kwame Mensah"
                           className="h-14 bg-black/40 border-white/5 text-slate-200 placeholder:text-slate-800 rounded-2xl focus-visible:ring-emerald-500/20 font-bold italic tracking-wide"
                        />
                     </div>
                     <div className="space-y-3">
                        <Label htmlFor="email" className="ml-1 italic">Email Address <span className="text-emerald-500">*</span></Label>
                        <Input 
                           id="email"
                           type="email"
                           value={formData.email}
                           onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                           placeholder="kwame@business.com"
                           className="h-14 bg-black/40 border-white/5 text-slate-200 placeholder:text-slate-800 rounded-2xl focus-visible:ring-emerald-500/20 font-bold italic tracking-wide"
                        />
                     </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-[11px] font-black uppercase tracking-widest text-slate-500">
                     <div className="space-y-3">
                        <Label htmlFor="business" className="ml-1 italic">Business Name</Label>
                        <Input 
                           id="business"
                           value={formData.businessName}
                           onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                           placeholder="Mensah Retail Ventures"
                           className="h-14 bg-black/40 border-white/5 text-slate-200 placeholder:text-slate-800 rounded-2xl focus-visible:ring-emerald-500/20 font-bold italic tracking-wide"
                        />
                     </div>
                     <div className="space-y-3">
                        <Label htmlFor="phone" className="ml-1 italic">Phone Number</Label>
                        <Input 
                           id="phone"
                           value={formData.phone}
                           onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                           placeholder="+233 ..."
                           className="h-14 bg-black/40 border-white/5 text-slate-200 placeholder:text-slate-800 rounded-2xl focus-visible:ring-emerald-500/20 font-bold italic tracking-wide"
                        />
                     </div>
                  </div>

                  <div className="space-y-3 text-[11px] font-black uppercase tracking-widest text-slate-500">
                     <Label className="ml-1 italic">Reason for Identity <span className="text-emerald-500">*</span></Label>
                     <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val })}>
                        <SelectTrigger className="h-14 bg-black/40 border-white/5 text-slate-200 rounded-2xl focus-visible:ring-emerald-500/20 font-bold italic tracking-wide">
                           <SelectValue placeholder="Select Inquiry Type" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-white/5 rounded-2xl p-2">
                           <SelectItem value="sales" className="h-11 rounded-xl font-black uppercase tracking-widest text-[10px] focus:bg-emerald-500 focus:text-white transition-all">Sales Inquiry</SelectItem>
                           <SelectItem value="support" className="h-11 rounded-xl font-black uppercase tracking-widest text-[10px] focus:bg-emerald-500 focus:text-white transition-all">Technical Support</SelectItem>
                           <SelectItem value="partnership" className="h-11 rounded-xl font-black uppercase tracking-widest text-[10px] focus:bg-emerald-500 focus:text-white transition-all">Strategic Partnership</SelectItem>
                           <SelectItem value="other" className="h-11 rounded-xl font-black uppercase tracking-widest text-[10px] focus:bg-emerald-500 focus:text-white transition-all">Other Inquiry</SelectItem>
                        </SelectContent>
                     </Select>
                  </div>

                  <div className="space-y-3 text-[11px] font-black uppercase tracking-widest text-slate-500">
                     <Label htmlFor="message" className="ml-1 italic">Your Message <span className="text-emerald-500">*</span></Label>
                     <div className="relative">
                        <Textarea 
                           id="message"
                           value={formData.message}
                           onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                           placeholder="How can we help your business today?"
                           className="min-h-[160px] bg-black/40 border-white/5 text-slate-200 placeholder:text-slate-800 rounded-2xl focus-visible:ring-emerald-500/20 font-bold italic tracking-wide p-6"
                        />
                     </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-500 shadow-xl shadow-emerald-500/20 transition-all font-black uppercase tracking-[0.3em] text-[10px] border-none group/submit"
                  >
                     {loading ? (
                       <Loader2 className="h-5 w-5 animate-spin" />
                     ) : (
                       <span className="flex items-center gap-3">
                          Commit Message <ArrowRight className="h-4 w-4 group-hover/submit:translate-x-2 transition-transform" />
                       </span>
                     )}
                  </Button>
               </form>
            </div>
          </motion.div>

          {/* Contact Info & Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-5 space-y-12"
          >
            <div className="space-y-10">
               <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-6">Support Channels</h3>
                  
                  <div className="group flex items-start gap-6 p-8 rounded-[35px] bg-white/[0.02] border border-white/5 hover:border-emerald-500/20 transition-all cursor-default">
                     <div className="h-14 w-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                        <Mail className="h-6 w-6" />
                     </div>
                     <div>
                        <span className="block text-[10px] font-black uppercase tracking-widest text-slate-600 mb-1">Email Archive</span>
                        <span className="block font-black italic text-lg text-slate-200 tracking-tight">support@nexus-sme.gh</span>
                        <p className="text-[10px] font-bold text-slate-500 mt-2 uppercase tracking-tighter">Direct node for complex architectural inquiries.</p>
                     </div>
                  </div>

                  <div className="group flex items-start gap-6 p-8 rounded-[35px] bg-emerald-500/5 border border-emerald-500/10 hover:border-emerald-500/40 transition-all cursor-default relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <Phone className="h-12 w-12" />
                     </div>
                     <div className="h-14 w-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-500/30 group-hover:scale-110 transition-transform relative z-10">
                        <MessageSquare className="h-6 w-6" />
                     </div>
                     <div className="relative z-10">
                        <span className="block text-[10px] font-black uppercase tracking-widest text-emerald-500/60 mb-1">Express Support</span>
                        <button 
                           onClick={handleWhatsAppClick}
                           className="flex items-center gap-2 font-black italic text-lg text-slate-100 hover:text-emerald-400 transition-colors tracking-tight"
                        >
                           WhatsApp Support <ExternalLink className="h-4 w-4" />
                        </button>
                        <p className="text-[10px] font-bold text-emerald-500/40 mt-2 uppercase tracking-tighter">Standard WhatsApp support for Ghana.</p>
                     </div>
                  </div>

                  <div className="flex items-center gap-4 px-8 py-4 bg-slate-900/40 rounded-2xl border border-white/5">
                     <Clock className="h-4 w-4 text-emerald-500" />
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Expected latency: &lt; 24h Response Time</span>
                  </div>
               </div>

               {/* Trust Indicators */}
               <div className="p-10 rounded-[40px] border border-white/5 bg-slate-900/60 backdrop-blur-md relative overflow-hidden">
                  <div className="absolute -top-4 -right-4 h-24 w-24 bg-primary/5 rounded-full blur-3xl" />
                  <div className="relative z-10 space-y-6">
                     <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 text-primary" />
                        <h4 className="text-sm font-black uppercase tracking-widest text-slate-200 italic">Identity Privacy</h4>
                     </div>
                     <p className="text-xs font-bold text-slate-500 leading-relaxed uppercase tracking-tighter">
                        Your business telemetry is encrypted at the source. We never share proprietary merchant intelligence with third-party nodes.
                     </p>
                  </div>
               </div>
            </div>
          </motion.div>
        </div>

        {/* FAQ Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-32 pt-32 border-t border-white/5"
        >
          <div className="max-w-3xl mb-16">
            <div className="flex items-center gap-3 mb-6">
               <HelpCircle className="h-5 w-5 text-primary" />
               <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Help & Support</h2>
            </div>
            <h2 className="text-4xl font-black italic tracking-tighter uppercase text-slate-100 leading-none">Frequently Asked <span className="text-primary italic">Questions</span></h2>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-4">
            {FAQS.map((faq, i) => (
              <AccordionItem 
                key={i} 
                value={`item-${i}`} 
                className="border-white/5 bg-slate-900/20 backdrop-blur-sm rounded-[30px] px-8 overflow-hidden group data-[state=open]:bg-white/[0.03] transition-all"
              >
                <AccordionTrigger className="hover:no-underline py-8">
                  <span className="text-left font-black italic text-lg text-slate-300 group-hover:text-primary transition-colors tracking-tight uppercase">
                    {faq.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-8">
                  <p className="text-slate-500 font-bold text-base leading-relaxed tracking-tight max-w-4xl">
                    {faq.answer}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </div>
  );
}
