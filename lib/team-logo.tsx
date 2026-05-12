import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';

interface TeamLogoProps {
  team: {
    logo?: string;
    abbreviation: string;
    color: string;
  };
  size?: 'sm' | 'md' | 'lg';
}

export function TeamLogo({ team, size = 'md' }: TeamLogoProps) {
  const sizeClass = size === 'sm' ? 'h-8 w-8' : size === 'md' ? 'h-10 w-10' : 'h-16 w-16';
  
  return (
    <Avatar className={sizeClass}>
      <AvatarImage src={team.logo || '/placeholder-logo.svg'} alt={`${team.abbreviation} logo`} />
      <AvatarFallback 
        className="font-bold text-xs md:text-sm"
        style={{ backgroundColor: `${team.color}20`, color: team.color }}
      >
        {team.abbreviation.charAt(0)}
      </AvatarFallback>
    </Avatar>
  );
}
