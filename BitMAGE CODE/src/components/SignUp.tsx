import React, { useState } from 'react';
import { motion } from 'motion/react';
import { imgIconMail, imgIconUser, imgIconLock, imgVector1 } from "../imports/svg-ezsnz";
import { authService } from '../utils/auth';

function IconMail() {
  return (
    <div className="relative shrink-0 size-6" data-name="icon / mail">
      <img className="block max-w-none size-full" src={imgIconMail} />
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

function IconUser() {
  return (
    <div className="relative shrink-0 size-6" data-name="icon / user">
      <img className="block max-w-none size-full" src={imgIconUser} />
    </div>
  );
}

function Frame33({ isFocused, hasContent }: { isFocused: boolean; hasContent: boolean }) {
  return (
    <div className="absolute content-stretch flex gap-1 items-center justify-start left-9 top-[286px]">
      {/* Static Icon */}
      <div className="opacity-50">
        <IconUser />
      </div>
      {/* Dynamic Text */}
      <div className={`font-['Inter:Regular',_sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[14px] text-[rgba(255,255,255,0.5)] text-center text-nowrap transition-all duration-300 ease-out ${
        isFocused && !hasContent ? 'opacity-100 transform translate-y-0' : 
        hasContent ? 'opacity-0 transform translate-y-[-8px]' : 'opacity-50'
      }`}>
        <p className="leading-[normal] whitespace-pre">Username</p>
      </div>
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

function Frame34({ isFocused, hasContent }: { isFocused: boolean; hasContent: boolean }) {
  return (
    <div className="absolute content-stretch flex gap-1 items-center justify-start left-9 top-[345px]">
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

function IconLock1() {
  return (
    <div className="relative shrink-0 size-6" data-name="icon / lock">
      <img className="block max-w-none size-full" src={imgIconLock} />
    </div>
  );
}

function Frame35({ isFocused, hasContent }: { isFocused: boolean; hasContent: boolean }) {
  return (
    <div className="absolute content-stretch flex gap-1 items-center justify-start left-9 top-[404px]">
      {/* Static Icon */}
      <div className="opacity-50">
        <IconLock1 />
      </div>
      {/* Dynamic Text */}
      <div className={`font-['Inter:Regular',_sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[14px] text-[rgba(255,255,255,0.5)] text-center text-nowrap transition-all duration-300 ease-out ${
        isFocused && !hasContent ? 'opacity-100 transform translate-y-0' : 
        hasContent ? 'opacity-0 transform translate-y-[-8px]' : 'opacity-50'
      }`}>
        <p className="leading-[normal] whitespace-pre">Confirm password</p>
      </div>
    </div>
  );
}

interface SignUpProps {
  onSignUpSuccess: (userData: any) => void;
  onShowSignIn: () => void;
}

export default function SignUp({ onSignUpSuccess, onShowSignIn }: SignUpProps) {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [focusedField, setFocusedField] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.username || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (!agreedToTerms) {
      setError('Please agree to the Terms of Services and Privacy Policy');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await authService.signUp(
        formData.email,
        formData.username,
        formData.password
      );
      
      if (result.success) {
        onSignUpSuccess(result.user);
      } else {
        setError(result.error || 'Sign up failed');
      }
    } catch (error) {
      console.error('Sign up error:', error);
      setError('An error occurred during sign up');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      className="bg-[#111813] relative size-full min-h-screen overflow-y-auto"
      data-name="iPhone 16 Pro - 2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="absolute font-['Inter:Extra_Bold',_sans-serif] font-extrabold leading-[normal] not-italic text-[20px] text-center text-nowrap text-white top-[98px] translate-x-[-50%] whitespace-pre" style={{ left: "calc(50% + 0.5px)" }}>
        <p className="mb-0">Your prediction journey starts here</p>
        <p>Take the first step</p>
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
      
      {/* Username Input Field */}
      <div className="absolute bg-[#334237] h-[45px] left-[17px] rounded-[10px] top-[275px] w-[368px]" />
      <input
        type="text"
        value={formData.username}
        onChange={(e) => handleInputChange('username', e.target.value)}
        onFocus={() => setFocusedField('username')}
        onBlur={() => setFocusedField('')}
        className="absolute bg-transparent h-[45px] left-[17px] top-[275px] w-[368px] px-12 text-white text-[14px] font-['Inter:Regular',_sans-serif] placeholder:text-transparent focus:outline-none focus:ring-2 focus:ring-[#0bda43] focus:ring-opacity-50 rounded-[10px] transition-all duration-200"
        placeholder="Username"
        autoComplete="username"
      />
      
      {/* Password Input Field */}
      <div className="absolute bg-[#334237] h-[45px] left-[17px] rounded-[10px] top-[334px] w-[368px]" />
      <input
        type="password"
        value={formData.password}
        onChange={(e) => handleInputChange('password', e.target.value)}
        onFocus={() => setFocusedField('password')}
        onBlur={() => setFocusedField('')}
        className="absolute bg-transparent h-[45px] left-[17px] top-[334px] w-[368px] px-12 text-white text-[14px] font-['Inter:Regular',_sans-serif] placeholder:text-transparent focus:outline-none focus:ring-2 focus:ring-[#0bda43] focus:ring-opacity-50 rounded-[10px] transition-all duration-200"
        placeholder="Password"
        autoComplete="new-password"
      />
      
      {/* Confirm Password Input Field */}
      <div className="absolute bg-[#334237] h-[45px] left-[17px] rounded-[10px] top-[393px] w-[368px]" />
      <input
        type="password"
        value={formData.confirmPassword}
        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
        onFocus={() => setFocusedField('confirmPassword')}
        onBlur={() => setFocusedField('')}
        className="absolute bg-transparent h-[45px] left-[17px] top-[393px] w-[368px] px-12 text-white text-[14px] font-['Inter:Regular',_sans-serif] placeholder:text-transparent focus:outline-none focus:ring-2 focus:ring-[#0bda43] focus:ring-opacity-50 rounded-[10px] transition-all duration-200"
        placeholder="Confirm password"
        autoComplete="new-password"
      />
      
      {/* Sign Up Button */}
      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className="absolute bg-[#0bda43] h-[45px] left-[17px] rounded-[20px] top-[720px] w-[368px] hover:bg-[#0bc93d] focus:outline-none focus:ring-2 focus:ring-[#0bda43] focus:ring-opacity-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="absolute font-['Inter:Bold',_sans-serif] font-bold leading-[0] not-italic text-[#111813] text-[16px] text-center text-nowrap top-[14px] translate-x-[-50%]" style={{ left: "calc(33.333% + 67.5px)" }}>
          <p className="leading-[normal] whitespace-pre">{isLoading ? 'Signing up...' : 'Sign up'}</p>
        </div>
      </button>
      
      {/* Icon Frames with Dynamic Focus and Content States */}
      <Frame32 
        isFocused={focusedField === 'email'} 
        hasContent={formData.email.length > 0} 
      />
      <Frame33 
        isFocused={focusedField === 'username'} 
        hasContent={formData.username.length > 0} 
      />
      <Frame34 
        isFocused={focusedField === 'password'} 
        hasContent={formData.password.length > 0} 
      />
      <Frame35 
        isFocused={focusedField === 'confirmPassword'} 
        hasContent={formData.confirmPassword.length > 0} 
      />
      
      {/* Sign In Link */}
      <button
        onClick={onShowSignIn}
        className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[0] not-italic text-[14px] text-[rgba(255,255,255,0.5)] text-center text-nowrap top-[788px] translate-x-[-50%]"
        style={{ left: "calc(50% + 0.5px)" }}
      >
        <p className="leading-[normal] whitespace-pre">
          <span>{`Already have an account ? `}</span>
          <span className="[text-underline-position:from-font] decoration-solid font-['Inter:Bold',_sans-serif] font-bold not-italic text-white underline">Sign in.</span>
        </p>
      </button>
      
      {/* Decorative Vector */}
      <div className="absolute h-[8.647px] left-1/2 top-36 w-10">
        <div className="absolute inset-[-17.34%_-3.75%_-17.35%_-3.75%]">
          <img className="block max-w-none size-full" src={imgVector1} />
        </div>
      </div>
      
      {/* Terms Agreement */}
      <div className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[normal] not-italic text-[14px] text-[rgba(255,255,255,0.5)] text-nowrap top-[480px] whitespace-pre" style={{ left: "calc(41.667% - 119.5px)" }}>
        <p className="mb-0">
          <span>{`I agree to the `}</span>
          <span className="[text-underline-position:from-font] decoration-solid font-['Inter:Bold',_sans-serif] font-bold not-italic underline">Terms of Services</span>
          <span>{` and `}</span>
        </p>
        <p className="[text-decoration-skip-ink:none] [text-underline-position:from-font] decoration-solid font-['Inter:Bold',_sans-serif] font-bold underline">Privacy Policy.</p>
      </div>
      
      {/* Terms Checkbox */}
      <button
        onClick={() => setAgreedToTerms(!agreedToTerms)}
        className="absolute left-[17px] rounded-[5px] size-[19px] top-[488px] focus:outline-none focus:ring-2 focus:ring-[#0bda43] focus:ring-opacity-50 transition-all duration-200"
      >
        <div 
          className={`absolute inset-0 rounded-[5px] border border-solid transition-all duration-200 ${
            agreedToTerms 
              ? 'border-[#0bda43] bg-[#0bda43]' 
              : 'border-[rgba(255,255,255,0.5)] bg-transparent hover:border-white'
          }`}
        />
        {agreedToTerms && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <svg width="12" height="9" viewBox="0 0 12 9" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 4.5L4.5 8L11 1.5" stroke="#111813" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.div>
        )}
      </button>
      
      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute left-[17px] right-[17px] top-[670px] bg-[#f16f6f] text-white text-center py-2 px-4 rounded-lg text-sm"
        >
          {error}
        </motion.div>
      )}
    </motion.div>
  );
}