import { imgIconMail, imgIconUser, imgIconLock, imgVector1 } from "./svg-ezsnz";

function IconMail() {
  return (
    <div className="relative shrink-0 size-6" data-name="icon / mail">
      <img className="block max-w-none size-full" src={imgIconMail} />
    </div>
  );
}

function Frame32() {
  return (
    <div className="absolute content-stretch flex gap-1 items-center justify-start left-9 top-[227px]">
      <IconMail />
      <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[14px] text-[rgba(255,255,255,0.5)] text-center text-nowrap">
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

function Frame33() {
  return (
    <div className="absolute content-stretch flex gap-1 items-center justify-start left-9 top-[286px]">
      <IconUser />
      <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[14px] text-[rgba(255,255,255,0.5)] text-center text-nowrap">
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

function Frame34() {
  return (
    <div className="absolute content-stretch flex gap-1 items-center justify-start left-9 top-[345px]">
      <IconLock />
      <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[14px] text-[rgba(255,255,255,0.5)] text-center text-nowrap">
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

function Frame35() {
  return (
    <div className="absolute content-stretch flex gap-1 items-center justify-start left-9 top-[404px]">
      <IconLock1 />
      <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[14px] text-[rgba(255,255,255,0.5)] text-center text-nowrap">
        <p className="leading-[normal] whitespace-pre">Confirm password</p>
      </div>
    </div>
  );
}

export default function IPhone16Pro2() {
  return (
    <div className="bg-[#111813] relative size-full" data-name="iPhone 16 Pro - 2">
      <div className="absolute font-['Inter:Extra_Bold',_sans-serif] font-extrabold leading-[normal] not-italic text-[20px] text-center text-nowrap text-white top-[98px] translate-x-[-50%] whitespace-pre" style={{ left: "calc(50% + 0.5px)" }}>
        <p className="mb-0">Your prediction journey starts here</p>
        <p>Take the first step</p>
      </div>
      <div className="absolute bg-[#334237] h-[45px] left-[17px] rounded-[10px] top-[216px] w-[368px]" />
      <div className="absolute bg-[#334237] h-[45px] left-[17px] rounded-[10px] top-[275px] w-[368px]" />
      <div className="absolute bg-[#334237] h-[45px] left-[17px] rounded-[10px] top-[334px] w-[368px]" />
      <div className="absolute bg-[#334237] h-[45px] left-[17px] rounded-[10px] top-[393px] w-[368px]" />
      <div className="absolute bg-[#0bda43] h-[45px] left-[17px] rounded-[20px] top-[720px] w-[368px]" />
      <Frame32 />
      <Frame33 />
      <Frame34 />
      <Frame35 />
      <div className="absolute font-['Inter:Regular',_sans-serif] font-normal leading-[0] not-italic text-[14px] text-[rgba(255,255,255,0.5)] text-center text-nowrap top-[788px] translate-x-[-50%]" style={{ left: "calc(50% + 0.5px)" }}>
        <p className="leading-[normal] whitespace-pre">
          <span>{`Already have an account ? `}</span>
          <span className="[text-underline-position:from-font] decoration-solid font-['Inter:Bold',_sans-serif] font-bold not-italic text-white underline">Sign in.</span>
        </p>
      </div>
      <div className="absolute h-[8.647px] left-1/2 top-36 w-10">
        <div className="absolute inset-[-17.34%_-3.75%_-17.35%_-3.75%]">
          <img className="block max-w-none size-full" src={imgVector1} />
        </div>
      </div>
      <div className="absolute font-['Inter:Bold',_sans-serif] font-bold leading-[0] not-italic text-[#111813] text-[16px] text-center text-nowrap top-[733px] translate-x-[-50%]" style={{ left: "calc(33.333% + 67.5px)" }}>
        <p className="leading-[normal] whitespace-pre">Sign up</p>
      </div>
      <div className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[normal] not-italic text-[14px] text-[rgba(255,255,255,0.5)] text-nowrap top-[480px] whitespace-pre" style={{ left: "calc(41.667% - 119.5px)" }}>
        <p className="mb-0">
          <span>{`I agree to the `}</span>
          <span className="[text-underline-position:from-font] decoration-solid font-['Inter:Bold',_sans-serif] font-bold not-italic underline">Terms of Services</span>
          <span>{` and `}</span>
        </p>
        <p className="[text-decoration-skip-ink:none] [text-underline-position:from-font] decoration-solid font-['Inter:Bold',_sans-serif] font-bold underline">Privacy Policy.</p>
      </div>
      <div className="absolute left-[17px] rounded-[5px] size-[19px] top-[488px]">
        <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.5)] border-solid inset-0 pointer-events-none rounded-[5px]" />
      </div>
    </div>
  );
}