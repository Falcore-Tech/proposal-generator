import React from "react";

const ProposalCTA: React.FC = () => {
  return (
    <div className="rounded-lg p-6 shadow-lg mb-8 bg-(--brand-muted) border border-(--brand-border)">
      <h2 className="text-xl font-bold mb-4 text-(--brand-accent)">
        Payment Information
      </h2>

      <div className="bg-(--brand-bg) p-5 rounded-lg mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm mb-1 text-(--brand-muted-fg)">Account Holder</p>
            <p className="font-medium text-(--brand-fg)">XLUXIVE DIGITAL MARKETING L.L.C</p>
          </div>
          <div>
            <p className="text-sm mb-1 text-(--brand-muted-fg)">IBAN</p>
            <p className="font-medium font-mono text-(--brand-fg)">AE590860000009339072484</p>
          </div>
          <div>
            <p className="text-sm mb-1 text-(--brand-muted-fg)">BIC</p>
            <p className="font-medium font-mono text-(--brand-fg)">WIOBAEADXXX</p>
          </div>
          <div>
            <p className="text-sm mb-1 text-(--brand-muted-fg)">Business Address</p>
            <p className="font-medium text-(--brand-fg)">The Curve Building M44, Dubai, UAE</p>
          </div>
        </div>
      </div>

      <div className="text-center">
        <div className="inline-block transition-colors rounded-lg p-6 text-white max-w-md bg-(--brand-accent) hover:opacity-90">
          <h3 className="text-lg font-bold mb-2">Ready to Get Started?</h3>
          <p className="text-sm mb-4">
            Contact us to proceed with this proposal or request any customizations.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="mailto:faez@falcoretech.com"
              className="bg-white/20 hover:bg-white/30 transition-colors px-4 py-2 rounded flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              Email Us
            </a>
            <a
              href="tel:+971503636856"
              className="bg-white/20 hover:bg-white/30 transition-colors px-4 py-2 rounded flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              Call Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalCTA;
