/**
 * Utility for evaluating redirect rules
 */

interface RedirectRule {
  id: string;
  link_id: string;
  condition_type: string;
  condition_value: string;
  redirect_url: string;
  priority: number;
  active: boolean;
  [key: string]: any;
}

/**
 * Evaluates redirect rules based on current conditions
 * @param rules Array of redirect rules to evaluate
 * @returns The first matching rule or null if no rules match
 */
export function evaluateRedirectRules(rules: RedirectRule[]): RedirectRule | null {
  if (!rules || rules.length === 0) return null;
  
  // Get current date and time
  const now = new Date();
  const currentHour = now.getHours();
  const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday
  const weekday = currentDay > 0 && currentDay < 6; // Monday-Friday
  const weekend = currentDay === 0 || currentDay === 6; // Saturday-Sunday
  
  // Get user's location (simplified - would need a proper geolocation service)
  const userLanguage = navigator.language;
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobile = /mobile|android|iphone|ipad|ipod/i.test(userAgent);
  const isDesktop = !isMobile;
  
  // Check each rule in priority order
  for (const rule of rules) {
    if (!rule.active) continue;
    
    let conditionMet = false;
    
    switch (rule.condition_type) {
      case 'time_of_day':
        // Time range like "9-17" (9 AM to 5 PM)
        if (rule.condition_value) {
          const [start, end] = rule.condition_value.split('-').map(Number);
          conditionMet = currentHour >= start && currentHour < end;
        }
        break;
        
      case 'day_of_week':
        // Check if current day matches the condition
        if (rule.condition_value === 'weekday') {
          conditionMet = weekday;
        } else if (rule.condition_value === 'weekend') {
          conditionMet = weekend;
        } else {
          // Specific day number (0-6)
          conditionMet = currentDay === parseInt(rule.condition_value);
        }
        break;
        
      case 'device_type':
        // Check device type
        if (rule.condition_value === 'mobile') {
          conditionMet = isMobile;
        } else if (rule.condition_value === 'desktop') {
          conditionMet = isDesktop;
        }
        break;
        
      case 'language':
        // Check browser language
        conditionMet = userLanguage.startsWith(rule.condition_value);
        break;
        
      case 'referrer':
        // Check referrer
        if (document.referrer) {
          conditionMet = document.referrer.includes(rule.condition_value);
        }
        break;
        
      case 'always':
        // Always redirect
        conditionMet = true;
        break;
        
      default:
        conditionMet = false;
    }
    
    if (conditionMet) {
      return rule;
    }
  }
  
  return null;
}