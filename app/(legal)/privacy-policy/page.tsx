import React from "react";
import { Shield, Lock, Globe, Mail } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <article className="container pt-40 mx-auto px-4 py-8 text-zinc-300">
      <header className="mb-12">
        <h1 className="text-4xl leading-[1.2] font-bold mb-4 text-center bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
          Falcore - Privacy Policy
        </h1>
      </header>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-white border-b border-zinc-700 pb-2 flex items-center gap-3">
          <Shield className="text-red-500" /> Introduction
        </h2>
        <p className="mb-4">
          At Falcore, we are committed to protecting your privacy. This
          Privacy Policy explains how we collect, use, disclose, and safeguard
          your information when you interact with our services, website, or
          digital platforms.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-white border-b border-zinc-700 pb-2 flex items-center gap-3">
          <Globe className="text-red-500" /> Information We Collect
        </h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            Personal identification information (Name, email address, phone
            number)
          </li>
          <li>Company and business-related information</li>
          <li>Communication and correspondence details</li>
          <li>Website usage information and analytics</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-white border-b border-zinc-700 pb-2 flex items-center gap-3">
          <Lock className="text-red-500" /> How We Use Your Information
        </h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>To provide and manage our professional services</li>
          <li>To communicate with you about your projects and inquiries</li>
          <li>To improve our website and service offerings</li>
          <li>To send periodic marketing communications (with your consent)</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-white border-b border-zinc-700 pb-2 flex items-center gap-3">
          <Mail className="text-red-500" /> Data Sharing and Disclosure
        </h2>
        <p className="mb-4">
          We do not sell, trade, or rent your personal information to third
          parties. We may share generic aggregated demographic information not
          linked to any personal identification information regarding visitors
          and users with our business partners, trusted affiliates, and
          advertisers.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-white border-b border-zinc-700 pb-2">
          Data Protection and Security
        </h2>
        <p className="mb-4">
          We implement a variety of security measures to maintain the safety of
          your personal information. Your personal information is contained
          behind secured networks and is only accessible by a limited number of
          persons who have special access rights to such systems.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-white border-b border-zinc-700 pb-2">
          Cookies and Tracking
        </h2>
        <p className="mb-4">
          We use cookies to enhance your experience, gather general visitor
          information, and track visits to our website. You can choose to have
          your computer warn you each time a cookie is being sent, or you can
          choose to turn off all cookies through your browser settings.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-white border-b border-zinc-700 pb-2">
          Your Rights
        </h2>
        <p className="mb-4">You have the right to:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Access the personal information we hold about you</li>
          <li>Request correction of your personal information</li>
          <li>Request deletion of your personal information</li>
          <li>Opt-out of marketing communications</li>
        </ul>
      </section>
    </article>
  );
};

export default PrivacyPolicy;
