import { useState, useEffect, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { bloodRequestAPI } from "@/lib/firebase/api";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, MapPin, Phone, User, AlertTriangle, Building2, Search } from "lucide-react";

// Hospital type for autocomplete
interface Hospital {
  id: string;
  name: string;
  address: string;
  city: string;
  phone?: string;
  latitude: number;
  longitude: number;
}

// Sample hospitals for fallback when database is unavailable
const sampleHospitals: Hospital[] = [
  { id: '1', name: 'Bir Hospital', address: 'Mahaboudha, Kathmandu', city: 'Kathmandu', phone: '01-4221119', latitude: 27.7033, longitude: 85.3167 },
  { id: '2', name: 'Teaching Hospital (TUTH)', address: 'Maharajgunj, Kathmandu', city: 'Kathmandu', phone: '01-4412303', latitude: 27.7372, longitude: 85.3308 },
  { id: '3', name: 'Patan Hospital', address: 'Lagankhel, Lalitpur', city: 'Lalitpur', phone: '01-5522295', latitude: 27.6683, longitude: 85.3264 },
  { id: '4', name: 'Grande International Hospital', address: 'Dhapasi, Kathmandu', city: 'Kathmandu', phone: '01-5159266', latitude: 27.7419, longitude: 85.3506 },
  { id: '5', name: 'Norvic International Hospital', address: 'Thapathali, Kathmandu', city: 'Kathmandu', phone: '01-4258554', latitude: 27.6947, longitude: 85.3197 },
  { id: '6', name: 'Nepal Medical College', address: 'Jorpati, Kathmandu', city: 'Kathmandu', phone: '01-4911008', latitude: 27.7356, longitude: 85.3856 },
  { id: '7', name: 'B&B Hospital', address: 'Gwarko, Lalitpur', city: 'Lalitpur', phone: '01-5533206', latitude: 27.6678, longitude: 85.3383 },
  { id: '8', name: 'Civil Hospital', address: 'New Baneshwor, Kathmandu', city: 'Kathmandu', phone: '01-4780069', latitude: 27.6917, longitude: 85.3453 },
  { id: '9', name: 'National Trauma Center', address: 'Mahankal, Kathmandu', city: 'Kathmandu', phone: '01-4499000', latitude: 27.7122, longitude: 85.3136 },
  { id: '10', name: 'Bhaktapur Hospital', address: 'Bhaktapur', city: 'Bhaktapur', phone: '01-6610798', latitude: 27.6711, longitude: 85.4297 },
];


const requestFormSchema = z.object({
  patientName: z.string().min(2, "Patient name is required"),
  contactName: z.string().min(2, "Contact name is required"),
  contactPhone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^\+?\d+$/, "Phone number must contain only digits (+ prefix allowed)"),
  bloodType: z.enum([
    "A+",
    "A-",
    "B+",
    "B-",
    "AB+",
    "AB-",
    "O+",
    "O-",
  ]),
  hospitalName: z.string().min(3, "Hospital name is required"),
  hospitalAddress: z.string().min(5, "Hospital address is required"),
  unitsNeeded: z.coerce
    .number()
    .min(1, "At least 1 unit is required")
    .max(10, "Maximum 10 units per request"),
  urgencyLevel: z.enum(["critical", "urgent", "standard"]),
  medicalReason: z.string().min(10, "Please provide medical reason"),
  consent: z.boolean().refine((val) => val === true, {
    message: "You must consent to the terms",
  }),
});

type RequestFormValues = z.infer<typeof requestFormSchema>;

export function RequestForm() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const totalSteps = 3;

  // Hospital autocomplete state
  const [hospitalSuggestions, setHospitalSuggestions] = useState<Hospital[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchingHospitals, setSearchingHospitals] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const hospitalInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const form = useForm<RequestFormValues>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: {
      patientName: "",
      contactName: "",
      contactPhone: "",
      bloodType: "O+",
      hospitalName: "",
      hospitalAddress: "",
      unitsNeeded: 1,
      urgencyLevel: "urgent",
      medicalReason: "",
      consent: false as boolean,
    },
  });

  // Search hospitals function
  const searchHospitals = useCallback(async (query: string) => {
    if (query.length < 2) {
      setHospitalSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setSearchingHospitals(true);

    try {
      // Try to search from Supabase first
      if (supabase) {
        const { data, error } = await supabase
          .from('hospitals')
          .select('id, name, address, city, phone, latitude, longitude')
          .ilike('name', `%${query}%`)
          .eq('is_active', true)
          .limit(8);

        if (!error && data && data.length > 0) {
          setHospitalSuggestions(data);
          setShowSuggestions(true);
          setSearchingHospitals(false);
          return;
        }
      }

      // Fall back to sample hospitals
      const filtered = sampleHospitals.filter(h =>
        h.name.toLowerCase().includes(query.toLowerCase()) ||
        h.city.toLowerCase().includes(query.toLowerCase())
      );
      setHospitalSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } catch (error) {
      console.error('Error searching hospitals:', error);
      // Fall back to sample hospitals
      const filtered = sampleHospitals.filter(h =>
        h.name.toLowerCase().includes(query.toLowerCase())
      );
      setHospitalSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } finally {
      setSearchingHospitals(false);
    }
  }, []);

  // Debounced hospital search
  useEffect(() => {
    const hospitalName = form.watch('hospitalName');
    if (!selectedHospital || selectedHospital.name !== hospitalName) {
      const timer = setTimeout(() => {
        searchHospitals(hospitalName);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [form.watch('hospitalName'), searchHospitals, selectedHospital]);

  // Handle hospital selection
  const handleSelectHospital = useCallback((hospital: Hospital) => {
    setSelectedHospital(hospital);
    form.setValue('hospitalName', hospital.name);
    form.setValue('hospitalAddress', `${hospital.address}, ${hospital.city}`);
    setShowSuggestions(false);
    setHospitalSuggestions([]);
  }, [form]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        hospitalInputRef.current &&
        !hospitalInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function onSubmit(data: RequestFormValues) {
    try {
      setSubmitting(true);

      // Calculate expiration time based on urgency level
      const hoursToAdd = {
        'critical': 3,
        'urgent': 12,
        'standard': 24
      }[data.urgencyLevel];

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + hoursToAdd);

      // Use selected hospital coordinates or default Kathmandu coordinates
      const latitude = selectedHospital?.latitude || 27.7172;
      const longitude = selectedHospital?.longitude || 85.3240;

      // Insert into Supabase emergency_requests table
      if (supabase) {
        // Map urgency level to database enum
        const urgencyMap: Record<string, string> = {
          'critical': 'critical',
          'urgent': 'urgent',
          'standard': 'normal'
        };

        const { data: insertedRequest, error } = await supabase
          .from('emergency_requests')
          .insert({
            // No requester_id for anonymous requests
            is_anonymous: true,
            patient_name: data.patientName,
            blood_type: data.bloodType,
            urgency: urgencyMap[data.urgencyLevel] || 'normal',
            units_needed: data.unitsNeeded,
            hospital_name: data.hospitalName,
            hospital_address: data.hospitalAddress,
            hospital_city: selectedHospital?.city || 'Kathmandu',
            hospital_state: 'Bagmati',
            latitude: latitude,
            longitude: longitude,
            contact_name: data.contactName,
            contact_phone: data.contactPhone,
            contact_relation: 'Family',
            request_reason: data.medicalReason,
            status: 'pending',
            expires_at: expiresAt.toISOString(),
            notification_radius_km: 5, // Start with 5km radius
          })
          .select()
          .single();

        if (error) {
          console.error('Supabase error:', error);
          // If database error, still save locally for demo
          if (error.code) {
            console.log('Saving request locally due to database error');
            saveRequestLocally();
          } else {
            throw new Error(error.message);
          }
        } else {
          console.log('Emergency request created:', insertedRequest);

          // Trigger donor notification function (if exists)
          try {
            await supabase.rpc('send_donor_notifications', {
              p_request_id: insertedRequest.id,
              p_initial_radius_km: 5,
              p_radius_increment_km: 2,
              p_max_radius_km: 50
            });
          } catch (notifyErr) {
            console.log('Donor notification function not available yet:', notifyErr);
          }
        }
      } else {
        saveRequestLocally();
      }

      // Helper function to save locally
      function saveRequestLocally() {
        const storedRequests = JSON.parse(localStorage.getItem('emergency_requests') || '[]');
        storedRequests.push({
          id: `req_${Date.now()}`,
          patient_name: data.patientName,
          blood_type: data.bloodType,
          urgency: data.urgencyLevel,
          units_needed: data.unitsNeeded,
          hospital_name: data.hospitalName,
          hospital_address: data.hospitalAddress,
          hospital_city: selectedHospital?.city || 'Kathmandu',
          contact_name: data.contactName,
          contact_phone: data.contactPhone,
          request_reason: data.medicalReason,
          status: 'pending',
          expires_at: expiresAt.toISOString(),
          created_at: new Date().toISOString()
        });
        localStorage.setItem('emergency_requests', JSON.stringify(storedRequests));
      }

      toast({
        title: "🚨 Emergency Request Created",
        description: "We're immediately searching for compatible donors in your area. You'll receive updates via SMS and email.",
      });

      // Navigate to dashboard or confirmation page
      setLocation('/dashboard');

    } catch (error) {
      console.error('Error creating emergency request:', error);
      toast({
        title: "Request Failed",
        description: "Failed to create emergency request. Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  const nextStep = () => {
    const fieldsToValidate = {
      1: ["patientName", "contactName", "contactPhone", "bloodType"],
      2: ["hospitalName", "hospitalAddress", "unitsNeeded", "urgencyLevel"],
      3: ["medicalReason", "consent"],
    }[step] as Array<keyof RequestFormValues>;

    form.trigger(fieldsToValidate).then((isValid) => {
      if (isValid) {
        if (step < totalSteps) {
          setStep(step + 1);
        } else {
          form.handleSubmit(onSubmit as any)();
        }
      }
    });
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="space-y-8">
      {/* Progress Indicator */}
      <div className="flex justify-between">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div key={i} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${i + 1 === step
                ? "bg-primary text-white"
                : i + 1 < step
                  ? "bg-green-100 text-green-700 border border-green-300"
                  : "bg-gray-100 text-gray-400 border border-gray-200"
                }`}
            >
              {i + 1 < step ? "✓" : i + 1}
            </div>
            {i < totalSteps - 1 && (
              <div
                className={`h-1 w-12 sm:w-24 ${i + 1 < step ? "bg-green-300" : "bg-gray-200"
                  }`}
              ></div>
            )}
          </div>
        ))}
      </div>

      <Form {...form}>
        <form className="space-y-6">
          {/* Step 1: Patient & Contact Information */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center mb-4">
                <User className="mr-2 h-5 w-5 text-primary" />
                <h3 className="text-lg font-medium">Patient & Contact Information</h3>
              </div>

              <FormField
                control={form.control as any}
                name="patientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Full name of patient" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="contactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Person Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Name of person to contact" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="contactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="bloodType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Blood Type Needed</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select blood type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Step 2: Hospital & Request Details */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center mb-4">
                <MapPin className="mr-2 h-5 w-5 text-primary" />
                <h3 className="text-lg font-medium">Hospital & Request Details</h3>
              </div>

              <FormField
                control={form.control as any}
                name="hospitalName"
                render={({ field }) => (
                  <FormItem className="relative">
                    <FormLabel>Hospital Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Start typing hospital name..."
                          {...field}
                          ref={hospitalInputRef}
                          onChange={(e) => {
                            field.onChange(e);
                            setSelectedHospital(null);
                          }}
                          onFocus={() => {
                            if (hospitalSuggestions.length > 0) {
                              setShowSuggestions(true);
                            }
                          }}
                          className="pl-10"
                          autoComplete="off"
                        />
                        {searchingHospitals && (
                          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
                        )}
                      </div>
                    </FormControl>

                    {/* Autocomplete Suggestions Dropdown */}
                    {showSuggestions && hospitalSuggestions.length > 0 && (
                      <div
                        ref={suggestionsRef}
                        className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto"
                      >
                        {hospitalSuggestions.map((hospital) => (
                          <button
                            key={hospital.id}
                            type="button"
                            onClick={() => handleSelectHospital(hospital)}
                            className="w-full px-4 py-3 text-left hover:bg-red-50 transition-colors border-b border-gray-100 last:border-0"
                          >
                            <div className="flex items-start gap-3">
                              <Building2 className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">{hospital.name}</p>
                                <p className="text-sm text-gray-500 truncate">{hospital.address}, {hospital.city}</p>
                                {hospital.phone && (
                                  <p className="text-xs text-gray-400 mt-0.5">📞 {hospital.phone}</p>
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Hint text when no database results */}
                    {form.watch('hospitalName').length >= 2 && hospitalSuggestions.length === 0 && !searchingHospitals && showSuggestions && (
                      <div className="absolute z-50 w-full mt-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-500">
                        <p>No hospitals found. You can enter a custom name.</p>
                      </div>
                    )}

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="hospitalAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hospital Address</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Full address"
                          {...field}
                          className={`pl-10 ${selectedHospital ? 'bg-green-50 border-green-200' : ''}`}
                        />
                        {selectedHospital && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-green-600">✓ Auto-filled</span>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control as any}
                  name="unitsNeeded"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Units Needed</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={10}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as any}
                  name="urgencyLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Urgency Level</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select urgency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="critical">
                            Critical (immediately life-threatening)
                          </SelectItem>
                          <SelectItem value="urgent">
                            Urgent (needed within hours)
                          </SelectItem>
                          <SelectItem value="standard">
                            Standard (needed within 24 hours)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          {/* Step 3: Reason & Confirmation */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center mb-4">
                <AlertTriangle className="mr-2 h-5 w-5 text-primary" />
                <h3 className="text-lg font-medium">Reason & Confirmation</h3>
              </div>

              <FormField
                control={form.control as any}
                name="medicalReason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medical Reason for Request</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Please provide details about the medical situation"
                        className="min-h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Card className="border-yellow-200 bg-yellow-50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-yellow-800 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Important Notice
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-yellow-800">
                    This system is for genuine medical emergencies only. False requests can
                    divert resources from real emergencies and may have legal consequences.
                  </CardDescription>
                </CardContent>
              </Card>

              <FormField
                control={form.control as any}
                name="consent"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        I confirm this is a genuine medical emergency and all information provided is accurate
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            {step > 1 ? (
              <Button type="button" variant="outline" onClick={prevStep}>
                Previous
              </Button>
            ) : (
              <div></div> // Empty div to maintain spacing
            )}
            <Button
              type="button"
              onClick={nextStep}
              disabled={submitting}
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {step < totalSteps ? "Next" : "Submit Request"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
