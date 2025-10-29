import { createAdminUser } from '@/lib/createAdminUser';

// Utility function to create the specific admin user
export const createSpecificAdmin = async () => {
  try {
    const result = await createAdminUser(
      'hennadii.shvedko@shvedko.dev',
      'qwerty'
    );
    console.log('Admin user created successfully:', result);
    return result;
  } catch (error) {
    console.error('Failed to create admin user:', error);
    throw error;
  }
};

// Run this function to create the admin user
// Uncomment the line below and run this file to create the admin user:
// createSpecificAdmin();