import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Home as HomeIcon,
  DollarSign as DollarSignIcon,
  TrendingUp as TrendingUpIcon,
  Zap as ZapIcon,
  Users as UsersIcon,
  Briefcase as BriefcaseIcon,
  Globe as GlobeIcon,
  Bell as BellIcon,
  Target as TargetIcon,
  Settings as SettingsIcon,
} from 'lucide-react';

interface SidebarItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface SidebarProps {
  items: SidebarItem[];
}

// Define the new, fixed items based on the API structure
const defaultSidebarItems: SidebarItem[] = [
  { label: 'Dashboard', href: '/', icon: <HomeIcon size={20} /> },
  { label: 'My Profile', href: '/users/me', icon: <UsersIcon size={20} /> },
  { label: 'Accounts', href: '/accounts', icon: <DollarSignIcon size={20} /> },
  { label: 'Transactions', href: '/transactions', icon: <TrendingUpIcon size={20} /> },
  { label: 'Budgets', href: '/budgets', icon: <TargetIcon size={20} /> },
  { label: 'Investments', href: '/investments', icon: <BriefcaseIcon size={20} /> },
  { label: 'AI Advisor', href: '/ai/advisor', icon: <ZapIcon size={20} /> },
  { label: 'Web3 Assets', href: '/web3/wallets', icon: <GlobeIcon size={20} /> },
  { label: 'Notifications', href: '/notifications', icon: <BellIcon size={20} /> },
  { label: 'Settings', href: '/settings', icon: <SettingsIcon size={20} /> },
];

const Sidebar: React.FC<SidebarProps> = ({ items = defaultSidebarItems }) => {
  const router = useRouter();

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen p-4 shadow-2xl">
      <div className="mb-8 border-b border-gray-700 pb-4">
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 text-center tracking-wider">
          Quantum Core 3.0
        </h2>
        <p className="text-xs text-center text-gray-500 mt-1">AI Financial Ecosystem</p>
      </div>
      <nav>
        <ul>
          {items.map((item) => (
            <li key={item.href} className="mb-2">
              <Link href={item.href} passHref>
                <a
                  className={`flex items-center p-3 rounded-xl transition-all duration-300 font-medium ${
                    router.pathname === item.href || (item.href !== '/' && router.pathname.startsWith(item.href))
                      ? 'bg-purple-700 text-white shadow-lg shadow-purple-900/50 transform scale-[1.02]'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-blue-400'
                  }`}
                >
                  {item.icon && <span className="mr-4">{item.icon}</span>}
                  <span>{item.label}</span>
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;