import React, { useState } from "react";
import {
  User,
  MapPin,
  Briefcase,
  DollarSign,
  FileText,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  Info,
  AlertCircle,
  Check,
  HelpCircle
} from "lucide-react";

// ==========================================
// TYPES & INTERFACES
// ==========================================

interface FormData {
  // Step 1: Personal Details
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  ssn: string;

  // Step 2: Demographics & Housing
  streetAddress: string;
  unit: string;
  city: string;
  state: string;
  zipCode: string;
  housingStatus: "Own" | "Rent" | "Other" | "";
  monthlyHousingPayment: string;

  // Step 3: Employment
  employmentStatus: "Employed" | "Self-Employed" | "Unemployed" | "Retired" | "Student" | "";
  employerName: string;
  jobTitle: string;
  yearsAtEmployer: string;
  workPhone: string;

  // Step 4: Financial Info
  annualIncome: string;
  otherIncome: string;
  requestedLimit: number;
  primaryBank: string;
  purposeOfCredit: "Debt Consolidation" | "Home Improvement" | "Emergency Expenses" | "Major Purchase" | "Other" | "";

  // Step 5: Consent
  agreeToTerms: boolean;
  agreeToCreditPull: boolean;
}

const initialFormData: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  dob: "",
  ssn: "",
  streetAddress: "",
  unit: "",
  city: "",
  state: "",
  zipCode: "",
  housingStatus: "",
  monthlyHousingPayment: "",
  employmentStatus: "",
  employerName: "",
  jobTitle: "",
  yearsAtEmployer: "",
  workPhone: "",
  annualIncome: "",
  otherIncome: "",
  requestedLimit: 5000,
  primaryBank: "",
  purposeOfCredit: "",
  agreeToTerms: false,
  agreeToCreditPull: false,
};

interface FormErrors {
  [key: string]: string;
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function OnboardingApplicationWizard() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [applicationId, setApplicationId] = useState<string>("");

  // Steps configuration
  const steps = [
    { id: 1, name: "Personal Details", icon: User },
    { id: 2, name: "Demographics", icon: MapPin },
    { id: 3, name: "Employment", icon: Briefcase },
    { id: 4, name: "Financial Info", icon: DollarSign },
    { id: 5, name: "Review & Submit", icon: FileText },
  ];

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Custom slider handler
  const handleSliderChange = (value: number) => {
    setFormData((prev) => ({ ...prev, requestedLimit: value }));
  };

  // Validation logic per step
  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};

    if (step === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
      if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Invalid email address";
      }
      if (!formData.phone.trim()) {
        newErrors.phone = "Phone number is required";
      } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ""))) {
        newErrors.phone = "Must be a valid 10-digit phone number";
      }
      if (!formData.dob) {
        newErrors.dob = "Date of birth is required";
      } else {
        const age = new Date().getFullYear() - new Date(formData.dob).getFullYear();
        if (age < 18) newErrors.dob = "You must be at least 18 years old";
      }
      if (!formData.ssn.trim()) {
        newErrors.ssn = "SSN is required";
      } else if (!/^\d{4}$|^\d{9}$|^\d{3}-\d{2}-\d{4}$/.test(formData.ssn)) {
        newErrors.ssn = "Enter last 4 digits or full SSN";
      }
    }

    if (step === 2) {
      if (!formData.streetAddress.trim()) newErrors.streetAddress = "Street address is required";
      if (!formData.city.trim()) newErrors.city = "City is required";
      if (!formData.state.trim()) newErrors.state = "State is required";
      if (!formData.zipCode.trim()) {
        newErrors.zipCode = "Zip code is required";
      } else if (!/^\d{5}(-\d{4})?$/.test(formData.zipCode)) {
        newErrors.zipCode = "Invalid Zip code format";
      }
      if (!formData.housingStatus) newErrors.housingStatus = "Housing status is required";
      if (!formData.monthlyHousingPayment.trim()) {
        newErrors.monthlyHousingPayment = "Monthly payment is required";
      } else if (isNaN(Number(formData.monthlyHousingPayment))) {
        newErrors.monthlyHousingPayment = "Must be a valid number";
      }
    }

    if (step === 3) {
      if (!formData.employmentStatus) newErrors.employmentStatus = "Employment status is required";
      if (formData.employmentStatus === "Employed" || formData.employmentStatus === "Self-Employed") {
        if (!formData.employerName.trim()) newErrors.employerName = "Employer name is required";
        if (!formData.jobTitle.trim()) newErrors.jobTitle = "Job title is required";
        if (!formData.yearsAtEmployer.trim()) newErrors.yearsAtEmployer = "Years at employer is required";
      }
    }

    if (step === 4) {
      if (!formData.annualIncome.trim()) {
        newErrors.annualIncome = "Annual income is required";
      } else if (isNaN(Number(formData.annualIncome)) || Number(formData.annualIncome) <= 0) {
        newErrors.annualIncome = "Must be a positive number";
      }
      if (!formData.purposeOfCredit) newErrors.purposeOfCredit = "Please select a purpose";
      if (!formData.primaryBank.trim()) newErrors.primaryBank = "Primary bank name is required";
    }

    if (step === 5) {
      if (!formData.agreeToTerms) newErrors.agreeToTerms = "You must accept the terms and conditions";
      if (!formData.agreeToCreditPull) newErrors.agreeToCreditPull = "You must authorize the credit check";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigation
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Mock API Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(5)) return;

    setIsSubmitting(true);

    // Simulate API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 2500));
      const generatedId = "APP-" + Math.floor(100000 + Math.random() * 900000);
      setApplicationId(generatedId);
      setIsSuccess(true);
    } catch (error) {
      console.error("Submission failed", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setCurrentStep(1);
    setIsSuccess(false);
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-2 bg-indigo-50 rounded-xl mb-4">
            <ShieldCheck className="h-8 w-8 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
            Unsecured Credit Application
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-lg text-slate-500 sm:mt-4">
            Complete our secure, 5-step application to check your eligibility. No impact on your credit score to pre-qualify.
          </p>
        </div>

        {/* Progress Stepper */}
        {!isSuccess && (
          <div className="mb-10">
            <div className="hidden md:flex justify-between items-center relative">
              {/* Background Line */}
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-200 -z-10 rounded-full" />
              {/* Active Progress Line */}
              <div 
                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-indigo-600 -z-10 transition-all duration-500 rounded-full"
                style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
              />

              {steps.map((step) => {
                const Icon = step.icon;
                const isCompleted = currentStep > step.id;
                const isActive = currentStep === step.id;

                return (
                  <div key={step.id} className="flex flex-col items-center bg-slate-50 px-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                        isCompleted
                          ? "bg-indigo-600 border-indigo-600 text-white"
                          : isActive
                          ? "bg-white border-indigo-600 text-indigo-600 shadow-md shadow-indigo-100 scale-110"
                          : "bg-white border-slate-200 text-slate-400"
                      }`}
                    >
                      {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <span
                      className={`mt-2 text-xs font-semibold tracking-wide uppercase ${
                        isActive ? "text-indigo-600" : "text-slate-500"
                      }`}
                    >
                      {step.name}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Mobile Stepper */}
            <div className="md:hidden flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                  {currentStep}
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Step {currentStep} of 5</p>
                  <p className="text-sm font-bold text-slate-800">{steps[currentStep - 1].name}</p>
                </div>
              </div>
              <div className="w-24 bg-slate-100 rounded-full h-2">
                <div 
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / steps.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Main Card Container */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden">
          
          {isSuccess ? (
            /* SUCCESS SCREEN */
            <div className="p-8 md:p-12 text-center">
              <div className="inline-flex items-center justify-center p-4 bg-emerald-50 rounded-full mb-6">
                <CheckCircle className="h-16 w-16 text-emerald-500 animate-bounce" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900">Application Submitted!</h2>
              <p className="mt-3 text-slate-500 max-w-md mx-auto">
                Thank you, <span className="font-semibold text-slate-800">{formData.firstName}</span>. Your application has been successfully received and is being processed.
              </p>

              {/* Application Details Box */}
              <div className="mt-8 max-w-md mx-auto bg-slate-50 rounded-xl p-6 border border-slate-100 text-left">
                <div className="flex justify-between items-center border-b border-slate-200 pb-3 mb-3">
                  <span className="text-sm text-slate-500 font-medium">Application ID</span>
                  <span className="text-sm font-mono font-bold text-indigo-600">{applicationId}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200 pb-3 mb-3">
                  <span className="text-sm text-slate-500 font-medium">Requested Limit</span>
                  <span className="text-sm font-bold text-slate-800">${formData.requestedLimit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200 pb-3 mb-3">
                  <span className="text-sm text-slate-500 font-medium">Status</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                    Under Review
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500 font-medium">Estimated Decision</span>
                  <span className="text-sm text-slate-800 font-medium">Within 24 Hours</span>
                </div>
              </div>

              <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
                <button
                  onClick={handleReset}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md shadow-indigo-100 transition-all duration-200"
                >
                  Submit Another Application
                </button>
                <button
                  onClick={() => alert("Redirecting to dashboard (mock)...")}
                  className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl border border-slate-200 transition-all duration-200"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          ) : (
            /* WIZARD FORM */
            <form onSubmit={handleSubmit} className="divide-y divide-slate-100">
              
              {/* Step Content Area */}
              <div className="p-6 md:p-10">
                
                {/* STEP 1: PERSONAL DETAILS */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Personal Details</h3>
                      <p className="text-sm text-slate-500">Please provide your legal identification details.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">First Name</label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          placeholder="John"
                          className={`w-full px-4 py-3 rounded-xl border ${
                            errors.firstName ? "border-red-500 focus:ring-red-500" : "border-slate-200 focus:ring-indigo-500"
                          } focus:outline-none focus:ring-2`}
                        />
                        {errors.firstName && <p className="mt-1.5 text-xs text-red-500 flex items-center"><AlertCircle className="w-3.5 h-3.5 mr-1" /> {errors.firstName}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Last Name</label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          placeholder="Doe"
                          className={`w-full px-4 py-3 rounded-xl border ${
                            errors.lastName ? "border-red-500 focus:ring-red-500" : "border-slate-200 focus:ring-indigo-500"
                          } focus:outline-none focus:ring-2`}
                        />
                        {errors.lastName && <p className="mt-1.5 text-xs text-red-500 flex items-center"><AlertCircle className="w-3.5 h-3.5 mr-1" /> {errors.lastName}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="john.doe@example.com"
                          className={`w-full px-4 py-3 rounded-xl border ${
                            errors.email ? "border-red-500 focus:ring-red-500" : "border-slate-200 focus:ring-indigo-500"
                          } focus:outline-none focus:ring-2`}
                        />
                        {errors.email && <p className="mt-1.5 text-xs text-red-500 flex items-center"><AlertCircle className="w-3.5 h-3.5 mr-1" /> {errors.email}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="(555) 000-0000"
                          className={`w-full px-4 py-3 rounded-xl border ${
                            errors.phone ? "border-red-500 focus:ring-red-500" : "border-slate-200 focus:ring-indigo-500"
                          } focus:outline-none focus:ring-2`}
                        />
                        {errors.phone && <p className="mt-1.5 text-xs text-red-500 flex items-center"><AlertCircle className="w-3.5 h-3.5 mr-1" /> {errors.phone}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Date of Birth</label>
                        <input
                          type="date"
                          name="dob"
                          value={formData.dob}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 rounded-xl border ${
                            errors.dob ? "border-red-500 focus:ring-red-500" : "border-slate-200 focus:ring-indigo-500"
                          } focus:outline-none focus:ring-2`}
                        />
                        {errors.dob && <p className="mt-1.5 text-xs text-red-500 flex items-center"><AlertCircle className="w-3.5 h-3.5 mr-1" /> {errors.dob}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center">
                          Social Security Number (SSN)
                          <span className="ml-1.5 text-slate-400 cursor-pointer group relative">
                            <HelpCircle className="w-4 h-4" />
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 bg-slate-800 text-white text-xs p-2 rounded shadow-lg text-center font-normal">
                              Required for identity verification. Encrypted & secure.
                            </span>
                          </span>
                        </label>
                        <input
                          type="password"
                          name="ssn"
                          value={formData.ssn}
                          onChange={handleChange}
                          placeholder="Last 4 digits or full SSN"
                          className={`w-full px-4 py-3 rounded-xl border ${
                            errors.ssn ? "border-red-500 focus:ring-red-500" : "border-slate-200 focus:ring-indigo-500"
                          } focus:outline-none focus:ring-2`}
                        />
                        {errors.ssn && <p className="mt-1.5 text-xs text-red-500 flex items-center"><AlertCircle className="w-3.5 h-3.5 mr-1" /> {errors.ssn}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: DEMOGRAPHICS & HOUSING */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Demographics & Housing</h3>
                      <p className="text-sm text-slate-500">Provide your current residential address and housing details.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Street Address</label>
                        <input
                          type="text"
                          name="streetAddress"
                          value={formData.streetAddress}
                          onChange={handleChange}
                          placeholder="123 Main St"
                          className={`w-full px-4 py-3 rounded-xl border ${
                            errors.streetAddress ? "border-red-500 focus:ring-red-500" : "border-slate-200 focus:ring-indigo-500"
                          } focus:outline-none focus:ring-2`}
                        />
                        {errors.streetAddress && <p className="mt-1.5 text-xs text-red-500 flex items-center"><AlertCircle className="w-3.5 h-3.5 mr-1" /> {errors.streetAddress}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Unit / Apt (Optional)</label>
                        <input
                          type="text"
                          name="unit"
                          value={formData.unit}
                          onChange={handleChange}
                          placeholder="Apt 4B"
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-indigo-500 focus:outline-none focus:ring-2"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">City</label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          placeholder="New York"
                          className={`w-full px-4 py-3 rounded-xl border ${
                            errors.city ? "border-red-500 focus:ring-red-500" : "border-slate-200 focus:ring-indigo-500"
                          } focus:outline-none focus:ring-2`}
                        />
                        {errors.city && <p className="mt-1.5 text-xs text-red-500 flex items-center"><AlertCircle className="w-3.5 h-3.5 mr-1" /> {errors.city}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">State</label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          placeholder="NY"
                          className={`w-full px-4 py-3 rounded-xl border ${
                            errors.state ? "border-red-500 focus:ring-red-500" : "border-slate-200 focus:ring-indigo-500"
                          } focus:outline-none focus:ring-2`}
                        />
                        {errors.state && <p className="mt-1.5 text-xs text-red-500 flex items-center"><AlertCircle className="w-3.5 h-3.5 mr-1" /> {errors.state}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Zip Code</label>
                        <input
                          type="text"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleChange}
                          placeholder="10001"
                          className={`w-full px-4 py-3 rounded-xl border ${
                            errors.zipCode ? "border-red-500 focus:ring-red-500" : "border-slate-200 focus:ring-indigo-500"
                          } focus:outline-none focus:ring-2`}
                        />
                        {errors.zipCode && <p className="mt-1.5 text-xs text-red-500 flex items-center"><AlertCircle className="w-3.5 h-3.5 mr-1" /> {errors.zipCode}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Housing Status</label>
                        <select
                          name="housingStatus"
                          value={formData.housingStatus}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 rounded-xl border ${
                            errors.housingStatus ? "border-red-500 focus:ring-red-500" : "border-slate-200 focus:ring-indigo-500"
                          } focus:outline-none focus:ring-2 bg-white`}
                        >
                          <option value="">Select status</option>
                          <option value="Own">Own</option>
                          <option value="Rent">Rent</option>
                          <option value="Other">Other</option>
                        </select>
                        {errors.housingStatus && <p className="mt-1.5 text-xs text-red-500 flex items-center"><AlertCircle className="w-3.5 h-3.5 mr-1" /> {errors.housingStatus}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Monthly Housing Payment ($)</label>
                        <input
                          type="text"
                          name="monthlyHousingPayment"
                          value={formData.monthlyHousingPayment}
                          onChange={handleChange}
                          placeholder="1200"
                          className={`w-full px-4 py-3 rounded-xl border ${
                            errors.monthlyHousingPayment ? "border-red-500 focus:ring-red-500" : "border-slate-200 focus:ring-indigo-500"
                          } focus:outline-none focus:ring-2`}
                        />
                        {errors.monthlyHousingPayment && <p className="mt-1.5 text-xs text-red-500 flex items-center"><AlertCircle className="w-3.5 h-3.5 mr-1" /> {errors.monthlyHousingPayment}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: EMPLOYMENT */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Employment Details</h3>
                      <p className="text-sm text-slate-500">Tell us about your current professional status.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Employment Status</label>
                        <select
                          name="employmentStatus"
                          value={formData.employmentStatus}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 rounded-xl border ${
                            errors.employmentStatus ? "border-red-500 focus:ring-red-500" : "border-slate-200 focus:ring-indigo-500"
                          } focus:outline-none focus:ring-2 bg-white`}
                        >
                          <option value="">Select status</option>
                          <option value="Employed">Employed</option>
                          <option value="Self-Employed">Self-Employed</option>
                          <option value="Unemployed">Unemployed</option>
                          <option value="Retired">Retired</option>
                          <option value="Student">Student</option>
                        </select>
                        {errors.employmentStatus && <p className="mt-1.5 text-xs text-red-500 flex items-center"><AlertCircle className="w-3.5 h-3.5 mr-1" /> {errors.employmentStatus}</p>}
                      </div>

                      {(formData.employmentStatus === "Employed" || formData.employmentStatus === "Self-Employed") && (
                        <>
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Employer Name</label>
                            <input
                              type="text"
                              name="employerName"
                              value={formData.employerName}
                              onChange={handleChange}
                              placeholder="Acme Corp"
                              className={`w-full px-4 py-3 rounded-xl border ${
                                errors.employerName ? "border-red-500 focus:ring-red-500" : "border-slate-200 focus:ring-indigo-500"
                              } focus:outline-none focus:ring-2`}
                            />
                            {errors.employerName && <p className="mt-1.5 text-xs text-red-500 flex items-center"><AlertCircle className="w-3.5 h-3.5 mr-1" /> {errors.employerName}</p>}
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Job Title</label>
                            <input
                              type="text"
                              name="jobTitle"
                              value={formData.jobTitle}
                              onChange={handleChange}
                              placeholder="Software Engineer"
                              className={`w-full px-4 py-3 rounded-xl border ${
                                errors.jobTitle ? "border-red-500 focus:ring-red-500" : "border-slate-200 focus:ring-indigo-500"
                              } focus:outline-none focus:ring-2`}
                            />
                            {errors.jobTitle && <p className="mt-1.5 text-xs text-red-500 flex items-center"><AlertCircle className="w-3.5 h-3.5 mr-1" /> {errors.jobTitle}</p>}
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Years at Employer</label>
                            <input
                              type="number"
                              name="yearsAtEmployer"
                              value={formData.yearsAtEmployer}
                              onChange={handleChange}
                              placeholder="3"
                              min="0"
                              className={`w-full px-4 py-3 rounded-xl border ${
                                errors.yearsAtEmployer ? "border-red-500 focus:ring-red-500" : "border-slate-200 focus:ring-indigo-500"
                              } focus:outline-none focus:ring-2`}
                            />
                            {errors.yearsAtEmployer && <p className="mt-1.5 text-xs text-red-500 flex items-center"><AlertCircle className="w-3.5 h-3.5 mr-1" /> {errors.yearsAtEmployer}</p>}
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Work Phone (Optional)</label>
                            <input
                              type="tel"
                              name="workPhone"
                              value={formData.workPhone}
                              onChange={handleChange}
                              placeholder="(555) 000-0000"
                              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-indigo-500 focus:outline-none focus:ring-2"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* STEP 4: FINANCIAL INFO */}
                {currentStep === 4 && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Financial Information</h3>
                      <p className="text-sm text-slate-500">Provide details about your income and requested credit limit.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Annual Gross Income ($)</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                          <input
                            type="text"
                            name="annualIncome"
                            value={formData.annualIncome}
                            onChange={handleChange}
                            placeholder="85000"
                            className={`w-full pl-8 pr-4 py-3 rounded-xl border ${
                              errors.annualIncome ? "border-red-500 focus:ring-red-500" : "border-slate-200 focus:ring-indigo-500"
                            } focus:outline-none focus:ring-2`}
                          />
                        </div>
                        {errors.annualIncome && <p className="mt-1.5 text-xs text-red-500 flex items-center"><AlertCircle className="w-3.5 h-3.5 mr-1" /> {errors.annualIncome}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Other Annual Income (Optional) ($)</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                          <input
                            type="text"
                            name="otherIncome"
                            value={formData.otherIncome}
                            onChange={handleChange}
                            placeholder="5000"
                            className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-indigo-500 focus:outline-none focus:ring-2"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Primary Bank Name</label>
                        <input
                          type="text"
                          name="primaryBank"
                          value={formData.primaryBank}
                          onChange={handleChange}
                          placeholder="Chase, Bank of America, etc."
                          className={`w-full px-4 py-3 rounded-xl border ${
                            errors.primaryBank ? "border-red-500 focus:ring-red-500" : "border-slate-200 focus:ring-indigo-500"
                          } focus:outline-none focus:ring-2`}
                        />
                        {errors.primaryBank && <p className="mt-1.5 text-xs text-red-500 flex items-center"><AlertCircle className="w-3.5 h-3.5 mr-1" /> {errors.primaryBank}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Purpose of Credit</label>
                        <select
                          name="purposeOfCredit"
                          value={formData.purposeOfCredit}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 rounded-xl border ${
                            errors.purposeOfCredit ? "border-red-500 focus:ring-red-500" : "border-slate-200 focus:ring-indigo-500"
                          } focus:outline-none focus:ring-2 bg-white`}
                        >
                          <option value="">Select purpose</option>
                          <option value="Debt Consolidation">Debt Consolidation</option>
                          <option value="Home Improvement">Home Improvement</option>
                          <option value="Emergency Expenses">Emergency Expenses</option>
                          <option value="Major Purchase">Major Purchase</option>
                          <option value="Other">Other</option>
                        </select>
                        {errors.purposeOfCredit && <p className="mt-1.5 text-xs text-red-500 flex items-center"><AlertCircle className="w-3.5 h-3.5 mr-1" /> {errors.purposeOfCredit}</p>}
                      </div>
                    </div>

                    {/* Interactive Slider for Requested Limit */}
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                      <div className="flex justify-between items-center mb-4">
                        <label className="text-sm font-bold text-slate-800">Requested Credit Limit</label>
                        <span className="text-2xl font-extrabold text-indigo-600">
                          ${formData.requestedLimit.toLocaleString()}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1000"
                        max="50000"
                        step="500"
                        value={formData.requestedLimit}
                        onChange={(e) => handleSliderChange(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                      <div className="flex justify-between text-xs text-slate-400 mt-2 font-semibold">
                        <span>$1,000</span>
                        <span>$25,000</span>
                        <span>$50,000</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 5: REVIEW & SUBMIT */}
                {currentStep === 5 && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Review & Submit</h3>
                      <p className="text-sm text-slate-500">Double-check your details before submitting your application.</p>
                    </div>

                    {/* Summary Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Personal & Demographics Summary */}
                      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-3">
                        <h4 className="font-bold text-slate-800 border-b border-slate-200 pb-2 flex items-center">
                          <User className="w-4 h-4 mr-2 text-indigo-600" /> Personal & Contact
                        </h4>
                        <p className="text-sm text-slate-600"><span className="font-medium text-slate-500">Name:</span> {formData.firstName} {formData.lastName}</p>
                        <p className="text-sm text-slate-600"><span className="font-medium text-slate-500">Email:</span> {formData.email}</p>
                        <p className="text-sm text-slate-600"><span className="font-medium text-slate-500">Phone:</span> {formData.phone}</p>
                        <p className="text-sm text-slate-600"><span className="font-medium text-slate-500">Address:</span> {formData.streetAddress}, {formData.unit && `${formData.unit}, `}{formData.city}, {formData.state} {formData.zipCode}</p>
                      </div>

                      {/* Employment & Financial Summary */}
                      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-3">
                        <h4 className="font-bold text-slate-800 border-b border-slate-200 pb-2 flex items-center">
                          <DollarSign className="w-4 h-4 mr-2 text-indigo-600" /> Employment & Financials
                        </h4>
                        <p className="text-sm text-slate-600"><span className="font-medium text-slate-500">Status:</span> {formData.employmentStatus}</p>
                        {formData.employerName && (
                          <p className="text-sm text-slate-600"><span className="font-medium text-slate-500">Employer:</span> {formData.employerName} ({formData.jobTitle})</p>
                        )}
                        <p className="text-sm text-slate-600"><span className="font-medium text-slate-500">Annual Income:</span> ${Number(formData.annualIncome).toLocaleString()}</p>
                        <p className="text-sm text-slate-600"><span className="font-medium text-slate-500">Requested Limit:</span> ${formData.requestedLimit.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Consents & Agreements */}
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="agreeToTerms"
                            name="agreeToTerms"
                            type="checkbox"
                            checked={formData.agreeToTerms}
                            onChange={handleChange}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="agreeToTerms" className="font-medium text-slate-700">
                            I agree to the Terms of Service and Privacy Policy.
                          </label>
                          <p className="text-slate-500 text-xs">By checking this, you agree to our digital communication consent policy.</p>
                          {errors.agreeToTerms && <p className="mt-1 text-xs text-red-500 flex items-center"><AlertCircle className="w-3.5 h-3.5 mr-1" /> {errors.agreeToTerms}</p>}
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="agreeToCreditPull"
                            name="agreeToCreditPull"
                            type="checkbox"
                            checked={formData.agreeToCreditPull}
                            onChange={handleChange}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="agreeToCreditPull" className="font-medium text-slate-700">
                            I authorize a credit history check.
                          </label>
                          <p className="text-slate-500 text-xs">We will perform a soft credit pull which does not affect your credit score.</p>
                          {errors.agreeToCreditPull && <p className="mt-1 text-xs text-red-500 flex items-center"><AlertCircle className="w-3.5 h-3.5 mr-1" /> {errors.agreeToCreditPull}</p>}
                        </div>
                      </div>
                    </div>

                    {/* Security Badge */}
                    <div className="flex items-center justify-center space-x-2 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/50">
                      <ShieldCheck className="w-5 h-5 text-indigo-600" />
                      <span className="text-xs font-semibold text-indigo-800">
                        Your data is protected with 256-bit bank-grade encryption.
                      </span>
                    </div>
                  </div>
                )}

              </div>

              {/* Action Buttons Footer */}
              <div className="px-6 py-5 bg-slate-50 flex justify-between items-center rounded-b-2xl">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={currentStep === 1 || isSubmitting}
                  className={`flex items-center px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                    currentStep === 1
                      ? "text-slate-300 cursor-not-allowed"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                  }`}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </button>

                {currentStep < steps.length ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-100 transition-all duration-200"
                  >
                    Continue <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-100 transition-all duration-200 disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...
                      </>
                    ) : (
                      "Submit Application"
                    )}
                  </button>
                )}
              </div>

            </form>
          )}

        </div>
      </div>
    </div>
  );
}