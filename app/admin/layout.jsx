import AdminLayout from "@/components/admin/AdminLayout";

export const metadata = {
  title: "PakCards - Admin Dashboard",
  description: "PakCards Admin - Manage stores, products and orders",
};

export default function RootAdminLayout({ children }) {
  return (
    <>
      <AdminLayout>{children}</AdminLayout>
    </>
  );
}
