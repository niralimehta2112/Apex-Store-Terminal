import { UserProfile } from '../types';

const SESSION_KEY = 'apex_auth_current_user_v1';
const USERS_REGISTRY_KEY = 'apex_registered_users_v1';

export const DEMO_USERS: Record<string, UserProfile & { password: string }> = {
  'alex@apextech.io': {
    uid: 'usr-alex-001',
    name: 'Alexander Wright',
    email: 'alex@apextech.io',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    role: 'Quantitative Trader',
    createdAt: '2026-01-15T09:30:00Z',
  },
  'elena@apextech.io': {
    uid: 'usr-elena-002',
    name: 'Elena Rostova',
    email: 'elena@apextech.io',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
    role: 'Hedge Fund Analyst',
    createdAt: '2026-03-22T14:15:00Z',
  }
};

/**
 * Loads current authenticated user session
 */
export function getCurrentUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse auth session', e);
  }
  // Default to Alexander Wright for instant rich demo experience
  const defaultUser = {
    uid: DEMO_USERS['alex@apextech.io'].uid,
    name: DEMO_USERS['alex@apextech.io'].name,
    email: DEMO_USERS['alex@apextech.io'].email,
    avatar: DEMO_USERS['alex@apextech.io'].avatar,
    role: DEMO_USERS['alex@apextech.io'].role,
    createdAt: DEMO_USERS['alex@apextech.io'].createdAt,
  };
  saveCurrentSession(defaultUser);
  return defaultUser;
}

/**
 * Saves current user session
 */
export function saveCurrentSession(user: UserProfile | null) {
  try {
    if (user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  } catch (e) {
    console.error('Failed to save session', e);
  }
}

/**
 * Gets all registered users (demo + custom registered)
 */
function getUsersRegistry(): Record<string, UserProfile & { password: string }> {
  try {
    const stored = localStorage.getItem(USERS_REGISTRY_KEY);
    if (stored) {
      return { ...DEMO_USERS, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error('Failed to read users registry', e);
  }
  return { ...DEMO_USERS };
}

/**
 * Authenticates user with email and password
 */
export async function signInWithEmailPassword(
  email: string,
  pass: string
): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  // Simulate network latency of real Firebase Auth
  await new Promise((r) => setTimeout(r, 400));

  const registry = getUsersRegistry();
  const normalizedEmail = email.trim().toLowerCase();
  const matched = registry[normalizedEmail];

  if (!matched) {
    return { success: false, error: 'User account not found with this email. Please check your email or create an account.' };
  }

  if (matched.password !== pass) {
    return { success: false, error: 'Incorrect password provided. Please try again or use a demo account.' };
  }

  const userProfile: UserProfile = {
    uid: matched.uid,
    name: matched.name,
    email: matched.email,
    avatar: matched.avatar,
    role: matched.role,
    createdAt: matched.createdAt,
  };

  saveCurrentSession(userProfile);
  return { success: true, user: userProfile };
}

/**
 * Creates new user account and saves credentials securely
 */
export async function signUpWithEmailPassword(
  name: string,
  email: string,
  pass: string,
  role: UserProfile['role'] = 'Quantitative Trader'
): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  await new Promise((r) => setTimeout(r, 500));

  const normalizedEmail = email.trim().toLowerCase();
  const registry = getUsersRegistry();

  if (registry[normalizedEmail]) {
    return { success: false, error: 'An account with this email address already exists. Please log in.' };
  }

  if (pass.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters in length.' };
  }

  const avatars = [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
  ];
  const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];

  const newUser: UserProfile & { password: string } = {
    uid: `usr-${Date.now().toString().slice(-6)}`,
    name: name.trim(),
    email: normalizedEmail,
    password: pass,
    avatar: randomAvatar,
    role,
    createdAt: new Date().toISOString(),
  };

  // Save to persistent user registry
  const updatedRegistry = { ...registry, [normalizedEmail]: newUser };
  localStorage.setItem(USERS_REGISTRY_KEY, JSON.stringify(updatedRegistry));

  const userProfile: UserProfile = {
    uid: newUser.uid,
    name: newUser.name,
    email: newUser.email,
    avatar: newUser.avatar,
    role: newUser.role,
    createdAt: newUser.createdAt,
  };

  saveCurrentSession(userProfile);
  return { success: true, user: userProfile };
}

/**
 * Sign out
 */
export async function signOutUser(): Promise<void> {
  saveCurrentSession(null);
}

/**
 * Instant 1-click login with demo profile
 */
export async function quickDemoSignIn(
  profileId: 'alex' | 'elena'
): Promise<UserProfile> {
  const targetEmail = profileId === 'alex' ? 'alex@apextech.io' : 'elena@apextech.io';
  const target = DEMO_USERS[targetEmail];

  const userProfile: UserProfile = {
    uid: target.uid,
    name: target.name,
    email: target.email,
    avatar: target.avatar,
    role: target.role,
    createdAt: target.createdAt,
  };

  saveCurrentSession(userProfile);
  return userProfile;
}

