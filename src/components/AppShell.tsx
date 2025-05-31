
"use client";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import Logo from '@/components/Logo';
import { LayoutDashboard, ListChecks, Target, BarChart3, Settings, LogOut, UserCircle, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAppContext } from '@/contexts/AppContext';
import { Skeleton } from '@/components/ui/skeleton'; // For loading state
import { useToast } from '@/hooks/use-toast';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transactions', icon: ListChecks },
  { href: '/budgets', label: 'Budgets', icon: Target },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

const publicPaths = ['/login', '/signup'];

interface AppShellProps {
  children: React.ReactNode;
}

const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, authLoading, logout, theme } = useAppContext();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading) {
      if (!user && !publicPaths.includes(pathname)) {
        router.push('/login');
      }
    }
  }, [user, authLoading, pathname, router]);
  
  useEffect(() => {
    // Apply theme class to HTML element for global styling
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  const handleLogout = async () => {
    try {
      await logout();
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
      router.push('/login');
    } catch (error) {
      toast({ variant: "destructive", title: "Logout Failed", description: "Could not log out. Please try again." });
    }
  };
  
  const getUserInitials = () => {
    if (user?.displayName) {
      return user.displayName.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="space-y-4 p-8">
          <Logo size="lg" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }
  
  // If not authenticated and on a public page, don't render full AppShell, just children (e.g. Login page)
  if (!user && publicPaths.includes(pathname)) {
      return <>{children}</>;
  }
  
  // If tried to access protected page without user (should be caught by useEffect redirect, but as fallback)
  if (!user && !publicPaths.includes(pathname)) {
    return ( // Or a dedicated "Access Denied" page
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p>Redirecting to login...</p> 
      </div>
    );
  }


  return (
    <SidebarProvider defaultOpen>
      <Sidebar side="left" variant="sidebar" collapsible="icon">
        <SidebarHeader className="p-4">
          <div className="flex items-center justify-between">
            <Logo />
            <div className="md:hidden">
              <SidebarTrigger />
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent className="flex-1 p-2">
          {user ? (
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href} passHref legacyBehavior>
                    <SidebarMenuButton
                      isActive={pathname.startsWith(item.href)}
                      tooltip={{ children: item.label, side: 'right', align: 'center' }}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          ) : (
             <SidebarMenu>
                <SidebarMenuItem>
                    <Link href="/login" passHref legacyBehavior>
                        <SidebarMenuButton tooltip={{ children: "Login", side: 'right', align: 'center' }}>
                            <LogIn />
                            <span>Login</span>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
             </SidebarMenu>
          )}
        </SidebarContent>
        <SidebarFooter className="p-4 border-t border-sidebar-border">
           {user ? (
             <>
              <Button variant="ghost" className="w-full justify-start gap-2" onClick={handleLogout}>
                <LogOut />
                <span className="group-data-[collapsible=icon]:hidden">Logout</span>
              </Button>
              <div className="flex items-center gap-2 mt-2 group-data-[collapsible=icon]:justify-center">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL || `https://placehold.co/40x40.png?text=${getUserInitials()}`} alt="User Avatar" data-ai-hint="person portrait" />
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                  <div className="group-data-[collapsible=icon]:hidden truncate">
                    <p className="text-sm font-medium truncate">{user.displayName || "User"}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
              </div>
             </>
           ) : (
             <Button asChild variant="default" className="w-full">
                <Link href="/login">Login / Sign Up</Link>
             </Button>
           )}
           <div className="mt-4 pt-4 border-t border-sidebar-border text-center group-data-[collapsible=icon]:hidden">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} BudgetWise. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground">
              Developed with ❤️ by Minjxnx
            </p>
           </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="bg-background">
        <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 bg-background/80 backdrop-blur-sm border-b md:hidden">
          <Logo size="sm" />
          <SidebarTrigger />
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AppShell;
