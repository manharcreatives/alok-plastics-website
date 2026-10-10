// Legal page content: DRAFT for Alok Plastics to review and approve (SRS 6.10, Requirements 33).
// Text in {{double braces}} is information only the client can supply; it renders highlighted and
// must be replaced before publishing. No figures, timelines or jurisdictions are assumed here.

export type LegalBlock = string | { ul: string[] };
export type LegalSection = { id: string; title: string; body: LegalBlock[] };
export type LegalSlug = 'privacy' | 'terms' | 'refund';
export type LegalPageContent = { title: string; lead: string; sections: LegalSection[] };

export const legalPages: Record<LegalSlug, LegalPageContent> = {
  privacy: {
    title: 'Privacy Policy',
    lead: 'What Alok Plastics collects when you enquire about a part, why we need it, and what you can ask us to do with it.',
    sections: [
      {
        id: 'what-we-collect',
        title: 'What we collect',
        body: [
          'When you send an enquiry or ask for a quotation, we collect the details you give us:',
          {
            ul: [
              'Your name and mobile number',
              'Your company name and, if you are a business, your GSTIN',
              'Your email address, delivery city and location',
              'The parts, sizes, materials and quantities you ask about, plus any message, sample or photo you attach',
            ],
          },
          'When you browse this website, our analytics tools record general usage: pages visited, device and browser type, and how you reached the site.',
        ],
      },
      {
        id: 'how-we-use',
        title: 'How we use it',
        body: [
          {
            ul: [
              'To respond to your enquiry, check availability, prepare a quotation and arrange dispatch.',
              'To contact you about that enquiry on WhatsApp or by phone.',
              'To understand which pages are useful and improve the site. We do not use usage data to identify you.',
            ],
          },
        ],
      },
      {
        id: 'mobile-verification',
        title: 'Mobile verification',
        body: [
          'Before an enquiry is sent, we may ask you to confirm your mobile number with a one-time code (OTP). The code is used only to confirm that the number is yours. {{Client to confirm: OTP route, SMS or WhatsApp}}',
        ],
      },
      {
        id: 'cookies',
        title: 'Cookies and analytics',
        body: [
          'Cookies are small files stored on your device. We use essential cookies to keep the site working and analytics cookies to measure visits. You can block or delete cookies in your browser settings. Blocking essential cookies may stop parts of the site from working. {{Client to confirm: analytics tools in use}}',
        ],
      },
      {
        id: 'sharing',
        title: 'Who we share it with',
        body: [
          'We do not sell your information.',
          'We share it only with the services that help us run the site and reply to you, such as our hosting provider, the messaging service used for WhatsApp, and analytics providers.',
          'We may disclose information where the law requires it.',
        ],
      },
      {
        id: 'retention',
        title: 'How long we keep it',
        body: [
          'We keep enquiry records for {{Client to confirm: retention period}} so that we can support repeat orders and meet our record-keeping obligations. After that we delete or anonymise them.',
        ],
      },
      {
        id: 'security',
        title: 'Keeping it safe',
        body: [
          'Enquiry details are visible only to staff who need them, the admin area sits behind a secure login, and changes are recorded. No online system is completely secure, so please share only what an enquiry needs.',
        ],
      },
      {
        id: 'your-rights',
        title: 'Your choices and rights',
        body: [
          'You can ask what we hold about you, ask us to correct it, or ask us to delete it, unless we must keep it by law. You can withdraw consent to marketing messages at any time.',
        ],
      },
      {
        id: 'privacy-contact',
        title: 'Privacy contact',
        body: [
          'For any privacy question or request, write to {{Client to confirm: privacy email}} or use the contact page.',
        ],
      },
    ],
  },

  terms: {
    title: 'Terms of Use',
    lead: 'The rules for using this website, and for placing an enquiry or order with Alok Plastics.',
    sections: [
      {
        id: 'using-the-site',
        title: 'Using this website',
        body: [
          'This website gives information about Alok Plastics and its spare parts. You may browse it and contact us through it. Please do not copy, scrape or misuse the site, or interfere with how it works.',
        ],
      },
      {
        id: 'products-prices',
        title: 'Products, prices and images',
        body: [
          'Product names, materials, sizes and variants are shown as they appear in our catalogue. Prices shown are reference prices and may change. Images are illustrative, and the part supplied may differ slightly in finish.',
          'The quotation we send you is the price that applies. We confirm availability and price for each enquiry in writing.',
        ],
      },
      {
        id: 'enquiry-order',
        title: 'Enquiries and orders',
        body: [
          'Sending an enquiry is not an order. An order is placed only when we confirm it in writing, after checking availability and issuing a quotation or order confirmation.',
          'For a custom part made from your sample, drawing or photo, we confirm the specification with you before production starts.',
        ],
      },
      {
        id: 'payment',
        title: 'Payment',
        body: [
          'This website has no online checkout and takes no card payments. Payment is made outside the website, using the bank or payment details we share with you on WhatsApp or in writing.',
          '{{Client to confirm: advance payment, credit terms and payment timelines}}',
        ],
      },
      {
        id: 'dispatch-risk',
        title: 'Dispatch and risk',
        body: [
          '{{Client to confirm: dispatch timelines and transport arrangements}}',
          'Risk in the goods passes to you on {{Client to confirm: dispatch or delivery}}.',
        ],
      },
      {
        id: 'warranty',
        title: 'Warranty',
        body: [
          '{{Client to confirm: warranty position for each product group, or state that no warranty applies}}',
        ],
      },
      {
        id: 'liability',
        title: 'Limitation of liability',
        body: [
          'To the extent the law allows, Alok Plastics is not liable for indirect or consequential loss arising from use of this website or from information on it. Nothing in these terms limits liability that cannot legally be limited.',
        ],
      },
      {
        id: 'intellectual-property',
        title: 'Intellectual property',
        body: [
          'The name, logo, photographs, text and design of this website belong to Alok Plastics or are used with permission. Do not reproduce them without written permission.',
        ],
      },
      {
        id: 'governing-law',
        title: 'Governing law',
        body: [
          'These terms are governed by the laws of India. {{Client to confirm: courts with jurisdiction}}',
        ],
      },
    ],
  },

  refund: {
    title: 'Returns & Refunds',
    lead: 'What to do if a part arrives damaged, defective or different from what was confirmed.',
    sections: [
      {
        id: 'when-returns',
        title: 'When we accept a return or replacement',
        body: [
          'We accept a return or replacement where the part is:',
          {
            ul: [
              'damaged in transit',
              'defective when it arrives',
              'different from what we confirmed in the quotation or order',
            ],
          },
          'Please check the delivery on arrival and tell us within {{Client to confirm: number of days}} of receiving it.',
        ],
      },
      {
        id: 'damage-in-transit',
        title: 'Damage in transit',
        body: [
          'If a package arrives damaged, note the damage on the transporter\'s delivery receipt before you sign, photograph the parts and the outer packing, and tell us within {{Client to confirm: number of hours}}. Keep the packing, because the transporter may need to inspect it.',
        ],
      },
      {
        id: 'raise-claim',
        title: 'How to raise a claim',
        body: [
          'Send us your order or invoice number, the parts and quantities affected, clear photographs and a short description of the fault, through the contact page or on WhatsApp. We confirm whether the claim is accepted within {{Client to confirm: number of working days}}.',
        ],
      },
      {
        id: 'refund-method',
        title: 'Refund or replacement',
        body: [
          'Where a claim is accepted, we offer a replacement or a refund, as agreed with you. Refunds are paid by {{Client to confirm: refund method}} and usually take {{Client to confirm: refund timeline}} from approval.',
        ],
      },
      {
        id: 'non-returnable',
        title: 'Items that cannot be returned',
        body: [
          'Custom parts made to your sample or drawing; parts that have been installed, fitted or altered; and parts no longer in their original packing, unless they were damaged in transit.',
          '{{Client to confirm: final list of non-returnable items}}',
        ],
      },
      {
        id: 'raise-request',
        title: 'Start a request',
        body: [
          'Use the contact page to start a return or refund request, and quote your order or invoice number.',
        ],
      },
    ],
  },
};
