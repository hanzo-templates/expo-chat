import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

/** The document shell for the web target. expo-router renders every static
 *  route inside this, so the title, viewport and pre-hydration background live
 *  here once instead of in each page. Native ignores this file entirely. */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />
        <meta name="theme-color" content="#0a0a0b" />
        {/* Stops the body scrolling twice on web; expo-router ships it for this. */}
        <ScrollViewStyleReset />
        {/* Paint the app background before hydration so there is no white flash. */}
        <style dangerouslySetInnerHTML={{ __html: `html,body{background:#0a0a0b}` }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
