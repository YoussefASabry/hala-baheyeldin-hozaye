'use client';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function ScrollToTop() {
  const pathname = usePathname();
  useEffect(() => {
    const wrapper = document.querySelector('.wrapper');
    if (wrapper) wrapper.scrollTop = 0;
  }, [pathname]);
  return null;
}
