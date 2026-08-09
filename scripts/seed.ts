/* eslint-disable no-console */
import { MongoClient } from "mongodb";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Minimal .env loader
function loadEnv(file: string): void {
  if (!fs.existsSync(file)) return;
  const lines = fs.readFileSync(file, "utf8").split("\n");
  for (const line of lines) {
    const m = line.match(/^\s*([\w.]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}
loadEnv(path.join(__dirname, "..", ".env"));
loadEnv(path.join(__dirname, "..", ".env.local"));

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
const dbName = process.env.MONGODB_DB || "startupregion8";

const PROVINCES = ["Leyte", "Southern Leyte", "Biliran", "Samar", "Northern Samar", "Eastern Samar"];

function slugify(text: string): string {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .replace(/[^a-z0-9-]/g, "");
}

const carousel = [
  {
    title: "Eastern Visayas Startup Summit 2026",
    subtitle: "Current Event",
    image: "/images/hero-placeholder.svg",
    link: "/news/startup-summit-2026",
    active: true,
    sortOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    title: "Pitching Competition for Agritech Innovators",
    subtitle: "Upcoming",
    image: "/images/hero-placeholder.svg",
    link: "/news/agritech-pitching",
    active: true,
    sortOrder: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    title: "Startup Bootcamp for Region 8 Founders",
    subtitle: "Training",
    image: "/images/hero-placeholder.svg",
    link: "/news/startup-bootcamp",
    active: true,
    sortOrder: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const news = [
  {
    title: "Eastern Visayas Startup Summit 2026 Opens Registrations",
    slug: "startup-summit-2026",
    excerpt:
      "The region's biggest startup gathering returns with investors, mentors, and 50+ exhibitors from across all six provinces.",
    content:
      "<p>The Eastern Visayas Startup Summit 2026 is officially open for registrations. Bringing together founders, investors, and government agencies, the summit will feature keynotes, pitch battles, and an expo of the region's most promising startups.</p><p>Attendees can expect workshops on fundraising, product-market fit, and regional expansion, plus networking sessions with mentors from Manila, Cebu, and beyond.</p><h2>What to Expect</h2><ul><li>50+ exhibiting startups</li><li>Pitching competition with cash prizes</li><li>One-on-one mentoring sessions</li></ul>",
    image: "/images/hero-placeholder.svg",
    category: "Events",
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    title: "Agritech Pitching Competition Opens for Applications",
    slug: "agritech-pitching",
    excerpt:
      "Innovators with agritech solutions can now apply to compete for seed funding and incubation slots.",
    content:
      "<p>Farmers, agripreneurs, and technologists across Region 8 are invited to join the Agritech Pitching Competition. Finalists will receive seed funding, mentorship, and incubation support from partner agencies.</p><p>Applications are open until the end of the month. Teams must present a working prototype or pilot in the field.</p>",
    image: "/images/hero-placeholder.svg",
    category: "Funding",
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    title: "Startup Bootcamp: From Idea to MVP",
    slug: "startup-bootcamp",
    excerpt:
      "A hands-on bootcamp helping aspiring founders validate ideas and build their first minimal viable product.",
    content:
      "<p>The two-week bootcamp guides participants from idea to a validated MVP. Topics cover customer discovery, lean canvas, prototyping, and pitching.</p><p>Coaches from the region's startup community will be on hand to provide feedback at every milestone.</p>",
    image: "/images/hero-placeholder.svg",
    category: "Training",
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const blogs = [
  {
    title: "How Leyte Startups Are Reinventing Coconut Farming",
    slug: "leyte-coconut-agritech",
    excerpt:
      "Meet the founders using technology to modernize one of the region's oldest industries.",
    content:
      "<p>Across Leyte, a new generation of startups is bringing data and technology to coconut farming — from precision mapping of plantations to blockchain-based supply tracking.</p><h2>The Opportunity</h2><p>Coconuts are central to the region's economy, yet farmers still face outdated practices. Startups are closing the gap with affordable tools built for local conditions.</p>",
    image: "/images/card-placeholder.svg",
    author: "Region 8 Startups Team",
    featured: true,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    title: "Samar's Quiet Rise as a Remote Work Hub",
    slug: "samar-remote-work",
    excerpt:
      "With improving connectivity, Samar is becoming home to a growing community of digital freelancers and founders.",
    content:
      "<p>Once known primarily for its natural wonders, Samar is now attracting digital nomads and remote-first startups thanks to improving internet infrastructure and a lower cost of living.</p><p>Local co-working spaces and community groups are fueling a collaborative ecosystem that keeps growing each year.</p>",
    image: "/images/card-placeholder.svg",
    author: "Region 8 Startups Team",
    featured: true,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    title: "Lessons from Founders Scaling Beyond Region 8",
    slug: "scaling-beyond-region8",
    excerpt:
      "What happens when a provincial startup goes national? Founders share the wins and the growing pains.",
    content:
      "<p>Expanding beyond the region brings new customers — but also new challenges in logistics, hiring, and operations. In this post, founders who have made the leap share practical advice.</p>",
    image: "/images/card-placeholder.svg",
    author: "Region 8 Startups Team",
    featured: false,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const government = [
  {
    title: "DTI Startup Support Programs",
    slug: "dti-startup-support",
    content:
      "<p>The Department of Trade and Industry (DTI) Region 8 provides a range of programs to support startups, including:</p><ul><li>Startup grant assistance and seed funding</li><li>Business registration and compliance guidance</li><li>Access to mentors and industry experts</li><li>Market linkage opportunities</li></ul><p>Visit your nearest DTI provincial office to learn more.</p>",
    image: "/images/hero-placeholder.svg",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    title: "DOST Technology Business Incubators",
    slug: "dost-tbi",
    content:
      "<p>The Department of Science and Technology (DOST) supports Technology Business Incubators (TBIs) across Eastern Visayas. TBIs provide startups with:</p><ul><li>Co-working space and lab facilities</li><li>Mentorship and technical assistance</li><li>Access to DOST research and funding programs</li></ul>",
    image: "/images/hero-placeholder.svg",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const startups = [
  {
    companyName: "Visayas Agritech Solutions",
    productName: "FarmSense",
    dateFounded: "2021-06-15",
    address: "Palo, Leyte",
    lat: 11.1585,
    lng: 124.9914,
    website: "https://example.com",
    employeeRange: "11-50",
    description:
      "FarmSense uses IoT sensors and data analytics to help coconut and rice farmers increase yields while reducing input costs across Leyte and beyond.",
    province: "Leyte",
    logo: "",
    featured: true,
    status: "active",
    founders: [
      { name: "Maria Santos", position: "CEO & Co-founder" },
      { name: "Jose Ramirez", position: "CTO" },
    ],
    fundings: [
      {
        name: "DTI Innovation Grant",
        from: "DTI Region 8",
        amount: 500000,
        link: "/news/agritech-pitching",
        dateAwarded: "2024-06-10",
      },
      {
        name: "Agritech Pitching Champion",
        from: "Eastern Visayas Startup Summit",
        amount: 250000,
        link: "/news/agritech-pitching",
        dateAwarded: "2025-02-20",
      },
    ],
  },
  {
    companyName: "Island Link Logistics",
    productName: "IslandLink",
    dateFounded: "2022-03-01",
    address: "Tacloban City, Leyte",
    lat: 11.2405,
    lng: 125.0066,
    website: "https://example.com",
    employeeRange: "51-200",
    description:
      "Connecting island communities with dependable, tech-enabled freight and delivery services between the islands of Eastern Visayas.",
    province: "Leyte",
    logo: "",
    featured: true,
    status: "active",
    founders: [
      { name: "Karlo Mendoza", position: "Founder" },
      { name: "Ana Villanueva", position: "COO" },
    ],
    fundings: [
      {
        name: "Startup Summit 2026 Runner-Up",
        from: "Eastern Visayas Startup Summit",
        amount: 150000,
        link: "/news/startup-summit-2026",
        dateAwarded: "2026-03-05",
      },
    ],
  },
  {
    companyName: "SouthLeyte Eco-Tourism",
    productName: "EcoTrip PH",
    dateFounded: "2020-11-20",
    address: "Maasin City, Southern Leyte",
    lat: 10.1333,
    lng: 124.8444,
    website: "https://example.com",
    employeeRange: "1-10",
    description:
      "A booking platform that connects travelers with sustainable eco-tourism experiences in Southern Leyte's coastlines and marine sanctuaries.",
    province: "Southern Leyte",
    logo: "",
    featured: true,
    status: "active",
    founders: [{ name: "Liza Bautista", position: "Founder" }],
    fundings: [
      {
        name: "DOST TBI Seed Funding",
        from: "DOST Region 8",
        amount: 350000,
        link: "/government/dost-tbi",
        dateAwarded: "2023-08-01",
      },
    ],
  },
  {
    companyName: "Biliran AquaTech",
    productName: "AquaHarvest",
    dateFounded: "2023-02-10",
    address: "Naval, Biliran",
    lat: 11.5833,
    lng: 124.4167,
    website: "https://example.com",
    employeeRange: "1-10",
    description:
      "Smart aquaculture monitoring systems that help fish farmers in Biliran and Samar track water quality and feeding in real time.",
    province: "Biliran",
    logo: "",
    featured: false,
    status: "active",
    founders: [{ name: "Ramon Duran", position: "CEO" }],
    fundings: [
      {
        name: "Coastal Agri-Fisheries Innovation Award",
        from: "BFAR Eastern Visayas",
        amount: 120000,
        link: "/news/startup-bootcamp",
        dateAwarded: "2025-07-12",
      },
    ],
  },
  {
    companyName: "Samar Digital Craft",
    productName: "CraftConnect",
    dateFounded: "2019-09-05",
    address: "Catbalogan City, Samar",
    lat: 11.7753,
    lng: 124.8862,
    website: "https://example.com",
    employeeRange: "11-50",
    description:
      "An e-commerce platform bringing the handicrafts and woven products of Samar's artisans to national and international markets.",
    province: "Samar",
    logo: "",
    featured: true,
    status: "active",
    founders: [
      { name: "Nina Pascual", position: "Founder & Creative Director" },
      { name: "Danilo Reyes", position: "Co-founder" },
    ],
    fundings: [
      {
        name: "Women in Tech Seed Grant",
        from: "DTI Region 8",
        amount: 600000,
        link: "/government/dti-startup-support",
        dateAwarded: "2024-11-18",
      },
      {
        name: "Export Readiness Program Support",
        from: "DTI Region 8",
        amount: 200000,
        link: "/government/dti-startup-support",
        dateAwarded: "2025-04-30",
      },
    ],
  },
  {
    companyName: "NorthSamar Freelance Hub",
    productName: "NorthHub",
    dateFounded: "2024-01-12",
    address: "Catarman, Northern Samar",
    lat: 12.4989,
    lng: 124.6373,
    website: "https://example.com",
    employeeRange: "1-10",
    description:
      "A community-driven platform helping young professionals in Northern Samar find remote work and digital skills training.",
    province: "Northern Samar",
    logo: "",
    featured: false,
    status: "active",
    founders: [{ name: "Elena Cruz", position: "Founder" }],
  },
  {
    companyName: "EastSamar Seaweed Ventures",
    productName: "SeaGrow",
    dateFounded: "2022-07-18",
    address: "Borongan City, Eastern Samar",
    lat: 11.6057,
    lng: 125.4328,
    website: "https://example.com",
    employeeRange: "11-50",
    description:
      "Processing and exporting high-quality seaweed products, with a startup-grade supply chain app for coastal farmer cooperatives.",
    province: "Eastern Samar",
    logo: "",
    featured: true,
    status: "active",
    founders: [
      { name: "Mark Aguilar", position: "Founder" },
      { name: "Sonia Torres", position: "Head of Operations" },
    ],
    fundings: [
      {
        name: "DOST SETUP Technology Grant",
        from: "DOST Region 8",
        amount: 750000,
        link: "/government/dost-tbi",
        dateAwarded: "2025-01-25",
      },
    ],
  },
];

interface SeedStartup {
  founders: { name: string; position: string }[];
  fundings?: {
    name: string;
    from: string;
    amount: number;
    link: string;
    dateAwarded?: string;
  }[];
  slug?: string;
  [key: string]: unknown;
}

async function run(): Promise<void> {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  console.log(`Connected to MongoDB: ${uri} / ${dbName}`);

  const collections = {
    startups: "startups",
    founders: "founders",
    fundings: "fundings",
    news: "news",
    blogs: "blogs",
    carousel: "carousel_items",
    government: "government_pages",
  };

  await db.collection(collections.startups).createIndex({ province: 1 });
  await db.collection(collections.founders).createIndex({ startupId: 1 });
  await db.collection(collections.fundings).createIndex({ startupId: 1 });
  await db.collection(collections.news).createIndex({ slug: 1 }, { unique: true });
  await db.collection(collections.blogs).createIndex({ slug: 1 }, { unique: true });
  await db.collection(collections.government).createIndex({ slug: 1 }, { unique: true });
  await db.collection(collections.startups).createIndex({ slug: 1 }, { unique: true, sparse: true });

  await db.collection(collections.startups).deleteMany({});
  await db.collection(collections.founders).deleteMany({});
  await db.collection(collections.fundings).deleteMany({});
  await db.collection(collections.news).deleteMany({});
  await db.collection(collections.blogs).deleteMany({});
  await db.collection(collections.carousel).deleteMany({});
  await db.collection(collections.government).deleteMany({});

  await db.collection(collections.carousel).insertMany(carousel);
  await db.collection(collections.news).insertMany(news);
  await db.collection(collections.blogs).insertMany(blogs);
  await db.collection(collections.government).insertMany(government);

  for (const s of startups as SeedStartup[]) {
    const { founders, fundings, ...startup } = s;
    const slug =
      startup.slug && typeof startup.slug === "string"
        ? (startup.slug as string)
        : slugify(String(startup.companyName || "startup")) || "startup";
    const res = await db.collection(collections.startups).insertOne({
      ...startup,
      slug,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    await db.collection(collections.founders).insertMany(
      founders.map((f) => ({
        ...f,
        startupId: res.insertedId,
        createdAt: new Date().toISOString(),
      }))
    );
    if (fundings && fundings.length) {
      await db.collection(collections.fundings).insertMany(
        fundings.map((f) => ({
          ...f,
          startupId: res.insertedId,
          createdAt: new Date().toISOString(),
        }))
      );
    }
  }

  const counts: Record<string, number> = {};
  for (const [k, c] of Object.entries(collections)) {
    counts[k] = await db.collection(c).countDocuments();
  }
  console.log("Seeded collections:", counts);
  console.log("Provinces:", PROVINCES.join(", "));
  const dist: Record<string, number> = {};
  for (const p of PROVINCES) {
    dist[p] = await db.collection(collections.startups).countDocuments({ province: p });
  }
  console.log("Startups by province:", dist);

  await client.close();
  console.log("Done. Run `npm run dev` and visit http://localhost:3000");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
