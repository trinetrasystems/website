const fs = require('fs');

let content = fs.readFileSync('Admin.tsx', 'utf8');

// Update UserProfile
content = content.replace(
  /role: "admin" \| "user";/,
  'role: "admin" | "member" | "user";\n  permissions?: string[];'
);

// Add loggedInUserPermissions
content = content.replace(
  /const \[userRole, setUserRole\] = useState<"admin" \| "user" \| null>\(null\);/,
  'const [userRole, setUserRole] = useState<"admin" | "member" | "user" | null>(null);\n  const [loggedInUserPermissions, setLoggedInUserPermissions] = useState<string[]>([]);'
);

// Update newUserRole
content = content.replace(
  /const \[newUserRole, setNewUserRole\] = useState<"admin" \| "user">\("user"\);/,
  'const [newUserRole, setNewUserRole] = useState<"admin" | "member" | "user">("user");\n  const [newUserPermissions, setNewUserPermissions] = useState<string[]>([]);'
);

// Update selectedUserRole
content = content.replace(
  /const \[selectedUserRole, setSelectedUserRole\] = useState<"admin" \| "user">\("user"\);/,
  'const [selectedUserRole, setSelectedUserRole] = useState<"admin" | "member" | "user">("user");\n  const [selectedUserPermissions, setSelectedUserPermissions] = useState<string[]>([]);'
);

// Helper function hasPermission
const helperFn = `  const hasPermission = (tabId: string) => {
    if (userRole === "admin") return true;
    if (userRole === "member") return loggedInUserPermissions.includes(tabId);
    return false;
  };
`;
// Insert helper function before handlePasswordChange
content = content.replace(
  /  const handlePasswordChange = async/,
  helperFn + '\n  const handlePasswordChange = async'
);

// Update canShowDashboard
content = content.replace(
  /const canShowDashboard = useMemo\(\(\) => Boolean\(user && isAdmin\), \[user, isAdmin\]\);/,
  'const canShowDashboard = useMemo(() => Boolean(user && (isAdmin || userRole === "member")), [user, isAdmin, userRole]);'
);

// Update pageTitle & pageSubtitle
content = content.replace(
  /const pageTitle = isAdmin \? "Admin Console" : userRole === "user" \? "User Dashboard" : "Access Portal";/,
  'const pageTitle = (isAdmin || userRole === "member") ? "Admin Console" : userRole === "user" ? "User Dashboard" : "Access Portal";'
);
content = content.replace(
  /const pageSubtitle = isAdmin\n\s+\? "User Management"\n\s+: userRole === "user"\n\s+\? "Your account details"\n\s+: "Sign in to continue";/,
  `const pageSubtitle = (isAdmin || userRole === "member")
    ? "User Management"
    : userRole === "user"
      ? "Your account details"
      : "Sign in to continue";`
);


fs.writeFileSync('Admin.tsx', content, 'utf8');
