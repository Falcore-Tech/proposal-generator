import React from 'react';

const TermsAndConditionsArticle = () => {
  return (
    <article className="container pt-40 mx-auto px-4 py-8 text-zinc-300">
      <header className="mb-12">
        <h1 className="text-4xl leading-[1.2] font-bold mb-4 text-center bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
          Falcore - Terms and Conditions
        </h1>
      </header>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-white border-b border-zinc-700 pb-2">
          Preliminary Information
        </h2>
        <p className="mb-4">
          Falcore provides professional digital marketing services within the United Arab Emirates. These Terms and Conditions constitute a legally binding agreement between Falcore and its clients. By engaging our services, clients acknowledge and accept the following terms in their entirety.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-white border-b border-zinc-700 pb-2">
          Services and Engagement
        </h2>
        <p className="mb-4">
          Falcore operates on a transparent, pay-as-you-go service model. No credit is extended to clients, and all services require prepayment before commencement. We offer a comprehensive satisfaction guarantee, ensuring that clients review and approve all assets prior to public release.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-white border-b border-zinc-700 pb-2">
          Intellectual Property Rights
        </h2>
        <p className="mb-4">
          All intellectual property created during the course of our services shall remain the exclusive property of the client who has paid for the services. Falcore retains the right to be recognized as the creator of the work. Upon full payment, clients receive complete usage rights to all produced assets.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-white border-b border-zinc-700 pb-2">
          Confidentiality and Non-Disclosure
        </h2>
        <p className="mb-4">
          A rigorous Non-Disclosure Agreement (NDA) is established between Falcore and the client. Both parties are equally bound by strict confidentiality obligations. We are committed to protecting all client information with the highest standard of professional confidentiality, ensuring complete privacy and security of sensitive business information.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-white border-b border-zinc-700 pb-2">
          Financial Terms
        </h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>All services are prepaid</li>
          <li>Payments must be made in full before service commencement</li>
          <li>Pricing is based on the agreed-upon service package</li>
          <li>No credit is extended</li>
        </ul>
      </section>
    </article>
  );
};

export default TermsAndConditionsArticle;
