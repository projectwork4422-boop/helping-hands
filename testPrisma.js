const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const service = await prisma.service.create({
      data: {
        name: "Test",
        description: "Test description",
        basePrice: 100,
        iconUrl: null,
        isActive: true,
      }
    });
    console.log("Success:", service);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
