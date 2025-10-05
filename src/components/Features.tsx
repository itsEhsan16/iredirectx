
import React, { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Layers, Grid3x3, ListCheck, BookOpen, Star, LayoutDashboard } from "lucide-react";

const Features = () => {
  const [openFeature, setOpenFeature] = useState<number | null>(null);
  
  const features = [
    {
      title: "Custom Short Links",
      description: "Create memorable custom slugs for your URLs with real-time availability checking.",
      expandedDescription: "Design custom short links that reflect your brand and are easy to remember. Check slug availability in real-time, use custom domains, and create meaningful URLs that enhance your brand recognition and click-through rates.",
      icon: (
        <Layers size={24} className="text-cosmic-accent" />
      )
    },
    {
      title: "Advanced Analytics",
      description: "Track clicks, analyze traffic patterns, and gain insights into your link performance.",
      expandedDescription: "Monitor link performance with detailed analytics including click counts, geographic data, referrer information, and device statistics. Generate comprehensive reports and identify trends to optimize your marketing campaigns.",
      icon: (
        <Grid3x3 size={24} className="text-cosmic-accent" />
      )
    },
    {
      title: "Real-time Management",
      description: "Update destination URLs instantly without changing your short links.",
      expandedDescription: "Modify destination URLs on the fly without breaking your short links. Enable or disable links instantly, schedule link activation, and maintain full control over your redirect destinations with real-time updates.",
      icon: (
        <LayoutDashboard size={24} className="text-cosmic-accent" />
      )
    },
    {
      title: "Bulk Operations",
      description: "Manage multiple links efficiently with bulk actions and organized views.",
      expandedDescription: "Handle large volumes of links with bulk creation, editing, and deletion tools. Import links from CSV files, perform bulk status changes, and organize your links with tags and categories for efficient management.",
      icon: (
        <ListCheck size={24} className="text-cosmic-accent" />
      )
    },
    {
      title: "QR Code Generation",
      description: "Generate QR codes for your short links to enable easy mobile access.",
      expandedDescription: "Automatically generate high-quality QR codes for all your short links. Customize QR code designs, download in multiple formats, and enable seamless mobile access to your content with scannable codes.",
      icon: (
        <Star size={24} className="text-cosmic-accent" />
      )
    },
    {
      title: "Fast Redirects",
      description: "Lightning-fast redirects with global CDN support and optimized performance.",
      expandedDescription: "Ensure blazing-fast redirects with our global CDN infrastructure. Minimize redirect latency, handle high traffic volumes, and provide seamless user experience with enterprise-grade performance and reliability.",
      icon: (
        <BookOpen size={24} className="text-cosmic-accent" />
      )
    }
  ];
  
  const toggleFeature = (index: number) => {
    setOpenFeature(openFeature === index ? null : index);
  };
  
  return (
    <section id="features" className="w-full py-12 md:py-16 px-6 md:px-12">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-medium tracking-tighter">
            Everything your business needs
          </h2>
          <p className="text-cosmic-muted text-lg">
            Comprehensive URL shortening solutions to streamline your link management and drive engagement
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Collapsible
              key={index}
              open={openFeature === index}
              onOpenChange={() => toggleFeature(index)}
              className={`rounded-xl border ${openFeature === index ? 'border-cosmic-light/40' : 'border-cosmic-light/20'} cosmic-gradient transition-all duration-300`}
            >
              <CollapsibleTrigger className="w-full text-left p-6 flex flex-col">
                <div className="flex justify-between items-start">
                  <div className="h-16 w-16 rounded-full bg-cosmic-light/10 flex items-center justify-center mb-6">
                    {feature.icon}
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-cosmic-muted transition-transform duration-200 ${
                      openFeature === index ? 'rotate-180' : ''
                    }`}
                  />
                </div>
                <h3 className="text-xl font-medium tracking-tighter mb-3">{feature.title}</h3>
                <p className="text-cosmic-muted">{feature.description}</p>
              </CollapsibleTrigger>
              <CollapsibleContent className="px-6 pb-6 pt-2">
                <div className="pt-3 border-t border-cosmic-light/10">
                  <p className="text-cosmic-muted">{feature.expandedDescription}</p>
                  <div className="mt-4 flex justify-end">
                    <button className="text-cosmic-accent hover:text-cosmic-accent/80 text-sm font-medium">
                      Learn more →
                    </button>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
