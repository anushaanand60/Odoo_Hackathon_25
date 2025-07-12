const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createAdmin() {
    try {
        console.log('Creating admin user...');

        // Check if admin user already exists
        const existingAdmin = await prisma.user.findFirst({
            where: {
                OR: [
                    { role: 'ADMIN' },
                    { role: 'SUPER_ADMIN' },
                    { email: 'admin@skillswap.com' }
                ]
            }
        });

        if (existingAdmin) {
            console.log('Admin user already exists:', existingAdmin.email);
            console.log('Role:', existingAdmin.role);
            return;
        }

        // Create admin user
        const hashedPassword = await bcrypt.hash('admin123', 10);

        const adminUser = await prisma.user.create({
            data: {
                email: 'admin@skillswap.com',
                password: hashedPassword,
                name: 'Admin User',
                role: 'SUPER_ADMIN',
                isActive: true,
                isPublic: false // Admin profile should be private
            }
        });

        console.log('Admin user created successfully!');
        console.log('Email: admin@skillswap.com');
        console.log('Password: admin123');
        console.log('Role:', adminUser.role);
        console.log('');
        console.log('You can now login with these credentials to access the admin dashboard.');

    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Also function to promote existing user to admin
async function promoteUserToAdmin(email) {
    try {
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            console.log('User not found with email:', email);
            return;
        }

        const updatedUser = await prisma.user.update({
            where: { email },
            data: { role: 'ADMIN' }
        });

        console.log(`User ${email} promoted to ADMIN role successfully!`);
        return updatedUser;

    } catch (error) {
        console.error('Error promoting user:', error);
    }
}

// Check command line arguments
const args = process.argv.slice(2);
if (args.length > 0 && args[0] === 'promote') {
    if (args[1]) {
        promoteUserToAdmin(args[1]);
    } else {
        console.log('Usage: node createAdmin.js promote <email>');
    }
} else {
    createAdmin();
}

module.exports = { createAdmin, promoteUserToAdmin }; 