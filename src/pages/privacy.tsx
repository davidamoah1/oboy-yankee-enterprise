import React from "react";
import { LegalLayout, LegalSection } from "@/components/legal-layout";
import { ShieldCheck } from "lucide-react";

export default function PrivacyPage() {
  const sections: LegalSection[] = [
    {
      id: "collection",
      title: "1. Data Collection Practices",
      content: (
        <div className="space-y-4">
          <p>
            Nexus Business Systems Limited ("we", "us", "our") takes the security and privacy of our customers and their business records seriously. This Privacy Policy details the types of personal and corporate data we collect through <strong>SME OS (formerly OBOY YANKEE ENTERPRISE)</strong>, how we process and store it, and the strict controls in place to protect your business intelligence.
          </p>
          <p>
            We collect data in three distinct categories when you interact with our platform:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Account Registration Data:</strong> Complete name, business physical address, email, phone number, VAT/TIN numbers (where applicable), and password credentials.
            </li>
            <li>
              <strong>Operational Transactional Data:</strong> Product SKUs, price matrix files, stock numbers, customer names list, order items, invoice records, mobile money transaction references, and supplier details that you input into the POS console.
            </li>
            <li>
              <strong>Automatic Device and Telemetry Logs:</strong> Static location markers (IP address mapping), web browsers, platform interaction duration, screen layouts accessed, and performance latency indicators.
            </li>
          </ul>
        </div>
      )
    },
    {
      id: "handling",
      title: "2. Customer Information Handling",
      content: (
        <div className="space-y-4">
          <p>
            The transactional data and checkout records you record inside your tenant console remain your exclusive business asset. SME OS processes this customer information solely as a <strong>Data Processor</strong> under your direct mandate.
          </p>
          <p>
            We will never sell, lease, transfer, or license your consumer transaction histories, inventory prices, or customer phone records to third-party advertisers, market intelligence brokers, or competitor outlets. We access your database records only under the following strictly defined scenarios:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>To resolve a concrete administrative support ticket initiated by your systems administrator.</li>
            <li>To compile anonymous, highly aggregated regional business growth stats (e.g., general macro inflation trends across retail) where all identity markers are completely scrubbed.</li>
            <li>To prevent systemic fraud or platform abuse within the POS network.</li>
          </ul>
        </div>
      )
    },
    {
      id: "payment",
      title: "3. Payment Data Handling",
      content: (
        <div className="space-y-4">
          <p>
            SME OS enforces strict compartmentalization protocols for all financial payment information. Credit card credentials, CVVs, and mobile banking PINs are handled under the <strong>Payment Card Industry Data Security Standard (PCI-DSS)</strong>.
          </p>
          <p>
            Our payment collection flows are powered by registered, Bank of Ghana-authorized gateway services which utilize SSL encryption and military-grade tokenization:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Billing and Checkouts:</strong> Subscription bills, billing profiles, and checkout requests are channeled through <strong>Paystack</strong>. Your private banking strings cannot be read or retained by our cloud database.
            </li>
            <li>
              <strong>Momo Cash flow:</strong> For on-premise Mobile Money receiving (MTN Momo, Telecel, AT Money), we only store the alphanumeric transaction reference codes returned by the gateway. Merchant settlement accounts are strictly isolated and secured.
            </li>
          </ul>
        </div>
      )
    },
    {
      id: "cookies",
      title: "4. Cookies & Analytics",
      content: (
        <div className="space-y-4">
          <p>
            We use temporary, secure first-party cookies to manage session tokens, protect against Cross-Site Request Forgery (CSRF) vulnerabilities, and preserve your system theme parameters.
          </p>
          <p>
            For system diagnostics, checkout funnel tracking, and application optimization, we may load light aggregate telemetry engines. These analytics strictly log client actions (clicks, latency, menu switches) and do not retain transactional records or business customer balances. For complete details, consult our <strong className="text-primary hover:underline cursor-pointer">Cookie Policy</strong>.
          </p>
        </div>
      )
    },
    {
      id: "integrations",
      title: "5. Third-Party Integrations",
      content: (
        <div className="space-y-4">
          <p>
            To deliver an integrated, enterprise-class operation, SME OS securely interfaces with selective technical partner systems:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Supabase Cloud Platform:</strong> Utilized for highly optimized cloud hosting, relational DB clustering, identity authentication token storage, and column-level encryption keys.
            </li>
            <li>
              <strong>AI Business Intelligence:</strong> Our predictive reporting modules utilize isolated <strong>Gemini API</strong> instances. Customer details are completely stripped (anonymized) before data blocks are pushed for intelligence synthesis. No AI model is trained on your private inventory files.
            </li>
            <li>
              <strong>WhatsApp Business & SMS Gateways:</strong> Used to dispatch real-time digital receipts, invoice alerts, and daily checkout tallies to your customers. Phone numbers pushed through these networks are used strictly for document transmission and are never recycled for marketing.
            </li>
          </ul>
        </div>
      )
    },
    {
      id: "retention",
      title: "6. Data Retention Policies",
      content: (
        <div className="space-y-4">
          <p>
            We retain your corporate account metadata and POS transaction summaries for as long as your subscribed tenant console remains active.
          </p>
          <p>
            Upon subscription termination or account cancellation, your records are held in a secure, dormant "soft-delete" partition for ninety (90) calendar days to prevent catastrophic data loss from accidental cancellation. After this grace period, a complete, unrecoverable programmatic scrub (hard delete) of your database containers is initiated, except where we are legally required under the Ghana Revenue Authority (GRA) tax laws or corporate regulations to retain trade transaction logs for audit purposes.
          </p>
        </div>
      )
    },
    {
      id: "rights",
      title: "7. User & Consumer Rights",
      content: (
        <div className="space-y-4">
          <p>
            Under the provisions of the <strong>Ghana Data Protection Act, 2012 (Act 843)</strong> and the **General Data Protection Regulation (GDPR)**, you and your business clients enjoy comprehensive privacy entitlements:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Right to Access:</strong> The right to export a complete CSV/JSON file containing all stored transactions, products, and customer profiles.
            </li>
            <li>
              <strong>Right to Rectification:</strong> The right to update incorrect customer files, cashier profiles, and pricing spreadsheets at any time.
            </li>
            <li>
              <strong>Right to Erasure (The Right to be Forgotten):</strong> The right to request comprehensive deletion of your business's consumer marketing registries.
            </li>
            <li>
              <strong>Right to Restriction:</strong> The right to temporarily freeze database access, revoke API keys, or disable cashiers immediately via the settings board.
            </li>
          </ul>
        </div>
      )
    },
    {
      id: "security",
      title: "8. Enterprise Security Practices",
      content: (
        <div className="space-y-4">
          <p>
            We implement advanced, military-inspired structural safeguards. All incoming and outgoing data blocks are secured via <strong>Transport Layer Security (TLS 1.3)</strong>. Persistent server files use AES-256 storage level encryption.
          </p>
          <p>
            Our infrastructure maintains isolated private schema grids for every tenant (Virtual Isolation), meaning cashiers of Tenant A can never query or intercept datasets belonging to Tenant B. Detailed architectural parameters can be reviewed on our dedicated <strong className="text-primary hover:underline cursor-pointer">Security & Trust Center</strong>.
          </p>
        </div>
      )
    },
    {
      id: "communications",
      title: "9. Communication Preferences",
      content: (
        <div className="space-y-4">
          <p>
            We dispatch critical administrative emails, support responses, policy changes and transaction receipts automatically. These system channels are operational defaults and cannot be silenced, as they guard account safety.
          </p>
          <p>
            You can choose to opt-out of newsletter alerts, analytics digests, or executive growth tips at any time by clicking the "Unsubscribe" footer link in any marketing email, or disabling the "Weekly Digest" switch in your Account Settings panel.
          </p>
        </div>
      )
    },
    {
      id: "transfers",
      title: "10. International Data Transfers",
      content: (
        <div className="space-y-4">
          <p>
            SME OS serves businesses globally. While your corporate physical nodes operate locally in the West African sub-region, raw databases, secure image files and backup snapshots are cached and mirrored across secure cloud regions managed by our infrastructure partners (located in Europe and Africa).
          </p>
          <p>
            We verify that our data transit and replication configurations maintain compliance with international cross-border data transfer laws, utilizing standard contract clauses ensuring equivalent encryption protections across all server nodes.
          </p>
        </div>
      )
    }
  ];

  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle="Corporate Transparency, Consent Standards, and Consumer Protection Ledger"
      description="This document outlines our commitment to protecting your core retail transaction histories, enterprise logins, and financial analytics. It explains how SME OS manages your data footprint in absolute compliance with global guidelines and the Ghana Data Protection Act 2012 (Act 843)."
      version="v2.5"
      effectiveDate="May 21, 2026"
      sections={sections}
      icon={<ShieldCheck className="h-6 w-6" />}
    />
  );
}
