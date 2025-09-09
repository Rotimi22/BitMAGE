import { imgIconUserGroup, imgIconUser } from "./svg-ynmbg";

interface Frame44Props {
  onLeaderboardClick?: () => void;
  onProfileClick?: () => void;
}

function IconUserGroup({ onClick }: { onClick?: () => void }) {
  return (
    <div className="relative shrink-0 size-6 cursor-pointer transition-transform hover:scale-110" data-name="icon / user-group" onClick={onClick}>
      <img className="block max-w-none size-full" src={imgIconUserGroup} />
    </div>
  );
}



function IconUser({ onClick }: { onClick?: () => void }) {
  return (
    <div className="relative shrink-0 size-6 cursor-pointer transition-transform hover:scale-110" data-name="icon / user" onClick={onClick}>
      <img className="block max-w-none size-full" src={imgIconUser} />
    </div>
  );
}

function Frame42({ onLeaderboardClick, onProfileClick }: { onLeaderboardClick?: () => void; onProfileClick?: () => void }) {
  return (
    <div className="absolute content-stretch flex gap-12 items-center justify-center left-1/2 top-[25px] transform -translate-x-1/2">
      <IconUserGroup onClick={onLeaderboardClick} />
      <IconUser onClick={onProfileClick} />
    </div>
  );
}

export default function Frame44({ onLeaderboardClick, onProfileClick }: Frame44Props) {
  return (
    <div className="relative size-full">
      <div className="absolute bg-[#334237] h-[74px] left-1/2 rounded-[16px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] top-0 translate-x-[-50%] w-[212px]" data-name="Container" />
      <Frame42 onLeaderboardClick={onLeaderboardClick} onProfileClick={onProfileClick} />
    </div>
  );
}