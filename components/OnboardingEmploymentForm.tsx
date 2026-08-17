import React, { useState, useEffect, useRef } from 'react';
import { 
  Briefcase, 
  Building, 
  Hash, 
  Award, 
  Calendar, 
  Info, 
  ChevronDown, 
  Search, 
  Check, 
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  HelpCircle
} from 'lucide-react';

// Interfaces
export interface EmploymentDetails {
  employerName: string;
  registrationNumber: string;
  jobTitle: string;
  occupationCode: string;
  industryCode: string;
  experienceYears: number;
  experienceMonths: number;
}

interface OnboardingEmploymentFormProps {
  initialData?: Partial<EmploymentDetails>;
  onSubmit: (data: EmploymentDetails) => void;
  onBack?: () => void;
}

// Mock Data for Occupation Codes (SOC)
const OCCUPATION_CODES = [
  { code: '15-1252', name: 'Software Developers', category: 'Technology' },
  { code: '15-1253', name: 'Software Quality Assurance Analysts and Testers', category: 'Technology' },
  { code: '11-3021', name: 'Computer and Information Systems Managers', category: 'Management' },
  { code: '13-2011', name: 'Accountants and Auditors', category: 'Finance' },
  { code: '13-1111', name: 'Management Analysts', category: 'Business Operations' },
  { code: '15-1211', name: 'Computer Systems Analysts', category: 'Technology' },
  { code: '11-1021', name: 'General and Operations Managers', category: 'Management' },
  { code: '15-1200', name: 'Data Scientists & Mathematical Science Occupations', category: 'Technology' },
  { code: '23-1011', name: 'Lawyers', category: 'Legal' },
  { code: '41-3091', name: 'Sales Representatives, Services, All Other', category: 'Sales' },
];

// Mock Data for Industry Codes (NAICS)
const INDUSTRY_CODES = [
  { code: '541511', name: 'Custom Computer Programming Services', sector: 'Professional & Tech Services' },
  { code: '541512', name: 'Computer Systems Design Services', sector: 'Professional & Tech Services' },
  { code: '511210', name: 'Software Publishers', sector: 'Information' },
  { code: '522110', name: 'Commercial Banking', sector: 'Finance & Insurance' },
  { code: '541611', name: 'Administrative Management Consulting Services', sector: 'Professional & Tech Services' },
  { code: '621111', name: 'Offices of Physicians (except Mental Health Specialists)', sector: 'Healthcare' },
  { code: '541810', name: 'Advertising Agencies', sector: 'Marketing & Advertising' },
  { code: '611310', name: 'Colleges, Universities, and Professional Schools', sector: 'Education' },
];

export default function OnboardingEmploymentForm({
  initialData,
  onSubmit,
  onBack
}: OnboardingEmploymentFormProps) {
  // Form State
  const [employerName, setEmployerName] = useState(initialData?.employerName || '');
  const [registrationNumber, setRegistrationNumber] = useState(initialData?.registrationNumber || '');
  const [jobTitle, setJobTitle] = useState(initialData?.jobTitle || '');
  const [occupationCode, setOccupationCode] = useState(initialData?.occupationCode || '');
  const [industryCode, setIndustryCode] = useState(initialData?.industryCode || '');
  const [experienceYears, setExperienceYears] = useState<number>(initialData?.experienceYears ?? 0);
  const [experienceMonths, setExperienceMonths] = useState<number>(initialData?.experienceMonths ?? 0);

  // UI States
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Searchable Dropdown States
  const [occupationSearch, setOccupationSearch] = useState('');
  const [isOccupationOpen, setIsOccupationOpen] = useState(false);
  const [industrySearch, setIndustrySearch] = useState('');
  const [isIndustryOpen, setIsIndustryOpen] = useState(false);

  // Refs for closing dropdowns on click outside
  const occupationRef = useRef<HTMLDivElement>(null);
  const industryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (occupationRef.current && !occupationRef.current.contains(event.target as Node)) {
        setIsOccupationOpen(false);
      }
      if (industryRef.current && !industryRef.current.contains(event.target as Node)) {
        setIsIndustryOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered Lists
  const filteredOccupations = OCCUPATION_CODES.filter(
    item =>
      item.name.toLowerCase().includes(occupationSearch.toLowerCase()) ||
      item.code.includes(occupationSearch) ||
      item.category.toLowerCase().includes(occupationSearch.toLowerCase())
  );

  const filteredIndustries = INDUSTRY_CODES.filter(
    item =>
      item.name.toLowerCase().includes(industrySearch.toLowerCase()) ||
      item.code.includes(industrySearch) ||
      item.sector.toLowerCase().includes(industrySearch.toLowerCase())
  );

  // Selected item display names
  const selectedOccupationName = OCCUPATION_CODES.find(o => o.code === occupationCode)?.name || '';
  const selectedIndustryName = INDUSTRY_CODES.find(i => i.code === industryCode)?.name || '';

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!employerName.trim()) {
      newErrors.employerName = 'Employer name is required';
    } else if (employerName.trim().length < 2) {
      newErrors.employerName = 'Employer name must be at least 2 characters';
    }

    if (!registrationNumber.trim()) {
      newErrors.registrationNumber = 'Company registration number is required';
    } else if (!/^[A-Z0-9-]{5,20}$/i.test(registrationNumber.trim())) {
      newErrors.registrationNumber = 'Enter a valid registration number (5-20 alphanumeric characters)';
    }

    if (!jobTitle.trim()) {
      newErrors.jobTitle = 'Job title is required';
    }

    if (!occupationCode) {
      newErrors.occupationCode = 'Please select an occupation code';
    }

    if (!industryCode) {
      newErrors.industryCode = 'Please select an industry code';
    }

    if (experienceYears < 0 || experienceYears > 50) {
      newErrors.experience = 'Please enter a valid number of years (0-50)';
    }

    if (experienceMonths < 0 || experienceMonths > 11) {
      newErrors.experience = 'Months must be between 0 and 11';
    }

    if (experienceYears === 0 && experienceMonths === 0) {
      newErrors.experience = 'Total work experience must be greater than 0 months';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    // Simulate API delay for premium feel
    setTimeout(() => {
      setIsSubmitting(false);
      onSubmit({
        employerName: employerName.trim(),
        registrationNumber: registrationNumber.trim().toUpperCase(),
        jobTitle: jobTitle.trim(),
        occupationCode,
        industryCode,
        experienceYears,
        experienceMonths,
      });
    }, 800);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden transition-all duration-300">
      {/* Header Section */}
      <div className="relative px-8 pt-8 pb-6 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-md shadow-indigo-500/20">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold tracking-wider text-indigo-600 dark:text-indigo-400 uppercase">Step 3 of 4</span>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Employment Details</h2>
          </div>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
          Please provide your current or most recent professional employment details to complete your profile verification.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        {/* Row 1: Employer Name & Registration Number */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Employer Name */}
          <div className="space-y-2">
            <label className="flex items-center justify-between text-sm font-semibold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-2">
                <Building className="w-4 h-4 text-slate-400" />
                Employer Name
              </span>
              <span className="text-xs text-red-500 font-normal">* Required</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={employerName}
                onChange={(e) => {
                  setEmployerName(e.target.value);
                  if (errors.employerName) setErrors({ ...errors, employerName: '' });
                }}
                placeholder="e.g. Acme Corporation"
                className={`w-full px-4 py-3 rounded-xl border bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 transition-all duration-200 ${
                  errors.employerName 
                    ? 'border-red-500 focus:ring-red-500/20' 
                    : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500/20 focus:border-indigo-500'
                }`}
              />
              {errors.employerName && (
                <div className="absolute right-3 top-3.5 text-red-500">
                  <AlertCircle className="w-5 h-5" />
                </div>
              )}
            </div>
            {errors.employerName && (
              <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.employerName}
              </p>
            )}
          </div>

          {/* Registration Number */}
          <div className="space-y-2">
            <label className="flex items-center justify-between text-sm font-semibold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-slate-400" />
                Employer Registration No.
              </span>
              <button
                type="button"
                onClick={() => setActiveTooltip(activeTooltip === 'reg' ? null : 'reg')}
                className="text-slate-400 hover:text-indigo-500 transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </label>
            
            {activeTooltip === 'reg' && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-600 dark:text-slate-300 animate-fadeIn">
                Enter your company's official registration number (e.g., EIN, CRN, or local business registry ID). Format: 5-20 alphanumeric characters.
              </div>
            )}

            <div className="relative">
              <input
                type="text"
                value={registrationNumber}
                onChange={(e) => {
                  setRegistrationNumber(e.target.value);
                  if (errors.registrationNumber) setErrors({ ...errors, registrationNumber: '' });
                }}
                placeholder="e.g. 12-3456789"
                className={`w-full px-4 py-3 rounded-xl border bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 transition-all duration-200 ${
                  errors.registrationNumber 
                    ? 'border-red-500 focus:ring-red-500/20' 
                    : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500/20 focus:border-indigo-500'
                }`}
              />
              {errors.registrationNumber && (
                <div className="absolute right-3 top-3.5 text-red-500">
                  <AlertCircle className="w-5 h-5" />
                </div>
              )}
            </div>
            {errors.registrationNumber && (
              <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.registrationNumber}
              </p>
            )}
          </div>
        </div>

        {/* Row 2: Job Title */}
        <div className="space-y-2">
          <label className="flex items-center justify-between text-sm font-semibold text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-2">
              <Award className="w-4 h-4 text-slate-400" />
              Job Title
            </span>
            <span className="text-xs text-red-500 font-normal">* Required</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => {
                setJobTitle(e.target.value);
                if (errors.jobTitle) setErrors({ ...errors, jobTitle: '' });
              }}
              placeholder="e.g. Senior Full Stack Engineer"
              className={`w-full px-4 py-3 rounded-xl border bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 transition-all duration-200 ${
                errors.jobTitle 
                  ? 'border-red-500 focus:ring-red-500/20' 
                  : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500/20 focus:border-indigo-500'
              }`}
            />
            {errors.jobTitle && (
              <div className="absolute right-3 top-3.5 text-red-500">
                <AlertCircle className="w-5 h-5" />
              </div>
            )}
          </div>
          {errors.jobTitle && (
            <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5" /> {errors.jobTitle}
            </p>
          )}
        </div>

        {/* Row 3: Occupation Code (Searchable Dropdown) */}
        <div className="space-y-2" ref={occupationRef}>
          <label className="flex items-center justify-between text-sm font-semibold text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400" />
              Standard Occupation Code (SOC)
            </span>
            <span className="text-xs text-red-500 font-normal">* Required</span>
          </label>
          
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsOccupationOpen(!isOccupationOpen)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border bg-slate-50/50 dark:bg-slate-800/50 text-left transition-all duration-200 ${
                errors.occupationCode 
                  ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' 
                  : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500'
              }`}
            >
              <span className={occupationCode ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500'}>
                {occupationCode ? `${occupationCode} - ${selectedOccupationName}` : 'Select occupation code...'}
              </span>
              <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isOccupationOpen ? 'transform rotate-180' : ''}`} />
            </button>

            {isOccupationOpen && (
              <div className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden animate-fadeIn">
                <div className="p-2 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search by code, title, or category..."
                      value={occupationSearch}
                      onChange={(e) => setOccupationSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>
                <ul className="max-h-60 overflow-y-auto py-1">
                  {filteredOccupations.length > 0 ? (
                    filteredOccupations.map((item) => (
                      <li key={item.code}>
                        <button
                          type="button"
                          onClick={() => {
                            setOccupationCode(item.code);
                            setIsOccupationOpen(false);
                            setOccupationSearch('');
                            if (errors.occupationCode) setErrors({ ...errors, occupationCode: '' });
                          }}
                          className="w-full px-4 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center justify-between transition-colors"
                        >
                          <div>
                            <div className="text-sm font-medium text-slate-800 dark:text-slate-100">
                              {item.code} - {item.name}
                            </div>
                            <div className="text-xs text-slate-400 dark:text-slate-500">{item.category}</div>
                          </div>
                          {occupationCode === item.code && (
                            <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          )}
                        </button>
                      </li>
                    ))
                  ) : (
                    <li className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 text-center">
                      No occupations found
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
          {errors.occupationCode && (
            <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5" /> {errors.occupationCode}
            </p>
          )}
        </div>

        {/* Row 4: Industry Code (Searchable Dropdown) */}
        <div className="space-y-2" ref={industryRef}>
          <label className="flex items-center justify-between text-sm font-semibold text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-2">
              <Building className="w-4 h-4 text-slate-400" />
              Industry Classification Code (NAICS)
            </span>
            <span className="text-xs text-red-500 font-normal">* Required</span>
          </label>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsIndustryOpen(!isIndustryOpen)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border bg-slate-50/50 dark:bg-slate-800/50 text-left transition-all duration-200 ${
                errors.industryCode 
                  ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' 
                  : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500'
              }`}
            >
              <span className={industryCode ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500'}>
                {industryCode ? `${industryCode} - ${selectedIndustryName}` : 'Select industry code...'}
              </span>
              <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isIndustryOpen ? 'transform rotate-180' : ''}`} />
            </button>

            {isIndustryOpen && (
              <div className="absolute z-40 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden animate-fadeIn">
                <div className="p-2 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search by code, industry, or sector..."
                      value={industrySearch}
                      onChange={(e) => setIndustrySearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>
                <ul className="max-h-60 overflow-y-auto py-1">
                  {filteredIndustries.length > 0 ? (
                    filteredIndustries.map((item) => (
                      <li key={item.code}>
                        <button
                          type="button"
                          onClick={() => {
                            setIndustryCode(item.code);
                            setIsIndustryOpen(false);
                            setIndustrySearch('');
                            if (errors.industryCode) setErrors({ ...errors, industryCode: '' });
                          }}
                          className="w-full px-4 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center justify-between transition-colors"
                        >
                          <div>
                            <div className="text-sm font-medium text-slate-800 dark:text-slate-100">
                              {item.code} - {item.name}
                            </div>
                            <div className="text-xs text-slate-400 dark:text-slate-500">{item.sector}</div>
                          </div>
                          {industryCode === item.code && (
                            <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          )}
                        </button>
                      </li>
                    ))
                  ) : (
                    <li className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400 text-center">
                      No industries found
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
          {errors.industryCode && (
            <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5" /> {errors.industryCode}
            </p>
          )}
        </div>

        {/* Row 5: Work Experience (Years & Months) */}
        <div className="space-y-3">
          <label className="flex items-center justify-between text-sm font-semibold text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              Total Work Experience
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">In years and months</span>
          </label>

          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
            {/* Years */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Years</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={experienceYears}
                  onChange={(e) => {
                    setExperienceYears(parseInt(e.target.value) || 0);
                    if (errors.experience) setErrors({ ...errors, experience: '' });
                  }}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <span className="w-12 text-center font-bold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-sm">
                  {experienceYears}y
                </span>
              </div>
            </div>

            {/* Months */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Months</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="11"
                  value={experienceMonths}
                  onChange={(e) => {
                    setExperienceMonths(parseInt(e.target.value) || 0);
                    if (errors.experience) setErrors({ ...errors, experience: '' });
                  }}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <span className="w-12 text-center font-bold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-sm">
                  {experienceMonths}m
                </span>
              </div>
            </div>
          </div>
          {errors.experience && (
            <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5" /> {errors.experience}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800 mt-8">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-2 px-5 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all duration-200"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}