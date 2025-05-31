
"use client";
import React, { useEffect } from 'react';
import AppShell from '@/components/AppShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAppContext } from '@/contexts/AppContext';
import { Settings as SettingsIcon, ImageUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { theme, setTheme, user } = useAppContext();
  const { toast } = useToast();

  // Ensure theme is applied on mount
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  const handleThemeChange = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
  };

  const handleProfilePicUpload = () => {
    // Placeholder for Firebase Storage upload logic
    toast({
      title: "Feature Coming Soon!",
      description: "Profile picture upload will be available in a future update.",
    });
  };

  return (
    <AppShell>
      <div className="space-y-8">
        <header>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <SettingsIcon className="h-8 w-8 text-primary" /> Settings
          </h1>
          <p className="text-muted-foreground">Manage your application preferences and profile.</p>
        </header>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize the look and feel of the application.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="dark-mode" className="text-base">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Enable dark theme for a different visual experience.
                </p>
              </div>
              <Switch
                id="dark-mode"
                checked={theme === 'dark'}
                onCheckedChange={handleThemeChange}
                aria-label="Toggle dark mode"
              />
            </div>
          </CardContent>
        </Card>
        
        {user && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Manage your account details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="profile-picture" className="text-base">Profile Picture</Label>
                  <p className="text-sm text-muted-foreground">
                    Upload or change your avatar.
                  </p>
                </div>
                 <Button onClick={handleProfilePicUpload} variant="outline">
                    <ImageUp className="mr-2 h-4 w-4" /> Upload Picture
                  </Button>
              </div>
               {/* More profile settings can go here, e.g., change password */}
            </CardContent>
          </Card>
        )}

      </div>
    </AppShell>
  );
}
