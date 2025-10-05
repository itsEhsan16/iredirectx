import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogType?: string;
  ogImage?: string;
  twitterCard?: string;
  twitterImage?: string;
  keywords?: string;
  noIndex?: boolean;
  schema?: object;
  locale?: string;
  alternateLocales?: string[];
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  articleTags?: string[];
}

const defaultSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "iRedirectX",
  "url": "https://iredirectx.com",
  "description": "Professional URL shortening & link management platform",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://iredirectx.com/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
};

const SEO: React.FC<SEOProps> = ({
  title = 'iRedirectX | Professional URL Shortening & Link Management',
  description = 'Create custom short links with powerful analytics. Professional URL shortening service built for businesses who value performance, tracking, and scalable growth.',
  canonical,
  ogType = 'website',
  ogImage = 'https://lovable.dev/opengraph-image-p98pqg.png',
  twitterCard = 'summary_large_image',
  twitterImage = 'https://lovable.dev/opengraph-image-p98pqg.png',
  keywords = 'URL shortener, link management, link analytics, short links, custom URLs, link tracking, redirect service',
  noIndex = false,
  schema = defaultSchema,
  locale = 'en_US',
  alternateLocales = [],
  publishedTime,
  modifiedTime,
  author = 'iRedirectX',
  section,
  articleTags = [],
}) => {
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const canonicalUrl = canonical || currentUrl;
  
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="iRedirectX" />
      
      {/* Twitter Meta Tags */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:site" content="@iredirectx" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={twitterImage} />
      
      {/* Robots Meta Tag */}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Additional Meta Tags */}
      <meta name="author" content="iRedirectX" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="theme-color" content="#000000" />
      
      {/* Language Meta Tags */}
      <meta property="og:locale" content={locale} />
      {alternateLocales.map((altLocale) => (
        <meta key={altLocale} property="og:locale:alternate" content={altLocale} />
      ))}
      
      {/* Article Meta Tags */}
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {author && <meta property="article:author" content={author} />}
      {section && <meta property="article:section" content={section} />}
      {articleTags.map((tag) => (
        <meta key={tag} property="article:tag" content={tag} />
      ))}
      
      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
      
      {/* Preconnect to Important Origins */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://api.iredirectx.com" />
      
      {/* PWA Meta Tags */}
      <meta name="application-name" content="iRedirectX" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="iRedirectX" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      
      {/* Security Headers */}
      <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
      <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
    </Helmet>
  );
};

export default SEO;