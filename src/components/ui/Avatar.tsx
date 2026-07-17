import { getInitials } from '../../utils/format';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = { sm: 'w-8 h-8 text-[12px]', md: 'w-10 h-10 text-[14px]', lg: 'w-12 h-12 text-[16px]' };

export function Avatar({ src, name, size = 'md' }: AvatarProps) {
  if (src) {
    return (
      <div className={`${sizes[size]} rounded-full overflow-hidden border border-[#e3ddd0] shrink-0`}>
        <img src={src} alt={name} className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div className={`${sizes[size]} rounded-full bg-[rgba(42,157,127,0.13)] text-[#2a9d7f] flex items-center justify-center font-[600] shrink-0`}>
      {getInitials(name)}
    </div>
  );
}
