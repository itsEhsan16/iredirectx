import React from 'react';
import { createLazyComponent, createCosmicLazyComponent } from '@/utils/lazyLoad';

// Lazy load larger UI components
export const LazyLinkTable = createLazyComponent(() => import('./LinkTable'));
export const LazyDraggableLinkList = createCosmicLazyComponent(() => import('./DraggableLinkList'));
export const LazyCustomRedirectRules = createLazyComponent(() => import('./CustomRedirectRules'));

// Lazy load analytics components with cosmic styling
export const LazyAnalyticsSummary = createCosmicLazyComponent(() => import('./analytics/AnalyticsSummary'));
export const LazyClicksOverTimeChart = createCosmicLazyComponent(() => import('./analytics/ClicksOverTimeChart'));
export const LazyDeviceAnalyticsChart = createCosmicLazyComponent(() => import('./analytics/DeviceAnalyticsChart'));
export const LazyReferrerSourcesChart = createCosmicLazyComponent(() => import('./analytics/ReferrerSourcesChart'));

// Lazy load landing page components
export const LazyHeroSection = createLazyComponent(() => import('./HeroSection'));
export const LazyFeatures = createLazyComponent(() => import('./Features'));
export const LazyTestimonials = createLazyComponent(() => import('./Testimonials'));
export const LazyPricing = createLazyComponent(() => import('./Pricing'));