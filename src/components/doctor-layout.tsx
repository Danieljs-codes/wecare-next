'use client';

import { Aside } from '@ui/aside';
import { Button } from '@ui/button';
import { Menu } from '@ui/menu';
import {
  IconAccessible,
  IconBell,
  IconCalendar2,
  IconChevronLgDown,
  IconCirclePerson,
  IconDashboard,
  IconFolderDelete,
  IconHome,
  IconLogout,
  IconSearch,
  IconSettings,
  IconSupport,
} from 'justd-icons';
import { ReactNode } from 'react';
import { Avatar } from '@ui/avatar';
import { Link } from '@ui/link';
import { Logo } from './logo';
import { usePathname } from 'next/navigation';

const asideItems = [
  { icon: IconDashboard, href: '/doctor/dashboard', label: 'Overview' },
  { icon: IconAccessible, href: '/doctor/patients', label: 'Patients' },
  { icon: IconCalendar2, href: '/doctor/appointments', label: 'Appointments' },
  { icon: IconSettings, href: '/doctor/settings', label: 'Settings' },
];

const navbarButtons = [
  { icon: IconBell, label: 'Inbox' },
  { icon: IconSearch, label: 'Search' },
];

const menuItems = [
  { icon: IconHome, href: '/doctor/dashboard', label: 'Home' },
  { icon: IconCirclePerson, label: 'Profile' },
  { icon: IconSupport, label: 'Contact Support' },
  { type: 'separator' },
  { icon: IconLogout, label: 'Log out' },
  { icon: IconFolderDelete, label: 'Delete account', intent: 'danger' },
];

interface DoctorLayoutProps {
  children: ReactNode;
  name: string;
  avatar: string;
}

export function DoctorLayout({ children, avatar, name }: DoctorLayoutProps) {
  const pathname = usePathname();

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
                        onAction={
                          !item.href
                            ? () => console.log(`Action: ${item.label}`)
                            : undefined
                        }
                      >
                        {item.icon && <item.icon />}
                        {item.label}
                      </Menu.Item>
                    )
                  )}
                </Menu.Content>
              </Menu>
            </Aside.Footer>
          </>
        }
      >
        <main className="relative">{children}</main>
      </Aside.Layout>
    </div>
  );
}
