import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create companies
  const speakerDrive = await prisma.company.create({
    data: {
      company_name: 'Speaker Drive',
      company_address: 'Philadelphia',
    },
  });

  const testDrive = await prisma.company.create({
    data: {
      company_name: 'Test Drive',
      company_address: 'New York',
    },
  });

  // Hash password
  const hashedPassword = await bcrypt.hash('12345Qwe!', 10);

  // Create users
  await prisma.user.create({
    data: {
      email: 'fevegapo@teleg.eu',
      password: hashedPassword,
      user_type: 'Admin',
      user_role: 'Owner',
      fname: 'Austin',
      lname: 'Benton',
      status: 'Active',
      company: speakerDrive.id,
    },
  });

  await prisma.user.create({
    data: {
      email: 'bleuewulf@gmail.com',
      password: hashedPassword,
      user_type: 'Admin',
      user_role: 'Staff',
      fname: 'Jiggy',
      lname: 'Alteros',
      status: 'Active',
      company: speakerDrive.id,
    },
  });

  await prisma.user.create({
    data: {
      email: 'bleuewulf+sdrive01@gmail.com',
      password: hashedPassword,
      user_type: 'Client',
      user_role: 'Owner',
      fname: 'John Test',
      lname: 'Doe',
      status: 'Active',
      company: testDrive.id,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });