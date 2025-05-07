import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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
import { Loader2, MapPin, Phone, User, AlertTriangle } from "lucide-react";

const requestFormSchema = z.object({
  patientName: z.string().min(2, "Patient name is required"),
  contactName: z.string().min(2, "Contact name is required"),
  contactPhone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^\d+$/, "Phone number must contain only digits"),
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
  consent: z.literal(true, {
    errorMap: () => ({
      message: "You must consent to the terms",
    }),
  }),
});

type RequestFormValues = z.infer<typeof requestFormSchema>;

export function RequestForm() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const totalSteps = 3;

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
      consent: false,
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: RequestFormValues) => {
      const response = await apiRequest("POST", "/api/emergency-requests", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Emergency request created",
        description: "We are searching for compatible donors in your area.",
        variant: "default",
      });
      // Reset form or redirect
    },
    onError: (error) => {
      toast({
        title: "Error creating request",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: RequestFormValues) {
    mutate(data);
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
          form.handleSubmit(onSubmit)();
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
              className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                i + 1 === step
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
                className={`h-1 w-12 sm:w-24 ${
                  i + 1 < step ? "bg-green-300" : "bg-gray-200"
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
                control={form.control}
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
                control={form.control}
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
                control={form.control}
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
                control={form.control}
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
                control={form.control}
                name="hospitalName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hospital Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Name of hospital or medical facility" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hospitalAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hospital Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Full address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
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
                  control={form.control}
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
                control={form.control}
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
                control={form.control}
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
              disabled={isPending}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {step < totalSteps ? "Next" : "Submit Request"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
