import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import { Link } from "react-router-dom";
import { 
  ShieldAlert, 
  Download, 
  Printer, 
  Share2, 
  Check, 
  Globe, 
  ArrowLeft,
  Calendar,
  Lock,
  ChevronRight,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface LegalSection {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface LegalLayoutProps {
  title: string;
  subtitle: string;
  description: string;
  version: string;
  effectiveDate: string;
  jurisdiction?: string;
  sections: LegalSection[];
  icon?: React.ReactNode;
}

export function LegalLayout({
  title,
  subtitle,
  description,
  version,
  effectiveDate,
  jurisdiction = "Republic of Ghana • Global Standards",
  sections,
  icon
}: LegalLayoutProps) {
  const [activeSection, setActiveSection] = useState(sections[0]?.id || "");
  const [copiedLink, setCopiedLink] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Ref map for sections to detect scroll intersection and smooth scroll
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Handle active link tracking on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 160;
      
      // Find the current active section
      for (const section of sections) {
        const element = sectionRefs.current[section.id];
        if (element) {
          const top = element.offsetTop;
          const height = element.offsetHeight;
          
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    const element = sectionRefs.current[id];
    if (element) {
      const offsetPos = element.offsetTop - 120;
      window.scrollTo({
        top: offsetPos,
        behavior: "smooth"
      });
      setActiveSection(id);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    toast.success("Policy URL copied to clipboard");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative selection:bg-primary/20">
      {/* Scroll Progress Indicator */}
      <motion.div 
        className="fixed top-[64px] md:top-[80px] left-0 right-0 h-1 bg-gradient-to-r from-primary to-emerald-500 z-50 origin-[0%]"
        style={{ scaleX }}
      />

      {/* Hero Header Banner */}
      <div className="relative pt-32 pb-20 border-b border-border/50 bg-radial from-muted/50 via-background to-background overflow-hidden">
        {/* Abstract Glow Rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="container mx-auto px-6 max-w-7xl">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 mb-8 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors flex items-center gap-1.5 focus:outline-none">
              <ArrowLeft className="h-3.5 w-3.5" /> Base
            </Link>
            <ChevronRight className="h-3 w-3 text-muted-foreground/30" />
            <span className="text-muted-foreground/50">Trust Ledger</span>
            <ChevronRight className="h-3 w-3 text-muted-foreground/30" />
            <span className="text-primary italic font-black">{title}</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12">
            <div className="space-y-4 max-w-3xl">
              <div className="flex items-center gap-4">
                {icon && (
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner">
                    {icon}
                  </div>
                )}
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/80 bg-primary/5 px-3.5 py-1.5 rounded-lg border border-primary/10">
                  Compliance Node Active
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black italic tracking-tighter uppercase leading-none">
                {title}
              </h1>
              <p className="text-xl text-muted-foreground font-medium leading-relaxed italic">
                {subtitle}
              </p>
              <p className="text-sm text-muted-foreground/80 max-w-2xl font-normal leading-relaxed">
                {description}
              </p>
            </div>

            {/* Compliance Badge Ledger */}
            <div className="bg-card/40 border border-border/50 rounded-3xl p-6 lg:min-w-[280px] shrink-0 backdrop-blur-xl space-y-4 shadow-xl">
              <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-primary border-b border-border/50 pb-3">
                <Globe className="h-4 w-4" /> Certification Registry
              </div>
              <div className="space-y-3 font-mono text-[10px] uppercase font-black tracking-wider text-muted-foreground/80">
                <div className="flex justify-between gap-4">
                  <span>Policy ID:</span>
                  <span className="text-foreground tracking-normal font-sans italic">NEX-POL-{sections[0]?.id?.slice(0, 3)}-V2</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Version State:</span>
                  <span className="text-foreground">{version}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Effective Date:</span>
                  <span className="text-foreground">{effectiveDate}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Jurisdiction:</span>
                  <span className="text-primary tracking-tight font-sans italic">{jurisdiction}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Table of Contents Bar */}
      <div className="sticky top-[64px] md:top-[80px] z-40 bg-background/95 backdrop-blur-xl border-b border-border/50 px-6 py-4 block lg:hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Policy Navigation</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="rounded-xl h-9 border border-border uppercase text-[10px] font-black tracking-widest"
          >
            {isMobileMenuOpen ? <X className="h-4 w-4 mr-1" /> : <Menu className="h-4 w-4 mr-1" />}
            Table of Contents
          </Button>
        </div>
        
        {isMobileMenuOpen && (
          <div className="mt-4 pt-4 border-t border-border/50 space-y-2 max-h-[300px] overflow-y-auto">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={cn(
                  "w-full text-left py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all border",
                  activeSection === section.id 
                    ? "bg-primary/10 text-primary border-primary/20 italic" 
                    : "bg-transparent text-muted-foreground border-transparent hover:bg-muted/50"
                )}
              >
                {section.title}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Dual-Column Content */}
      <div className="container mx-auto px-6 max-w-7xl pt-16 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Desktop Left Column Sticky Table of Contents */}
          <div className="hidden lg:block lg:col-span-4 h-fit sticky top-28 space-y-10">
            <div className="bg-card/30 border border-border/50 rounded-[28px] p-6 backdrop-blur-xl">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/80 mb-6 block">Table of Contents</span>
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={cn(
                      "w-full flex items-center justify-between py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all text-left border relative group",
                      activeSection === section.id 
                        ? "bg-primary/10 text-primary border-primary/25 italic" 
                        : "bg-transparent text-muted-foreground border-transparent hover:bg-muted/40 hover:text-foreground"
                    )}
                  >
                    <span className="truncate pr-4">{section.title}</span>
                    <ChevronRight className={cn(
                      "h-3.5 w-3.5 shrink-0 transition-all opacity-0",
                      activeSection === section.id ? "opacity-100 translate-x-0 text-primary" : "group-hover:opacity-40 group-hover:translate-x-1"
                    )} />
                  </button>
                ))}
              </nav>
            </div>

            {/* Extra Reassurance / Help Core Card */}
            <div className="bg-primary/5 border border-primary/15 rounded-[28px] p-8 space-y-6">
              <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Lock className="h-5 w-5" />
              </div>
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-widest italic leading-tight text-foreground">Need Legal Clarification?</h4>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Our legal compliance operations and general corporate counsel desk are always open. Reach out for formal verification letters.
                </p>
              </div>
              <Button 
                variant="outline" 
                className="w-full h-11 text-[9px] uppercase font-black tracking-widest bg-background border-border/50 rounded-xl hover:bg-primary hover:text-primary-foreground hover:border-transparent"
                asChild
              >
                <Link to="/contact">Inquire Compliance Officer</Link>
              </Button>
            </div>
          </div>

          {/* Right Column Core Legalese Body */}
          <div className="lg:col-span-8 space-y-16">
            
            {/* Control Strip Actions */}
            <div className="flex flex-wrap items-center gap-4 bg-muted/40 border border-border/50 rounded-2xl p-4 justify-between">
              <p className="text-[10px] font-bold text-muted-foreground px-2">
                This document is formatted for screen-readers and digital audits.
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCopyLink}
                  className="rounded-xl text-[9px] uppercase font-black tracking-widest h-10 border-border/50"
                >
                  {copiedLink ? <Check className="h-3.5 w-3.5 mr-1.5 text-emerald-500 animate-bounce" /> : <Share2 className="h-3.5 w-3.5 mr-1.5" />}
                  Share URL
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handlePrint}
                  className="rounded-xl text-[9px] uppercase font-black tracking-widest h-10 border-border/50"
                >
                  <Printer className="h-3.5 w-3.5 mr-1.5" />
                  Print
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handlePrint}
                  className="rounded-xl text-[9px] uppercase font-black tracking-widest h-10 border-border/50"
                >
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  Audit PDF
                </Button>
              </div>
            </div>

            {/* Document Content Render */}
            <div className="space-y-16 leading-relaxed">
              {sections.map((section) => (
                <article 
                  key={section.id} 
                  ref={(el) => {
                    sectionRefs.current[section.id] = el;
                  }}
                  id={section.id}
                  className="space-y-6 pt-12 border-t border-border/30 first:border-0 first:pt-0 group relative scroll-mt-48"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-xs text-primary font-black italic select-none">
                      #{section.id.toUpperCase()}
                    </span>
                    <h2 className="text-2xl font-black italic tracking-tight uppercase group-hover:text-primary transition-colors">
                      {section.title}
                    </h2>
                  </div>
                  <div className="text-muted-foreground font-medium text-sm sm:text-base space-y-4">
                    {section.content}
                  </div>
                </article>
              ))}
            </div>

            {/* Policy Close Seal */}
            <div className="pt-16 border-t border-border/30 flex flex-col items-center text-center space-y-6">
              <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 mb-2">
                <ShieldAlert className="h-8 w-8" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500/80">Compliance Verified</span>
                <p className="text-xs font-mono text-muted-foreground/50 mt-1 uppercase">Block Registry Node ID: 0x82fca9b182ea98cf</p>
                <p className="text-xs font-medium text-muted-foreground max-w-md mx-auto leading-relaxed mt-4">
                  By accessing, browsing, or installing the Ghana SME OS (OBOY YANKEE ENTERPRISE), you automatically acknowledge audit logs mapping back to version control files.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
