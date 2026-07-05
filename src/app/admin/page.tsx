import { createServerSupabase } from "@/lib/supabase-server";
import { DB } from "@/lib/db";
import AdminPanel from "../components/admin/AdminPanel";
import AdminLoginForm from "./AdminLoginForm";

export default async function AdminPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <AdminLoginForm />;
  }

  const { data: profile } = await supabase
    .from(DB.TABLES.PROFILES)
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== DB.ROLES.ADMIN) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <p className="text-gray-600 font-semibold">Geen toegang.</p>
      </div>
    );
  }

  return <AdminPanel />;
}
