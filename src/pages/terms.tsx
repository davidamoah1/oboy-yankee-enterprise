import React from "react";
import { LegalLayout, LegalSection } from "@/components/legal-layout";
import { FileText } from "lucide-react";

export default function TermsPage() {
  const sections: LegalSection[] = [
    {
      id: "overview",
      title: "1. Platform Overview",
      content: (
        <div className="space-y-4">
          <p>
            Welcome to <strong>SME OS (formerly OBOY YANKEE ENTERPRISE)</strong>, an enterprise-grade software-as-a-service (SaaS) business intelligence platform, cloud POS system, and transaction management suite designed specifically for African enterprises, multi-branch corporations, and retail businesses. The Platform is owned, operated, and maintained by <strong>Nexus Business Systems Limited</strong> (hereinafter referred to as "the Company", "we", "us", or "our").
          </p>
          <p>
            These Terms & Conditions ("Terms", "Agreement") constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("the Customer", "the User", "you") and Nexus Business Systems Limited, concerning your access to and use of the platform and any associated services, websites, integrations, and mobile applications.
          </p>
          <p>
            By registering for an account, subscribing to any service plans, or clicking to accept this Agreement during registration, you explicitly acknowledge that you have read, understood, and agreed to be bound by all of these Terms, our Privacy Policy, and our Data Protection policy. If you do not accept this Agreement in its entirety, you are strictly prohibited from utilizing the Platform or any associated services.
          </p>
        </div>
      )
    },
    {
      id: "accounts",
      title: "2. Account Responsibilities",
      content: (
        <div className="space-y-4">
          <p>
            To utilize the platform, you must create a Principal User Account (Owner Account) and register your registered business. You represent and warrant that:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>All registration information you submit is completely accurate, current, truthful, and complete.</li>
            <li>You will maintain the accuracy of such information and promptly update client details as necessary.</li>
            <li>You possess the legal authority, licenses, and local corporate power to bind your company or organization to this Agreement.</li>
            <li>Your use of the Platform complies with all applicable microfinance, taxation, corporate registration, and business licensing laws of the Republic of Ghana or other local operating jurisdictions.</li>
          </ul>
          <p>
            You are entirely responsible for safeguarding your authentication credentials (passwords, JWT tokens, sessions) and for all activities, actions, and transactions occurring under your tenant node. Sharing of login credentials across multiple individuals is strictly prohibited; you must provision discrete user credentials for your staff, managers, and accountants utilizing our Role-Based Access Control (RBAC) mechanisms. You must notify us immediately of any unauthorized breach of security or compromise of client accounts.
          </p>
        </div>
      )
    },
    {
      id: "billing",
      title: "3. Subscriptions & Billing",
      content: (
        <div className="space-y-4">
          <p>
            SME OS is billed on a subscription basis ("Billing Cycles") in advance. You may choose between Monthly or Annual billing cycles. Subscriptions automatically renew at the end of each Billing Cycle under identical pricing conditions unless explicitly cancelled by the Customer or suspended by the Company.
          </p>
          <p>
            All subscription prices are denominated in Ghana Cedis (GHS) or United States Dollars (USD) as selected during billing. You are responsible for any applicable local taxes, levies, or duties, including Communication Service Tax (CST), Value Added Tax (VAT), or COVID-19 Health Recovery Levy, as assessed by the Ghana Revenue Authority (GRA) or relevant sovereign authority.
          </p>
          <p>
            You agree to maintain a valid, liquid payment method linked to your account. Failure of automatic renewal payments will trigger a standard grace period, after which the client tenant container will be marked as "past_due" and automatically limited from issuing POS receipts or editing system inventories.
          </p>
        </div>
      )
    },
    {
      id: "processing",
      title: "4. Payment Processing",
      content: (
        <div className="space-y-4">
          <p>
            Payment processing for SME OS subscriptions, digital add-ons, and integrated client checkouts is handled securely through our PCI-DSS compliant payment processing partners, primarily <strong>Paystack</strong> (operating under authorization from the Bank of Ghana) and associated direct Mobile Money networks (MTN Momo, Telecel Cash, AT Money).
          </p>
          <p>
            By entering credit card details or Mobile Money authentication parameters, you authorize our payment processor to bill all subscription charges, transaction fees, and renewal fees to your designated payment account. Your payment metadata is handled under rigorous cryptographic tokenization standards and is never stored on the Company's persistent databases.
          </p>
        </div>
      )
    },
    {
      id: "refunds",
      title: "5. Refunds & Cancellations",
      content: (
        <div className="space-y-4">
          <p>
            Subscriptions can be cancelled at any time through the Tenant Settings panel in the System Console. Upon cancellation, your account will remain active and licensed to operate until the end of your prepaid current Billing Cycle, at which time the account status shifts to "expired".
          </p>
          <p>
            Due to the direct server resources and cloud compute infrastructure allocated upon subscription initialization, all subscription payments are strictly non-refundable. We do not provide prorated refunds, subscription partial-term cancellations, or credits for partial months of service or unused feature quotas.
          </p>
        </div>
      )
    },
    {
      id: "prohibited",
      title: "6. Prohibited Activities",
      content: (
        <div className="space-y-4">
          <p>
            You agree not to engage in any of the following restricted actions, which will trigger immediate, permanent account termination without prior notice:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Utilizing the POS checkout networks or inventories to distribute, sell, or manage illegal goods, unauthorized financial derivatives, unregistered pharmaceutical items, or smuggled assets.</li>
            <li>Attempting to bypass public rate limiters, reverse-engineering our compiled React codebases, executing automated DDoS runs, or scanning SME OS APIs for architectural vulnerabilities.</li>
            <li>Uploading malware, scripts, malicious schemas, or binary assets designed to corrupt or exploit our Supabase cloud infrastructure.</li>
            <li>Forging transaction documents, receipts, system audit trails, or simulating counterfeit sales logs.</li>
          </ul>
        </div>
      )
    },
    {
      id: "ip",
      title: "7. Intellectual Property Rights",
      content: (
        <div className="space-y-4">
          <p>
            The Platform, including all core software architecture, source code, UI elements, layouts, styling frameworks, text elements, customized icons, vector imagery, custom logos, database models, and intellectual property (collectively, "Company IP"), is the exclusive property of Nexus Business Systems Limited or its licensors.
          </p>
          <p>
            Subject to continuous subscription compliance, the Company grants you a limited, non-assignable, non-transferable, revocable license to access the customer interface. You are strictly forbidden from copying, cloning, modifying, re-selling, or redistributing Company IP under any circumstances.
          </p>
        </div>
      )
    },
    {
      id: "availability",
      title: "8. Service Availability & Uptime SLA",
      content: (
        <div className="space-y-4">
          <p>
            We strive to provide premium enterprise service reliability. The Company targets a <strong>99.9% platform availability index</strong> (exclusive of scheduled maintenance, system architecture upgrades, or force majeure events such as international fiber-optic cable cuts).
          </p>
          <p>
            Service maintenance is typically scheduled during low-traffic periods (11:00 PM to 3:00 AM Greenwich Mean Time) and is announced in advance on the Support Dashboard. We do not assume liability for temporary service latency or data transit disruptions caused by local internet service providers, power outages, local network equipment, or third-party infrastructure.
          </p>
        </div>
      )
    },
    {
      id: "liability",
      title: "9. Limitation of Liability",
      content: (
        <div className="space-y-4">
          <p>
            TO THE MAXIMUM EXTENT PERMITTED UNDER APPLICABLE LAW, IN NO EVENT SHALL NEXUS BUSINESS SYSTEMS LIMITED, ITS OFFICERS, DIRECTORS, EMPLOYEES, OR LICENSORS BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY INDIRECT, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR INCIDENTAL DAMAGES. THIS INCLUDES LOSS OF PROFITS, LOSS OF TRANSACTION REVENUE, INVENTORY SHRINKAGE, UNTRACKED CASHIER THEFT, REGULATORY FINES, OR COMPROMISE OF BUSINESS OPERATIONS ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF OR INABILITY TO USE THE PLATFORM.
          </p>
          <p>
            OUR LIABILITY TO YOU FOR ANY REASON WHATEVER, REGARDLESS OF THE NATURE OF THE CLAIM OR THE FORM OF ACTION, WILL AT ALL TIMES BE LIMITED TO THE TOTAL AMOUNT PAID, IF ANY, BY THE CUSTOMER TO THE COMPANY DURING THE THREE (3) MONTH PERIOD PRECEDING THE CLAIM'S MATURITY.
          </p>
        </div>
      )
    },
    {
      id: "termination",
      title: "10. Account Termination",
      content: (
        <div className="space-y-4">
          <p>
            This Agreement remains in force as long as you maintain your account on the Platform. We reserve the absolute, unilateral right to suspend, terminate, or delete your account, business credentials, and access keys if we discover a material breach of this Agreement, fraud, or non-payment of subscription fees.
          </p>
          <p>
            Upon account termination, your right to access the cloud console and POS terminal ceases instantly. Subject to local regulatory requirements for trade data retention, we will decommission your tenant database nodes and scrub all user sessions in accordance with our Data Protection Policy.
          </p>
        </div>
      )
    },
    {
      id: "disputes",
      title: "11. Dispute Resolution",
      content: (
        <div className="space-y-4">
          <p>
            Any dispute, controversy, or claim arising out of this Agreement, including its formulation, execution, or breach, shall first be referred to amicable informal negotiation between senior executives of the Customer and the Company.
          </p>
          <p>
            If informal negotiations do not yield a resolution within thirty (30) calendar days, the dispute shall be referred to and finally resolved by binding arbitration in accordance with the provisions of the <strong>Alternative Dispute Resolution Act, 2010 (Act 798)</strong> of the Republic of Ghana. The place of arbitration shall be Accra, Ghana, and the proceedings shall be conducted in English by a single arbitrator appointed by the Ghana ADR Hub or comparable neutral body.
          </p>
        </div>
      )
    },
    {
      id: "governing-law",
      title: "12. Governing Law",
      content: (
        <div className="space-y-4">
          <p>
            This Agreement, including all associated policies, security structures, and digital handshakes, shall be governed by, interpreted, and enforced in accordance with the laws of the <strong>Republic of Ghana</strong>, without regard to its conflict of law principles.
          </p>
        </div>
      )
    },
    {
      id: "contact",
      title: "13. Contact Information",
      content: (
        <div className="space-y-4">
          <p>
            For any statutory inquiries, formal contract clarifications, regulatory audits, or legal communications regarding this Agreement, please direct your formal physical or digital letters to:
          </p>
          <div className="p-6 bg-muted/60 border border-border/60 rounded-2xl font-sans text-xs sm:text-sm space-y-2">
            <p className="font-black text-foreground">NEXUS BUSINESS SYSTEMS LIMITED</p>
            <p><strong>Legal Compliance & Counsel Desk</strong></p>
            <p>12 Giffard Road, Cantonments, Accra</p>
            <p>Greater Accra Region, Republic of Ghana</p>
            <p>Email: <a href="mailto:legal@nexuspos.com" className="text-primary hover:underline">legal@nexuspos.com</a> / <a href="mailto:compliance@nexuspos.com" className="text-primary hover:underline">compliance@nexuspos.com</a></p>
          </div>
        </div>
      )
    }
  ];

  return (
    <LegalLayout
      title="Terms & Conditions"
      subtitle="Standard Platform Agreement and Master Service Level Rules"
      description="These terms govern your subscription to the SME OS platform. They define your legal entitlements, data parameters, payment protocols, liabilities, and the Accra arbitration framework. We advice that you read this document carefully before deploying OBOY YANKEE ENTERPRISE across your retail networks."
      version="v2.6a"
      effectiveDate="May 21, 2026"
      sections={sections}
      icon={<FileText className="h-6 w-6" />}
    />
  );
}
