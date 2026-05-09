const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const medicines = [
    { name: "Paracetamol 500mg", category: "Tablet", stock: 100, price: 5000 },
    { name: "Amoxicillin 500mg", category: "Kapsul", stock: 50, price: 15000 },
    { name: "Ibuprofen 400mg", category: "Tablet", stock: 75, price: 12000 },
    { name: "OBH Combi", category: "Sirup", stock: 20, price: 25000 },
    { name: "Vitamin C 1000mg", category: "Tablet", stock: 200, price: 10000 },
  ];

  for (const med of medicines) {
    await prisma.medicine.create({ data: med });
  }
  console.log("Medicines seeded!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
