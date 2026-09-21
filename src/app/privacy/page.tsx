import type { Metadata } from "next";
import {
  LegalDocument,
  type LegalSection,
} from "@/components/legal/legal-document";
import { LEGAL_LAST_UPDATED, SITE_URL, SUPPORT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How LifeOS collects, uses, stores, and protects personal and connected-account information.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Privacy Policy · LifeOS",
    description:
      "How LifeOS handles personal and connected-account information.",
    url: SITE_URL + "/privacy",
    type: "website",
  },
};

const sections: LegalSection[] = [
  {
    id: "introduction",
    title: "Introduction",
    content: (
      <p>
        This Privacy Policy explains how LifeOS collects, uses, stores, and
        protects information when you use the application. LifeOS is primarily a
        personal productivity dashboard. It helps you organize information about
        your tasks, goals, subscriptions, reminders, and connected social
        accounts.
      </p>
    ),
  },
  {
    id: "information-collected",
    title: "Information LifeOS collects",
    content: (
      <>
        <p>The information LifeOS may collect falls into three broad groups:</p>
        <ul>
          <li>information you enter directly into the application;</li>
          <li>account and authentication information; and</li>
          <li>
            information returned by a third-party service after you choose to
            connect that service.
          </li>
        </ul>
        <p>
          The exact information available depends on the features you use and
          the permissions you approve.
        </p>
      </>
    ),
  },
  {
    id: "information-you-enter",
    title: "Information you enter directly",
    content: (
      <p>
        LifeOS may store information you create or provide, including daily and
        monthly tasks, goals and progress, subscription details, inbox items,
        preferences, and similar dashboard content. You control what you enter
        and should avoid adding information you do not want stored in your
        account.
      </p>
    ),
  },
  {
    id: "authentication",
    title: "Authentication information",
    content: (
      <p>
        When account access is enabled, LifeOS may process information needed to
        create and secure your account, such as your email address, user ID,
        authentication session, and related account metadata. Authentication is
        provided through Supabase. Password handling and supported login methods
        follow the authentication flow presented when you sign in.
      </p>
    ),
  },
  {
    id: "connected-social-accounts",
    title: "Connected social account data",
    content: (
      <>
        <p>
          Connecting YouTube, Instagram, or TikTok is optional. LifeOS accesses
          social account information only after you explicitly authorize the
          connection through the relevant platform&apos;s OAuth or login flow.
        </p>
        <p>
          LifeOS uses connected social data to display and record account
          statistics inside your dashboard. Depending on the platform and the
          permission granted, this may include a platform account identifier,
          display or profile information, follower or subscriber totals,
          following totals, and historical snapshots of those statistics.
        </p>
      </>
    ),
  },
  {
    id: "tiktok-data",
    title: "TikTok data",
    content: (
      <>
        <p>
          LifeOS requests account-level read access for your own authenticated
          TikTok account. The intended permissions are{" "}
          <code>user.info.basic</code> and <code>user.info.stats</code>. These
          permissions may provide basic profile information, follower count,
          following count, total likes count, and video count.
        </p>
        <p>
          LifeOS does not use TikTok account information for advertising. It
          does not post or delete content, send messages, manage comments, or
          modify your TikTok account on your behalf.
        </p>
      </>
    ),
  },
  {
    id: "google-data",
    title: "YouTube and Google data",
    content: (
      <p>
        If you connect a YouTube or Google account, LifeOS may receive the basic
        account, channel, and audience information covered by the scopes shown
        during Google&apos;s authorization process. LifeOS uses that information
        to identify the connected channel and show relevant audience statistics
        in your dashboard. LifeOS does not receive information outside the
        access you approve.
      </p>
    ),
  },
  {
    id: "meta-data",
    title: "Instagram and Meta data",
    content: (
      <p>
        If you connect Instagram through Meta, LifeOS may receive the account
        identity, profile, and audience information made available by the
        permissions shown during Meta&apos;s authorization process. This data is
        used to identify your connected account and display relevant account
        statistics in LifeOS.
      </p>
    ),
  },
  {
    id: "oauth-tokens",
    title: "OAuth access and refresh tokens",
    content: (
      <p>
        A connected platform may issue access or refresh tokens so LifeOS can
        retrieve authorized information without asking you to sign in for every
        request. OAuth tokens and connected-account credentials are private,
        server-side data. LifeOS does not display or share them publicly. Access
        to them is limited to the application processes that need them to
        maintain an authorized connection.
      </p>
    ),
  },
  {
    id: "how-information-is-used",
    title: "How collected information is used",
    content: (
      <>
        <p>LifeOS may use collected information to:</p>
        <ul>
          <li>provide and organize the dashboard features you use;</li>
          <li>authenticate you and keep your account available;</li>
          <li>retrieve, display, and record authorized social statistics;</li>
          <li>
            calculate progress, reminders, renewals, and historical trends;
          </li>
          <li>maintain security, diagnose errors, and prevent misuse; and</li>
          <li>improve the reliability and usability of LifeOS.</li>
        </ul>
      </>
    ),
  },
  {
    id: "storage-security",
    title: "Storage and security",
    content: (
      <p>
        LifeOS uses reasonable technical and organizational measures intended to
        protect stored information, including keeping sensitive
        connected-account credentials on the server rather than exposing them in
        public pages or client-side interfaces. No method of storage or
        transmission is completely secure, so LifeOS cannot guarantee absolute
        security or that an incident will never occur.
      </p>
    ),
  },
  {
    id: "supabase",
    title: "Supabase infrastructure",
    content: (
      <p>
        LifeOS uses Supabase for authentication and database infrastructure.
        Information stored through those services is processed subject to
        Supabase&apos;s security practices and applicable terms. LifeOS limits
        use of that infrastructure to operating the application and its account
        features.
      </p>
    ),
  },
  {
    id: "third-party-services",
    title: "Third-party services",
    content: (
      <p>
        LifeOS may interact with Supabase, Google and YouTube, Meta and
        Instagram, TikTok, and hosting or infrastructure providers. Those
        services operate under their own privacy policies and may collect
        information directly when you use their sign-in, authorization, or
        account-management interfaces. LifeOS does not control their independent
        data practices.
      </p>
    ),
  },
  {
    id: "data-sharing",
    title: "Data sharing",
    content: (
      <>
        <p>
          LifeOS does not sell personal data. Information may be shared with
          infrastructure or service providers only as reasonably necessary to
          operate, secure, and support LifeOS, or when required by applicable
          law. OAuth tokens are not made public.
        </p>
        <p>
          Because LifeOS is a private personal dashboard rather than a public
          social network, dashboard content is not intended for public display.
        </p>
      </>
    ),
  },
  {
    id: "retention",
    title: "Data retention",
    content: (
      <p>
        LifeOS retains information while it is needed to provide the
        application, maintain an authorized connection, meet security or legal
        obligations, resolve disputes, or preserve reasonable backups. Retention
        periods can vary by data type. Backup or security records may remain for
        a limited period after primary data is removed before being overwritten
        or safely deleted.
      </p>
    ),
  },
  {
    id: "disconnect-delete",
    title: "Disconnecting accounts and deleting connected data",
    content: (
      <>
        <p>
          You may disconnect a social account in LifeOS when that control is
          available. You may also revoke third-party authorization directly in
          the relevant Google, Meta, TikTok, or other account settings. Revoking
          access prevents future authorized requests but may not automatically
          remove information already stored in LifeOS.
        </p>
        <p>
          Connected-account information can be deleted when an account is
          disconnected or when you request deletion, subject to reasonable
          backup, fraud-prevention, security, and legal retention where
          applicable. To request deletion, contact LifeOS using the address
          below and identify the connected account concerned.
        </p>
      </>
    ),
  },
  {
    id: "your-rights",
    title: "Your rights and control",
    content: (
      <p>
        Depending on where you live, you may have rights to request access to,
        correction of, deletion of, restriction of, or a copy of your personal
        information. You may also withdraw an OAuth authorization through the
        relevant platform. LifeOS may need to verify your identity before acting
        on a request and may retain information where the law permits or
        requires it.
      </p>
    ),
  },
  {
    id: "children",
    title: "Children’s privacy",
    content: (
      <p>
        LifeOS is not directed to children under 13, or under any higher minimum
        age required for an online service in their location. LifeOS does not
        knowingly collect personal information from a child below the applicable
        minimum age. If you believe such information has been provided, please
        contact LifeOS so it can be reviewed and removed where appropriate.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to this Privacy Policy",
    content: (
      <p>
        This policy may change as LifeOS develops or its legal and technical
        requirements change. The updated version will be posted on this page
        with a revised “Last updated” date. Material changes may also be
        communicated inside LifeOS when appropriate.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact information",
    content: (
      <p>
        For privacy questions, account-data requests, or connected-account
        deletion requests, contact:{" "}
        <a href={"mailto:" + SUPPORT_EMAIL}>{SUPPORT_EMAIL}</a>.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalDocument
      eyebrow="Your information, clearly explained"
      title="Privacy Policy"
      lastUpdated={LEGAL_LAST_UPDATED}
      introduction="LifeOS is built to help you understand and organize your own life. This policy explains what information the application may handle, why it is used, and the choices available to you."
      sections={sections}
    />
  );
}
