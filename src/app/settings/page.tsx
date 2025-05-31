"use client";
import React, { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppContext } from '@/contexts/AppContext';
import { Settings as SettingsIcon, ImageUp, Palette, Coins, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { currencies } from '@/libs/currencies'; // Import currencies

export default function SettingsPage() {
  const { user, userSettings, settingsLoading, updateUserSetting, theme } = useAppContext();
  const { toast } = useToast();
  const [selectedCurrency, setSelectedCurrency] = useState(userSettings?.currency || 'USD');

  useEffect(() => {
    if (userSettings?.currency) {
      setSelectedCurrency(userSettings.currency);
    }
  }, [userSettings?.currency]);

  const handleThemeChange = async (checked: boolean) => {
    const newTheme = checked ? 'dark' : 'light';
    try {
      await updateUserSetting('theme', newTheme);
      toast({ title: "Theme Updated", description: `Switched to ${newTheme} mode.` });
    } catch (error) {
      toast({ variant: "destructive", title: "Theme Update Failed", description: "Could not save theme preference." });
    }
  };

  const handleCurrencyChange = async (newCurrency: string) => {
    setSelectedCurrency(newCurrency); // Optimistic UI update
    try {
      await updateUserSetting('currency', newCurrency);
      toast({ title: "Currency Updated", description: `Default currency set to ${newCurrency}.` });
    } catch (error) {
      toast({ variant: "destructive", title: "Currency Update Failed", description: "Could not save currency preference." });
      // Revert optimistic update if needed, or re-fetch settings
      if (userSettings?.currency) setSelectedCurrency(userSettings.currency);
    }
  };

  const handleProfilePicUpload = () => {
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
              <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5 text-primary" /> Appearance</CardTitle>
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
                {settingsLoading && !userSettings ? (
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                ) : (
                    <Switch
                        id="dark-mode"
                        checked={theme === 'dark'} // Use the globally applied theme for switch state
                        onCheckedChange={handleThemeChange}
                        aria-label="Toggle dark mode"
                        disabled={settingsLoading}
                    />
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Coins className="h-5 w-5 text-primary" /> General</CardTitle>
              <CardDescription>Manage general application settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="currency" className="text-base">Default Currency</Label>
                  <p className="text-sm text-muted-foreground">
                    Set your preferred currency for displaying amounts.
                  </p>
                </div>
                {settingsLoading && !userSettings ? (
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                ) : (
                    <Select
                        value={selectedCurrency}
                        onValueChange={handleCurrencyChange}
                        disabled={settingsLoading}
                    >
                      <SelectTrigger id="currency" className="w-[180px]">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map(curr => (
                            <SelectItem key={curr.code} value={curr.code}>
                              {curr.name} ({curr.code})
                            </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                )}
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
                    <Button onClick={handleProfilePicUpload} variant="outline" disabled={settingsLoading}>
                      <ImageUp className="mr-2 h-4 w-4" /> Upload Picture
                    </Button>
                  </div>
                </CardContent>
              </Card>
          )}

        </div>
      </AppShell>
  );
}