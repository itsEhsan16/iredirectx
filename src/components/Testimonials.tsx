
import React from 'react';

const Testimonials = () => {
  const testimonials = [
    {
      quote: "Our marketing campaign click-through rates increased by 65% after switching to iRedirectX. The custom domains and analytics are phenomenal.",
      author: "Sarah Johnson",
      position: "Marketing Director at TechCorp",
      avatar: "bg-cosmic-light/30"
    },
    {
      quote: "Managing thousands of campaign links used to be a nightmare. iRedirectX's bulk operations and real-time analytics saved us countless hours.",
      author: "Michael Chen",
      position: "Growth Manager at StartupFlow",
      avatar: "bg-cosmic-light/20"
    },
    {
      quote: "The QR code generation and fast redirects are game-changers for our offline marketing. Our customers love the seamless experience.",
      author: "Leila Rodriguez",
      position: "Digital Marketing Lead at GlobalBrand",
      avatar: "bg-cosmic-light/40"
    }
  ];
  
  return (
    <section className="w-full py-20 px-6 md:px-12 bg-card relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 cosmic-grid opacity-20"></div>
      
      <div className="max-w-7xl mx-auto space-y-16 relative z-10">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-medium tracking-tighter text-foreground">
            Trusted by marketing teams worldwide
          </h2>
          <p className="text-muted-foreground text-lg">
            See how our platform transforms link management for growing businesses
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="p-6 rounded-xl border border-border bg-background/80 backdrop-blur-sm hover:border-border/60 transition-all duration-300"
            >
              <div className="mb-6">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-primary inline-block mr-1">★</span>
                ))}
              </div>
              <p className="text-lg mb-8 text-foreground/90 italic">"{testimonial.quote}"</p>
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-full ${testimonial.avatar} bg-muted`}></div>
                <div>
                  <h4 className="font-medium text-foreground">{testimonial.author}</h4>
                  <p className="text-sm text-muted-foreground">{testimonial.position}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
