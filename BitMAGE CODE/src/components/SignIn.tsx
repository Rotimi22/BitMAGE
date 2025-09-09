import React, { useState } from 'react';
import { motion } from 'motion/react';
import { imgIconMail, imgIconLock, imgVector1 } from "../imports/svg-q0opp";
import { authService } from '../utils/auth';

function IconMail() {
  return (
    <div className="relative shrink-0 size-6" data-name="icon / mail">
      <img className="block max-w-none size-full" src={imgIconMail} />
    </div>
  );
}

function IconLock() {
  return (
    <div className="relative shrink-0 size-6" data-name="icon / lock">
      <img className="block max-w-none size-full" src={imgIconLock} />
    </div>
  );
}

function Frame32({ isFocused, hasContent }: { isFocused: boolean; hasContent: boolean }) {
  return (
    <div className="absolute content-stretch flex gap-1 items-center justify-start left-9 top-[227px]">
      {/* Static Icon */}
      <div className="opacity-50">
        <IconMail />
      </div>
      {/* Dynamic Text */}
      <div className={`font-['Inter:Regular',_sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[14px] text-[rgba(255,255,255,0.5)] text-center text-nowrap transition-all duration-300 ease-out ${
        isFocused && !hasContent ? 'opacity-100 transform translate-y-0' : 
        hasContent ? 'opacity-0 transform translate-y-[-8px]' : 'opacity-50'
      }`}>
        <p className="leading-[normal] whitespace-pre">E-mail</p>
      </div>
    </div>
  );
}

function Frame33({ isFocused, hasContent }: { isFocused: boolean; hasContent: boolean }) {
  return (
    <div className="absolute content-stretch flex gap-1 items-center justify-start left-9 top-[286px]">
      {/* Static Icon */}
      <div className="opacity-50">
        <IconLock />
      </div>
      {/* Dynamic Text */}
      <div className={`font-['Inter:Regular',_sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[14px] text-[rgba(255,255,255,0.5)] text-center text-nowrap transition-all duration-300 ease-out ${
        isFocused && !hasContent ? 'opacity-100 transform translate-y-0' : 
        hasContent ? 'opacity-0 transform translate-y-[-8px]' : 'opacity-50'
      }`}>
        <p className="leading-[normal] whitespace-pre">Password</p>
      </div>
    </div>
  );
}

interface SignInProps {
  onSignInSuccess: (userData: any) => void;
  onShowSignUp: () => void;
}

export default function SignIn({ onSignInSuccess, onShowSignUp }: SignInProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [focusedField, setFocusedField] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleDemoAccount = async () => {
    setIsLoading(true);
    setError('');
    
    // Generate a unique demo user
    const timestamp = Date.now();
    const demoEmail = `demo${timestamp}@cryptopredict.demo`;
    const demoUsername = `demo_user_${timestamp}`;
    const demoPassword = 'demo123456';
    
    try {
      // First try to sign up the demo account
      const signUpResult = await authService.signUp(demoEmail, demoUsername, demoPassword);
      
      if (signUpResult.success) {
        onSignInSuccess(signUpResult.user);
      } else {
        setError('Failed to create demo account. Please try again.');
      }
    } catch (error) {
      console.error('Demo account error:', error);
      setError('Failed to create demo account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await authService.signIn(formData.email, formData.password);
      
      if (result.access_token && result.user) {
        onSignInSuccess(result.user);
      } else {
        setError('Sign in failed. Please try again.');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      
      // Handle specific error messages
      let errorMessage = 'An error occurred during sign in';
      
      if (error.message.includes('Invalid email or password') || error.message.includes('Authentication failed')) {
        errorMessage = 'Invalid email or password. If you don\'t have an account yet, please sign up first.';
      } else if (error.message.includes('User profile not found')) {
        errorMessage = 'Account not found. Please sign up to create your account.';
      } else if (error.message.includes('Network error') || error.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message.includes('HTTP 500')) {
        errorMessage = 'Server error. Please try again in a moment.';
      }
      
      // Also log the full error for debugging  
      console.error('Full signin error details:', {
        message: error.message,
        stack: error.stack,
        email: formData.email
      });
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      className="bg-[#111813] relative size-full min-h-screen overflow-y-auto"
      data-name="iPhone 16 Pro - SignIn"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="absolute font-['Inter:Extra_Bold',_sans-serif] font-extrabold leading-[normal] not-italic text-[20px] text-center text-nowrap text-white top-[98px] translate-x-[-50%] whitespace-pre" style={{ left: "calc(50% + 0.5px)" }}>
        <p className="mb-0">Welcome back!</p>
        <p>Ready to predict?</p>
      </div>
      
      {/* Email Input Field */}
      <div className="absolute bg-[#334237] h-[45px] left-[17px] rounded-[10px] top-[216px] w-[368px]" />
      <input
        type="email"
        value={formData.email}
        onChange={(e) => handleInputChange('email', e.target.value)}
        onFocus={() => setFocusedField('email')}
        onBlur={() => setFocusedField('')}
        className="absolute bg-transparent h-[45px] left-[17px] top-[216px] w-[368px] px-12 text-white text-[14px] font-['Inter:Regular',_sans-serif] placeholder:text-transparent focus:outline-none focus:ring-2 focus:ring-[#0bda43] focus:ring-opacity-50 rounded-[10px] transition-all duration-200"
        placeholder="E-mail"
        autoComplete="email"
      />
      
      {/* Password Input Field */}
      <div className="absolute bg-[#334237] h-[45px] left-[17px] rounded-[10px] top-[275px] w-[368px]" />
      <input
        type="password"
        value={formData.password}
        onChange={(e) => handleInputChange('password', e.target.value)}
        onFocus={() => setFocusedField('password')}
        onBlur={() => setFocusedField('')}
        className="absolute bg-transparent h-[45px] left-[17px] top-[275px] w-[368px] px-12 text-white text-[14px] font-['Inter:Regular',_sans-serif] placeholder:text-transparent focus:outline-none focus:ring-2 focus:ring-[#0bda43] focus:ring-opacity-50 rounded-[10px] transition-all duration-200"
        placeholder="Password"
        autoComplete="current-password"
      />
      
      {/* Sign In Button */}
      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className="absolute bg-[#0bda43] h-[45px] left-[17px] rounded-[20px] top-[380px] w-[368px] hover:bg-[#0bc93d] focus:outline-none focus:ring-2 focus:ring-[#0bda43] focus:ring-opacity-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="absolute font-['Inter:Bold',_sans-serif] font-bold leading-[0] not-italic text-[#111813] text-[16px] text-center text-nowrap top-[14px] translate-x-[-50%]" style={{ left: "calc(33.333% + 67.5px)" }}>
          <p className="leading-[normal] whitespace-pre">{isLoading ? 'Signing in...' : 'Sign in'}</p>
        </div>
      </button>
      
      {/* Demo Account Button */}
      <button
        onClick={handleDemoAccount}
        disabled={isLoading}
        className="absolute bg-[#334237] h-[40px] left-[17px] rounded-[15px] top-[440px] w-[368px] hover:bg-[#3d4d41] focus:outline-none focus:ring-2 focus:ring-[#0bda43] focus:ring-opacity-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-[#4a5c4f]"
      >
        <div className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[0] not-italic text-[rgba(255,255,255,0.8)] text-[14px] text-center text-nowrap top-[12px] translate-x-[-50%]" style={{ left: "calc(33.333% + 67.5px)" }}>
          <p className="leading-[normal] whitespace-pre">{isLoading ? 'Creating demo...' : 'Try Demo Account'}</p>
        </div>
      </button>
      
      {/* Icon Frames with Dynamic Focus and Content States */}
      <Frame32 
        isFocused={focusedField === 'email'} 
        hasContent={formData.email.length > 0} 
      />
      <Frame33 
        isFocused={focusedField === 'password'} 
        hasContent={formData.password.length > 0} 
      />
      
      {/* Sign Up Link */}
      <button
        onClick={onShowSignUp}
        className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[0] not-italic text-[14px] text-[rgba(255,255,255,0.5)] text-center text-nowrap top-[500px] translate-x-[-50%]"
        style={{ left: "calc(50% + 0.5px)" }}
      >
        <p className="leading-[normal] whitespace-pre">
          <span>{`Don't have an account ? `}</span>
          <span className="[text-underline-position:from-font] decoration-solid font-['Inter:Bold',_sans-serif] font-bold not-italic text-white underline">Sign up.</span>
        </p>
      </button>
      
      {/* Decorative Vector */}
      <div className="absolute h-[8.647px] left-1/2 top-36 w-10">
        <div className="absolute inset-[-17.34%_-3.75%_-17.35%_-3.75%]">
          <img className="block max-w-none size-full" src={imgVector1} />
        </div>
      </div>
      
      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute left-[17px] right-[17px] top-[330px] bg-[#f16f6f] text-white text-center py-2 px-4 rounded-lg text-sm"
        >
          {error}
        </motion.div>
      )}
    </motion.div>
  );
}