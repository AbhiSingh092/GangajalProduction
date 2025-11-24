import { useState } from 'react';
import { Star, Send, User } from 'lucide-react';

interface Testimonial {
  id: number;
  name: string;
  rating: number;
  comment: string;
  date: string;
  avatar?: string;
}

export default function TestimonialsSection() {
  const [newTestimonial, setNewTestimonial] = useState({
    name: '',
    rating: 5,
    comment: ''
  });
  const [showForm, setShowForm] = useState(false);

  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Priya Sharma",
      rating: 5,
      comment: "Absolutely stunning work! The photographer captured our wedding moments beautifully. Every shot tells a story and the attention to detail is remarkable.",
      date: "2024-11-15"
    },
    {
      id: 2,
      name: "Rajesh Kumar",
      rating: 5,
      comment: "Professional service and incredible photos. The product photography for our business was exactly what we needed. Highly recommended!",
      date: "2024-11-10"
    },
    {
      id: 3,
      name: "Anita Patel",
      rating: 5,
      comment: "The fashion shoot exceeded all expectations. Creative, professional, and delivered on time. Will definitely work again!",
      date: "2024-11-05"
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the testimonial to your backend
    console.log('New testimonial:', newTestimonial);
    setNewTestimonial({ name: '', rating: 5, comment: '' });
    setShowForm(false);
    alert('Thank you for your feedback!');
  };

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        className={`w-5 h-5 ${
          index < rating ? 'fill-amber-500 text-amber-500' : 'text-gray-300'
        } ${interactive ? 'cursor-pointer hover:text-amber-400' : ''}`}
        onClick={interactive && onRatingChange ? () => onRatingChange(index + 1) : undefined}
      />
    ));
  };

  return (
    <section className="py-24 bg-gradient-to-b from-gray-900 to-black">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-white mb-4">
            What Our Clients Say
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-amber-500 to-amber-600 mx-auto mb-6"></div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Don't just take our word for it. See what our amazing clients have to say about their experience.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-amber-500/30 transition-colors">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-black" />
                </div>
                <div className="ml-4">
                  <h4 className="text-white font-semibold">{testimonial.name}</h4>
                  <div className="flex items-center">
                    {renderStars(testimonial.rating)}
                  </div>
                </div>
              </div>
              <p className="text-gray-300 mb-4 leading-relaxed">
                "{testimonial.comment}"
              </p>
              <p className="text-gray-500 text-sm">
                {new Date(testimonial.date).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          ))}
        </div>

        {/* Add Testimonial Button */}
        <div className="text-center">
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold px-8 py-3 rounded-full transition-all transform hover:scale-105"
            >
              <Star className="w-5 h-5" />
              Share Your Experience
            </button>
          ) : (
            <div className="max-w-2xl mx-auto bg-gray-800 rounded-xl p-8 border border-gray-700">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">Share Your Experience</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Your Name</label>
                  <input
                    type="text"
                    value={newTestimonial.name}
                    onChange={(e) => setNewTestimonial({ ...newTestimonial, name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 transition-colors"
                    placeholder="Enter your name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Rating</label>
                  <div className="flex items-center gap-2">
                    {renderStars(newTestimonial.rating, true, (rating) => 
                      setNewTestimonial({ ...newTestimonial, rating })
                    )}
                    <span className="text-gray-400 ml-2">({newTestimonial.rating}/5)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Your Review</label>
                  <textarea
                    value={newTestimonial.comment}
                    onChange={(e) => setNewTestimonial({ ...newTestimonial, comment: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 transition-colors resize-none"
                    placeholder="Tell us about your experience..."
                    required
                  />
                </div>

                <div className="flex gap-4 justify-center">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold px-6 py-3 rounded-lg transition-all"
                  >
                    <Send className="w-4 h-4" />
                    Submit Review
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}