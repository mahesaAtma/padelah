import { Link, usePage } from '@inertiajs/react';
import {
    LayoutGrid,
    Building2,
    Tags,
    Users,
    Activity,
    UserCircle,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { NavItem } from '@/types';

const superadminNav: NavItem[] = [
    { title: 'Dashboard', href: '/admin', icon: LayoutGrid },
    { title: 'Venues', href: '/admin/venues', icon: Building2 },
    { title: 'Fasilitas', href: '/admin/facilities', icon: Tags },
    { title: 'Users', href: '/admin/users', icon: Users },
    { title: 'Activity Log', href: '/admin/activity-logs', icon: Activity },
    { title: 'Profil Saya', href: '/admin/profile', icon: UserCircle },
];

const venueAdminNav: NavItem[] = [
    { title: 'Dashboard', href: '/admin', icon: LayoutGrid },
    { title: 'Venue Saya', href: '/admin/venues', icon: Building2 },
    { title: 'Activity Log', href: '/admin/activity-logs', icon: Activity },
    { title: 'Profil Saya', href: '/admin/profile', icon: UserCircle },
];

export function AdminSidebar() {
    const { auth } = usePage<{ auth: { user: { type: string } } }>().props;
    const navItems =
        auth.user.type === 'superadmin' ? superadminNav : venueAdminNav;

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={navItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
