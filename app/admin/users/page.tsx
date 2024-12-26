import { createClient } from '@/utils/supabase/server';
import { log } from 'console';
import { redirect } from 'next/navigation';

export default async function AdminUsersPage() {
  const supabase = await createClient();
  
  // Check if user is authenticated and has admin role
  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  // Fetch user's profile to check role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    redirect('/');
  }

  // Fetch all user profiles
  const { data: users } = await supabase
    .from('profiles').select('*')

  console.log(users);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-800 shadow-md rounded-lg">
          <thead>
            <tr className="border-b dark:border-gray-700">
              <th className="px-6 py-3 text-left">Full Name</th>
              <th className="px-6 py-3 text-left">Role</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((user) => (
              <UserRow key={user.id} user={user} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UserRow({ user }: { user: any }) {
  return (
    <tr className="border-b dark:border-gray-700">
      <td className="px-6 py-4">{user.full_name}</td>
      <td className="px-6 py-4">{user.role}</td>
      <td className="px-6 py-4">
        <form action="/admin/update-user-role" method="POST">
          <input type="hidden" name="userId" value={user.id} />
          <select 
            name="role" 
            defaultValue={user.role}
            className="mr-2 p-2 border rounded dark:bg-gray-700"
          >
            <option value="children">Children</option>
            <option value="admin">Admin</option>
          </select>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Update
          </button>
        </form>
      </td>
    </tr>
  );
} 