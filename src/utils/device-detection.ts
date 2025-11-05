/**
 * Utility functions for detecting device, browser, and OS information from user agent
 */

export interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop' | 'tv' | 'other';
  browser: string;
  browserVersion?: string;
  os: string;
  osVersion?: string;
}

/**
 * Detect device type from user agent string
 */
export function detectDeviceType(userAgent: string): 'mobile' | 'tablet' | 'desktop' | 'tv' | 'other' {
  if (!userAgent) return 'other';
  
  const ua = userAgent.toLowerCase();
  
  // Check for TV/Console devices first
  if (ua.includes('smart-tv') || ua.includes('smarttv') || 
      ua.includes('googletv') || ua.includes('appletv') || 
      ua.includes('playstation') || ua.includes('xbox') ||
      ua.includes('nintendo') || ua.includes('roku')) {
    return 'tv';
  }
  
  // Check for tablets
  if ((ua.includes('ipad') || 
       (ua.includes('android') && !ua.includes('mobile')) ||
       ua.includes('tablet') ||
       ua.includes('kindle') ||
       ua.includes('silk')) &&
      !ua.includes('mobile')) {
    return 'tablet';
  }
  
  // Check for mobile devices
  if (ua.includes('mobile') || 
      ua.includes('iphone') || 
      ua.includes('ipod') ||
      ua.includes('android') ||
      ua.includes('blackberry') ||
      ua.includes('windows phone')) {
    return 'mobile';
  }
  
  // Check for desktop
  if (ua.includes('windows') || 
      ua.includes('mac') || 
      ua.includes('linux') ||
      ua.includes('cros')) {
    return 'desktop';
  }
  
  return 'other';
}

/**
 * Detect browser from user agent string
 */
export function detectBrowser(userAgent: string): { name: string; version?: string } {
  if (!userAgent) return { name: 'Unknown' };
  
  const ua = userAgent.toLowerCase();
  
  // Edge
  if (ua.includes('edg/')) {
    const match = ua.match(/edg\/(\d+(\.\d+)?)/);
    return { name: 'Edge', version: match?.[1] };
  }
  
  // Opera
  if (ua.includes('opr/') || ua.includes('opera')) {
    const match = ua.match(/(?:opr|opera)\/(\d+(\.\d+)?)/);
    return { name: 'Opera', version: match?.[1] };
  }
  
  // Chrome
  if (ua.includes('chrome')) {
    const match = ua.match(/chrome\/(\d+(\.\d+)?)/);
    return { name: 'Chrome', version: match?.[1] };
  }
  
  // Safari
  if (ua.includes('safari') && !ua.includes('chrome')) {
    const match = ua.match(/version\/(\d+(\.\d+)?)/);
    return { name: 'Safari', version: match?.[1] };
  }
  
  // Firefox
  if (ua.includes('firefox')) {
    const match = ua.match(/firefox\/(\d+(\.\d+)?)/);
    return { name: 'Firefox', version: match?.[1] };
  }
  
  // Internet Explorer
  if (ua.includes('msie') || ua.includes('trident')) {
    const match = ua.match(/(?:msie |rv:)(\d+(\.\d+)?)/);
    return { name: 'Internet Explorer', version: match?.[1] };
  }
  
  return { name: 'Other' };
}

/**
 * Detect operating system from user agent string
 */
export function detectOS(userAgent: string): { name: string; version?: string } {
  if (!userAgent) return { name: 'Unknown' };
  
  const ua = userAgent.toLowerCase();
  
  // iOS
  if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) {
    const match = ua.match(/os (\d+)[._](\d+)/);
    if (match) {
      return { name: 'iOS', version: `${match[1]}.${match[2]}` };
    }
    return { name: 'iOS' };
  }
  
  // Android
  if (ua.includes('android')) {
    const match = ua.match(/android (\d+(\.\d+)?)/);
    return { name: 'Android', version: match?.[1] };
  }
  
  // Windows
  if (ua.includes('windows')) {
    if (ua.includes('windows nt 10.0')) return { name: 'Windows', version: '10' };
    if (ua.includes('windows nt 6.3')) return { name: 'Windows', version: '8.1' };
    if (ua.includes('windows nt 6.2')) return { name: 'Windows', version: '8' };
    if (ua.includes('windows nt 6.1')) return { name: 'Windows', version: '7' };
    return { name: 'Windows' };
  }
  
  // macOS
  if (ua.includes('mac os x')) {
    const match = ua.match(/mac os x (\d+)[._](\d+)/);
    if (match) {
      return { name: 'macOS', version: `${match[1]}.${match[2]}` };
    }
    return { name: 'macOS' };
  }
  
  // Linux
  if (ua.includes('linux')) {
    if (ua.includes('ubuntu')) return { name: 'Ubuntu' };
    if (ua.includes('debian')) return { name: 'Debian' };
    if (ua.includes('fedora')) return { name: 'Fedora' };
    if (ua.includes('centos')) return { name: 'CentOS' };
    return { name: 'Linux' };
  }
  
  // Chrome OS
  if (ua.includes('cros')) {
    return { name: 'Chrome OS' };
  }
  
  return { name: 'Unknown' };
}

/**
 * Get complete device information from user agent
 */
export function getDeviceInfo(userAgent: string): DeviceInfo {
  const browser = detectBrowser(userAgent);
  const os = detectOS(userAgent);
  
  return {
    type: detectDeviceType(userAgent),
    browser: browser.name,
    browserVersion: browser.version,
    os: os.name,
    osVersion: os.version,
  };
}

/**
 * Get location from IP address (placeholder - would need actual geolocation service)
 */
export async function getLocationFromIP(ipAddress: string): Promise<{ country?: string; city?: string }> {
  // In production, this would use a geolocation API service
  // For now, return a placeholder
  return {
    country: 'Unknown',
    city: 'Unknown'
  };
}
