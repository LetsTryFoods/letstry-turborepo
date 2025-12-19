import { ProfileSidebar } from "@/components/profile/profile-sidebar";
import { ProfileInfo } from "@/components/profile/profile-info";

export default function ProfilePage() {
  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Account</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <ProfileSidebar />
          </div>
          <div className="lg:col-span-2">
            <ProfileInfo />
          </div>
        </div>
      </div>
    </div>
  );
}
