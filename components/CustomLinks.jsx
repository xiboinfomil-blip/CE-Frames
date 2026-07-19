'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

const CustomLink = ({ href, children, ...props }) => {
  const searchParams = useSearchParams();
  const forParam = searchParams?.get('for');

  let modifiedHref = '/';

  if (typeof href === 'object' && href !== null) {
    // Handle object case: { pathname, query }
    const { pathname, query } = href;
    const params = new URLSearchParams(query);

    if (forParam && !params.get('for')) {
      params.set('for', forParam);
    }

    modifiedHref = `${pathname}?${params.toString()}`;
  } else if (typeof href === 'string') {
    // Handle string case
    modifiedHref = href || '/';
    const hasQuery = modifiedHref.includes('?');
    const hasForParam = modifiedHref.includes('for=');

    if (forParam && !hasForParam) {
      modifiedHref += `${hasQuery ? '&' : '?'}for=${encodeURIComponent(forParam)}`;
    }
  }

  return (
    <Link href={modifiedHref} {...props}>
      {children}
    </Link>
  );
};

const GetForValue = () => {
  const searchParams = useSearchParams();
  return searchParams.get('for');
};

export default CustomLink;
export { GetForValue };

