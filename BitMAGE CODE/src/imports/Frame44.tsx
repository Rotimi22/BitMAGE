import { imgIconUserGroup, imgIconFeatherAdd, imgIconUser } from "./svg-hizma";

function IconUserGroup() {
  return (
    <div className="relative shrink-0 size-6" data-name="icon / user-group">
      <img className="block max-w-none size-full" src={imgIconUserGroup} />
    </div>
  );
}

function IconFeatherAdd() {
  return (
    <div className="relative shrink-0 size-6" data-name="icon / feather-add">
      <img className="block max-w-none size-full" src={imgIconFeatherAdd} />
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

function Frame42() {
  return (
    <div className="absolute content-stretch flex gap-9 items-center justify-start left-[33px] top-[25px]">
      <IconUserGroup />
      <IconFeatherAdd />
      <IconUser />
    </div>
  );
}

export default function Frame44() {
  return (
    <div className="relative size-full">
      <div className="absolute bg-[#334237] h-[74px] left-1/2 rounded-[16px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] top-0 translate-x-[-50%] w-[212px]" data-name="Container" />
      <Frame42 />
    </div>
  );
}