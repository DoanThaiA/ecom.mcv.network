'use client';

import Error from 'next/error';

// This page renders when a user requests a page that doesn't
// match any locale (e.g. `/unknown.txt`)
export default function NotFound() {
  return (
    <html lang="en">
      <body>
        <Error statusCode={404} />
      </body>
    </html>
  );
}
