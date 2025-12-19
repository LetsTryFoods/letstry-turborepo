"use client";

import { User, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/providers/auth-provider";
import { useState } from "react";

interface ProfileFieldProps {
  label: string;
  value?: string;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}

const ProfileField = ({ label, value, placeholder, type = "text", disabled }: ProfileFieldProps) => (
  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
    <label className="text-sm font-medium text-black w-1/3">{label}</label>
    <Input 
      defaultValue={value} 
      type={type}
      className="border-0 text-right focus-visible:ring-0 px-0 w-2/3 text-black placeholder:text-black"
      placeholder={placeholder}
      disabled={disabled}
    />
  </div>
);

export const ProfileInfo = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="bg-white rounded-xl border-2 border-gray-300 p-8">
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center border border-black">
            <User className="w-8 h-8 text-black" />
          </div>
          <div>
            <h2 className="font-semibold text-lg text-black">{user?.name || "Guest User"}</h2>
            <p className="text-black">{user?.email || "guest@example.com"}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsEditing(!isEditing)}>
          <Pencil className="w-5 h-5 text-black" />
        </Button>
      </div>

      <form className="space-y-6">
        <div className="grid gap-6">
          <ProfileField 
            label="Name" 
            value={user?.name} 
            placeholder="Your name" 
            disabled={!isEditing} 
          />
          <ProfileField 
            label="Email Account" 
            value={user?.email} 
            placeholder="yourname@gmail.com" 
            disabled={!isEditing} 
          />
          <ProfileField 
            label="Mobile Number" 
            value={user?.phoneNumber || "1234567890"} 
            placeholder="1234567890" 
            disabled={!isEditing} 
          />
          <ProfileField 
            label="Date of Birth" 
            type="date"
            disabled={!isEditing} 
          />
        </div>

        <div className="pt-4">
          <Button className="bg-[#1A4D63] hover:bg-[#133b4d] text-white px-8 py-6 text-lg w-full sm:w-auto rounded-lg">
            Save changes
          </Button>
        </div>
      </form>
    </div>
  );
};
