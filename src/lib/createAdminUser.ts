export const createAdminUser = async (email: string, password: string) => {
  try {
    const response = await fetch('/functions/v1/create-admin-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create admin user');
    }

    return data;
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
};