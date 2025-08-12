import DOMPurify from 'dompurify';

// Sanitize user input to prevent XSS attacks
export const sanitizeInput = (input: string): string => {
  // Further enhance sanitization by removing potentially dangerous characters
  const cleanInput = input.replace(/[<>"'`]/g, '');
  return DOMPurify.sanitize(cleanInput, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
};

// Validate email format
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254;
};

// Validate phone number (Chilean format)
export const validatePhone = (phone: string): boolean => {
  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Chilean phone patterns:
  // Mobile: +56 9 XXXX XXXX (9 digits after country code)
  // Landline: +56 X XXXX XXXX (8-9 digits after area code)
  const mobileRegex = /^(?:\+?56)?9\d{8}$/;
  const landlineRegex = /^(?:\+?56)?[2-9]\d{7,8}$/;
  
  return mobileRegex.test(cleanPhone) || landlineRegex.test(cleanPhone);
};

// Validate name (only letters, spaces, hyphens, apostrophes, and allow accented characters)
export const validateName = (name: string): boolean => {
  const nameRegex = /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s\-']{2,50}$/;
  return nameRegex.test(name);
};

// Rate limiting for form submissions
class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  private readonly maxAttempts = 5; // Increased attempts
  private readonly timeWindow = 300000; // 5 minutes (300 seconds)

  public isAllowed(identifier: string): boolean {
    const now = Date.now();
    const userAttempts = this.attempts.get(identifier) || [];
    
    // Remove old attempts outside the time window
    const recentAttempts = userAttempts.filter(
      timestamp => now - timestamp < this.timeWindow
    );
    
    // Update the attempts for this identifier
    this.attempts.set(identifier, recentAttempts);
    
    // Check if user has exceeded the limit
    if (recentAttempts.length >= this.maxAttempts) {
      return false;
    }
    
    // Add current attempt
    recentAttempts.push(now);
    this.attempts.set(identifier, recentAttempts);
    
    return true;
  }

  public getRemainingTime(identifier: string): number {
    const userAttempts = this.attempts.get(identifier) || [];
    if (userAttempts.length === 0) return 0;
    
    const oldestAttempt = Math.min(...userAttempts);
    const timeLeft = this.timeWindow - (Date.now() - oldestAttempt);
    
    return Math.max(0, Math.ceil(timeLeft / 1000));
  }
}

export const formRateLimiter = new RateLimiter();

// Generate a simple fingerprint for rate limiting
export const generateFingerprint = (): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Rate limiting fingerprint', 2, 2);
  }
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL(),
    // Add more entropy for better fingerprinting
    window.screen.colorDepth,
    window.screen.pixelDepth,
    navigator.hardwareConcurrency,
    navigator.platform
  ].join('|');
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString();
};

