import type { Metadata } from "next";
import {
  LegalDocument,
  type LegalSection,
} from "@/components/legal/legal-document";
import { LEGAL_LAST_UPDATED, SITE_URL, SUPPORT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that apply when using the LifeOS application.",
  alternates: { canonical: "/terms" },
  openGraph: {
    title: "Terms of Service · LifeOS",
    description: "The terms that apply when using LifeOS.",
    url: SITE_URL + "/terms",
    type: "website",
  },
};

const sections: LegalSection[] = [
  {
    id: "acceptance",
    title: "Acceptance of Terms",
    content: (
      <p>
        These Terms of Service govern your access to and use of LifeOS. By
        accessing or using LifeOS, you agree to these Terms. If you do not
        agree, do not use the application. The Privacy Policy also explains how
        LifeOS handles personal information.
      </p>
    ),
  },
  {
    id: "description",
    title: "Description of LifeOS",
    content: (
      <p>
        LifeOS is a personal productivity and dashboard application. It may help
        you manage tasks, monthly plans, goals, subscriptions, internal
        notifications, calendar information, and statistics from social accounts
        you choose to connect. Features may be added, changed, or removed as the
        application develops.
      </p>
    ),
  },
  {
    id: "eligibility",
    title: "Eligibility",
    content: (
      <p>
        You must be legally able to agree to these Terms and meet the minimum
        age required to use LifeOS and any connected third-party platform in
        your location. If you use LifeOS on behalf of another person or entity,
        you confirm that you have authority to accept these Terms for them.
      </p>
    ),
  },
  {
    id: "accounts",
    title: "User accounts and authentication",
    content: (
      <p>
        You are responsible for providing accurate account information,
        protecting your login methods and devices, and promptly reporting
        suspected unauthorized access. Authentication may be provided through
        Supabase or another identified provider. You may not share access in a
        way that compromises your account or another person&apos;s information.
      </p>
    ),
  },
  {
    id: "connected-accounts",
    title: "Connected third-party accounts",
    content: (
      <p>
        Connecting YouTube, Instagram, or TikTok is optional. If you connect an
        account, you confirm that it belongs to you or that you are authorized
        to access it. LifeOS uses the connection to retrieve the account
        information and statistics covered by the permissions you approve.
      </p>
    ),
  },
  {
    id: "oauth",
    title: "OAuth authorization",
    content: (
      <p>
        Third-party access is authorized through each platform&apos;s own OAuth,
        login, or consent system. The permissions shown by that platform define
        the access you grant. You can withdraw authorization from the relevant
        platform&apos;s account settings. Withdrawing access may stop connected
        features from working and does not necessarily delete information
        already stored in LifeOS.
      </p>
    ),
  },
  {
    id: "responsibilities",
    title: "User responsibilities",
    content: (
      <>
        <p>You are responsible for:</p>
        <ul>
          <li>the information you add to LifeOS;</li>
          <li>keeping your account and connected-account access secure;</li>
          <li>using LifeOS in accordance with applicable law;</li>
          <li>reviewing important dates, amounts, and statistics; and</li>
          <li>
            maintaining any independent records you need for financial, legal,
            health, or business decisions.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "acceptable-use",
    title: "Acceptable use",
    content: (
      <>
        <p>You must not:</p>
        <ul>
          <li>access or attempt to access data that does not belong to you;</li>
          <li>
            circumvent authentication, authorization, or security controls;
          </li>
          <li>use LifeOS to violate law or another person&apos;s rights;</li>
          <li>
            interfere with the application, its infrastructure, or connected
            services;
          </li>
          <li>introduce malware or conduct abusive automated requests; or</li>
          <li>
            misrepresent your identity or your authority over a connected
            account.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "third-party-services",
    title: "Third-party services",
    content: (
      <p>
        LifeOS may rely on YouTube and Google, Meta and Instagram, TikTok,
        Supabase, hosting providers, and other third-party services. Their own
        terms and policies also apply when you use them. LifeOS does not control
        their availability, security, decisions, interfaces, permissions, or
        behavior and is not responsible for independent changes they make.
      </p>
    ),
  },
  {
    id: "availability",
    title: "Availability and service changes",
    content: (
      <p>
        LifeOS may change as the application develops. Features may be updated,
        limited, suspended, or discontinued, and access may occasionally be
        interrupted for maintenance, technical problems, third-party changes, or
        reasons outside LifeOS&apos;s control. Continuous or error-free
        availability is not guaranteed.
      </p>
    ),
  },
  {
    id: "data-accuracy",
    title: "Data accuracy",
    content: (
      <p>
        Dashboard information can depend on user input and third-party APIs.
        Statistics retrieved from YouTube, Instagram, TikTok, or another service
        may be delayed, rounded, unavailable, incomplete, or different from the
        numbers shown directly by that platform. Subscription dates, prices, and
        other manually entered information are only as accurate as the data
        provided. You should verify important information at its original
        source.
      </p>
    ),
  },
  {
    id: "intellectual-property",
    title: "Intellectual property",
    content: (
      <p>
        LifeOS and its original interface, design, text, software, and branding
        are protected by applicable intellectual-property laws. These Terms give
        you a limited, personal, non-exclusive, non-transferable right to use
        the application as provided. You retain any rights you have in
        information you enter into LifeOS. Third-party names, marks, and content
        remain the property of their respective owners.
      </p>
    ),
  },
  {
    id: "warranties",
    title: "Disclaimer of warranties",
    content: (
      <p>
        To the extent permitted by law, LifeOS is provided on an “as is” and “as
        available” basis. No warranty is made that the application will always
        be available, meet every requirement, or contain no errors. LifeOS is a
        personal organization tool and does not provide financial, legal,
        medical, tax, or other professional advice.
      </p>
    ),
  },
  {
    id: "liability",
    title: "Limitation of liability",
    content: (
      <p>
        To the maximum extent permitted by applicable law, LifeOS and its
        operator will not be liable for indirect, incidental, special,
        consequential, or punitive losses arising from your use of or inability
        to use the application, reliance on dashboard information, loss of data,
        or the acts or availability of third-party services. Nothing in these
        Terms excludes liability that cannot legally be excluded.
      </p>
    ),
  },
  {
    id: "termination",
    title: "Account or data termination and removal",
    content: (
      <p>
        Access may be limited or ended when necessary to protect LifeOS, its
        users, connected services, or legal compliance, including in response to
        misuse of the application. You may stop using LifeOS or disconnect a
        third-party account at any time. Requests to remove stored account or
        connected-account data can be sent to the contact address below and may
        be subject to reasonable identity verification and limited backup,
        security, or legal retention.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to these Terms",
    content: (
      <p>
        These Terms may be updated as LifeOS changes. The updated version will
        be posted here with a revised “Last updated” date. If a change is
        material, additional notice may be provided inside LifeOS when
        appropriate. Your continued use after updated Terms take effect means
        you accept them.
      </p>
    ),
  },
  {
    id: "governing-terms",
    title: "Governing terms",
    content: (
      <p>
        These Terms are governed by the laws applicable to the LifeOS operator,
        without overriding any mandatory consumer rights that apply where you
        live. Before beginning formal proceedings, you agree to contact LifeOS
        and make a reasonable effort to resolve the concern directly. If any
        provision is unenforceable, the remaining provisions will continue to
        apply.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact information",
    content: (
      <p>
        For questions about these Terms, account access, or data removal,
        contact: <a href={"mailto:" + SUPPORT_EMAIL}>{SUPPORT_EMAIL}</a>.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalDocument
      eyebrow="The terms for your personal space"
      title="Terms of Service"
      lastUpdated={LEGAL_LAST_UPDATED}
      introduction="These terms set out the practical rules for using LifeOS and connecting services you choose to bring into your dashboard."
      sections={sections}
    />
  );
}
