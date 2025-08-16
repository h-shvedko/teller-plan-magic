-- Set administrator role for the correct user
INSERT INTO user_roles (user_id, role) 
SELECT id, 'administrator'::app_role 
FROM auth.users 
WHERE email = 'hennadii.shvedko@shvedko.dev'
ON CONFLICT (user_id, role) DO NOTHING;