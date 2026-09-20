import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PTA = { lat: -25.7545, lng: 28.1889 };

const vendors = [
  ["Rustic Rock Venue", "Venues", -25.72, 28.12, "Bushveld wedding venue with rustic charm, 20 minutes from Pretoria."],
  ["Casa Toscana", "Venues", -25.746, 28.21, "Tuscan-style function venue with illuminated courtyards and fountain."],
  ["Morgenzon", "Venues", -25.78, 28.26, "Elegant indoor hall with chandeliers — seats 200 guests."],
  ["Bukra Manana Function Venue", "Venues", -25.69, 28.15, "Moroccan-inspired venue with star fountain and gardens."],
  ["Zambesi Lodge", "Venues", -25.65, 28.3, "Lodge venue on the Zambezi drive with reception hall and gardens."],
  ["Grace Falls Wedding Chapel", "Venues", -25.83, 28.1, "Outdoor chapel and waterfall backdrop for ceremonies."],
  ["Braai Master Catering", "Catering & Bar", -25.75, 28.2, "Traditional SA braai and potjie catering for weddings up to 300 guests."],
  ["Silver Spoon Events", "Catering & Bar", -25.77, 28.22, "Contemporary plated menus, cocktail evenings and full bar service."],
  ["Lens & Vow Photography", "Photography & Video", -25.76, 28.19, "Documentary-style wedding photography and cinematic video."],
  ["Golden Hour Films", "Photography & Video", -25.74, 28.24, "Wedding videography — highlight films, drone coverage, same-day edits."],
  ["Bloom & co Florals", "Flowers & Decor", -25.79, 28.16, "Bridal bouquets, centrepieces and full venue styling."],
  ["The Groom Room Suit Hire", "Dresses & Suits", -25.755, 28.2, "Suits and formalwear hire, plus alterations for the whole bridal party."],
  ["Brides by Anzelle", "Dresses & Suits", -25.71, 28.18, "Bridal boutique — gowns, veils and accessories by appointment."],
  ["Glow Bridal Makeup Studio", "Hair & Makeup", -25.78, 28.21, "Airbrush bridal makeup and hairstyling, on-location service."],
] as const;

async function main() {
  for (const [name, category, lat, lng, description] of vendors) {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const email = `${slug}@vendors.weddo.local`;
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, role: "VENDOR" },
    });
    await prisma.vendor.upsert({
      where: { slug },
      update: { category, description, baseLat: lat, baseLng: lng },
      create: {
        userId: user.id,
        businessName: name,
        slug,
        category,
        description,
        baseRegion: "Pretoria, Gauteng",
        baseLat: lat,
        baseLng: lng,
        status: "APPROVED",
        approvedAt: new Date(),
        ratingAvg: 4.5 + Math.random() * 0.5,
        ratingCount: Math.floor(Math.random() * 20) + 1,
      },
    });
  }
  console.log(`Seeded ${vendors.length} vendors.`);

  const bundles = [
    ["Starter", 15, 45000],
    ["Growth", 50, 135000],
    ["Pro", 150, 360000],
  ] as const;
  for (const [name, credits, priceCents] of bundles) {
    await prisma.creditBundle.upsert({
      where: { id: `bundle-${name.toLowerCase()}` },
      update: { credits, priceCents },
      create: { id: `bundle-${name.toLowerCase()}`, name, credits, priceCents },
    });
  }
  console.log("Seeded credit bundles.");

  // Admin account
  await prisma.user.upsert({
    where: { email: "admin@everafter.co.za" },
    update: {},
    create: { email: "admin@everafter.co.za", role: "ADMIN" },
  });
  console.log("Seeded admin (admin@everafter.co.za).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
