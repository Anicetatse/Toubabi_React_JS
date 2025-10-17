'use client';

import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface WishlistButtonProps {
  produitCode: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'icon-sm' | 'icon-lg';
  className?: string;
  showText?: boolean;
}

export function WishlistButton({
  produitCode,
  variant = 'secondary',
  size = 'icon',
  className,
  showText = false,
}: WishlistButtonProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { isInWishlist, toggleWishlist, isToggling } = useWishlist();
  
  const isFavorite = isInWishlist(produitCode);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }
    
    toggleWishlist(produitCode);
  };

  return (
    <Button
      variant={variant}
      size={showText ? 'default' : size}
      onClick={handleClick}
      disabled={isToggling}
      className={cn(
        'transition-all',
        // Style par défaut pour les petits boutons (sans texte)
        !showText && isFavorite && 'text-red-600 hover:text-red-700',
        // Style pour les boutons avec texte quand en favoris
        showText && isFavorite && '!bg-red-600 !text-white hover:!bg-red-700 !border-red-600',
        // Style pour les boutons avec texte quand PAS en favoris
        showText && !isFavorite && '!bg-transparent',
        className
      )}
      title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
    >
      <Heart 
        className={cn(
          'w-5 h-5',
          isFavorite && !showText && 'fill-red-600',
          isFavorite && showText && 'fill-white',
          !isFavorite && 'fill-transparent'
        )} 
      />
      {showText && <span>{isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}</span>}
    </Button>
  );
}

