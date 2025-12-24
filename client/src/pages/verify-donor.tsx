/**
 * Become a Verified Donor Page
 * Multi-step verification process for blood donors
 */
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import {
    Shield, FileText, Heart, MapPin, Check, ChevronRight,
    AlertCircle, Loader2, Camera, Upload, User, Droplet,
    Scale, Ruler, Clock, Stethoscope, MapPinned, Car
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { useDonorVerification, IdentityData, MedicalData, LocationData } from '@/hooks/use-donor-verification';
import { useAuth } from '@/hooks/use-auth-firebase';
import { PageLayout } from '@/components/layout/page-layout';
import { BloodTypeBadge } from '@/components/ui/blood-type-badge';

// Blood types for selection
const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// ID types
const ID_TYPES = [
    { value: 'citizenship', label: 'Citizenship Certificate' },
    { value: 'passport', label: 'Passport' },
    { value: 'license', label: "Driver's License" },
    { value: 'voter_id', label: 'Voter ID' },
];

// Medical conditions that may affect donation
const MEDICAL_CONDITIONS = [
    'Diabetes',
    'High Blood Pressure',
    'Heart Disease',
    'Hepatitis',
    'HIV/AIDS',
    'Cancer',
    'Epilepsy',
    'Asthma',
    'Kidney Disease',
    'Bleeding Disorders',
];

export function VerifyDonorPage() {
    const { user } = useAuth();
    const [, navigate] = useLocation();
    const {
        isLoading,
        error,
        currentStep,
        setCurrentStep,
        verificationStatus,
        submitIdentity,
        submitMedical,
        submitLocation,
    } = useDonorVerification();

    // Form state
    const [identityForm, setIdentityForm] = useState<Partial<IdentityData>>({
        fullName: '',
        dateOfBirth: '',
        gender: '',
        idType: 'citizenship',
        idNumber: '',
    });

    const [medicalForm, setMedicalForm] = useState<Partial<MedicalData>>({
        bloodType: '',
        weight: undefined,
        height: undefined,
        medicalConditions: [],
        medications: [],
        allergies: [],
        hasRecentSurgery: false,
        hasChronicDisease: false,
        hasTattooOrPiercing: false,
        hasRecentTravel: false,
    });

    const [locationForm, setLocationForm] = useState<Partial<LocationData>>({
        address: '',
        city: '',
        state: '',
        country: 'Nepal',
        latitude: 0,
        longitude: 0,
        travelRadius: 25,
        transportationNeeded: false,
        emergencyAvailable: true,
    });

    // Get user's current location
    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocationForm(prev => ({
                        ...prev,
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    }));
                },
                (error) => {
                    console.error('Geolocation error:', error);
                }
            );
        }
    };

    // Handle form submissions
    const handleIdentitySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        await submitIdentity(String(user.id), identityForm as IdentityData);
    };

    const handleMedicalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        await submitMedical(String(user.id), medicalForm as MedicalData);
    };

    const handleLocationSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        await submitLocation(String(user.id), locationForm as LocationData);
    };

    // Toggle medical condition
    const toggleCondition = (condition: string) => {
        setMedicalForm(prev => ({
            ...prev,
            medicalConditions: prev.medicalConditions?.includes(condition)
                ? prev.medicalConditions.filter(c => c !== condition)
                : [...(prev.medicalConditions || []), condition],
        }));
    };

    // Step indicator
    const steps = [
        { key: 'identity', label: 'Identity', icon: Shield, completed: verificationStatus.identityVerified },
        { key: 'medical', label: 'Medical', icon: Heart, completed: verificationStatus.medicalVerified },
        { key: 'location', label: 'Location', icon: MapPin, completed: verificationStatus.locationVerified },
    ];

    return (
        <PageLayout>
            <div className="min-h-screen bg-gradient-to-b from-red-50 to-white py-8">
                <div className="container mx-auto px-4 max-w-3xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                            <Shield className="w-8 h-8 text-red-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-red-800 mb-2">Become a Verified Donor</h1>
                        <p className="text-red-600 max-w-lg mx-auto">
                            Complete the verification process to become a trusted blood donor and help save lives in your community.
                        </p>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center justify-center mb-8">
                        {steps.map((step, index) => (
                            <div key={step.key} className="flex items-center">
                                <button
                                    onClick={() => setCurrentStep(step.key as any)}
                                    className={`flex flex-col items-center transition-all ${currentStep === step.key ? 'scale-110' : ''
                                        }`}
                                >
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-colors ${step.completed ? 'bg-green-500 text-white' :
                                        currentStep === step.key ? 'bg-red-600 text-white' :
                                            'bg-red-100 text-red-400'
                                        }`}>
                                        {step.completed ? <Check className="w-6 h-6" /> : <step.icon className="w-6 h-6" />}
                                    </div>
                                    <span className={`text-sm font-medium ${currentStep === step.key ? 'text-red-800' : 'text-gray-500'
                                        }`}>
                                        {step.label}
                                    </span>
                                </button>
                                {index < steps.length - 1 && (
                                    <div className={`w-16 h-1 mx-2 rounded ${steps[index + 1].completed || steps[index].completed ? 'bg-green-500' : 'bg-red-100'
                                        }`} />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    {/* Step Content */}
                    <Card className="p-6 md:p-8 shadow-lg border-red-100">
                        {/* Step 1: Identity Verification */}
                        {currentStep === 'identity' && (
                            <form onSubmit={handleIdentitySubmit} className="space-y-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 bg-red-100 rounded-lg">
                                        <Shield className="w-6 h-6 text-red-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Identity Verification</h2>
                                        <p className="text-gray-500">Provide your personal information and ID details</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName">Full Name (as on ID)</Label>
                                        <Input
                                            id="fullName"
                                            value={identityForm.fullName}
                                            onChange={(e) => setIdentityForm(prev => ({ ...prev, fullName: e.target.value }))}
                                            placeholder="Enter your full name"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="dob">Date of Birth</Label>
                                        <Input
                                            id="dob"
                                            type="date"
                                            value={identityForm.dateOfBirth}
                                            onChange={(e) => setIdentityForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Gender</Label>
                                    <div className="flex gap-4">
                                        {['Male', 'Female', 'Other'].map((gender) => (
                                            <label key={gender} className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="gender"
                                                    value={gender.toLowerCase()}
                                                    checked={identityForm.gender === gender.toLowerCase()}
                                                    onChange={(e) => setIdentityForm(prev => ({ ...prev, gender: e.target.value }))}
                                                    className="w-4 h-4 text-red-600"
                                                />
                                                <span>{gender}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="idType">ID Type</Label>
                                        <select
                                            id="idType"
                                            value={identityForm.idType}
                                            onChange={(e) => setIdentityForm(prev => ({ ...prev, idType: e.target.value as any }))}
                                            className="w-full h-10 px-3 rounded-md border border-input bg-background"
                                            required
                                        >
                                            {ID_TYPES.map((type) => (
                                                <option key={type.value} value={type.value}>{type.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="idNumber">ID Number</Label>
                                        <Input
                                            id="idNumber"
                                            value={identityForm.idNumber}
                                            onChange={(e) => setIdentityForm(prev => ({ ...prev, idNumber: e.target.value }))}
                                            placeholder="Enter your ID number"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Document Upload */}
                                <div className="space-y-4">
                                    <Label>Upload Documents</Label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="border-2 border-dashed border-red-200 rounded-lg p-6 text-center hover:border-red-400 transition-colors cursor-pointer">
                                            <Upload className="w-10 h-10 mx-auto text-red-400 mb-2" />
                                            <p className="text-sm text-gray-600">Upload ID Photo</p>
                                            <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
                                        </div>
                                        <div className="border-2 border-dashed border-red-200 rounded-lg p-6 text-center hover:border-red-400 transition-colors cursor-pointer">
                                            <Camera className="w-10 h-10 mx-auto text-red-400 mb-2" />
                                            <p className="text-sm text-gray-600">Take a Selfie</p>
                                            <p className="text-xs text-gray-400">For biometric verification</p>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-red-600 hover:bg-red-700"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                                    ) : (
                                        <>Continue to Medical History <ChevronRight className="w-4 h-4 ml-2" /></>
                                    )}
                                </Button>
                            </form>
                        )}

                        {/* Step 2: Medical History */}
                        {currentStep === 'medical' && (
                            <form onSubmit={handleMedicalSubmit} className="space-y-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 bg-red-100 rounded-lg">
                                        <Heart className="w-6 h-6 text-red-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Medical History</h2>
                                        <p className="text-gray-500">Complete the health questionnaire for eligibility</p>
                                    </div>
                                </div>

                                {/* Blood Type Selection */}
                                <div className="space-y-3">
                                    <Label>Select Your Blood Type</Label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {BLOOD_TYPES.map((type) => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setMedicalForm(prev => ({ ...prev, bloodType: type }))}
                                                className={`p-3 rounded-lg border-2 transition-all ${medicalForm.bloodType === type
                                                    ? 'border-red-500 bg-red-50 scale-105'
                                                    : 'border-gray-200 hover:border-red-200'
                                                    }`}
                                            >
                                                <BloodTypeBadge type={type as any} />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Physical Measurements */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="weight" className="flex items-center gap-2">
                                            <Scale className="w-4 h-4" /> Weight (kg)
                                        </Label>
                                        <Input
                                            id="weight"
                                            type="number"
                                            min="45"
                                            max="200"
                                            value={medicalForm.weight || ''}
                                            onChange={(e) => setMedicalForm(prev => ({ ...prev, weight: parseFloat(e.target.value) }))}
                                            placeholder="e.g., 65"
                                            required
                                        />
                                        <p className="text-xs text-gray-400">Minimum 45kg required to donate</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="height" className="flex items-center gap-2">
                                            <Ruler className="w-4 h-4" /> Height (cm)
                                        </Label>
                                        <Input
                                            id="height"
                                            type="number"
                                            min="100"
                                            max="250"
                                            value={medicalForm.height || ''}
                                            onChange={(e) => setMedicalForm(prev => ({ ...prev, height: parseFloat(e.target.value) }))}
                                            placeholder="e.g., 170"
                                        />
                                    </div>
                                </div>

                                {/* Medical Conditions */}
                                <div className="space-y-3">
                                    <Label className="flex items-center gap-2">
                                        <Stethoscope className="w-4 h-4" /> Do you have any of these conditions?
                                    </Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {MEDICAL_CONDITIONS.map((condition) => (
                                            <label
                                                key={condition}
                                                className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${medicalForm.medicalConditions?.includes(condition)
                                                    ? 'border-red-500 bg-red-50'
                                                    : 'border-gray-200 hover:border-red-200'
                                                    }`}
                                            >
                                                <Checkbox
                                                    checked={medicalForm.medicalConditions?.includes(condition)}
                                                    onCheckedChange={() => toggleCondition(condition)}
                                                />
                                                <span className="text-sm">{condition}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Additional Questions */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="font-medium">Recent Surgery (last 6 months)?</p>
                                            <p className="text-sm text-gray-500">Including minor procedures</p>
                                        </div>
                                        <Switch
                                            checked={medicalForm.hasRecentSurgery}
                                            onCheckedChange={(checked) => setMedicalForm(prev => ({ ...prev, hasRecentSurgery: checked }))}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="font-medium">Tattoo or Piercing (last 6 months)?</p>
                                            <p className="text-sm text-gray-500">Temporary deferral may apply</p>
                                        </div>
                                        <Switch
                                            checked={medicalForm.hasTattooOrPiercing}
                                            onCheckedChange={(checked) => setMedicalForm(prev => ({ ...prev, hasTattooOrPiercing: checked }))}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="font-medium">Recent International Travel?</p>
                                            <p className="text-sm text-gray-500">Certain regions may require deferral</p>
                                        </div>
                                        <Switch
                                            checked={medicalForm.hasRecentTravel}
                                            onCheckedChange={(checked) => setMedicalForm(prev => ({ ...prev, hasRecentTravel: checked }))}
                                        />
                                    </div>
                                </div>

                                {/* Navigation */}
                                <div className="flex gap-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setCurrentStep('identity')}
                                        className="flex-1"
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1 bg-red-600 hover:bg-red-700"
                                        disabled={isLoading || !medicalForm.bloodType || !medicalForm.weight}
                                    >
                                        {isLoading ? (
                                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                                        ) : (
                                            <>Continue to Location <ChevronRight className="w-4 h-4 ml-2" /></>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        )}

                        {/* Step 3: Location Verification */}
                        {currentStep === 'location' && (
                            <form onSubmit={handleLocationSubmit} className="space-y-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 bg-red-100 rounded-lg">
                                        <MapPin className="w-6 h-6 text-red-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Location Verification</h2>
                                        <p className="text-gray-500">Confirm your address for emergency matching</p>
                                    </div>
                                </div>

                                {/* Auto-detect Location */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <MapPinned className="w-6 h-6 text-blue-600" />
                                            <div>
                                                <p className="font-medium text-blue-800">Auto-detect Location</p>
                                                <p className="text-sm text-blue-600">
                                                    {locationForm.latitude ? `${locationForm.latitude.toFixed(4)}, ${(locationForm.longitude ?? 0).toFixed(4)}` : 'Click to detect'}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={getCurrentLocation}
                                        >
                                            Detect
                                        </Button>
                                    </div>
                                </div>

                                {/* Address Fields */}
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="address">Street Address</Label>
                                        <Input
                                            id="address"
                                            value={locationForm.address}
                                            onChange={(e) => setLocationForm(prev => ({ ...prev, address: e.target.value }))}
                                            placeholder="Enter your street address"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="city">City</Label>
                                            <select
                                                id="city"
                                                value={locationForm.city}
                                                onChange={(e) => setLocationForm(prev => ({ ...prev, city: e.target.value }))}
                                                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                                                required
                                            >
                                                <option value="">Select City</option>
                                                <option value="Kathmandu">Kathmandu</option>
                                                <option value="Lalitpur">Lalitpur</option>
                                                <option value="Bhaktapur">Bhaktapur</option>
                                                <option value="Pokhara">Pokhara</option>
                                                <option value="Biratnagar">Biratnagar</option>
                                                <option value="Birgunj">Birgunj</option>
                                                <option value="Chitwan">Chitwan (Bharatpur)</option>
                                                <option value="Butwal">Butwal</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="state">Province/State</Label>
                                            <Input
                                                id="state"
                                                value={locationForm.state}
                                                onChange={(e) => setLocationForm(prev => ({ ...prev, state: e.target.value }))}
                                                placeholder="e.g., Bagmati"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Travel Preferences */}
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="travelRadius" className="flex items-center gap-2">
                                            <Car className="w-4 h-4" /> Travel Radius (km)
                                        </Label>
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="range"
                                                id="travelRadius"
                                                min="5"
                                                max="100"
                                                value={locationForm.travelRadius}
                                                onChange={(e) => setLocationForm(prev => ({ ...prev, travelRadius: parseInt(e.target.value) }))}
                                                className="flex-1"
                                            />
                                            <span className="w-16 text-center font-medium text-red-600">
                                                {locationForm.travelRadius} km
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="font-medium">Need Transportation?</p>
                                            <p className="text-sm text-gray-500">We can arrange pickup for emergencies</p>
                                        </div>
                                        <Switch
                                            checked={locationForm.transportationNeeded}
                                            onCheckedChange={(checked) => setLocationForm(prev => ({ ...prev, transportationNeeded: checked }))}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                                        <div>
                                            <p className="font-medium text-green-800">Available for Emergencies?</p>
                                            <p className="text-sm text-green-600">Receive urgent blood request alerts</p>
                                        </div>
                                        <Switch
                                            checked={locationForm.emergencyAvailable}
                                            onCheckedChange={(checked) => setLocationForm(prev => ({ ...prev, emergencyAvailable: checked }))}
                                        />
                                    </div>
                                </div>

                                {/* Navigation */}
                                <div className="flex gap-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setCurrentStep('medical')}
                                        className="flex-1"
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1 bg-red-600 hover:bg-red-700"
                                        disabled={isLoading || !locationForm.city}
                                    >
                                        {isLoading ? (
                                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                                        ) : (
                                            <>Complete Verification <Check className="w-4 h-4 ml-2" /></>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        )}

                        {/* Step 4: Completion */}
                        {currentStep === 'complete' && (
                            <div className="text-center py-8">
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                                    <Check className="w-10 h-10 text-green-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Submitted!</h2>
                                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                    Thank you for completing the verification process. Your application is now under review.
                                    You'll be notified once your donor profile is verified.
                                </p>

                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                                    <p className="text-yellow-800 text-sm">
                                        <Clock className="w-4 h-4 inline mr-2" />
                                        Verification typically takes 1-2 business days
                                    </p>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <Button
                                        onClick={() => navigate('/dashboard')}
                                        className="bg-red-600 hover:bg-red-700"
                                    >
                                        Go to Dashboard
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => navigate('/')}
                                    >
                                        Return Home
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Card>

                    {/* FAQ Section */}
                    <div className="mt-8 space-y-4">
                        <h3 className="text-lg font-bold text-red-800">Frequently Asked Questions</h3>
                        <div className="space-y-3">
                            <div className="bg-white rounded-lg p-4 border border-red-100">
                                <p className="font-medium">Why do I need to verify my identity?</p>
                                <p className="text-sm text-gray-600 mt-1">
                                    Identity verification ensures the safety and trust of our blood donation network. It helps protect both donors and recipients.
                                </p>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-red-100">
                                <p className="font-medium">How long does verification take?</p>
                                <p className="text-sm text-gray-600 mt-1">
                                    Most verifications are completed within 1-2 business days. You'll receive a notification once your profile is verified.
                                </p>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-red-100">
                                <p className="font-medium">Is my medical information secure?</p>
                                <p className="text-sm text-gray-600 mt-1">
                                    Yes, all medical data is encrypted and only accessible to authorized medical staff. We comply with data protection regulations.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
}

export default VerifyDonorPage;
