/**
 * Streaming SSR with React 18 for optimized initial load
 */

import { renderToPipeableStream } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { ConcurrentApp } from '../components/ConcurrentApp';
import type { Response } from 'express';

interface StreamingOptions {
  bootstrapScripts?: string[];
  nonce?: string;
}

export function renderAppToStream(
  url: string,
  res: Response,
  options: StreamingOptions = {}
) {
  const { bootstrapScripts = ['/static/js/bundle.js'], nonce } = options;

  let didError = false;

  const stream = renderToPipeableStream(
    <StaticRouter location={url}>
      <ConcurrentApp />
    </StaticRouter>,
    {
      bootstrapScripts,
      nonce,
      onShellReady() {
        // The content above the Suspense boundaries is ready.
        // Start streaming the response.
        res.statusCode = didError ? 500 : 200;
        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Cache-Control', 'no-cache');
        
        // Start with the HTML shell
        res.write(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CMO - Centro de Monitoreo de Operaciones</title>
  <link rel="stylesheet" href="/static/css/main.css">
  ${nonce ? `<meta property="csp-nonce" content="${nonce}">` : ''}
  <script>
    // Hydration error prevention
    window.__REACT_HYDRATION_ERROR__ = false;
  </script>
</head>
<body>
  <div id="root">`);
        
        stream.pipe(res);
      },
      onShellError(error) {
        // Something went wrong with the shell
        console.error('Shell error:', error);
        res.statusCode = 500;
        res.send(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Error - CMO</title>
</head>
<body>
  <h1>500 - Error del Servidor</h1>
  <p>Lo sentimos, ha ocurrido un error al cargar la aplicación.</p>
</body>
</html>`);
      },
      onAllReady() {
        // All Suspense boundaries have resolved
        // Close the HTML
        res.write(`</div>
  <script ${nonce ? `nonce="${nonce}"` : ''}>
    // Performance metrics
    window.addEventListener('load', () => {
      const timing = performance.timing;
      const metrics = {
        ttfb: timing.responseStart - timing.navigationStart,
        domReady: timing.domContentLoadedEventEnd - timing.navigationStart,
        windowLoad: timing.loadEventEnd - timing.navigationStart
      };
      console.log('Performance Metrics:', metrics);
      
      // Send to analytics
      if (window.gtag) {
        window.gtag('event', 'timing_complete', {
          name: 'load',
          value: metrics.windowLoad
        });
      }
    });
  </script>
</body>
</html>`);
        res.end();
      },
      onError(error) {
        didError = true;
        console.error('Streaming error:', error);
      }
    }
  );

  // Abort the stream after 10 seconds
  setTimeout(() => {
    stream.abort();
  }, 10000);
}

// Express middleware
export function streamingSSRMiddleware(options: StreamingOptions = {}) {
  return (req: any, res: Response, next: any) => {
    // Only handle GET requests to app routes
    if (req.method !== 'GET' || req.path.startsWith('/api')) {
      return next();
    }

    try {
      renderAppToStream(req.url, res, options);
    } catch (error) {
      console.error('SSR error:', error);
      next(error);
    }
  };
}

// Selective hydration script
export const selectiveHydrationScript = `
<script>
  // Enable selective hydration for better interactivity
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      // Mark critical components for immediate hydration
      document.querySelectorAll('[data-priority="immediate"]').forEach(el => {
        el.setAttribute('data-hydrate', 'true');
      });
    });
  }

  // Intersection observer for lazy hydration
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.setAttribute('data-hydrate', 'true');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '50px' });

    document.addEventListener('DOMContentLoaded', () => {
      document.querySelectorAll('[data-priority="low"]').forEach(el => {
        observer.observe(el);
      });
    });
  }
</script>
`;