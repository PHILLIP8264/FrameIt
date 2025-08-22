// Settings sections configuration
export const SETTINGS_SECTIONS = {
  preferences: [
    {
      icon: "notifications-outline",
      label: "Notifications",
      value: "Manage notification settings",
      route: "/notifications",
    },
    {
      icon: "shield-outline",
      label: "Privacy",
      value: "Privacy and security settings",
      route: "/privacy",
    },
  ],
  support: [
    {
      icon: "help-circle-outline",
      label: "Help & Support",
      route: "/help",
    },
    {
      icon: "information-circle-outline",
      label: "About",
      route: "/about",
    },
  ],
};

// Account settings configuration
export const ACCOUNT_SETTINGS = [
  {
    icon: "person-outline",
    label: "Display Name",
    type: "displayName" as const,
  },
  {
    icon: "mail-outline",
    label: "Email Address",
    type: "email" as const,
  },
  {
    icon: "lock-closed-outline",
    label: "Password",
    type: "password" as const,
  },
];

// UI Text constants
export const UI_TEXT = {
  loading: "Loading settings...",
  profilePicture: "Profile Picture",
  changePhoto: "Change Photo",
  accountInformation: "Account Information",
  preferences: "Preferences",
  support: "Support",
  signOut: "Sign Out",
  slideToEdit: "Slide to edit",
  passwordValue: "••••••••",
  notSet: "Not set",
};
