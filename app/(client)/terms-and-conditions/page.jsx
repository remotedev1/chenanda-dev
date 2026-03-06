"use client";

const sections = [
  {
    id: "01",
    title: "Account & Registration",
    body: "To access and use the Services, you agree to provide true, accurate and complete information to us during and after registration, and you shall be responsible for all acts done through the use of your registered account on the Platform.",
  },
  {
    id: "02",
    title: "No Warranty",
    body: "Neither we nor any third parties provide any warranty or guarantee as to the accuracy, timeliness, performance, completeness or suitability of the information and materials offered on this website or through the Services, for any specific purpose. You acknowledge that such information and materials may contain inaccuracies or errors and we expressly exclude liability for any such inaccuracies or errors to the fullest extent permitted by law.",
  },
  {
    id: "03",
    title: "Use at Your Own Risk",
    body: "Your use of our Services and the Platform is solely and entirely at your own risk and discretion for which we shall not be liable to you in any manner. You are required to independently assess and ensure that the Services meet your requirements.",
  },
  {
    id: "04",
    title: "Intellectual Property",
    body: "The contents of the Platform and the Services are proprietary to us and are licensed to us. You will not have any authority to claim any intellectual property rights, title, or interest in its contents. The contents includes and is not limited to the design, layout, look and graphics.",
  },
  {
    id: "05",
    title: "Authorised Use",
    body: "You acknowledge that unauthorized use of the Platform and/or the Services may lead to action against you as per these Terms of Use and/or applicable laws.",
  },
  {
    id: "06",
    title: "Payment",
    body: "You agree to pay us the charges associated with availing the Services.",
  },
  {
    id: "07",
    title: "Lawful Use Only",
    body: "You agree not to use the Platform and/or Services for any purpose that is unlawful, illegal or forbidden by these Terms, or Indian or local laws that might apply to you.",
  },
  {
    id: "08",
    title: "Third-Party Links",
    body: "You agree and acknowledge that the website and the Services may contain links to other third-party websites. On accessing these links, you will be governed by the terms of use, privacy policy and such other policies of such third-party websites. These links are provided for your convenience to provide further information.",
  },
  {
    id: "09",
    title: "Binding Contract",
    body: "You understand that upon initiating a transaction for availing the Services you are entering into a legally binding and enforceable contract with the Platform Owner for the Services.",
  },
  {
    id: "10",
    title: "Indemnification",
    body: "You shall indemnify and hold harmless Platform Owner, its affiliates, group companies (as applicable) and their respective officers, directors, agents, and employees, from any claim or demand, or actions including reasonable attorney's fees, made by any third party or penalty imposed due to or arising out of Your breach of this Terms of Use, privacy Policy and other Policies, or Your violation of any law, rules or regulations or the rights (including infringement of intellectual property rights) of a third party.",
  },
  {
    id: "11",
    title: "Force Majeure",
    body: "Notwithstanding anything contained in these Terms of Use, the parties shall not be liable for any failure to perform an obligation under these Terms if performance is prevented or delayed by a force majeure event.",
  },
  {
    id: "12",
    title: "Governing Law",
    body: "These Terms and any dispute or claim relating to it, or its enforceability, shall be governed by and construed in accordance with the laws of India.",
  },
  {
    id: "13",
    title: "Jurisdiction",
    body: "All disputes arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts in India.",
  },
  {
    id: "14",
    title: "Contact Us",
    body: "All concerns or communications relating to these Terms must be communicated to us using the contact information provided on this website.",
  },
];

export default function TermsAndConditions() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Lora:ital,wght@0,400;0,500;1,400&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background: #faf7f2; }
      `}</style>

      <main
        style={{ minHeight: "100vh", background: "#faf7f2" }}
        className="mt-24 max-w-5xl mx-auto"
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
              Terms &amp; Conditions
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
            This document is published in accordance with the provisions of Rule
            3(1) of the Information Technology (Intermediaries Guidelines)
            Rules, 2011, governing the use of{" "}
            <a
              href="https://www.chenanda.in/"
              style={{ color: "#b89a6a", textDecoration: "underline" }}
            >
              chenanda.in
            </a>
            . By accessing or using the Platform, you agree to be bound by these
            Terms. Please read them carefully.
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
            {sections.length} items
          </span>
        </div>

        {/* All Clauses — fully visible */}
        <section
          style={{
            padding: "1rem clamp(1.5rem, 6vw, 5rem) 4rem",
            maxWidth: "860px",
          }}
        >
          {sections.map((s, i) => (
            <div
              key={s.id}
              style={{
                borderTop: "1px solid #e2d9c8",
                padding: "1.75rem 0",
                display: "grid",
                gridTemplateColumns: "2.5rem 1fr",
                gap: "0 1.25rem",
                ...(i === sections.length - 1
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
