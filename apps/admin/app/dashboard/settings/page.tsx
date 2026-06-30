"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "react-hot-toast";
import { Save, Shield, Bell, Moon, Sun, Globe, Settings as SettingsIcon } from "lucide-react";
import { ComingSoonBanner } from "@/components/ComingSoonBanner";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_GLOBAL_SETTINGS, UPDATE_GLOBAL_SETTINGS } from "@/lib/graphql/settings";
import { Switch } from "@/components/ui/switch";

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  orderUpdates: boolean;
  productUpdates: boolean;
}

export default function SettingsPage() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [language, setLanguage] = useState("en");
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    orderUpdates: true,
    productUpdates: false,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PasswordFormData>();

  const onPasswordSubmit = async (data: PasswordFormData) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      // TODO: Implement API call to change password
      console.log("Password change:", data);
      toast.success("Password changed successfully!");
      reset();
    } catch (error) {
      toast.error("Failed to change password");
    }
  };

  const handleThemeChange = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    toast.success(`Theme changed to ${newTheme} mode`);
  };

  const handleNotificationToggle = (key: keyof NotificationSettings) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    toast.success("Notification settings updated");
  };

  const { data, loading } = useQuery<any>(GET_GLOBAL_SETTINGS);
  const [updateGlobalSettings] = useMutation<any>(UPDATE_GLOBAL_SETTINGS);

  const handleScanBypassToggle = async (checked: boolean) => {
    try {
      await updateGlobalSettings({
        variables: {
          isPackerScanBypassEnabled: checked,
          minAppVersionAndroid: data?.getGlobalSettings?.minAppVersionAndroid,
          minAppVersionIos: data?.getGlobalSettings?.minAppVersionIos,
        },
        refetchQueries: [{ query: GET_GLOBAL_SETTINGS }],
      });
      toast.success(
        `Packer scan bypass ${checked ? "enabled" : "disabled"} successfully`
      );
    } catch (error) {
      toast.error("Failed to update scan bypass setting");
    }
  };

  const handleUpdateAppVersions = async () => {
    try {
      await updateGlobalSettings({
        variables: {
          isPackerScanBypassEnabled: data?.getGlobalSettings?.isPackerScanBypassEnabled,
          minAppVersionAndroid: (document.getElementById('minAppVersionAndroid') as HTMLInputElement).value,
          minAppVersionIos: (document.getElementById('minAppVersionIos') as HTMLInputElement).value,
        },
        refetchQueries: [{ query: GET_GLOBAL_SETTINGS }],
      });
      toast.success("Minimum app versions updated successfully");
    } catch (error) {
      toast.error("Failed to update minimum app versions");
    }
  };

  return (
    <div className="container max-w-4xl py-6 space-y-6 mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <Separator />

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security
          </CardTitle>
          <CardDescription>
            Update your password and security settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                placeholder="Enter current password"
                {...register("currentPassword", {
                  required: "Current password is required",
                })}
              />
              {errors.currentPassword && (
                <p className="text-sm text-red-600">
                  {errors.currentPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Enter new password"
                {...register("newPassword", {
                  required: "New password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                })}
              />
              {errors.newPassword && (
                <p className="text-sm text-red-600">
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                })}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-600">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full sm:w-auto">
              <Save className="h-4 w-4 mr-2" />
              Change Password
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Store Operations Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Store Operations
          </CardTitle>
          <CardDescription>
            Manage global operational settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Bypass Packer Scanning</Label>
              <p className="text-sm text-muted-foreground">
                If enabled, packers won't need to scan items individually. They will take 5 photos instead.
              </p>
            </div>
            <Switch
              checked={data?.getGlobalSettings?.isPackerScanBypassEnabled || false}
              onCheckedChange={handleScanBypassToggle}
              disabled={loading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Mobile App Versions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Mobile App Version Control
          </CardTitle>
          <CardDescription>
            Force users to update if their app version is below these minimums.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="minAppVersionAndroid">Minimum Android Version</Label>
              <Input
                id="minAppVersionAndroid"
                defaultValue={data?.getGlobalSettings?.minAppVersionAndroid || "1.0.0"}
                key={data?.getGlobalSettings?.minAppVersionAndroid} // Forces re-render when data loads
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="minAppVersionIos">Minimum iOS Version</Label>
              <Input
                id="minAppVersionIos"
                defaultValue={data?.getGlobalSettings?.minAppVersionIos || "1.0.0"}
                key={data?.getGlobalSettings?.minAppVersionIos}
              />
            </div>
          </div>
          <Button onClick={handleUpdateAppVersions} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            Save Versions
          </Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Configure how you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications via email
              </p>
            </div>
            <Button
              variant={notifications.emailNotifications ? "default" : "outline"}
              size="sm"
              onClick={() => handleNotificationToggle("emailNotifications")}
            >
              {notifications.emailNotifications ? "Enabled" : "Disabled"}
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive push notifications in browser
              </p>
            </div>
            <Button
              variant={notifications.pushNotifications ? "default" : "outline"}
              size="sm"
              onClick={() => handleNotificationToggle("pushNotifications")}
            >
              {notifications.pushNotifications ? "Enabled" : "Disabled"}
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Order Updates</Label>
              <p className="text-sm text-muted-foreground">
                Get notified about order changes
              </p>
            </div>
            <Button
              variant={notifications.orderUpdates ? "default" : "outline"}
              size="sm"
              onClick={() => handleNotificationToggle("orderUpdates")}
            >
              {notifications.orderUpdates ? "Enabled" : "Disabled"}
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Product Updates</Label>
              <p className="text-sm text-muted-foreground">
                Receive updates about new products
              </p>
            </div>
            <Button
              variant={notifications.productUpdates ? "default" : "outline"}
              size="sm"
              onClick={() => handleNotificationToggle("productUpdates")}
            >
              {notifications.productUpdates ? "Enabled" : "Disabled"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {theme === "light" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
            Appearance
          </CardTitle>
          <CardDescription>
            Customize the look and feel of your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Theme</Label>
              <p className="text-sm text-muted-foreground">
                Choose between light and dark mode
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleThemeChange}>
              {theme === "light" ? (
                <>
                  <Moon className="h-4 w-4 mr-2" />
                  Dark Mode
                </>
              ) : (
                <>
                  <Sun className="h-4 w-4 mr-2" />
                  Light Mode
                </>
              )}
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="language">Language</Label>
              <p className="text-sm text-muted-foreground">
                Select your preferred language
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <select
                id="language"
                value={language}
                onChange={(e) => {
                  setLanguage(e.target.value);
                  toast.success("Language updated");
                }}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible actions for your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Delete Account</Label>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all data
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => toast.error("This feature is disabled in demo")}
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
