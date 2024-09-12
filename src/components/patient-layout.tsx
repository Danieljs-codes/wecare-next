'use client';

import { Aside } from '@ui/aside';
import { Button } from '@ui/button';
import { Menu } from '@ui/menu';
import {
  IconBell,
  IconCalendar2,
  IconChevronLgDown,
  IconCirclePerson,
  IconDashboard,
  IconFolderDelete,
  IconHome,
  IconLogout,
  IconShieldCrossed,
  IconSearch,
  IconSettings,
  IconSupport,
  IconMoon,
} from 'justd-icons';
import { ReactNode, useCallback, useMemo } from 'react';
import { Avatar } from '@ui/avatar';
import { Link } from '@ui/link';
import { Logo } from '@components/logo';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { NotificationsSheet } from '@components/notifications-sheet';
import { PatientNotifications } from '@lib/types';
import { useMutation } from '@tanstack/react-query';
import { deletePatientAccount, logout } from '@/app/action';
import { toast } from 'sonner';

const asideItems = [
  { icon: IconDashboard, href: '/patient/dashboard', label: 'Overview' },
  { icon: IconSearch, href: '/patient/search', label: 'Search' },
  {
    icon: IconShieldCrossed,
    href: '/patient/appointments',
    label: 'Appointments',
  },
  {
    icon: IconCalendar2,
    href: '/patient/medical-history',
    label: 'Medical History',
  },
  { icon: IconSettings, href: '/patient/settings', label: 'Settings' },
];

const navbarButtons = [
  { icon: IconBell, label: 'Notifications' },
  { icon: IconSearch, label: 'Search' },
];

interface PatientLayoutProps {
  children: ReactNode;
  name: string;
  avatar: string;
  notifications: PatientNotifications[];
}

export function PatientLayout({
  children,
  avatar,
  name,
  notifications,
}: PatientLayoutProps) {
  const pathname = usePathname();
  const { setTheme, theme } = useTheme();
  const router = useRouter();

  const { mutateAsync } = useMutation({
    mutationKey: ['deleteAccount'],
    mutationFn: async () => {
      const res = await deletePatientAccount();
      if (res.success === false) {
        throw new Error(res.message);
      }
      return res;
    },
  });

  const toggleTheme = useCallback(
    () => setTheme(theme === 'light' ? 'dark' : 'light'),
    [setTheme, theme]
  );

  const handleLogout = useCallback(async () => {
    toast.promise(logout(), {
      loading: 'Logging out...',
      success: data => {
        router.push('/sign-in');
        return `${data.message}`;
      },
      error: 'Something went wrong while logging out',
    });
  }, [router]);

  const deleteUserAccount = useMemo(() => {
    return () => {
      toast.promise(mutateAsync(), {
        loading: 'Deleting account...',
        success: data => {
          return `${data.message}`;
        },
        error: (error: Error) => `${error.message}`,
      });
    };
  }, [mutateAsync]);

  const menuItems = useMemo(
    () => [
      { icon: IconHome, href: '/patient/dashboard', label: 'Home' },
      { icon: IconCirclePerson, label: 'Profile' },
      { icon: IconSupport, label: 'Contact Support' },
      { type: 'separator' as const },
      { icon: IconMoon, label: 'Toggle theme', onAction: toggleTheme },
      { icon: IconLogout, label: 'Log out', onAction: handleLogout },
      {
        icon: IconFolderDelete,
        label: 'Delete account',
        intent: 'danger' as const,
        onAction: deleteUserAccount,
      },
    ],
    [toggleTheme, handleLogout, deleteUserAccount]
  );

  const openNotifications = useCallback(
    () => router.push('?notifications=open'),
    [router]
  );

  return (
    <div>
      <Aside.Layout
        navbar={
          <Aside.Responsive>
            {navbarButtons.map(({ icon: Icon, label }) => (
              <Button
                key={label}
                aria-label={label}
                appearance="plain"
                shape="circle"
                size="square-petite"
                onPress={
                  label === 'Notifications' ? openNotifications : undefined
                }
              >
                <Icon />
              </Button>
            ))}
            <Menu>
              <Button
                appearance="plain"
                size="square-petite"
                shape="circle"
                aria-label="Profile"
                className="group"
              >
                <Avatar size="medium" src={avatar} />
              </Button>
              <Menu.Content placement="top" className="min-w-[--trigger-width]">
                {menuItems.map((item, index) =>
                  item.type === 'separator' ? (
                    <Menu.Separator key={`separator-${index}`} />
                  ) : (
                    <Menu.Item
                      className="text-sm"
                      key={item.label}
                      href={item.href}
                      isDanger={item.intent === 'danger'}
                      onAction={item.onAction}
                    >
                      {item.icon && <item.icon />}
                      {item.label}
                    </Menu.Item>
                  )
                )}
              </Menu.Content>
            </Menu>
          </Aside.Responsive>
        }
        aside={
          <>
            <Aside.Header>
              <Link className="flex items-center gap-x-2" href="#">
                <Logo />
              </Link>
            </Aside.Header>
            <Aside.Content>
              <Aside.Section>
                {asideItems.map(({ icon, href, label }) => (
                  <Aside.Item
                    key={label}
                    icon={icon}
                    href={href}
                    isCurrent={pathname === href}
                  >
                    {label}
                  </Aside.Item>
                ))}
              </Aside.Section>
            </Aside.Content>
            <Aside.Footer className="lg:flex lg:flex-row hidden items-center">
              <Menu>
                <Button
                  appearance="plain"
                  aria-label="Profile"
                  className="group w-full justify-start flex"
                >
                  <Avatar
                    size="extra-small"
                    shape="square"
                    className="-ml-1.5"
                    src={avatar}
                  />
                  {name}
                  <IconChevronLgDown className="right-3 absolute group-pressed:rotate-180 transition-transform" />
                </Button>
                <Menu.Content
                  placement="top"
                  className="min-w-[--trigger-width]"
                >
                  {menuItems.map((item, index) =>
                    item.type === 'separator' ? (
                      <Menu.Separator key={`separator-${index}`} />
                    ) : (
                      <Menu.Item
                        key={item.label}
                        className="text-sm"
                        href={item.href}
                        isDanger={item.intent === 'danger'}
                        onAction={item.onAction}
                      >
                        {item.icon && <item.icon />}
                        {item.label}
                      </Menu.Item>
                    )
                  )}
                </Menu.Content>
              </Menu>
              <Button
                appearance="plain"
                size="square-petite"
                aria-label="Notifications"
                onPress={openNotifications}
                className="ml-1"
              >
                <IconBell />
              </Button>
            </Aside.Footer>
          </>
        }
      >
        <main className="relative">{children}</main>
      </Aside.Layout>
      <NotificationsSheet notifications={notifications} userType="patient" />
    </div>
  );
}
