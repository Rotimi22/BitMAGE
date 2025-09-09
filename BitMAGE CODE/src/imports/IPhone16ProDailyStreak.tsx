import { imgIconGem, imgFrame22, imgFrame30, imgIconChevronDown } from "./svg-mnms2";

function Frame17() {
  return <div className="h-[35px] shrink-0 w-[70px]" />;
}

function Frame18() {
  return (
    <div className="absolute box-border content-stretch flex gap-1 items-center justify-start left-0 pl-1.5 pr-0 py-0 top-[77px] w-[109px]">
      <Frame17 />
    </div>
  );
}

function IconGem() {
  return (
    <div className="absolute size-6 top-[113px]" data-name="icon / gem" style={{ left: "calc(33.333% + 32px)" }}>
      <img className="block max-w-none size-full" src={imgIconGem} />
    </div>
  );
}

function Frame20() {
  return (
    <div className="absolute box-border content-stretch flex gap-2.5 h-[45px] items-center justify-end p-[10px] top-[102px] translate-x-[-50%] w-[166px]" style={{ left: "calc(25% - 17.5px)" }}>
      <div className="font-['Inter:Bold',_sans-serif] font-bold leading-[0] not-italic relative shrink-0 text-[24px] text-center text-nowrap text-white">
        <p className="leading-[normal] whitespace-pre">Daily Streak</p>
      </div>
    </div>
  );
}

function Frame22() {
  return (
    <div className="absolute left-5 size-[55px] top-[185px]">
      <img className="block max-w-none size-full" src={imgFrame22} />
    </div>
  );
}

function Frame23() {
  return (
    <div className="box-border content-stretch flex gap-2.5 items-center justify-center p-[10px] relative shrink-0">
      <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[14px] text-[rgba(246,246,246,0.5)] text-center text-nowrap">
        <p className="leading-[normal] whitespace-pre">Day 1</p>
      </div>
    </div>
  );
}

function Frame24() {
  return (
    <div className="box-border content-stretch flex gap-2.5 items-center justify-center p-[10px] relative shrink-0">
      <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[14px] text-[rgba(246,246,246,0.5)] text-center text-nowrap">
        <p className="leading-[normal] whitespace-pre">Day 2</p>
      </div>
    </div>
  );
}

function Frame25() {
  return (
    <div className="box-border content-stretch flex gap-2.5 items-center justify-center p-[10px] relative shrink-0">
      <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[#f6f6f6] text-[14px] text-center text-nowrap">
        <p className="leading-[normal] whitespace-pre">Day 3</p>
      </div>
    </div>
  );
}

function Frame26() {
  return (
    <div className="box-border content-stretch flex gap-2.5 items-center justify-center p-[10px] relative shrink-0">
      <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[14px] text-[rgba(246,246,246,0.5)] text-center text-nowrap">
        <p className="leading-[normal] whitespace-pre">Day 4</p>
      </div>
    </div>
  );
}

function Frame27() {
  return (
    <div className="box-border content-stretch flex gap-2.5 items-center justify-center p-[10px] relative shrink-0">
      <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[14px] text-[rgba(246,246,246,0.5)] text-center text-nowrap">
        <p className="leading-[normal] whitespace-pre">Day 5</p>
      </div>
    </div>
  );
}

function Frame28() {
  return (
    <div className="box-border content-stretch flex gap-2.5 items-center justify-center p-[10px] relative shrink-0">
      <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[0] not-italic relative shrink-0 text-[14px] text-[rgba(246,246,246,0.5)] text-center text-nowrap">
        <p className="leading-[normal] whitespace-pre">Day 6</p>
      </div>
    </div>
  );
}

function Frame32() {
  return (
    <div className="absolute content-stretch flex h-[37px] items-center justify-center left-[17px] top-[284px] w-[359px]">
      <Frame23 />
      <Frame24 />
      <Frame25 />
      <Frame26 />
      <Frame27 />
      <Frame28 />
    </div>
  );
}

function Frame29() {
  return (
    <div className="absolute box-border content-stretch flex gap-[25px] items-center justify-center px-6 py-2.5 top-48 w-[127px]" style={{ left: "calc(66.667% - 10px)" }}>
      <div className="font-['Inter:Semi_Bold',_sans-serif] font-semibold leading-[0] not-italic relative shrink-0 text-[20px] text-center text-nowrap text-white">
        <p className="leading-[normal] whitespace-pre">+500pts</p>
      </div>
    </div>
  );
}

function Frame30() {
  return (
    <div className="absolute h-11 left-0 top-0 w-[51px]">
      <img className="block max-w-none size-full" src={imgFrame30} />
    </div>
  );
}

function IconChevronDown() {
  return (
    <div className="h-[13px] relative w-3.5" data-name="icon / chevron-down">
      <img className="block max-w-none size-full" src={imgIconChevronDown} />
    </div>
  );
}

function Frame31() {
  return (
    <div className="absolute h-11 left-0 top-[43px] w-[51px]">
      <Frame30 />
      <div className="absolute flex h-[14px] items-center justify-center left-[22px] top-[15px] w-[13px]">
        <div className="flex-none rotate-[270deg] scale-y-[-100%]">
          <IconChevronDown />
        </div>
      </div>
    </div>
  );
}

export default function IPhone16ProDailyStreak() {
  return (
    <div className="bg-[#111813] relative size-full" data-name="iPhone 16 Pro - Daily streak">
      <div className="absolute bg-[#1c271f] h-[188px] left-[17px] rounded-[10px] top-[162px] w-[368px]" />
      <Frame18 />
      <IconGem />
      <Frame20 />
      <Frame22 />
      <div className="absolute font-['Inter:Bold',_sans-serif] font-bold leading-[0] not-italic text-[20px] text-center text-nowrap text-white top-[190px] translate-x-[-50%]" style={{ left: "calc(16.667% + 33px)" }}>
        <p className="leading-[normal] whitespace-pre">Day 3</p>
      </div>
      <div className="absolute font-['Inter:Medium',_sans-serif] font-medium leading-[0] not-italic text-[14px] text-center text-nowrap text-white top-[219px] translate-x-[-50%]" style={{ left: "calc(16.667% + 58.5px)" }}>
        <p className="leading-[normal] whitespace-pre">You are on a roll</p>
      </div>
      <div className="absolute bg-gray-700 h-[9px] left-[30px] rounded-[8px] top-[270px] w-[333px]" />
      <div className="absolute bg-[#0bda43] h-[9px] left-[30px] rounded-[8px] top-[270px] w-[137px]" />
      <Frame32 />
      <Frame29 />
      <Frame31 />
    </div>
  );
}