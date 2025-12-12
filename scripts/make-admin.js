// Script to make a user admin by email or Clerk ID
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function makeAdmin() {
  try {
    // Get all users to inspect
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
      },
    });

    console.log("\n📋 Current users in database:");
    console.log("================================");
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Admin: ${user.isAdmin ? "✅ YES" : "❌ NO"}`);
      console.log("");
    });

    // Find user by name or email containing "Zeeshan"
    const zeeshanUser = users.find(
      (u) =>
        u.name.toLowerCase().includes("zeeshan") ||
        u.email.toLowerCase().includes("zeeshan")
    );

    if (zeeshanUser) {
      if (zeeshanUser.isAdmin) {
        console.log(
          `✅ ${zeeshanUser.name} is already an admin! No changes needed.`
        );
      } else {
        console.log(`🔧 Making ${zeeshanUser.name} an admin...`);
        const updated = await prisma.user.update({
          where: { id: zeeshanUser.id },
          data: { isAdmin: true },
        });
        console.log(
          `✅ SUCCESS! ${updated.name} is now an admin. Please refresh your browser.`
        );
      }
    } else {
      console.log(
        '⚠️  No user found with "Zeeshan" in name or email. Available users listed above.'
      );
      console.log(
        "\nTo make a specific user admin, update this script with their exact email."
      );
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

makeAdmin();
