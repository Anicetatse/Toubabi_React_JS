const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('=== COMMUNES ===');
    const communes = await prisma.$queryRawUnsafe(`DESCRIBE communes`);
    console.log(JSON.stringify(communes, null, 2));
    
    console.log('\n=== PRODUITS ===');
    const produits = await prisma.$queryRawUnsafe(`DESCRIBE produits`);
    console.log(JSON.stringify(produits, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();

