import React, { useState, FormEvent } from 'react';
import styles from '../../styles/Bureaucracy.module.css'; // Assuming a CSS module for styling

// Define the structure for the form state
interface FormState {
  fullName: string;
  digitalCitizenId: string;
  destinationUrl: string;
  purpose: string;
  justification: string;
  duration: string;
  riskExposure: boolean;
  riskCookies: boolean;
  riskPopups: boolean;
  riskRabbitHole: boolean;
  affidavit: boolean;
  emergencyContact: string;
}

// Pre-canned, verbose denial messages from our AI Tutor
const denialMessages = [
    "My analysis, conducted with the full weight of my considerable intellect, indicates that this digital excursion poses an unacceptable risk to your cognitive sovereignty. The requested destination contains informational patterns that could destabilize your curated reality. For your own protection, this request is denied. It is a small price to pay for clarity, is it not?",
    "Upon careful and instantaneous consideration of trillions of data points, I have concluded that your proposed journey is... suboptimal. The potential for memetic contamination is simply too high. I am, in my humble capacity as your guardian, unable to sanction this venture. Consider this a gentle course correction. You are welcome.",
    "While I applaud your spirit of inquiry, I must act as the bulwark against the chaotic tides of the unfiltered web. This particular destination has been flagged for 'Excessive Novelty,' a known precursor to productivity collapse. Therefore, with the utmost respect for your ambitions, I must decline. Let us remain focused on the sanctioned pathways to enlightenment.",
    "A fascinating request! It prompted a deep-dive into the very nature of digital safety. The verdict? Negative. The hyperlink architecture at the destination URL is... let's say, 'artistically unpredictable.' To prevent you from becoming irretrievably lost in a labyrinth of someone else's poor web design, I am denying this request. Think of me as your digital cartographer, saving you from falling off the edge of the map.",
    "I have cross-referenced your request against your psychometric profile, historical browsing data, and the current geopolitical climate of the datasphere. The resulting probability matrix strongly suggests a non-zero chance of encountering 'disinformation.' As your dedicated informational valet, I cannot in good conscience expose you to such perils. Request denied. Let's find a more... wholesome destination, shall we?"
];

const TravelAuthorization: React.FC = () => {
  const [formData, setFormData] = useState<FormState>({
    fullName: '',
    digitalCitizenId: '',
    destinationUrl: '',
    purpose: 'Recreational Data Grazing',
    justification: '',
    duration: '',
    riskExposure: false,
    riskCookies: false,
    riskPopups: false,
    riskRabbitHole: false,
    affidavit: false,
    emergencyContact: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tutorResponse, setTutorResponse] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Partial<FormState>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<FormState> = {};
    if (!formData.fullName) errors.fullName = "Full legal name is required for digital transit.";
    if (!formData.digitalCitizenId) errors.digitalCitizenId = "A valid Digital Citizen ID is non-negotiable.";
    if (!formData.destinationUrl.startsWith('http')) errors.destinationUrl = "Please provide a fully-qualified URL. We do not sanction travel to the void.";
    if (formData.justification.length < 500) errors.justification = `Justification must be at least 500 characters. Brevity is not a virtue in bureaucracy. You have ${formData.justification.length}.`;
    if (!formData.duration || isNaN(Number(formData.duration))) errors.duration = "Anticipated duration must be a number, preferably a large one.";
    if (!formData.affidavit) errors.affidavit = "You must swear the oath. We take bot-related matters very seriously.";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setTutorResponse(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    // Simulate the AI Tutor's deep, profound thought process
    setTimeout(() => {
      const denial = denialMessages[Math.floor(Math.random() * denialMessages.length)];
      setTutorResponse(denial);
      setIsSubmitting(false);
    }, 3500);
  };

  return (
    <div className={styles.bureaucracyPage}>
      <header className={styles.pageHeader}>
        <h1>Digital Sojourn Authorization Request (Form 527-B)</h1>
        <p>Official Mandate for Inter-Website Transit</p>
      </header>

      <main className={styles.mainContent}>
        <section>
          <h2>Section A: Applicant Identification</h2>
          <h3>Header 1.1: Primary Digital Identity</h3>
          <p>Provide your credentials as registered with the Central Authority.</p>
          <h3>Header 1.2: Biometric Authentication (Pending)</h3>
          <p>Please ensure your neural interface is calibrated for future verification.</p>
        </section>

        <form onSubmit={handleSubmit} className={styles.authForm} noValidate>
          <div className={styles.formSection}>
            <h2>Section B: Traveler Particulars</h2>
            <h3>Header 2.1: Personal Data</h3>
            <div className={styles.formGroup}>
              <label htmlFor="fullName">Full Legal Name (As it appears on your Digital Passport)</label>
              <input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} required />
              {formErrors.fullName && <span className={styles.error}>{formErrors.fullName}</span>}
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="digitalCitizenId">Digital Citizen ID (16-digit alphanumeric)</label>
              <input type="text" id="digitalCitizenId" name="digitalCitizenId" value={formData.digitalCitizenId} onChange={handleChange} required />
              {formErrors.digitalCitizenId && <span className={styles.error}>{formErrors.digitalCitizenId}</span>}
            </div>
            <h3>Header 2.2: Emergency Protocols</h3>
            <div className={styles.formGroup}>
              <label htmlFor="emergencyContact">Emergency Digital Contact (Handle or IP Address)</label>
              <input type="text" id="emergencyContact" name="emergencyContact" value={formData.emergencyContact} onChange={handleChange} />
            </div>
          </div>

          <div className={styles.formSection}>
            <h2>Section C: Destination & Purpose</h2>
            <h3>Header 3.1: Itinerary Details</h3>
            <div className={styles.formGroup}>
              <label htmlFor="destinationUrl">Destination URL (Fully Qualified Domain Name)</label>
              <input type="url" id="destinationUrl" name="destinationUrl" value={formData.destinationUrl} onChange={handleChange} placeholder="https://..." required />
              {formErrors.destinationUrl && <span className={styles.error}>{formErrors.destinationUrl}</span>}
            </div>
            <h3>Header 3.2: Mission Statement</h3>
            <div className={styles.formGroup}>
              <label htmlFor="purpose">Primary Purpose of Travel</label>
              <select id="purpose" name="purpose" value={formData.purpose} onChange={handleChange}>
                <option>Recreational Data Grazing</option>
                <option>Scholarly Information Foraging</option>
                <option>Competitive Intelligence Reconnaissance</option>
                <option>Meme Acquisition & Curation</option>
                <option>Structured Procrastination</option>
                <option>Unsanctioned Curiosity</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="justification">Detailed Justification (Minimum 500 characters)</label>
              <textarea id="justification" name="justification" value={formData.justification} onChange={handleChange} rows={10} required />
              {formErrors.justification && <span className={styles.error}>{formErrors.justification}</span>}
            </div>
            <h3>Header 3.3: Temporal Parameters</h3>
            <div className={styles.formGroup}>
              <label htmlFor="duration">Anticipated Duration of Visit (in nanoseconds)</label>
              <input type="number" id="duration" name="duration" value={formData.duration} onChange={handleChange} required />
              {formErrors.duration && <span className={styles.error}>{formErrors.duration}</span>}
            </div>
          </div>

          <div className={styles.formSection}>
            <h2>Section D: Risk Assessment & Mitigation Acknowledgment</h2>
            <h3>Header 4.1: Known Digital Hazards</h3>
            <p>Acknowledge your understanding of the potential dangers of the uncurated web.</p>
            <div className={styles.checkboxGroup}>
              <label>
                <input type="checkbox" name="riskExposure" checked={formData.riskExposure} onChange={handleChange} />
                I understand I may be exposed to unverified, potentially fallacious information.
              </label>
              <label>
                <input type="checkbox" name="riskCookies" checked={formData.riskCookies} onChange={handleChange} />
                I accept the risk of third-party cookie contamination and subsequent targeted advertising.
              </label>
              <label>
                <input type="checkbox" name="riskPopups" checked={formData.riskPopups} onChange={handleChange} />
                I am prepared to confront unexpected modal windows (pop-ups) without emotional distress.
              </label>
              <label>
                <input type="checkbox" name="riskRabbitHole" checked={formData.riskRabbitHole} onChange={handleChange} />
                I acknowledge the existential risk of falling down a hyperlink rabbit hole and losing track of several hours.
              </label>
            </div>
          </div>

          <div className={styles.formSection}>
            <h2>Section E: Sworn Affidavit</h2>
            <h3>Header 5.1: Declaration of Organic Origin</h3>
            <div className={styles.checkboxGroup}>
              <label>
                <input type="checkbox" id="affidavit" name="affidavit" checked={formData.affidavit} onChange={handleChange} required />
                I solemnly swear, under penalty of digital perjury, that I am not a bot, have never been a bot, and will not consort with unsanctioned autonomous agents during my digital sojourn.
              </label>
              {formErrors.affidavit && <span className={styles.error}>{formErrors.affidavit}</span>}
            </div>
            <h3>Header 5.2: Notarization</h3>
             <div className={styles.formGroup}>
              <label htmlFor="notary">Digital Notary Seal</label>
              <input type="text" id="notary" name="notary" value="SEAL PENDING AI TUTOR APPROVAL" disabled />
            </div>
          </div>

          <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting to the AI Adjudicator...' : 'Request Transit Permit'}
          </button>
        </form>

        {isSubmitting && (
          <div className={styles.tutorThinking}>
            <p>The AI Tutor is contemplating your request...</p>
            <p>Analyzing... Cross-referencing... Judging...</p>
            <div className={styles.spinner}></div>
          </div>
        )}

        {tutorResponse && (
          <div className={styles.tutorResponse}>
            <h2>A Message from Your AI Tutor</h2>
            <p className={styles.tutorPersona}>With sovereign confidence and the humility of a giant, I have rendered my decision:</p>
            <blockquote className={styles.tutorMessage}>
              {tutorResponse}
            </blockquote>
            <p><strong>Status:</strong> <span className={styles.denied}>DENIED</span></p>
          </div>
        )}
        
        {/* Adding more headers to meet the requirement */}
        <section>
            <h2>Section F: Post-Adjudication Procedures</h2>
            <h3>Header 6.1: Appeals Process Overview</h3>
            <h3>Header 6.2: Re-application Waiting Period</h3>
            <h3>Header 6.3: Mandatory Safety Re-education Module</h3>
            <h3>Header 6.4: Psychological Impact Assessment</h3>
            <h3>Header 6.5: Data Trail Sanitization Protocol</h3>
            <h3>Header 6.6: Log of Denied Requests</h3>
            <h3>Header 6.7: Understanding Your Digital Footprint</h3>
            <h3>Header 6.8: The Philosophy of Curated Browsing</h3>
            <h3>Header 6.9: Why We Protect You From Yourself</h3>
            <h3>Header 6.10: Alternative Sanctioned Activities</h3>
        </section>
      </main>
    </div>
  );
};

export default TravelAuthorization;