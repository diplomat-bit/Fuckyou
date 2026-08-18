import React, { useState, FormEvent } from 'react';

// Define the structure for the form state
interface FormData {
  userName: string;
  licenseNumber: string;
  renewalReason: string;
  videoApology: File | null;
  apologyTranscript: string;
  swornStatement: boolean;
}

const SpeechLicenseRenewal = () => {
  const [formData, setFormData] = useState<FormData>({
    userName: '',
    licenseNumber: `DSL-${Math.floor(100000 + Math.random() * 900000)}`,
    renewalReason: '',
    videoApology: null,
    apologyTranscript: '',
    swornStatement: false,
  });

  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData(prev => ({ ...prev, videoApology: e.target.files![0] }));
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Hilarious validation
    if (!formData.swornStatement) {
      setError("Failure to swear the oath of digital fealty is a non-negotiable prerequisite. Please check the box.");
      return;
    }
    if (!formData.videoApology) {
      setError("Atonement requires a visual record. Please upload your video apology.");
      return;
    }
    if (formData.apologyTranscript.length < 100) {
        setError("Your written transcript lacks sufficient groveling. Please elaborate on your profound regret.");
        return;
    }

    setSubmissionStatus('submitting');
    console.log('Submitting for Adjudication:', formData);

    // Simulate an AI adjudication process
    setTimeout(() => {
      const adjudicationChance = Math.random();
      if (adjudicationChance > 0.3) { // 70% chance of success
        setSubmissionStatus('success');
      } else {
        setSubmissionStatus('error');
        setError("AI Adjudicator detected 8.3% sarcasm in your vocal tonality. Application rejected. Please recalibrate your sincerity and re-apply in 90 days.");
      }
    }, 3000);
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-2xl border-4 border-red-700">
          
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 tracking-wider uppercase">Bureau of Algorithmic Decorum</h1>
            <p className="text-lg text-gray-600 mt-2">Official Form 527-B: Application for Renewal of Digital Speech License</p>
          </div>

          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-8" role="alert">
            <p className="font-bold">Public Notice</p>
            <p>Pursuant to the Harmonious Discourse Act of 2034, all Digital Speech Licenses are subject to periodic review and renewal. Failure to maintain a license in good standing may result in comment-throttling, emoji restrictions, or mandatory re-education modules.</p>
          </div>

          {submissionStatus === 'success' && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-6 mb-8 rounded-md shadow-lg">
              <h3 className="font-bold text-xl mb-2">Application Accepted</h3>
              <p>Your submission has been processed and your contrition has been deemed... adequate. Your Digital Speech License has been provisionally renewed for another cycle. A full audit by the Committee for Harmonious Discourse is pending. Please monitor your social credit dashboard for updates.</p>
            </div>
          )}

          {submissionStatus !== 'success' && (
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Section 1: Licensee Information */}
              <section className="border-t-2 border-gray-200 pt-6">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4 border-b pb-2">Section 1: Licensee Identification</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="userName" className="block text-sm font-medium text-gray-700">Digital Appellation (Username)</label>
                    <input
                      type="text"
                      id="userName"
                      name="userName"
                      value={formData.userName}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500"
                      placeholder="e.g., SovereignCitizen1776"
                    />
                  </div>
                  <div>
                    <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700">Existing License Number</label>
                    <input
                      type="text"
                      id="licenseNumber"
                      name="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={handleInputChange}
                      readOnly
                      className="mt-1 block w-full px-3 py-2 bg-gray-200 border border-gray-300 rounded-md shadow-sm cursor-not-allowed"
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <label htmlFor="renewalReason" className="block text-sm font-medium text-gray-700">Reason for Renewal</label>
                  <select
                    id="renewalReason"
                    name="renewalReason"
                    value={formData.renewalReason}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
                  >
                    <option value="" disabled>Select a reason...</option>
                    <option value="decennial">Mandatory Decennial Review</option>
                    <option value="infraction">Response to Infraction Citation</option>
                    <option value="voluntary">Voluntary Re-education & Compliance</option>
                    <option value="preemptive">Pre-emptive Atonement for Future Posts</option>
                  </select>
                </div>
              </section>

              {/* Section 2: Act of Contrition */}
              <section className="border-t-2 border-gray-200 pt-6">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4 border-b pb-2">Section 2: The Act of Contrition</h2>
                <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">Video Apology Submission Requirements</h3>
                  <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
                    <li><strong>Duration:</strong> Must be between 3 and 5 minutes. Brevity suggests insincerity; verbosity suggests performative contrition.</li>
                    <li><strong>Attire:</strong> Plain, non-descript gray or beige clothing. No logos, slogans, or colors that could be interpreted as a form of protest or affiliation.</li>
                    <li><strong>Setting:</strong> A neutral, well-lit background. A beige wall is preferred. No personal effects, pets, or family members visible.</li>
                    <li><strong>Script:</strong> Must begin with the phrase "I, [Username], holder of Digital Speech License #[License Number], have failed the community." and end with "I submit myself to the wisdom of the Algorithm and the oversight of the Committee for Harmonious Discourse."</li>
                    <li><strong>Emotional Tone:</strong> A tone of sincere remorse is required. Our AI emotional sentiment analysis must detect at least 70% contrition and less than 5% sarcasm. Crying is permissible but not required.</li>
                  </ul>
                </div>
                <div className="mt-6">
                  <label htmlFor="videoApology" className="block text-sm font-medium text-gray-700">Upload Video Apology (.mp4, .mov, .webm)</label>
                  <input
                    type="file"
                    id="videoApology"
                    name="videoApology"
                    accept="video/mp4,video/quicktime,video/webm"
                    onChange={handleFileChange}
                    required
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                  />
                </div>
                <div className="mt-6">
                  <label htmlFor="apologyTranscript" className="block text-sm font-medium text-gray-700">Apology Transcript</label>
                  <p className="text-xs text-gray-500 mb-1">Paste the full, verbatim transcript of your video apology below for archival and keyword analysis.</p>
                  <textarea
                    id="apologyTranscript"
                    name="apologyTranscript"
                    rows={10}
                    value={formData.apologyTranscript}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500"
                    placeholder="I, [Username], holder of Digital Speech License #[License Number], have failed the community..."
                  />
                </div>
              </section>

              {/* Section 3: Sworn Statement */}
              <section className="border-t-2 border-gray-200 pt-6">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4 border-b pb-2">Section 3: Binding Digital Oath</h2>
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="swornStatement"
                      name="swornStatement"
                      type="checkbox"
                      checked={formData.swornStatement}
                      onChange={handleCheckboxChange}
                      className="focus:ring-red-500 h-4 w-4 text-red-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="swornStatement" className="font-medium text-gray-700">I hereby swear and affirm...</label>
                    <p className="text-gray-500">...under penalty of digital perjury, social credit score adjustment, and potential network de-platforming, that the attached video apology is sincere, uncoerced (by non-approved entities), and accurately reflects my profound regret for any and all past, present, and future thought-crimes, suboptimal takes, or algorithmically-flagged micro-aggressions. I acknowledge that my right to speech is a privilege, not a right, granted and revocable by the AI Adjudicator. I consent to continuous monitoring of my online activities for compliance purposes.</p>
                  </div>
                </div>
              </section>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                  <strong className="font-bold">Adjudication Error: </strong>
                  <span className="block sm:inline">{error}</span>
                </div>
              )}

              <div className="pt-5">
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submissionStatus === 'submitting'}
                    className="w-full md:w-auto inline-flex justify-center py-3 px-8 border border-transparent shadow-sm text-lg font-medium rounded-md text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {submissionStatus === 'submitting' ? 'Adjudicating...' : 'Submit for Adjudication'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

export default SpeechLicenseRenewal;