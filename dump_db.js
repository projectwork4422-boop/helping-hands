const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');

async function main() {
  try {
    const users = await prisma.user.findMany({ where: { role: 'CLIENT' }});
    if (users.length === 0) return console.log('No client user found');
    const user = users[0];
    
    const locations = await prisma.savedLocation.findMany({ where: { userId: user.id }});
    const activeHierarchy = await prisma.district.findMany({
      where: { isActive: true },
      include: {
        towns: {
          include: {
            cities: true
          }
        }
      }
    });
    
    fs.writeFileSync('db_dump.json', JSON.stringify({ locations, activeHierarchy }, null, 2));
    console.log('Dump successful!');
  } catch(e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
