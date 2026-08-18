import React, { useState, useMemo } from "react";
import {
  User,
  Calendar,
  Globe,
  FileText,
  Languages,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Loader2
} from "lucide-react";

// --- Reference Data ---
const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "non-binary", label: "Non-binary" },
  { value: "prefer-not-to-say", label: "Prefer not to say" }
];

const RESIDENCY_STATUS_OPTIONS = [
  { value: "citizen", label: "Citizen" },
  { value: "permanent-resident", label: "Permanent Resident" },
  { value: "temporary-resident", label: "Temporary Resident" },
  { value: "work-visa", label: "Work Visa" },
  { value: "student-visa", label: "Student Visa" },
  { value: "other", label: "Other" }
];

const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "JP", name: "Japan" },
  { code: "SG", name: "Singapore" },
  { code: "CH", name: "Switzerland" },
  { code: "NZ", name: "New Zealand" },
  { code: "IE", name: "Ireland" },
  { code: "NL", name: "Netherlands" },
  { code: "IN", name: "India" },
  { code: "BR", name: "Brazil" },
  { code: "ZA", name: "South Africa" }
].sort((a, b) => a.name.localeCompare(b.name));

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "zh", name: "Mandarin Chinese" },
  { code: "ja", name: "Japanese" },
  { code: "pt", name: "Portuguese" },
  { code: "ar", name: "Arabic" },
  { code: "hi", name: "Hindi" },
  { code: "it", name: "Italian" }
].sort((a, b) => a.name.localeCompare(b.name));

// --- Types ---
export interface DemographicsFormData {
  gender: string;
  dateOfBirth: string;
  nationality: string;
  residencyStatus: string;
  taxDomicile: string;
  preferredLanguage: string;
  hasDualNationality: boolean;
  secondaryNationality?: string;
}

interface OnboardingApplicantDemographicsFormProps {
  initialData?: Partial<DemographicsFormData>;
  onSubmit: (data: DemographicsFormData) => void | Promise<void>;
  onBack?: () => void;
  isLoading?: boolean;
}

export default function OnboardingApplicantDemographicsForm({
  initialData,
  onSubmit,
  onBack,
  isLoading = false
}: OnboardingApplicantDemographicsFormProps) {
  // --- Form State ---
  const [formData, setFormData] = useState<DemographicsFormData>({
    gender: initialData?.gender || "",
    dateOfBirth: initialData?.dateOfBirth || "",
    nationality: initialData?.nationality || "",
    residencyStatus: initialData?.residencyStatus || "",
    taxDomicile: initialData?.taxDomicile || "",
    preferredLanguage: initialData?.preferredLanguage || "en",
    hasDualNationality: initialData?.hasDualNationality || false,
    secondaryNationality: initialData?.secondaryNationality || ""
  });

  const [errors, setErrors] = useState<Partial<Record<keyof DemographicsFormData, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof DemographicsFormData, boolean>>>({});
  const [showTaxTooltip, setShowTaxTooltip] = useState(false);

  // --- Validation Logic ---
  const validateField = (name: keyof DemographicsFormData, value: any): string => {
    switch (name) {
      case "gender":
        if (!value) return "Gender selection is required.";
        break;
      case "dateOfBirth":
        if (!value) return "Date of birth is required.";
        const dob = new Date(value);
        if (isNaN(dob.getTime())) return "Invalid date format.";
        const ageLimitDate = new Date();
        ageLimitDate.setFullYear(ageLimitDate.getFullYear() - 18);
        if (dob > ageLimitDate) {
          return "You must be at least 18 years old to apply.";
        }
        const maxAgeLimit = new Date();
        maxAgeLimit.setFullYear(maxAgeLimit.getFullYear() - 120);
        if (dob < maxAgeLimit) {
          return "Please enter a valid date of birth.";
        }
        break;
      case "nationality":
        if (!value) return "Nationality is required.";
        break;
      case "residencyStatus":
        if (!value) return "Residency status is required.";
        break;
      case "taxDomicile":
        if (!value) return "Tax domicile is required.";
        break;
      case "preferredLanguage":
        if (!value) return "Preferred language is required.";
        break;
      case "secondaryNationality":
        if (formData.hasDualNationality && !value) {
          return "Please select your secondary nationality.";
        }
        if (formData.hasDualNationality && value === formData.nationality) {
          return "Secondary nationality must be different from primary nationality.";
        }
        break;
      default:
        break;
    }
    return "";
  };

  const handleBlur = (field: keyof DemographicsFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field]);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleChange = (field: keyof DemographicsFormData, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      // Reset secondary nationality if dual nationality is toggled off
      if (field === "hasDualNationality" && !value) {
        updated.secondaryNationality = "";
      }
      return updated;
    });

    if (touched[field] || errors[field]) {
      const error = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const newErrors: Partial<Record<keyof DemographicsFormData, string>> = {};
    const fieldsToValidate: (keyof DemographicsFormData)[] = [
      "gender",
      "dateOfBirth",
      "nationality",
      "residencyStatus",
      "taxDomicile",
      "preferredLanguage"
    ];

    if (formData.hasDualNationality) {
      fieldsToValidate.push("secondaryNationality");
    }

    fieldsToValidate.forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);
    // Mark all as touched
    const allTouched = fieldsToValidate.reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {} as Record<keyof DemographicsFormData, boolean>);
    setTouched(allTouched);

    if (Object.keys(newErrors).length === 0) {
      await onSubmit(formData);
    } else {
      // Scroll to first error
      const firstErrorField = Object.keys(newErrors)[0];
      const element = document.getElementsByName(firstErrorField)[0];
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  // Calculate completion percentage
  const completionPercentage = useMemo(() => {
    const coreFields: (keyof DemographicsFormData)[] = [
      "gender",
      "dateOfBirth",
      "nationality",
      "residencyStatus",
      "taxDomicile",
      "preferredLanguage"
    ];
    if (formData.hasDualNationality) {
      coreFields.push("secondaryNationality");
    }
    const filledFields = coreFields.filter((field) => !!formData[field]);
    return Math.round((filledFields.length / coreFields.length) * 100);
  }, [formData]);

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-100/40 overflow-hidden">
      {/* Header & Progress */}
      <div className="relative bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-10 text-white">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-black/5 rounded-full blur-xl -ml-10 -mb-10 pointer-events-none" />
        
        <div className="relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/15 text-white backdrop-blur-sm mb-3">
            <User className="w-3.5 h-3.5" /> Personal Profile
          </span>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Demographic Details</h2>
          <p className="mt-2 text-indigo-100 text-sm md:text-base max-w-xl">
            Please provide your demographic and residency details. This information is required for regulatory compliance and identity verification.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/10">
          <div
            className="h-full bg-emerald-400 transition-all duration-500 ease-out"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
        {/* Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Date of Birth */}
          <div className="space-y-2">
            <label htmlFor="dateOfBirth" className="block text-sm font-semibold text-slate-700">
              Date of Birth <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Calendar className="w-5 h-5" />
              </div>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                onBlur={() => handleBlur("dateOfBirth")}
                className={`block w-full pl-11 pr-4 py-3 rounded-xl border text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                  errors.dateOfBirth && touched.dateOfBirth
                    ? "border-rose-300 focus:ring-rose-100 focus:border-rose-500 bg-rose-50/30"
                    : "border-slate-200 focus:ring-indigo-100 focus:border-indigo-500 bg-slate-50/30 hover:bg-slate-50/50"
                }`}
              />
            </div>
            {errors.dateOfBirth && touched.dateOfBirth ? (
              <p className="flex items-center gap-1.5 text-xs font-medium text-rose-600 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.dateOfBirth}
              </p>
            ) : (
              <p className="text-xs text-slate-400">Must be at least 18 years of age.</p>
            )}
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <label htmlFor="gender" className="block text-sm font-semibold text-slate-700">
              Gender Identity <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-5 h-5" />
              </div>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={(e) => handleChange("gender", e.target.value)}
                onBlur={() => handleBlur("gender")}
                className={`block w-full pl-11 pr-10 py-3 rounded-xl border text-slate-900 bg-white focus:outline-none focus:ring-2 transition-all duration-200 appearance-none ${
                  errors.gender && touched.gender
                    ? "border-rose-300 focus:ring-rose-100 focus:border-rose-500 bg-rose-50/30"
                    : "border-slate-200 focus:ring-indigo-100 focus:border-indigo-500 bg-slate-50/30 hover:bg-slate-50/50"
                }`}
              >
                <option value="" disabled>Select gender</option>
                {GENDER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {errors.gender && touched.gender && (
              <p className="flex items-center gap-1.5 text-xs font-medium text-rose-600 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.gender}
              </p>
            )}
          </div>

          {/* Nationality */}
          <div className="space-y-2">
            <label htmlFor="nationality" className="block text-sm font-semibold text-slate-700">
              Primary Nationality <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Globe className="w-5 h-5" />
              </div>
              <select
                id="nationality"
                name="nationality"
                value={formData.nationality}
                onChange={(e) => handleChange("nationality", e.target.value)}
                onBlur={() => handleBlur("nationality")}
                className={`block w-full pl-11 pr-10 py-3 rounded-xl border text-slate-900 bg-white focus:outline-none focus:ring-2 transition-all duration-200 appearance-none ${
                  errors.nationality && touched.nationality
                    ? "border-rose-300 focus:ring-rose-100 focus:border-rose-500 bg-rose-50/30"
                    : "border-slate-200 focus:ring-indigo-100 focus:border-indigo-500 bg-slate-50/30 hover:bg-slate-50/50"
                }`}
              >
                <option value="" disabled>Select country</option>
                {COUNTRIES.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {errors.nationality && touched.nationality && (
              <p className="flex items-center gap-1.5 text-xs font-medium text-rose-600 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.nationality}
              </p>
            )}
          </div>

          {/* Residency Status */}
          <div className="space-y-2">
            <label htmlFor="residencyStatus" className="block text-sm font-semibold text-slate-700">
              Residency Status <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <FileText className="w-5 h-5" />
              </div>
              <select
                id="residencyStatus"
                name="residencyStatus"
                value={formData.residencyStatus}
                onChange={(e) => handleChange("residencyStatus", e.target.value)}
                onBlur={() => handleBlur("residencyStatus")}
                className={`block w-full pl-11 pr-10 py-3 rounded-xl border text-slate-900 bg-white focus:outline-none focus:ring-2 transition-all duration-200 appearance-none ${
                  errors.residencyStatus && touched.residencyStatus
                    ? "border-rose-300 focus:ring-rose-100 focus:border-rose-500 bg-rose-50/30"
                    : "border-slate-200 focus:ring-indigo-100 focus:border-indigo-500 bg-slate-50/30 hover:bg-slate-50/50"
                }`}
              >
                <option value="" disabled>Select status</option>
                {RESIDENCY_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {errors.residencyStatus && touched.residencyStatus && (
              <p className="flex items-center gap-1.5 text-xs font-medium text-rose-600 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.residencyStatus}
              </p>
            )}
          </div>

          {/* Tax Domicile */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="taxDomicile" className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                Tax Domicile <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <button
                  type="button"
                  onMouseEnter={() => setShowTaxTooltip(true)}
                  onMouseLeave={() => setShowTaxTooltip(false)}
                  onClick={() => setShowTaxTooltip(!showTaxTooltip)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label="Tax domicile information"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
                {showTaxTooltip && (
                  <div className="absolute right-0 bottom-full mb-2 w-64 p-3 bg-slate-900 text-white text-xs rounded-lg shadow-xl z-20 leading-relaxed">
                    Your tax domicile is the country where you are legally registered for tax purposes and pay income tax.
                  </div>
                )}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Globe className="w-5 h-5" />
              </div>
              <select
                id="taxDomicile"
                name="taxDomicile"
                value={formData.taxDomicile}
                onChange={(e) => handleChange("taxDomicile", e.target.value)}
                onBlur={() => handleBlur("taxDomicile")}
                className={`block w-full pl-11 pr-10 py-3 rounded-xl border text-slate-900 bg-white focus:outline-none focus:ring-2 transition-all duration-200 appearance-none ${
                  errors.taxDomicile && touched.taxDomicile
                    ? "border-rose-300 focus:ring-rose-100 focus:border-rose-500 bg-rose-50/30"
                    : "border-slate-200 focus:ring-indigo-100 focus:border-indigo-500 bg-slate-50/30 hover:bg-slate-50/50"
                }`}
              >
                <option value="" disabled>Select tax country</option>
                {COUNTRIES.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {errors.taxDomicile && touched.taxDomicile && (
              <p className="flex items-center gap-1.5 text-xs font-medium text-rose-600 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.taxDomicile}
              </p>
            )}
          </div>

          {/* Preferred Language */}
          <div className="space-y-2">
            <label htmlFor="preferredLanguage" className="block text-sm font-semibold text-slate-700">
              Preferred Language <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Languages className="w-5 h-5" />
              </div>
              <select
                id="preferredLanguage"
                name="preferredLanguage"
                value={formData.preferredLanguage}
                onChange={(e) => handleChange("preferredLanguage", e.target.value)}
                onBlur={() => handleBlur("preferredLanguage")}
                className={`block w-full pl-11 pr-10 py-3 rounded-xl border text-slate-900 bg-white focus:outline-none focus:ring-2 transition-all duration-200 appearance-none ${
                  errors.preferredLanguage && touched.preferredLanguage
                    ? "border-rose-300 focus:ring-rose-100 focus:border-rose-500 bg-rose-50/30"
                    : "border-slate-200 focus:ring-indigo-100 focus:border-indigo-500 bg-slate-50/30 hover:bg-slate-50/50"
                }`}
              >
                <option value="" disabled>Select language</option>
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {errors.preferredLanguage && touched.preferredLanguage && (
              <p className="flex items-center gap-1.5 text-xs font-medium text-rose-600 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.preferredLanguage}
              </p>
            )}
          </div>
        </div>

        {/* Dual Nationality Toggle */}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex items-start gap-3">
            <div className="flex items-center h-5 mt-0.5">
              <input
                id="hasDualNationality"
                name="hasDualNationality"
                type="checkbox"
                checked={formData.hasDualNationality}
                onChange={(e) => handleChange("hasDualNationality", e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 focus:ring-offset-0 transition-colors cursor-pointer"
              />
            </div>
            <div className="text-sm">
              <label htmlFor="hasDualNationality" className="font-semibold text-slate-700 cursor-pointer select-none">
                I hold dual citizenship / secondary nationality
              </label>
              <p className="text-slate-400 text-xs mt-0.5">Check this box if you hold passports for more than one country.</p>
            </div>
          </div>

          {/* Secondary Nationality Field (Conditional) */}
          {formData.hasDualNationality && (
            <div className="mt-4 max-w-md animate-fadeIn">
              <div className="space-y-2">
                <label htmlFor="secondaryNationality" className="block text-sm font-semibold text-slate-700">
                  Secondary Nationality <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Globe className="w-5 h-5" />
                  </div>
                  <select
                    id="secondaryNationality"
                    name="secondaryNationality"
                    value={formData.secondaryNationality}
                    onChange={(e) => handleChange("secondaryNationality", e.target.value)}
                    onBlur={() => handleBlur("secondaryNationality")}
                    className={`block w-full pl-11 pr-10 py-3 rounded-xl border text-slate-900 bg-white focus:outline-none focus:ring-2 transition-all duration-200 appearance-none ${
                      errors.secondaryNationality && touched.secondaryNationality
                        ? "border-rose-300 focus:ring-rose-100 focus:border-rose-500 bg-rose-50/30"
                        : "border-slate-200 focus:ring-indigo-100 focus:border-indigo-500 bg-slate-50/30 hover:bg-slate-50/50"
                    }`}
                  >
                    <option value="" disabled>Select secondary country</option>
                    {COUNTRIES.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {errors.secondaryNationality && touched.secondaryNationality && (
                  <p className="flex items-center gap-1.5 text-xs font-medium text-rose-600 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {errors.secondaryNationality}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 active:bg-slate-100 transition-colors disabled:opacity-50 disabled:pointer-events-none"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          ) : (
            <div />
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 active:bg-indigo-800 shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                Continue <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}