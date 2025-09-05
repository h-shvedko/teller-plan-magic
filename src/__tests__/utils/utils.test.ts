import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('utils', () => {
  describe('cn (className utility)', () => {
    it('should merge class names correctly', () => {
      const result = cn('px-2 py-1', 'bg-red-500');
      expect(result).toBe('px-2 py-1 bg-red-500');
    });

    it('should handle conditional class names', () => {
      const isActive = true;
      const isDisabled = false;
      
      const result = cn(
        'base-class',
        isActive && 'active-class',
        isDisabled && 'disabled-class'
      );
      
      expect(result).toBe('base-class active-class');
    });

    it('should handle conflicting Tailwind classes', () => {
      const result = cn('px-2', 'px-4');
      expect(result).toBe('px-4'); // Last one wins
    });

    it('should handle arrays of class names', () => {
      const result = cn(['px-2', 'py-1'], 'bg-blue-500');
      expect(result).toBe('px-2 py-1 bg-blue-500');
    });

    it('should handle empty inputs', () => {
      const result = cn();
      expect(result).toBe('');
    });

    it('should handle null and undefined values', () => {
      const result = cn('px-2', null, undefined, 'py-1');
      expect(result).toBe('px-2 py-1');
    });

    it('should handle objects with boolean values', () => {
      const result = cn({
        'text-red-500': true,
        'text-blue-500': false,
        'font-bold': true,
      });
      
      expect(result).toBe('text-red-500 font-bold');
    });

    it('should resolve conflicting responsive classes correctly', () => {
      const result = cn('sm:px-2', 'sm:px-4', 'md:px-6');
      expect(result).toBe('sm:px-4 md:px-6');
    });

    it('should handle complex combinations', () => {
      const variant = 'primary';
      const size = 'large';
      const disabled = false;
      
      const result = cn(
        'btn',
        {
          'btn-primary': variant === 'primary',
          'btn-secondary': variant === 'secondary',
          'btn-lg': size === 'large',
          'btn-sm': size === 'small',
          'opacity-50': disabled,
        },
        'transition-all duration-200'
      );
      
      expect(result).toBe('btn btn-primary btn-lg transition-all duration-200');
    });

    it('should handle string with multiple spaces', () => {
      const result = cn('  px-2    py-1  ', 'bg-red-500');
      expect(result).toBe('px-2 py-1 bg-red-500');
    });

    it('should work with modern Tailwind arbitrary values', () => {
      const result = cn('text-[#1a1a1a]', 'bg-[rgb(255,0,0)]');
      expect(result).toBe('text-[#1a1a1a] bg-[rgb(255,0,0)]');
    });
  });
});