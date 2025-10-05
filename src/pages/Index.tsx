
import React, { Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { LazyHeroSection, LazyFeatures, LazyTestimonials, LazyPricing } from '@/components/LazyComponents';

// Loading fallback for sections
const SectionFallback = () => (
  <div className="w-full py-12 flex justify-center items-center">
    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
  </div>
);

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SEO
        schema={{
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "iRedirectX",
          "url": "https://iredirectx.com",
          "logo": "https://iredirectx.com/logo.png",
          "sameAs": [
            "https://twitter.com/iredirectx",
            "https://linkedin.com/company/iredirectx"
          ],
          "description": "Professional URL shortening & link management platform for businesses",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://iredirectx.com/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        }}
        articleTags={["URL shortener", "link management", "analytics", "business tools"]}
        publishedTime="2024-01-01T00:00:00Z"
        modifiedTime={new Date().toISOString()}
        alternateLocales={["es_ES", "fr_FR", "de_DE"]}
      />
      <Header />
      <main>
        <LazyHeroSection fallback={<SectionFallback />} />
        <LazyFeatures fallback={<SectionFallback />} />
        <LazyTestimonials fallback={<SectionFallback />} />
        <LazyPricing fallback={<SectionFallback />} />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
