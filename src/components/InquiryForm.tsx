import { useState } from 'react';
import { Send, CheckCircle } from 'lucide-react';

export default function InquiryForm() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    shootType: '',
    mediaType: '',
    location: '',
    date: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const mailtoLink = `mailto:contact@gangajalproduction.com?subject=Inquiry from ${formData.fullName}&body=
Name: ${formData.fullName}%0D%0A
Email: ${formData.email}%0D%0A
Phone: ${formData.phone}%0D%0A
Type of Shoot: ${formData.shootType}%0D%0A
Media Format: ${formData.mediaType}%0D%0A
Location: ${formData.location}%0D%0A
Preferred Date: ${formData.date}%0D%0A
Message: ${formData.message}`;

    window.location.href = mailtoLink;
    setSubmitted(true);

    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        shootType: '',
        mediaType: '',
        location: '',
        date: '',
        message: ''
      });
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <section id="contact" className="py-24 bg-gradient-to-b from-black via-gray-900 to-black relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')]"></div>
      </div>

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-white mb-4">
            Let's Create Together
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-amber-500 to-amber-600 mx-auto mb-6"></div>
          <p className="text-gray-400 text-lg">
            Ready to bring your vision to life? Get in touch with us today.
          </p>
        </div>

        {submitted ? (
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-12 border border-amber-500/30 text-center">
            <CheckCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Thank You!</h3>
            <p className="text-gray-400">We'll get back to you shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 md:p-12 border border-amber-500/20 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-gray-300 mb-2 font-medium">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full bg-black/50 border border-amber-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2 font-medium">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-black/50 border border-amber-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-gray-300 mb-2 font-medium">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full bg-black/50 border border-amber-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
                  placeholder="+91 98765 43210"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2 font-medium">Type of Shoot</label>
                <select
                  name="shootType"
                  value={formData.shootType}
                  onChange={handleChange}
                  required
                  className="w-full bg-black/50 border border-amber-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
                >
                  <option value="">Select a type</option>
                  <option value="product">Product Photography</option>
                  <option value="fashion">Fashion & Portrait</option>
                  <option value="event">Event Coverage</option>
                  <option value="travel">Travel & Lifestyle</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-gray-300 mb-2 font-medium">Media Format</label>
                <select
                  name="mediaType"
                  value={formData.mediaType}
                  onChange={handleChange}
                  required
                  className="w-full bg-black/50 border border-amber-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
                >
                  <option value="">Select format</option>
                  <option value="photography">Photography Only</option>
                  <option value="videography">Videography Only</option>
                  <option value="both">Both Photography & Videography</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-300 mb-2 font-medium">Deliverables</label>
                <select
                  name="deliverables"
                  defaultValue="standard"
                  className="w-full bg-black/50 border border-amber-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
                >
                  <option value="standard">Standard Package</option>
                  <option value="premium">Premium Package</option>
                  <option value="custom">Custom Package</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-gray-300 mb-2 font-medium">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="w-full bg-black/50 border border-amber-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
                  placeholder="City, State"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2 font-medium">Preferred Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full bg-black/50 border border-amber-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-gray-300 mb-2 font-medium">Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={5}
                className="w-full bg-black/50 border border-amber-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors resize-none"
                placeholder="Tell us about your project..."
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-black py-4 rounded-full font-bold text-lg hover:shadow-2xl hover:shadow-amber-500/50 transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2"
            >
              <span>Send Inquiry</span>
              <Send className="w-5 h-5" />
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
