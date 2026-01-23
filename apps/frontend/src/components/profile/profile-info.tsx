"use client";

import { User, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/providers/auth-provider";
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useUpdateUser } from "@/lib/auth/use-update-user";
import { graphqlClient } from "@/lib/graphql/client-factory";
import { ME_QUERY } from "@/lib/queries/auth";

interface ProfileFormData {
  name: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
}

interface ProfileFieldProps {
  label: string;
  type?: string;
  disabled?: boolean;
  control: any;
  name: keyof ProfileFormData;
  placeholder?: string;
}

interface UserData {
  _id: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  email?: string;
  dateOfBirth?: string;
}

const ProfileField = ({ label, type = "text", disabled, control, name, placeholder }: ProfileFieldProps) => (
  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
    <label className="text-sm font-medium text-black w-1/3">{label}</label>
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const displayValue = type === "date" && field.value && disabled
          ? new Date(field.value).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
          : field.value;
        
        return (
          <Input
            {...field}
            value={disabled && type === "date" ? displayValue : field.value}
            type={disabled && type === "date" ? "text" : type}
            className="border-0 text-right focus-visible:ring-0 px-0 w-2/3 text-black placeholder:text-black"
            placeholder={placeholder}
            disabled={disabled}
          />
        );
      }}
    />
  </div>
);

export const ProfileInfo = () => {
  const { isAuthenticated } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!isAuthenticated) return;

      try {
        setIsLoading(true);
        const data = await graphqlClient.request(ME_QUERY) as { me: UserData };
        if (data.me) {
          setUserData(data.me);
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [isAuthenticated]);

  const fullName = userData ? `${userData.firstName} ${userData.lastName}`.trim() : "";

  const { control, handleSubmit, reset } = useForm<ProfileFormData>({
    defaultValues: {
      name: fullName,
      email: userData?.email || "",
      phoneNumber: userData?.phoneNumber || "",
      dateOfBirth: userData?.dateOfBirth ? new Date(userData.dateOfBirth).toISOString().split('T')[0] : "",
    },
  });

  useEffect(() => {
    if (userData) {
      reset({
        name: fullName,
        email: userData.email || "",
        phoneNumber: userData.phoneNumber || "",
        dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth).toISOString().split('T')[0] : "",
      });
    }
  }, [userData, fullName, reset]);

  const { updateUser, isPending } = useUpdateUser(() => {
    setIsEditing(false);
  });

  const onSubmit = (data: ProfileFormData) => {
    const [firstName, ...lastNameParts] = data.name.split(" ");
    const lastName = lastNameParts.join(" ");
    updateUser({
      firstName,
      lastName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border-2 border-gray-300 p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border-2 border-gray-300 p-8">
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center border border-black">
            <User className="w-8 h-8 text-black" />
          </div>
          <div>
            <h2 className="font-semibold text-lg text-black">{fullName || "Guest User"}</h2>
            <p className="text-black">{userData?.email || "guest@example.com"}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsEditing(!isEditing)}>
          <Pencil className="w-5 h-5 text-black" />
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6">
          <ProfileField
            label="Name"
            control={control}
            name="name"
            placeholder="Your name"
            disabled={!isEditing}
          />
          <ProfileField
            label="Email Account"
            control={control}
            name="email"
            placeholder="yourname@gmail.com"
            disabled={!isEditing}
          />
          <ProfileField
            label="Mobile Number"
            control={control}
            name="phoneNumber"
            placeholder="1234567890"
            disabled={!isEditing}
          />
          <ProfileField
            label="Date of Birth"
            type="date"
            control={control}
            name="dateOfBirth"
            disabled={!isEditing}
          />
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            disabled={!isEditing || isPending}
            className="bg-[#1A4D63] hover:bg-[#133b4d] text-white px-8 py-6 text-lg w-full sm:w-auto rounded-lg"
          >
            Save changes
          </Button>
        </div>
      </form>
    </div>
  );
};
