const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function setAdmin() {
  try {
    const userId = "user_357N8AecPsLiS0wVIMzdWcxBsAZ";

    // Update the user to be admin
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isAdmin: true },
    });

    console.log("✅ User set as admin successfully:");
    console.log(`   ID: ${updatedUser.id}`);
    console.log(`   Email: ${updatedUser.email}`);
    console.log(`   Name: ${updatedUser.name}`);
    console.log(`   isAdmin: ${updatedUser.isAdmin}`);
  } catch (error) {
    console.error("❌ Error setting admin:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

setAdmin();
