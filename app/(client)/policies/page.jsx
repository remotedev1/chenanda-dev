"use client";

import { useState } from "react";

const policies = {
  privacy: {
    label: "Privacy Policy",
    sections: [
      {
        id: "01",
        title: "Introduction",
        body: "This Privacy Policy describes how CHENANDA HOCKEY FESTIVAL 2026 and its affiliates collect, use, share, protect or otherwise process your information/personal data through our website chenanda.in. By visiting this Platform, providing your information or availing any product/service offered, you expressly agree to be bound by the terms and conditions of this Privacy Policy and the applicable laws of India. If you do not agree, please do not use or access our Platform.",
      },
      {
        id: "02",
        title: "Collection",
        body: "We collect your personal data when you use our Platform, services or otherwise interact with us. This includes information provided during sign-up such as name, date of birth, address, telephone/mobile number, email ID, and any such information shared as proof of identity or address. Sensitive personal data such as bank account, credit/debit card details, or biometric information may be collected with your consent in accordance with applicable laws. You always have the option to not provide information by choosing not to use a particular service or feature.",
      },
      {
        id: "03",
        title: "Usage",
        body: "We use personal data to provide the services you request. We use your personal data to assist in handling and fulfilling orders; enhancing customer experience; to resolve disputes; troubleshoot problems; inform you about offers, products, services, and updates; customise your experience; detect and protect against error, fraud and other criminal activity; enforce our terms and conditions; and conduct marketing research, analysis and surveys.",
      },
      {
        id: "04",
        title: "Sharing",
        body: "We may share your personal data internally within our group entities and affiliates to provide access to their services and products. We may disclose personal data to third parties such as sellers, business partners, logistics partners, and payment providers. We may also disclose personal data to government agencies or authorised law enforcement agencies if required to do so by law or in good faith belief that such disclosure is reasonably necessary.",
      },
      {
        id: "05",
        title: "Security Precautions",
        body: "To protect your personal data from unauthorised access, loss or misuse, we adopt reasonable security practices and procedures. However, the transmission of information is not completely secure for reasons beyond our control. By using the Platform, users accept the security implications of data transmission over the internet. Users are responsible for ensuring the protection of login and password records for their account.",
      },
      {
        id: "06",
        title: "Data Deletion & Retention",
        body: "You have an option to delete your account by visiting your profile and settings on our Platform, which will result in losing all information related to your account. We retain your personal data for a period no longer than required for the purpose for which it was collected or as required under applicable law. We may retain data if necessary to prevent fraud or future abuse, or for other legitimate purposes.",
      },
      {
        id: "07",
        title: "Your Rights",
        body: "You may access, rectify, and update your personal data directly through the functionalities provided on the Platform.",
      },
      {
        id: "08",
        title: "Consent",
        body: "By visiting our Platform or by providing your information, you consent to the collection, use, storage, disclosure and processing of your information in accordance with this Privacy Policy. You have an option to withdraw your consent by writing to the Grievance Officer. Please note that withdrawal of consent will not be retrospective and we reserve the right to restrict or deny provision of services for which such information is considered necessary.",
      },
      {
        id: "09",
        title: "Changes to This Policy",
        body: "Please check our Privacy Policy periodically for changes. We may update this Privacy Policy to reflect changes to our information practices and will alert you about significant changes as may be required under applicable laws.",
      },
    ],
  },
  refund: {
    label: "Refund & Cancellation",
    sections: [
      {
        id: "01",
        title: "Cancellation Window",
        body: "Cancellations will only be considered if the request is made within 1 day of placing the order. However, cancellation requests may not be entertained if the orders have been communicated to the seller/merchant and they have initiated the process of shipping, or the product is out for delivery. In such an event, you may choose to reject the product at the doorstep.",
      },
      {
        id: "02",
        title: "Perishable Items",
        body: "CHENANDA HOCKEY FESTIVAL 2026 does not accept cancellation requests for perishable items like flowers, eatables, etc. However, a refund or replacement can be made if the user establishes that the quality of the product delivered is not good.",
      },
      {
        id: "03",
        title: "Damaged or Defective Items",
        body: "In case of receipt of damaged or defective items, please report to our customer service team within 1 day of receipt of products. The request will be entertained once the seller/merchant has checked and determined the same at their own end.",
      },
      {
        id: "04",
        title: "Product Not as Described",
        body: "In case you feel that the product received is not as shown on the site or as per your expectations, you must bring it to the notice of our customer service within 1 day of receiving the product. The customer service team will look into your complaint and take an appropriate decision.",
      },
      {
        id: "05",
        title: "Warranty Claims",
        body: "In case of complaints regarding products that come with a warranty from the manufacturers, please refer the issue to them directly.",
      },
      {
        id: "06",
        title: "Refund Processing",
        body: "In case of any refunds approved by CHENANDA HOCKEY FESTIVAL 2026, it will take 1 day for the refund to be processed to you.",
      },
    ],
  },
  return: {
    label: "Return Policy",
    sections: [
      {
        id: "01",
        title: "Return & Exchange Window",
        body: "We offer refund/exchange within the first 5 days from the date of your purchase. If 5 days have passed since your purchase, you will not be offered a return, exchange or refund of any kind.",
      },
      {
        id: "02",
        title: "Eligibility Conditions",
        body: "In order to become eligible for a return or an exchange: (i) the purchased item should be unused and in the same condition as you received it, (ii) the item must have original packaging, (iii) if the item was purchased on sale, it may not be eligible for a return/exchange. Only such items are replaced if they are found defective or damaged.",
      },
      {
        id: "03",
        title: "Exempted Categories",
        body: "There may be certain categories of products/items that are exempted from returns or refunds. Such categories will be identified to you at the time of purchase.",
      },
      {
        id: "04",
        title: "Processing of Returns",
        body: "Once your returned product/item is received and inspected by us, we will send you an email to notify you about receipt. If approved after the quality check at our end, your request for return/exchange will be processed in accordance with our policies.",
      },
    ],
  },
  shipping: {
    label: "Shipping Policy",
    sections: [
      {
        id: "01",
        title: "Shipping Partners",
        body: "Orders are shipped through registered domestic courier companies and/or speed post only.",
      },
      {
        id: "02",
        title: "Dispatch Timeline",
        body: "Orders are shipped within 1 day from the date of the order and/or payment or as per the delivery date agreed at the time of order confirmation, subject to courier company/post office norms.",
      },
      {
        id: "03",
        title: "Delivery Liability",
        body: "Platform Owner shall not be liable for any delay in delivery by the courier company/postal authority. Delivery of all orders will be made to the address provided by the buyer at the time of purchase.",
      },
      {
        id: "04",
        title: "Delivery Confirmation",
        body: "Delivery of our services will be confirmed on your email ID as specified at the time of registration.",
      },
      {
        id: "05",
        title: "Shipping Costs",
        body: "If there are any shipping costs levied by the seller or the Platform Owner, the same are not refundable.",
      },
    ],
  },
};

const tabs = [
  { key: "privacy", label: "Privacy Policy" },
  { key: "refund", label: "Refund & Cancellation" },
  { key: "return", label: "Return Policy" },
  { key: "shipping", label: "Shipping Policy" },
];

export default function Policies() {
  const [active, setActive] = useState("privacy");
  const policy = policies[active];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Lora:ital,wght@0,400;0,500;1,400&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background: #faf7f2; }
        .tab-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-family: 'DM Mono', monospace;
          font-size: 0.68rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 0.55rem 1rem;
          border-radius: 2px;
          transition: background 0.2s, color 0.2s;
          white-space: nowrap;
          color: #7a6a52;
        }
        .tab-btn:hover { background: #f0ebe1; }
        .tab-btn.active {
          background: #1a1208;
          color: #faf7f2 !important;
        }
      `}</style>

      <main
        style={{ minHeight: "100vh", background: "#faf7f2" }}
        className="max-w-5xl mx-auto mt-24"
      >
        {/* Header */}
        <header
          style={{
            borderBottom: "1px solid #e2d9c8",
            padding: "2rem clamp(1.5rem, 6vw, 5rem)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <p
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: "0.65rem",
                letterSpacing: "0.18em",
                color: "#9e8c72",
                margin: "0 0 0.4rem",
                textTransform: "uppercase",
              }}
            >
              Chenanda Hockey Festival — 2026
            </p>
            <h1
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
                fontWeight: 700,
                color: "#1a1208",
                margin: 0,
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
              }}
            >
              {policy.label}
            </h1>
          </div>
          <span
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "0.65rem",
              letterSpacing: "0.12em",
              color: "#b89a6a",
              border: "1px solid #e2d9c8",
              padding: "0.35rem 0.75rem",
              borderRadius: "2px",
              whiteSpace: "nowrap",
            }}
          >
            Effective 2026
          </span>
        </header>

        {/* Tab Navigation */}
        <nav
          style={{
            borderBottom: "1px solid #e2d9c8",
            padding: "0.75rem clamp(1.5rem, 6vw, 5rem)",
            display: "flex",
            gap: "0.35rem",
            overflowX: "auto",
            flexWrap: "wrap",
          }}
        >
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              className={`tab-btn${active === t.key ? " active" : ""}`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {/* Preamble */}
        <section
          style={{
            padding: "2.5rem clamp(1.5rem, 6vw, 5rem) 2rem",
            maxWidth: "860px",
          }}
        >
          <p
            style={{
              fontFamily: "'Lora', Georgia, serif",
              fontSize: "clamp(0.9rem, 1.5vw, 1rem)",
              lineHeight: 1.9,
              color: "#5a4e3a",
              margin: 0,
              fontStyle: "italic",
            }}
          >
            Please read this policy carefully as it governs your use of the
            Platform and services offered by{" "}
            <a
              href="https://www.chenanda.in/"
              style={{ color: "#b89a6a", textDecoration: "underline" }}
            >
              chenanda.in
            </a>
            . By accessing or using the Platform, you agree to be bound by these
            terms.
          </p>
        </section>

        {/* Divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            padding: "0 clamp(1.5rem, 6vw, 5rem) 0.5rem",
          }}
        >
          <span
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "0.6rem",
              letterSpacing: "0.18em",
              color: "#9e8c72",
              textTransform: "uppercase",
            }}
          >
            Clauses
          </span>
          <div style={{ flex: 1, height: "1px", background: "#e2d9c8" }} />
          <span
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "0.6rem",
              color: "#c4b49a",
            }}
          >
            {policy.sections.length} items
          </span>
        </div>

        {/* Clauses */}
        <section
          style={{
            padding: "1rem clamp(1.5rem, 6vw, 5rem) 4rem",
            maxWidth: "860px",
          }}
        >
          {policy.sections.map((s, i) => (
            <div
              key={s.id}
              style={{
                borderTop: "1px solid #e2d9c8",
                padding: "1.75rem 0",
                display: "grid",
                gridTemplateColumns: "2.5rem 1fr",
                gap: "0 1.25rem",
                ...(i === policy.sections.length - 1
                  ? { borderBottom: "1px solid #e2d9c8" }
                  : {}),
              }}
            >
              <span
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: "0.68rem",
                  color: "#b89a6a",
                  letterSpacing: "0.08em",
                  paddingTop: "0.3rem",
                }}
              >
                {s.id}
              </span>
              <div>
                <h2
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: "clamp(1rem, 2vw, 1.15rem)",
                    fontWeight: 600,
                    color: "#1a1208",
                    margin: "0 0 0.65rem",
                    letterSpacing: "0.01em",
                  }}
                >
                  {s.title}
                </h2>
                <p
                  style={{
                    fontFamily: "'Lora', Georgia, serif",
                    fontSize: "clamp(0.88rem, 1.4vw, 0.95rem)",
                    color: "#4a3f2e",
                    lineHeight: 1.85,
                    margin: 0,
                  }}
                >
                  {s.body}
                </p>
              </div>
            </div>
          ))}
        </section>
      </main>
    </>
  );
}
