/**
 * Organization Authentication Hook
 * Handles login/logout for hospitals and blood banks
 */

import { useState, useCallback, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

// ============================================
// Types
// ============================================

export interface OrganizationAccount {
    id: string;
    organizationType: 'hospital' | 'blood_bank';
    hospitalId?: string;
    bloodBankId?: string;
    email: string;
    contactName: string;
    contactPhone?: string;
    contactRole: string;
    accessLevel: 'full' | 'inventory_only' | 'rooms_only' | 'view_only';
    isActive: boolean;
    isVerified: boolean;
    lastLoginAt?: string;
    organizationName?: string;
}

export interface OrganizationLoginCredentials {
    email: string;
    password: string;
}

export interface OrganizationRegistration {
    organizationType: 'hospital' | 'blood_bank';
    hospitalId?: string;
    bloodBankId?: string;
    email: string;
    password: string;
    contactName: string;
    contactPhone?: string;
    contactRole?: string;
}

interface OrganizationAuthContextType {
    organization: OrganizationAccount | null;
    isLoading: boolean;
    error: string | null;
    isAuthenticated: boolean;
    login: (credentials: OrganizationLoginCredentials) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    register: (data: OrganizationRegistration) => Promise<{ success: boolean; error?: string }>;
    refreshSession: () => Promise<void>;
}

// ============================================
// Context
// ============================================

const OrganizationAuthContext = createContext<OrganizationAuthContextType | null>(null);

// ============================================
// Hook
// ============================================

export function useOrganizationAuth() {
    const context = useContext(OrganizationAuthContext);
    if (!context) {
        return useOrganizationAuthStandalone();
    }
    return context;
}

function useOrganizationAuthStandalone() {
    const [organization, setOrganization] = useState<OrganizationAccount | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isAuthenticated = !!organization;

    useEffect(() => {
        const storedSession = localStorage.getItem('org_session');
        if (storedSession) {
            try {
                const parsed = JSON.parse(storedSession);
                if (parsed.expiresAt && new Date(parsed.expiresAt) > new Date()) {
                    setOrganization(parsed.organization);
                } else {
                    localStorage.removeItem('org_session');
                }
            } catch {
                localStorage.removeItem('org_session');
            }
        }
    }, []);

    const login = useCallback(async (credentials: OrganizationLoginCredentials) => {
        setIsLoading(true);
        setError(null);

        try {
            if (!supabase) {
                const mockOrg: OrganizationAccount = {
                    id: 'mock-org-1',
                    organizationType: 'hospital',
                    hospitalId: 'mock-hospital-1',
                    email: credentials.email,
                    contactName: 'Test Admin',
                    contactRole: 'admin',
                    accessLevel: 'full',
                    isActive: true,
                    isVerified: true,
                    organizationName: 'Demo Hospital',
                };

                setOrganization(mockOrg);
                localStorage.setItem('org_session', JSON.stringify({
                    organization: mockOrg,
                    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                }));

                return { success: true };
            }

            const { data: account, error: fetchError } = await supabase
                .from('organization_accounts')
                .select('*, hospitals:hospital_id(name), blood_banks:blood_bank_id(name)')
                .eq('email', credentials.email.toLowerCase())
                .single();

            if (fetchError || !account) {
                setError('Invalid email or password');
                return { success: false, error: 'Invalid email or password' };
            }

            if (!account.is_active) {
                setError('Account is deactivated.');
                return { success: false, error: 'Account is deactivated' };
            }

            if (!account.is_verified) {
                setError('Account pending verification.');
                return { success: false, error: 'Account not verified' };
            }

            if (account.locked_until && new Date(account.locked_until) > new Date()) {
                setError('Account is temporarily locked.');
                return { success: false, error: 'Account locked' };
            }

            await supabase
                .from('organization_accounts')
                .update({
                    last_login_at: new Date().toISOString(),
                    login_count: (account.login_count || 0) + 1,
                    failed_login_attempts: 0,
                    locked_until: null,
                })
                .eq('id', account.id);

            await supabase.from('organization_activity_log').insert({
                organization_account_id: account.id,
                activity_type: 'login',
                description: 'Successful login',
            });

            const org: OrganizationAccount = {
                id: account.id,
                organizationType: account.organization_type,
                hospitalId: account.hospital_id,
                bloodBankId: account.blood_bank_id,
                email: account.email,
                contactName: account.contact_name,
                contactPhone: account.contact_phone,
                contactRole: account.contact_role,
                accessLevel: account.access_level,
                isActive: account.is_active,
                isVerified: account.is_verified,
                lastLoginAt: account.last_login_at,
                organizationName: account.hospitals?.name || account.blood_banks?.name,
            };

            setOrganization(org);
            localStorage.setItem('org_session', JSON.stringify({
                organization: org,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            }));

            return { success: true };
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Login failed';
            setError(message);
            return { success: false, error: message };
        } finally {
            setIsLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            if (supabase && organization) {
                await supabase.from('organization_activity_log').insert({
                    organization_account_id: organization.id,
                    activity_type: 'logout',
                    description: 'User logged out',
                });
            }
        } catch {
            // Ignore
        }
        setOrganization(null);
        localStorage.removeItem('org_session');
    }, [organization]);

    const register = useCallback(async (data: OrganizationRegistration) => {
        setIsLoading(true);
        setError(null);

        try {
            if (!supabase) {
                return { success: true };
            }

            const { data: existing } = await supabase
                .from('organization_accounts')
                .select('id')
                .eq('email', data.email.toLowerCase())
                .single();

            if (existing) {
                setError('Email already exists');
                return { success: false, error: 'Email already exists' };
            }

            const { error: createError } = await supabase
                .from('organization_accounts')
                .insert({
                    organization_type: data.organizationType,
                    hospital_id: data.hospitalId,
                    blood_bank_id: data.bloodBankId,
                    email: data.email.toLowerCase(),
                    password_hash: 'PENDING_HASH',
                    contact_name: data.contactName,
                    contact_phone: data.contactPhone,
                    contact_role: data.contactRole || 'admin',
                    is_verified: false,
                });

            if (createError) throw createError;

            return { success: true };
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Registration failed';
            setError(message);
            return { success: false, error: message };
        } finally {
            setIsLoading(false);
        }
    }, []);

    const refreshSession = useCallback(async () => {
        const storedSession = localStorage.getItem('org_session');
        if (storedSession && supabase) {
            try {
                const parsed = JSON.parse(storedSession);
                const { data } = await supabase
                    .from('organization_accounts')
                    .select('*, hospitals:hospital_id(name), blood_banks:blood_bank_id(name)')
                    .eq('id', parsed.organization.id)
                    .single();

                if (data) {
                    const org: OrganizationAccount = {
                        id: data.id,
                        organizationType: data.organization_type,
                        hospitalId: data.hospital_id,
                        bloodBankId: data.blood_bank_id,
                        email: data.email,
                        contactName: data.contact_name,
                        contactPhone: data.contact_phone,
                        contactRole: data.contact_role,
                        accessLevel: data.access_level,
                        isActive: data.is_active,
                        isVerified: data.is_verified,
                        lastLoginAt: data.last_login_at,
                        organizationName: data.hospitals?.name || data.blood_banks?.name,
                    };
                    setOrganization(org);
                }
            } catch {
                localStorage.removeItem('org_session');
                setOrganization(null);
            }
        }
    }, []);

    return {
        organization,
        isLoading,
        error,
        isAuthenticated,
        login,
        logout,
        register,
        refreshSession,
    };
}

// ============================================
// Provider Component
// ============================================

export function OrganizationAuthProvider({ children }: { children: ReactNode }) {
    const auth = useOrganizationAuthStandalone();

    return (
        <OrganizationAuthContext.Provider value={auth} >
            {children}
        </OrganizationAuthContext.Provider>
    );
}

export default useOrganizationAuth;
