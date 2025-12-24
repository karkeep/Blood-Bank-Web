/**
 * Supabase Analytics Service
 * Replaces Firebase Analytics with Supabase-powered event tracking
 * Events are stored in the analytics_events table for dashboard and ML analysis
 */

import { supabase } from './supabase';

// Event types matching the database enum
export type AnalyticsEventType =
    | 'page_view'
    | 'button_click'
    | 'form_submit'
    | 'login'
    | 'logout'
    | 'donation_start'
    | 'donation_complete'
    | 'request_create'
    | 'request_fulfill'
    | 'donor_search'
    | 'profile_update'
    | 'notification_sent'
    | 'error';

interface AnalyticsEvent {
    eventType: AnalyticsEventType;
    eventData?: Record<string, unknown>;
    userId?: string;
    sessionId?: string;
    userAgent?: string;
    ipAddress?: string;
    referrer?: string;
    pageUrl?: string;
}

// Generate a session ID for the current browser session
let sessionId: string | null = null;
const getSessionId = (): string => {
    if (!sessionId) {
        sessionId = sessionStorage.getItem('analytics_session_id');
        if (!sessionId) {
            sessionId = `ses_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            sessionStorage.setItem('analytics_session_id', sessionId);
        }
    }
    return sessionId;
};

// Track page views
let lastPageView: string | null = null;
let pageViewTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Initialize analytics - call once on app start
 */
export function initializeAnalytics(): void {
    // Track initial page view
    if (typeof window !== 'undefined') {
        trackPageView();

        // Listen for route changes (works with most routers)
        const handleRouteChange = () => {
            // Debounce rapid route changes
            if (pageViewTimer) clearTimeout(pageViewTimer);
            pageViewTimer = setTimeout(() => {
                trackPageView();
            }, 100);
        };

        window.addEventListener('popstate', handleRouteChange);

        // Track when user leaves
        window.addEventListener('beforeunload', () => {
            trackEvent('page_view', {
                action: 'leave',
                duration_ms: Date.now() - (parseInt(sessionStorage.getItem('page_start_time') || '0', 10))
            });
        });

        console.log('✅ Supabase Analytics initialized');
    }
}

/**
 * Track a page view
 */
export function trackPageView(customPath?: string): void {
    const pageUrl = customPath || window.location.pathname + window.location.search;

    // Avoid duplicate tracking of same page
    if (pageUrl === lastPageView) return;
    lastPageView = pageUrl;

    // Store page start time for duration calculation
    sessionStorage.setItem('page_start_time', Date.now().toString());

    trackEvent('page_view', {
        page_path: pageUrl,
        page_title: document.title,
        referrer: document.referrer,
    });
}

/**
 * Track a custom event
 */
export async function trackEvent(
    eventType: AnalyticsEventType,
    eventData?: Record<string, unknown>,
    userId?: string
): Promise<void> {
    try {
        // Don't track in development if explicitly disabled
        if (import.meta.env.VITE_DISABLE_ANALYTICS === 'true') {
            console.debug('[Analytics] Skipped:', eventType, eventData);
            return;
        }

        const event: AnalyticsEvent = {
            eventType,
            eventData,
            userId,
            sessionId: getSessionId(),
            userAgent: navigator.userAgent,
            pageUrl: window.location.href,
            referrer: document.referrer,
        };

        // If Supabase is configured, send to database
        if (supabase) {
            const { error } = await supabase.from('analytics_events').insert({
                event_type: event.eventType,
                event_data: event.eventData,
                user_id: event.userId || null,
                session_id: event.sessionId,
                user_agent: event.userAgent,
                page_url: event.pageUrl,
                referrer: event.referrer,
            });

            if (error) {
                // Silently fail - analytics shouldn't break the app
                console.debug('[Analytics] Failed to track:', error.message);
            }
        } else {
            // Log to console in development when Supabase isn't configured
            console.debug('[Analytics]', eventType, eventData);
        }
    } catch (err) {
        // Silently fail - analytics should never break the app
        console.debug('[Analytics] Error:', err);
    }
}

/**
 * Track a button click
 */
export function trackClick(buttonName: string, additionalData?: Record<string, unknown>): void {
    trackEvent('button_click', {
        button_name: buttonName,
        ...additionalData,
    });
}

/**
 * Track form submission
 */
export function trackFormSubmit(formName: string, success: boolean, additionalData?: Record<string, unknown>): void {
    trackEvent('form_submit', {
        form_name: formName,
        success,
        ...additionalData,
    });
}

/**
 * Track user login
 */
export function trackLogin(method: string, userId?: string): void {
    trackEvent('login', { method }, userId);
}

/**
 * Track user logout
 */
export function trackLogout(userId?: string): void {
    trackEvent('logout', {}, userId);
}

/**
 * Track donation events
 */
export function trackDonation(
    stage: 'start' | 'complete' | 'cancel',
    donationData?: Record<string, unknown>,
    userId?: string
): void {
    const eventType = stage === 'complete' ? 'donation_complete' : 'donation_start';
    trackEvent(eventType, { stage, ...donationData }, userId);
}

/**
 * Track blood request events
 */
export function trackRequest(
    action: 'create' | 'fulfill' | 'cancel' | 'expire',
    requestData?: Record<string, unknown>,
    userId?: string
): void {
    const eventType = action === 'fulfill' ? 'request_fulfill' : 'request_create';
    trackEvent(eventType, { action, ...requestData }, userId);
}

/**
 * Track donor search
 */
export function trackDonorSearch(
    bloodType: string,
    city?: string,
    resultsCount?: number,
    userId?: string
): void {
    trackEvent('donor_search', {
        blood_type: bloodType,
        city,
        results_count: resultsCount,
    }, userId);
}

/**
 * Track errors
 */
export function trackError(
    errorType: string,
    errorMessage: string,
    errorStack?: string,
    userId?: string
): void {
    trackEvent('error', {
        error_type: errorType,
        error_message: errorMessage,
        error_stack: errorStack?.substring(0, 1000), // Limit stack trace length
    }, userId);
}

/**
 * Set user ID for all subsequent events
 */
let currentUserId: string | null = null;
export function setAnalyticsUser(userId: string | null): void {
    currentUserId = userId;
    if (userId) {
        sessionStorage.setItem('analytics_user_id', userId);
    } else {
        sessionStorage.removeItem('analytics_user_id');
    }
}

/**
 * Get current analytics user
 */
export function getAnalyticsUser(): string | null {
    if (!currentUserId) {
        currentUserId = sessionStorage.getItem('analytics_user_id');
    }
    return currentUserId;
}

// Default export for convenience
export default {
    initialize: initializeAnalytics,
    trackEvent,
    trackPageView,
    trackClick,
    trackFormSubmit,
    trackLogin,
    trackLogout,
    trackDonation,
    trackRequest,
    trackDonorSearch,
    trackError,
    setUser: setAnalyticsUser,
    getUser: getAnalyticsUser,
};
