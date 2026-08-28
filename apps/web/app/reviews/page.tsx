'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc/client/react';
import { Star, MapPin, Instagram, Phone, Video, Image as ImageIcon, Send, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function ReviewsPage() {
  // Fetch existing reviews
  const { data: reviews = [], isLoading, refetch } = api.reviews.getAll.useQuery();
  
  // Form state
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [stars, setStars] = useState(5);
  const [image, setImage] = useState('');
  const [video, setVideo] = useState('');
  const [instagramId, setInstagramId] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [hoverStars, setHoverStars] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mutation
  const createReviewMutation = api.reviews.create.useMutation({
    onSuccess: () => {
      toast.success('Thank you for sharing your experience!');
      refetch();
      // Reset form
      setName('');
      setMessage('');
      setStars(5);
      setImage('');
      setVideo('');
      setInstagramId('');
      setPhone('');
      setLocation('');
    },
    onError: (err) => {
      toast.error(err.message || 'Something went wrong. Please try again.');
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!message.trim()) {
      toast.error('Message is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await createReviewMutation.mutateAsync({
        name,
        message,
        stars,
        image: image.trim() || null,
        video: video.trim() || null,
        instagramId: instagramId.trim() || null,
        phone: phone.trim() || null,
        location: location.trim() || null,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#FAF9F5] min-h-screen text-zinc-800 pt-32 pb-24 font-sans">
      
      {/* Decorative Aura background */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#FF5E36]/5 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-80 h-80 rounded-full bg-[#FF5E36]/3 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[10px] tracking-[0.3em] uppercase text-[#FF5E36] font-bold mb-3 block">
            ATELIER DIARIES
          </span>
          <h1 className="font-serif text-4xl md:text-5xl font-light text-zinc-950 tracking-tight mb-4">
            Customer Reviews & Experiences
          </h1>
          <p className="text-zinc-500 font-light text-xs md:text-sm leading-relaxed">
            Read what our patrons say about their bespoke outfits, or share your own tailoring experience with our Delhi-based artisans.
          </p>
        </div>

        {/* Two Column Layout: Form Left/Right, Reviews List opposite */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Form to add reviews (5 cols) */}
          <div className="lg:col-span-5 bg-white/70 backdrop-blur-md border border-zinc-200/50 p-6 md:p-8 rounded-[2rem] shadow-xl shadow-zinc-100">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles size={16} className="text-[#FF5E36]" />
              <h2 className="font-serif text-xl font-medium text-zinc-900">Share Your Experience</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Star Rating Selector */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-zinc-400 font-bold mb-2">
                  Rating <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setStars(star)}
                      onMouseEnter={() => setHoverStars(star)}
                      onMouseLeave={() => setHoverStars(null)}
                      className="p-1 -ml-1 transition-transform hover:scale-110 cursor-pointer"
                      aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                    >
                      <Star
                        size={22}
                        className={cn(
                          "transition-colors",
                          star <= (hoverStars ?? stars)
                            ? "fill-amber-400 text-amber-400"
                            : "text-zinc-200"
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Name (Mandatory) */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-zinc-400 font-bold mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aditi Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:bg-white focus:border-zinc-300 focus:ring-1 focus:ring-[#FF5E36] transition-all"
                />
              </div>

              {/* Message (Mandatory) */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-zinc-400 font-bold mb-1">
                  Your Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Write your review here. What did you think of the fit, fabric, and handwork details?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:bg-white focus:border-zinc-300 focus:ring-1 focus:ring-[#FF5E36] transition-all resize-none"
                />
              </div>

              {/* Collapsible/Grouped Optional Fields */}
              <div className="border-t border-zinc-100 pt-4 mt-2">
                <span className="text-[9px] uppercase tracking-[0.2em] text-[#FF5E36] font-bold block mb-4">
                  Optional Details
                </span>

                <div className="space-y-3.5">
                  {/* Location & Instagram ID Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    <div>
                      <label className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-zinc-400 font-bold mb-1">
                        <MapPin size={10} /> Location
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. New Delhi"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 text-xs outline-none focus:bg-white focus:border-zinc-300 transition-all"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-zinc-400 font-bold mb-1">
                        <Instagram size={10} /> Instagram ID
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. aditi_sharma"
                        value={instagramId}
                        onChange={(e) => setInstagramId(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 text-xs outline-none focus:bg-white focus:border-zinc-300 transition-all"
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-zinc-400 font-bold mb-1">
                      <Phone size={10} /> Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. +91 9988776655"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 text-xs outline-none focus:bg-white focus:border-zinc-300 transition-all"
                    />
                  </div>

                  {/* Image URL */}
                  <div>
                    <label className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-zinc-400 font-bold mb-1">
                      <ImageIcon size={10} /> Image URL
                    </label>
                    <input
                      type="url"
                      placeholder="e.g. https://example.com/photo.jpg"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 text-xs outline-none focus:bg-white focus:border-zinc-300 transition-all"
                    />
                  </div>

                  {/* Video URL */}
                  <div>
                    <label className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-zinc-400 font-bold mb-1">
                      <Video size={10} /> Video URL
                    </label>
                    <input
                      type="url"
                      placeholder="e.g. https://example.com/video.mp4"
                      value={video}
                      onChange={(e) => setVideo(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 text-xs outline-none focus:bg-white focus:border-zinc-300 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#FF5E36] hover:bg-[#E04D27] disabled:bg-zinc-400 text-white font-bold uppercase tracking-widest text-[10px] py-4 rounded-full flex items-center justify-center gap-2.5 transition-all mt-6 shadow-md cursor-pointer"
              >
                <Send size={12} />
                <span>{isSubmitting ? 'Submitting...' : 'Submit Review'}</span>
              </button>
            </form>
          </div>

          {/* Right Column: Reviews list (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <h2 className="font-serif text-2xl text-zinc-900 font-light border-b border-zinc-200/60 pb-3 flex justify-between items-center">
              <span>Customer Voice</span>
              <span className="text-xs bg-zinc-150 px-3 py-1 rounded-full text-zinc-500 font-sans font-medium">
                {reviews.length} Reviews
              </span>
            </h2>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="animate-pulse bg-white border border-zinc-100 p-6 rounded-2xl h-36" />
                ))}
              </div>
            ) : reviews.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="bg-white border border-zinc-200/60 p-6 rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-md transition-all relative group"
                  >
                    <div>
                      {/* Rating stars & Date */}
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex gap-1 text-amber-400">
                          {[...Array(rev.stars)].map((_, i) => (
                            <Star key={i} size={13} className="fill-amber-400 text-amber-400" />
                          ))}
                          {[...Array(5 - rev.stars)].map((_, i) => (
                            <Star key={i} size={13} className="text-zinc-200" />
                          ))}
                        </div>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          {new Date(rev.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      </div>

                      {/* Review Message */}
                      <p className="text-zinc-600 text-xs md:text-sm font-light leading-relaxed mb-5">
                        "{rev.message}"
                      </p>

                      {/* Review Image or Video Attachments */}
                      {(rev.image || rev.video) && (
                        <div className="flex gap-3.5 mb-5 flex-wrap">
                          {rev.image && (
                            <div className="relative w-16 h-20 rounded-xl overflow-hidden border border-zinc-100 bg-zinc-50">
                              <img src={rev.image} alt="User attachment" className="object-cover w-full h-full" />
                            </div>
                          )}
                          {rev.video && (
                            <div className="relative w-28 h-20 rounded-xl overflow-hidden border border-zinc-100 bg-zinc-50 flex items-center justify-center">
                              <Video size={20} className="text-zinc-400" />
                              <span className="text-[8px] absolute bottom-1 uppercase tracking-wider text-zinc-500 font-bold">Video Attached</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Reviewer Details Footer */}
                    <div className="flex items-center justify-between border-t border-zinc-150/40 pt-3 text-[10px] flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <div>
                          <h4 className="font-bold text-zinc-950">{rev.name}</h4>
                          {rev.instagramId && (
                            <a
                              href={`https://instagram.com/${rev.instagramId}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[8px] tracking-wider uppercase text-zinc-400 hover:text-[#FF5E36] transition-colors mt-0.5 flex items-center gap-0.5"
                            >
                              <Instagram size={8} /> @{rev.instagramId}
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2.5 items-center">
                        {rev.location && (
                          <span className="flex items-center gap-0.5 text-[8px] tracking-widest uppercase font-bold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full">
                            <MapPin size={8} /> {rev.location}
                          </span>
                        )}
                        {rev.phone && (
                          <span className="text-[8px] tracking-widest uppercase font-bold text-zinc-400">
                            📞 Verified Patron
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-zinc-400 text-xs tracking-wider border border-dashed border-zinc-200 rounded-2xl">
                No reviews yet. Be the first to share your experience!
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

// Utility tailwind dynamic merge function local copy to keep file self-contained
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
