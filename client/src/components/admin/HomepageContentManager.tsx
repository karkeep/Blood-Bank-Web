/**
 * Homepage Content Manager
 * Admin panel for controlling homepage sections visibility and configuration
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import {
    Eye, EyeOff, RefreshCw, Save, Settings, Users,
    BarChart3, MapPin, TrendingDown, Loader2, CheckCircle, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

interface HomepageSection {
    id: string;
    sectionKey: string;
    isVisible: boolean;
    title: string;
    subtitle: string;
    displayOrder: number;
    config: Record<string, any>;
    updatedAt: string;
}

interface FeaturedDonor {
    id: string;
    donorId: string;
    displayOrder: number;
    isActive: boolean;
    customName: string | null;
    customBadge: string | null;
    highlightReason: string | null;
}

interface CitySettings {
    id: string;
    cityName: string;
    isVisible: boolean;
    displayOrder: number;
    displayName: string;
    targetDonors: number;
    criticalThreshold: number;
    lowThreshold: number;
}

// Section icon mapping
const SECTION_ICONS: Record<string, React.ElementType> = {
    donor_spotlight: Users,
    city_inventory: BarChart3,
    top_donor_cities: MapPin,
    cities_needing_donors: TrendingDown,
};

export function HomepageContentManager() {
    const [sections, setSections] = useState<HomepageSection[]>([]);
    const [cities, setCities] = useState<CitySettings[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [refreshing, setRefreshing] = useState(false);

    // Fetch sections and cities
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            if (!supabase) {
                // Mock data for development
                setSections([
                    { id: '1', sectionKey: 'donor_spotlight', isVisible: true, title: 'Top Donor Spotlight', subtitle: 'Celebrating our blood heroes', displayOrder: 1, config: { count: 3, anonymize: true }, updatedAt: new Date().toISOString() },
                    { id: '2', sectionKey: 'city_inventory', isVisible: true, title: 'City Blood Inventory', subtitle: 'Real-time blood supply status', displayOrder: 2, config: { show_map: true }, updatedAt: new Date().toISOString() },
                    { id: '3', sectionKey: 'top_donor_cities', isVisible: true, title: 'Top Donor Cities', subtitle: 'Cities with most active donors', displayOrder: 3, config: { limit: 5 }, updatedAt: new Date().toISOString() },
                    { id: '4', sectionKey: 'cities_needing_donors', isVisible: true, title: 'Cities Needing Donors', subtitle: 'Areas with donor shortage', displayOrder: 4, config: { limit: 5 }, updatedAt: new Date().toISOString() },
                ]);
                setCities([
                    { id: '1', cityName: 'Kathmandu', isVisible: true, displayOrder: 1, displayName: 'Kathmandu', targetDonors: 5000, criticalThreshold: 0.2, lowThreshold: 0.5 },
                    { id: '2', cityName: 'Lalitpur', isVisible: true, displayOrder: 2, displayName: 'Lalitpur (Patan)', targetDonors: 2000, criticalThreshold: 0.2, lowThreshold: 0.5 },
                    { id: '3', cityName: 'Bhaktapur', isVisible: true, displayOrder: 3, displayName: 'Bhaktapur', targetDonors: 1500, criticalThreshold: 0.2, lowThreshold: 0.5 },
                    { id: '4', cityName: 'Pokhara', isVisible: true, displayOrder: 4, displayName: 'Pokhara', targetDonors: 3000, criticalThreshold: 0.2, lowThreshold: 0.5 },
                ]);
                return;
            }

            // Fetch homepage sections
            const { data: sectionsData, error: sectionsError } = await supabase
                .from('homepage_content')
                .select('*')
                .order('display_order', { ascending: true });

            if (sectionsError) throw sectionsError;

            if (sectionsData) {
                setSections(sectionsData.map((s: any) => ({
                    id: s.id,
                    sectionKey: s.section_key,
                    isVisible: s.is_visible,
                    title: s.title,
                    subtitle: s.subtitle,
                    displayOrder: s.display_order,
                    config: s.config || {},
                    updatedAt: s.updated_at,
                })));
            }

            // Fetch city settings
            const { data: citiesData, error: citiesError } = await supabase
                .from('city_display_settings')
                .select('*')
                .order('display_order', { ascending: true });

            if (citiesError) throw citiesError;

            if (citiesData) {
                setCities(citiesData.map((c: any) => ({
                    id: c.id,
                    cityName: c.city_name,
                    isVisible: c.is_visible,
                    displayOrder: c.display_order,
                    displayName: c.display_name,
                    targetDonors: c.target_donors,
                    criticalThreshold: parseFloat(c.critical_threshold),
                    lowThreshold: parseFloat(c.low_threshold),
                })));
            }
        } catch (err) {
            console.error('Failed to fetch homepage settings:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Toggle section visibility
    const toggleSectionVisibility = useCallback(async (sectionId: string, isVisible: boolean) => {
        setSections(prev => prev.map(s =>
            s.id === sectionId ? { ...s, isVisible } : s
        ));

        if (supabase) {
            try {
                await supabase
                    .from('homepage_content')
                    .update({ is_visible: isVisible, updated_at: new Date().toISOString() })
                    .eq('id', sectionId);
            } catch (err) {
                console.error('Failed to update section visibility:', err);
            }
        }
    }, []);

    // Toggle city visibility
    const toggleCityVisibility = useCallback(async (cityId: string, isVisible: boolean) => {
        setCities(prev => prev.map(c =>
            c.id === cityId ? { ...c, isVisible } : c
        ));

        if (supabase) {
            try {
                await supabase
                    .from('city_display_settings')
                    .update({ is_visible: isVisible, updated_at: new Date().toISOString() })
                    .eq('id', cityId);
            } catch (err) {
                console.error('Failed to update city visibility:', err);
            }
        }
    }, []);

    // Refresh materialized views
    const refreshAnalytics = useCallback(async () => {
        setRefreshing(true);
        try {
            if (supabase) {
                await supabase.rpc('refresh_analytics_views');
            }
            // Simulate delay for development
            await new Promise(resolve => setTimeout(resolve, 2000));
            setSaveStatus('success');
            setTimeout(() => setSaveStatus('idle'), 3000);
        } catch (err) {
            console.error('Failed to refresh analytics:', err);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus('idle'), 3000);
        } finally {
            setRefreshing(false);
        }
    }, []);

    // Save all changes
    const saveChanges = useCallback(async () => {
        setIsSaving(true);
        try {
            // In production, batch update all sections
            if (supabase) {
                for (const section of sections) {
                    await supabase
                        .from('homepage_content')
                        .update({
                            is_visible: section.isVisible,
                            title: section.title,
                            subtitle: section.subtitle,
                            config: section.config,
                            updated_at: new Date().toISOString(),
                        })
                        .eq('id', section.id);
                }
            }
            setSaveStatus('success');
            setTimeout(() => setSaveStatus('idle'), 3000);
        } catch (err) {
            console.error('Failed to save changes:', err);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus('idle'), 3000);
        } finally {
            setIsSaving(false);
        }
    }, [sections]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-red-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Homepage Content Manager</h2>
                    <p className="text-gray-500">Control what appears on the public homepage</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={refreshAnalytics}
                        disabled={refreshing}
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh Data
                    </Button>
                    <Button
                        onClick={saveChanges}
                        disabled={isSaving}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        {isSaving ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : saveStatus === 'success' ? (
                            <CheckCircle className="w-4 h-4 mr-2 text-green-300" />
                        ) : saveStatus === 'error' ? (
                            <AlertCircle className="w-4 h-4 mr-2 text-red-300" />
                        ) : (
                            <Save className="w-4 h-4 mr-2" />
                        )}
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>

            {/* Section Controls */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Homepage Sections
                </h3>
                <div className="space-y-4">
                    {sections.map((section) => {
                        const Icon = SECTION_ICONS[section.sectionKey] || Settings;
                        return (
                            <div
                                key={section.id}
                                className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${section.isVisible ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-lg ${section.isVisible ? 'bg-green-100' : 'bg-gray-100'}`}>
                                        <Icon className={`w-5 h-5 ${section.isVisible ? 'text-green-600' : 'text-gray-400'}`} />
                                    </div>
                                    <div>
                                        <h4 className="font-medium">{section.title}</h4>
                                        <p className="text-sm text-gray-500">{section.subtitle}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        {section.isVisible ? (
                                            <Eye className="w-4 h-4 text-green-600" />
                                        ) : (
                                            <EyeOff className="w-4 h-4 text-gray-400" />
                                        )}
                                        <Label htmlFor={`section-${section.id}`} className="text-sm">
                                            {section.isVisible ? 'Visible' : 'Hidden'}
                                        </Label>
                                    </div>
                                    <Switch
                                        id={`section-${section.id}`}
                                        checked={section.isVisible}
                                        onCheckedChange={(checked) => toggleSectionVisibility(section.id, checked)}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>

            {/* City Controls */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    City Display Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cities.map((city) => (
                        <div
                            key={city.id}
                            className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${city.isVisible ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                                }`}
                        >
                            <div>
                                <h4 className="font-medium">{city.displayName}</h4>
                                <p className="text-sm text-gray-500">
                                    Target: {city.targetDonors.toLocaleString()} donors
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Switch
                                    id={`city-${city.id}`}
                                    checked={city.isVisible}
                                    onCheckedChange={(checked) => toggleCityVisibility(city.id, checked)}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Status Messages */}
            {saveStatus === 'success' && (
                <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-bottom">
                    <CheckCircle className="w-5 h-5" />
                    Changes saved successfully!
                </div>
            )}
            {saveStatus === 'error' && (
                <div className="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-bottom">
                    <AlertCircle className="w-5 h-5" />
                    Failed to save changes
                </div>
            )}
        </div>
    );
}

export default HomepageContentManager;
