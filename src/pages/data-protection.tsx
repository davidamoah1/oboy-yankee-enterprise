import React from "react";
import { LegalLayout, LegalSection } from "@/components/legal-layout";
import { Database } from "lucide-react";

export default function DataProtectionPage() {
  const sections: LegalSection[] = [
    {
      id: "standards",
      title: "1. Encryption Standards",
      content: (
        <div className="space-y-4">
          <p>
            Nexus Business Systems Limited implements a comprehensive, "defense-in-depth" cryptographic blueprint across the <strong>SME OS (formerly OBOY YANKEE ENTERPRISE)</strong> ecosystem. We protect digital assets from interception, spoofing, and unauthorized reading.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Data in Transit:</strong> All data packets departing from on-premise POS registers, web browsers, or mobile applications are encrypted using <strong>TLS 1.3</strong> (with fallback support limited to TLS 1.2 using modern cipher suites: ECDHE-RSA-AES128-GCM-SHA256 or equivalent).
            </li>
            <li>
              <strong>Data at Rest:</strong> Cloud databases, persistent block devices, configuration metrics, and static asset objects are encrypted utilizing <strong>AES-256 (Advanced Encryption Standard with a 256-bit key length)</strong>. Cryptographic keys are rotated automatically via Google Cloud KMS and Supabase internal key rings.
            </li>
            <li>
              <strong>Sensitive Column Hash:</strong> Highly confidential records such as employee passwords, API integration keys, and billing hashes are strictly hashed using <strong>bcrypt</strong> with an adaptive work factor or salted SHA-256 strings.
            </li>
          </ul>
        </div>
      )
    },
    {
      id: "access",
      title: "2. Rigid Access Controls",
      content: (
        <div className="space-y-4">
          <p>
            The Company enforces the <strong>Principle of Least Privilege (PoLP)</strong> across all internal divisions. Internal engineers, support specialists, base administrators, and business auditors are completely blocked from reading your customer accounts, cash draw tallies, or billing logs by default.
          </p>
          <p>
            We deploy strict physical and logical access controls:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Any internal engineering interaction with production clusters is continuously tracked and requires multi-factor authentication (MFA) accompanied by an active justification ticket.</li>
            <li>Database schema upgrades are automated, peer-reviewed, and executed through secure deployment runners. Direct ad-hoc SQL modifications on production tables are strictly disabled.</li>
          </ul>
        </div>
      )
    },
    {
      id: "rbac",
      title: "3. Role-Based Permissions (RBAC)",
      content: (
        <div className="space-y-4">
          <p>
            The Platform incorporates native, highly granular <strong>Role-Based Access Control (RBAC)</strong> models to empower tenant owners with complete authority over internal staff authorization profiles:
          </p>
          <div className="overflow-x-auto my-6 border border-border/50 rounded-2xl">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="bg-muted border-b border-border/50 text-[10px] font-black uppercase tracking-wider text-primary">
                  <th className="p-4">User Role</th>
                  <th className="p-4">POS Checkout</th>
                  <th className="p-4">Inventory Edit</th>
                  <th className="p-4">Financial Reports</th>
                  <th className="p-4">Account Settings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30 font-medium">
                <tr>
                  <td className="p-4 font-black">Tenant Owner</td>
                  <td className="p-4 text-emerald-500">FULL</td>
                  <td className="p-4 text-emerald-500">FULL</td>
                  <td className="p-4 text-emerald-500">FULL</td>
                  <td className="p-4 text-emerald-500">FULL</td>
                </tr>
                <tr>
                  <td className="p-4 font-black">Store Manager</td>
                  <td className="p-4 text-emerald-500">FULL</td>
                  <td className="p-4 text-emerald-500">FULL</td>
                  <td className="p-4 text-emerald-500">FULL</td>
                  <td className="p-4 text-red-500">BLOCKED</td>
                </tr>
                <tr>
                  <td className="p-4 font-black">Accountant</td>
                  <td className="p-4 text-red-500">BLOCKED</td>
                  <td className="p-4 text-muted-foreground/50">READ-ONLY</td>
                  <td className="p-4 text-emerald-500">FULL</td>
                  <td className="p-4 text-red-500">BLOCKED</td>
                </tr>
                <tr>
                  <td className="p-4 font-black">Cashier</td>
                  <td className="p-4 text-emerald-500">FULL</td>
                  <td className="p-4 text-red-500">BLOCKED</td>
                  <td className="p-4 text-red-500">BLOCKED</td>
                  <td className="p-4 text-red-500">BLOCKED</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            By designing proper assignment configurations, you guarantee that checkout clerks cannot manipulate margins, wipe historically completed receipts, or download comprehensive customer address rosters.
          </p>
        </div>
      )
    },
    {
      id: "backups",
      title: "4. Multi-Layer Cloud Backups",
      content: (
        <div className="space-y-4">
          <p>
            To insure against system failures, physical network breakdowns, or human databases accidents, SME OS runs a multi-layered, geographical backup system:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Continuous WAL Archiving:</strong> Write-Ahead Logging (WAL) captures every transaction, catalog insertion, and payment log within seconds, allowing point-in-time recovery (PITR) to any second of operation over the preceding 14 days.
            </li>
            <li>
              <strong>Daily Snapshots:</strong> Full database structural backups are compiled every 24 hours at 01:00 UTC and replicated across secondary, isolated cloud compartments located in separate data centers.
            </li>
            <li>
              <strong>Disaster Recovery Testing:</strong> Our security group executes simulated environment recovery trials quarterly to verify backup file integrity, targeting a <strong>Recovery Point Objective (RPO) of under 10 minutes</strong> and a <strong>Recovery Time Objective (RTO) of under 2 hours</strong>.
            </li>
          </ul>
        </div>
      )
    },
    {
      id: "breach",
      title: "5. Incident and Breach Response",
      content: (
        <div className="space-y-4">
          <p>
            In compliance with **Section 41 of the Ghana Data Protection Act 2012 (Act 843)**, the Company maintains an active, rigid Incident Response Framework. 
          </p>
          <p>
            In the highly unlikely event of a suspected database compromise or logical bypass:
          </p>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Our security monitors isolate the target database partition within 15 minutes of anomaly alert to neutralize further unauthorized transit.</li>
            <li>A comprehensive digital forensics inquiry is launched to map exactly what files or accounts were exposed.</li>
            <li>We notify the <strong>Ghana Data Protection Commission (DPC)</strong> within seventy-two (72) hours of confirming the breach.</li>
            <li>We issue detailed, transparent security disclosures directly to all affected Tenant Administrators via validated communication lines, specifying what actions are required (e.g., API rotations or password resets).</li>
          </ol>
        </div>
      )
    },
    {
      id: "infrastructure",
      title: "6. Infrastructure Protections",
      content: (
        <div className="space-y-4">
          <p>
            Our host environments are deployed across tier-IV enterprise cloud architectures (AWS/Supabase GCP networks) which are guarded by physically isolated barriers, biometric scanning layers, and 24/7 security control towers.
          </p>
          <p>
            On the virtual level, we employ distributed firewalls, adaptive <strong>DDOS mitigation services (Cloudflare Enterprise Shield)</strong>, and secure virtual private clouds (VPC) which block public internet traffic from addressing our core server ports, except through our secure nginx ingress proxy layer.
          </p>
        </div>
      )
    },
    {
      id: "audits",
      title: "7. Extensive Audit Logging",
      content: (
        <div className="space-y-4">
          <p>
            The Platform registers an immutable audit ledger documenting actions. Every system action is cryptographically recorded with a permanent timestamp, client IP, target record ID, and user profile tag.
          </p>
          <p>
            These audit lines record:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Login attempts, password modifications, token refreshes, and IP location flags.</li>
            <li>Receipt voids, manager approvals, item discount overrides, and cash register open/close handshakes.</li>
            <li>Security settings updates, API key generations, and user role overrides.</li>
          </ul>
          <p>
            The audit ledger is highly robust, preventing cashiers from hiding system transactions or altering historical checkout catalogs unrecorded.
          </p>
        </div>
      )
    },
    {
      id: "standards-ref",
      title: "8. Regulatory Alignment & Compliance Certification",
      content: (
        <div className="space-y-4">
          <p>
            This Data Protection Policy is designed to comply with the most advanced regional and international legal structures:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Ghana Data Protection Act, 2012 (Act 843):</strong> Strictly respecting the registry obligations, notification protocols, and individual consent rights enforced by the Ghana DPC.
            </li>
            <li>
              <strong>GDPR (General Data Protection Regulation):</strong> Providing equivalent privacy, data portability, and deletion pathways to all clients of international trade.
            </li>
          </ul>
        </div>
      )
    }
  ];

  return (
    <LegalLayout
      title="Data Protection Policy"
      subtitle="Cryptographic Architecture, Access Controls, and Incident Response Framework"
      description="This engineering directive details the strict data protection protocols, database partition schemas, and physical layers we deploy to prevent breach vulnerabilities and keep your business secure."
      version="v1.9"
      effectiveDate="May 21, 2026"
      sections={sections}
      icon={<Database className="h-6 w-6" />}
    />
  );
}
