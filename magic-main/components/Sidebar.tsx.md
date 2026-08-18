import React, { useState } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Collapse,
  useTheme,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  AccountBalanceWallet as WalletIcon,
  TrendingUp as TradingIcon,
  Settings as SettingsIcon,
  HelpOutline as HelpIcon,
  ExitToApp as LogoutIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  ExpandLess,
  ExpandMore,
  BarChart as AnalyticsIcon,
  Security as SecurityIcon,
  People as TeamIcon,
  Business as VentureIcon,
  Message as ChatIcon,
  Notifications as NotificationIcon,
} from '@mui/icons-material';

// This constant defines the width of the drawer when open
const DRAWER_WIDTH = 240;

// This component renders the sidebar navigation for the application.
// It supports expanding and collapsing to save screen real estate.
const Sidebar: React.FC = () => {
  // State to manage the open/closed state of the sidebar.
  // Initialized to true to show the sidebar by default.
  const [open, setOpen] = useState(true);
  // State to manage the open/closed state of the settings submenu.
  // Initialized to false to keep settings collapsed by default.
  const [settingsOpen, setSettingsOpen] = useState(false);

  const theme = useTheme();

  // Toggles the open/closed state of the sidebar.
  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  // Toggles the open/closed state of the settings submenu.
  const handleSettingsToggle = () => {
    setSettingsOpen(!settingsOpen);
  };

  // Defines the main navigation items for the sidebar.
  // Each item includes text and an associated icon.
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon /> },
    { text: 'Wallet', icon: <WalletIcon /> },
    { text: 'Trading', icon: <TradingIcon /> },
    { text: 'Analytics', icon: <AnalyticsIcon /> },
    { text: 'Venture', icon: <VentureIcon /> },
    { text: 'Team', icon: <TeamIcon /> },
    { text: 'Chat', icon: <ChatIcon /> },
    { text: 'Notifications', icon: <NotificationIcon /> },
    { text: 'Security', icon: <SecurityIcon /> },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? DRAWER_WIDTH : 64,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open ? DRAWER_WIDTH : 64,
          boxSizing: 'border-box',
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          overflowX: 'hidden',
        },
      }}
    >
      {/* Header section with toggle button for the sidebar */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', p: 1 }}>
        <IconButton onClick={handleDrawerToggle}>
          {open ? <ChevronLeftIcon /> : <MenuIcon />}
        </IconButton>
      </Box>
      <Divider />
      {/* Main navigation list */}
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : 'auto',
                  justifyContent: 'center',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} sx={{ opacity: open ? 1 : 0 }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      {/* Settings and Logout section */}
      <List>
        {/* Settings item with collapsible submenu */}
        <ListItem disablePadding sx={{ display: 'block' }}>
            <ListItemButton
                onClick={handleSettingsToggle}
                sx={{
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2.5,
                }}
            >
                <ListItemIcon
                    sx={{
                        minWidth: 0,
                        mr: open ? 3 : 'auto',
                        justifyContent: 'center',
                    }}
                >
                    <SettingsIcon />
                </ListItemIcon>
                <ListItemText primary="Settings" sx={{ opacity: open ? 1 : 0 }} />
                {/* Expand/collapse icon for settings */}
                {open ? (settingsOpen ? <ExpandLess /> : <ExpandMore />) : null}
            </ListItemButton>
            {/* Collapsible settings submenu */}
            <Collapse in={settingsOpen && open} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                    <ListItemButton sx={{ pl: 4 }}>
                        <ListItemIcon>
                            <HelpIcon />
                        </ListItemIcon>
                        <ListItemText primary="Help" />
                    </ListItemButton>
                </List>
            </Collapse>
        </ListItem>
        {/* Logout item */}
        <ListItem disablePadding sx={{ display: 'block' }}>
            <ListItemButton
                sx={{
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2.5,
                }}
            >
                <ListItemIcon
                    sx={{
                        minWidth: 0,
                        mr: open ? 3 : 'auto',
                        justifyContent: 'center',
                    }}
                >
                    <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary="Logout" sx={{ opacity: open ? 1 : 0 }} />
            </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Sidebar;