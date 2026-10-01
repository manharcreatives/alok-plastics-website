import type { CareerConfig } from './types';

// Alok Plastics — Career page content
// Verbatim from §5.11 — do not edit without client approval

export const careerConfig: CareerConfig = {
  culture: `At Alok Plastics, we believe a strong company is built by strong people. We aim to create a joyful, supportive, and trustworthy working environment where every team member feels valued and respected.

We encourage teamwork, learning, responsibility, and continuous improvement — giving people opportunities to develop their skills, take ownership of their work, and grow alongside the company. As we expand, our goal is to build not just a larger manufacturing business, but a workplace where people enjoy working, grow together, and take pride in what they create.`,

  teams: [
    {
      id: 'product-development',
      name: 'Product Development',
      description: 'Working closely with factory operations to develop and improve products.',
    },
    {
      id: 'sales',
      name: 'Sales',
      description: 'Building customer relationships and expanding B2B reach.',
    },
    {
      id: 'social-media-marketing',
      name: 'Social Media & Marketing',
      description: 'Strengthening brand presence, connecting with new audiences.',
    },
    {
      id: 'tech-developers',
      name: 'Tech Developers',
      description: 'Supporting technology, digital systems, and the company\'s growing digital needs.',
    },
  ],

  // Empty at launch — TODO(client): add open roles when available
  // Empty state: "No open roles right now — send your CV to [email TODO(client)]"
  openRoles: [],
};
