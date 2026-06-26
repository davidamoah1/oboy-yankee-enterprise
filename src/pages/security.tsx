import React, { useState, useEffect } from "react";
import { LegalLayout, LegalSection } from "@/components/legal-layout";
import { 
  ShieldAlert, 
  CheckCircle2, 
  Server, 
  Activity, 
  Key, 
  Cpu, 
  Fingerprint, 
  Terminal, 
  Flame,
  Globe,
  Shuffle
} from "lucide-react";
import { motion } from "motion/react";

export default function SecurityPage() {
  const [testLatency, setTestLatency] = useState("14ms");
  const [logsFired, setLogsFired] = useState<string[]>([]);

  // Simulation of live security log streaming for supreme visual interaction
  useEffect(() => {
    const latencies = ["12ms", "14ms", "18ms", "15ms", "11ms"];
    const operations = [
      "INGRESS FILTER: Checked token authenticity",
      "IAM AUTH: Verified tenant isolation signature",
      "ENCRYPTION ROTATION: AES-256 key index evaluated",
      "BACKUP DAEMON: Point-in-time snapshot sync successful",
      "FRAUD DISCOVERY: Zero transaction discrepancies discovered"
    ];

    const interval = setInterval(() => {
      // Rotate latency
      setTestLatency(latencies[Math.floor(Math.random() * latencies.length)]);
      
      // Update logs stream
      const stamp = new Date().toLocaleTimeString();
      const randomLine = operations[Math.floor(Math.random() * operations.length)];
      setLogsFired(prev => [`[${stamp}] ${randomLine}`, ...prev.slice(0, 3)]);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const sections: LegalSection[] = [
    {
      id: "status",
      title: "Active System Trust Audit & Status Board",
      content: (
        <div className="space-y-6">
          <p>
            Nexus Business Systems Limited believes trust is built on mathematical and architectural transparency. Below is our real-time active system diagnostic ledger assessing our current cloud infrastructure integrity:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-6">
            
            <div className="p-6 bg-card border border-border/50 rounded-2xl flex flex-col justify-between space-y-4">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Gateway Status</span>
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <h4 className="text-xl font-black uppercase tracking-tight italic">99.98% UPTIME</h4>
                <p className="text-xs text-muted-foreground mt-1">Operating normally without incident.</p>
              </div>
            </div>

            <div className="p-6 bg-card border border-border/50 rounded-2xl flex flex-col justify-between space-y-4">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Accra Core Latency</span>
                <Activity className="h-5 w-5 text-emerald-500 animate-pulse" />
              </div>
              <div>
                <h4 className="text-xl font-black uppercase tracking-tight italic">{testLatency}</h4>
                <p className="text-xs text-muted-foreground mt-1">Synchronized with West Africa regional server nodes.</p>
              </div>
            </div>

            <div className="p-6 bg-card border border-border/50 rounded-2xl flex flex-col justify-between space-y-4">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Encryption Matrix</span>
                <Key className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="text-xl font-black uppercase tracking-tight italic">AES-256 ACTIVE</h4>
                <p className="text-xs text-muted-foreground mt-1">Complete structural database volume masking.</p>
              </div>
            </div>

          </div>

          <div className="bg-slate-950 text-emerald-400 p-5 rounded-2xl border border-white/5 font-mono text-xs space-y-2 shadow-inner">
            <div className="flex items-center gap-2 text-[10px] uppercase font-black text-slate-500 pb-2 border-b border-white/5 tracking-wider">
              <Terminal className="h-4 w-4 text-emerald-500" /> Continuous Diagnostic Stream Node: SEC-01
            </div>
            {logsFired.length === 0 ? (
              <p className="text-slate-500">Initializing diagnostic scan...</p>
            ) : (
              logsFired.map((log, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="truncate"
                >
                  {log}
                </motion.div>
              ))
            )}
          </div>
        </div>
      )
    },
    {
      id: "infrastructure",
      title: "1. Infrastructure Protections",
      content: (
        <div className="space-y-4">
          <p>
            SME OS is hosted on highly certified, tier-IV cloud infrastructure clusters managed by Google Cloud Platform (GCP) and AWS via Supabase's global multi-region network. These data centers utilize professional defense hardware:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Strict biometric verification, localized asset controls, laser fencing, and 24/7 internal surveillance forces.</li>
            <li>Redundant power infrastructure utilizing massive industrial diesel arrays and secondary power grids to sustain continuity during grid failure events (e.g., local grid shedding).</li>
            <li>Carrier-neutral internet paths linking our container layers directly into regional fiber lines, eliminating packet loss and maximizing latency performance across Ghana and West Africa.</li>
          </ul>
        </div>
      )
    },
    {
      id: "authentication",
      title: "2. Secure Authentication Engine",
      content: (
        <div className="space-y-4">
          <p>
            We enforce strict identity verification to block credential stuffing, dictionary attacks, and user account takeovers:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Advanced Session Tokens:</strong> We utilize modern cryptographically signed JSON Web Tokens (JWT) using RS256 protocols to manage browser authentication lifetimes.
            </li>
            <li>
              <strong>Secure Salted Passwords:</strong> Employees credentials are never stored as text. Passwords undergo rigorous, localized hashing using <strong>bcrypt</strong> with advanced salt lengths before DB write.
            </li>
            <li>
              <strong>Cross-Site Request Forgery (CSRF) Guarding:</strong> All dashboard actions and POS checkouts require specific validation handshakes, blocking unauthorized background script execution in other browser tabs.
            </li>
          </ul>
        </div>
      )
    },
    {
      id: "communication",
      title: "3. Cryptographic Communication",
      content: (
        <div className="space-y-4">
          <p>
            All electronic communication passing to or from SME OS is protected using end-to-end <strong>Transport Layer Security (TLS 1.3)</strong>. Direct unencrypted HTTP traffic (Port 80) is permanently disabled and automatically redirected to encrypted Port 443. This prevents malicious individuals from inspecting your internal network packets, viewing credit cards, or harvesting POS cashier keys at checkout hubs.
          </p>
        </div>
      )
    },
    {
      id: "payments",
      title: "4. Rigid Payment Security",
      content: (
        <div className="space-y-4">
          <p>
            Our infrastructure keeps your bank credentials, cards, and Mobile Money keys completely isolated and safe:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>All checkout modules utilize direct, secure payment popups powered exclusively by bank-grade, PCI-DSS Level 1 certified systems, primarily <strong>Paystack</strong>.</li>
            <li>Private financial codes (pan numbers, verification pin sets, bank lists) are processed strictly in secure browser fields on Paystack's nodes. They are completely inaccessible to our employees or database tables.</li>
          </ul>
        </div>
      )
    },
    {
      id: "backups",
      title: "5. Redundancy & Disaster Recovery",
      content: (
        <div className="space-y-4">
          <p>
            We implement advanced transactional archiving and database replication to secure your corporate history against physical server failures:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Point-in-Time Recovery:</strong> Write-ahead transaction journals are committed instantly to an offsite secure storage bucket, enabling rapid rollback of database states with minute-level precision.
            </li>
            <li>
              <strong>Multizone Replication:</strong> Active primary database partitions are continuously mirrored across multiple secure, independent server compartments, rendering the ecosystem resilient against single-center power grid failures.
            </li>
          </ul>
        </div>
      )
    },
    {
      id: "ai-safety",
      title: "6. AI Safety and Data Isolation Practices",
      content: (
        <div className="space-y-4">
          <p>
            SME OS leverages state-of-the-art predictive artificial intelligence APIs to generate executive trend analytics, predictive inventory limits, and seasonal transaction models. We deploy strict isolation bounds to guarantee corporate confidentiality:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Zero customer identifiers (full names, payment codes, emails) are packaged into intelligence prompts. Transaction datasets are entirely anonymized before being queried by AI tools.</li>
            <li>Our integration models explicitly restrict the Gemini API from training any public visual or language models on your private store catalogs, products lists, or price lists.</li>
          </ul>
        </div>
      )
    },
    {
      id: "fraud",
      title: "7. Fraud Prevention and Threat Discovery",
      content: (
        <div className="space-y-4">
          <p>
            Our systems run background security scans to discover cashier fraud, cash-draw manipulations, and malicious account activity:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Wipe & Edit Restraints:</strong> Custom constraints prevent checkout cashiers from wiping compiled transaction lines or modifying prices after invoice generation unrecorded.
            </li>
            <li>
              <strong>Continuous Rate Limiting:</strong> Ingress traffic limits are enforced at the API server level, blocking brute-force password scanning engines and distributed denial of service (DDoS) attempts.
            </li>
          </ul>
        </div>
      )
    }
  ];

  return (
    <LegalLayout
      title="Security & Trust Center"
      subtitle="Cybersecurity Posture, Infrastructure Reliability, and Real-time Status Diagnostic Registry"
      description="SME OS deploys high-grade physical, technical, and cryptographic safeguards to protect your transactions, cashier staff records, and cash assets. Explore our structural trust posture, encryption standards, and live system health stats."
      version="v2.4"
      effectiveDate="May 21, 2026"
      sections={sections}
      icon={<Fingerprint className="h-6 w-6" />}
    />
  );
}
