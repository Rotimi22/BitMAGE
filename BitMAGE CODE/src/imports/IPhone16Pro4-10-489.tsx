import { imgIconCandlesV, imgIconCandlesV1 } from "./svg-21o4y";

function IconCandlesV() {
  return (
    <div className="absolute size-6 top-[403px]" data-name="icon / candles-v" style={{ left: "calc(16.667% + 30px)" }}>
      <img className="block max-w-none size-full" src={imgIconCandlesV} />
    </div>
  );
}

function IconCandlesV1() {
  return (
    <div className="absolute size-6 top-[379px]" data-name="icon / candles-v" style={{ left: "calc(66.667% + 2px)" }}>
      <img className="block max-w-none size-full" src={imgIconCandlesV1} />
    </div>
  );
}

function Frame37() {
  return (
    <div className="box-border content-stretch flex gap-2.5 items-center justify-center p-[10px] relative shrink-0">
      <div className="font-['Inter:Extra_Bold',_sans-serif] font-extrabold leading-[0] not-italic relative shrink-0 text-[32px] text-center text-nowrap text-white">
        <p className="leading-[normal] whitespace-pre">
          Bit<span className="text-[#0bda43]">MAGE</span>
        </p>
      </div>
    </div>
  );
}

function Frame36() {
  return (
    <div className="relative shrink-0 w-full">
      <div className="flex flex-row items-center justify-center relative size-full">
        <div className="box-border content-stretch flex gap-2.5 items-center justify-center p-[10px] relative w-full">
          <div className="font-['Inter:Regular',_sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[12px] text-[rgba(255,255,255,0.5)] text-center text-nowrap whitespace-pre">
            <p className="mb-0">Step into the world of crypto trading without risk,</p>
            <p>{`test your instincts and climb the leaderboard.  `}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame38() {
  return (
    <div className="absolute content-stretch flex flex-col gap-1 items-center justify-start left-0 top-[427px] w-[402px]">
      <Frame37 />
      <Frame36 />
    </div>
  );
}

export default function IPhone16Pro4() {
  return (
    <div className="bg-[#111813] relative size-full" data-name="iPhone 16 Pro - 4">
      <div className="absolute bg-[#111813] blur-[0px] filter h-[547px] left-[-5px] top-[327px] w-[402px]" />
      <IconCandlesV />
      <IconCandlesV1 />
      <Frame38 />
    </div>
  );
}