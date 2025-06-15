import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  {
    rel: "stylesheet",
    href: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css",
  },
  {
    rel: "stylesheet",
    href: "https://unpkg.com/aos@2.3.1/dist/aos.css",
  },
  { rel: "preload", href: "https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css", as: "style" },
  { rel: "dns-prefetch", href: "https://picsum.photos" },
  { rel: "dns-prefetch", href: "https://fonts.gstatic.com" },
  { rel: "dns-prefetch", href: "https://cdnjs.cloudflare.com" }
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#1e293b" />
        <meta name="description" content="Nginx performance tuning demonstration with React/Remix optimization showcase" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Nginx Performance Demo" />
        <Meta />
        <Links />
        <script dangerouslySetInnerHTML={{
          __html: `
            window.performance.mark('app-start');
            
            const observer = new PerformanceObserver((list) => {
              for (const entry of list.getEntries()) {
                if (entry.entryType === 'largest-contentful-paint') {
                  console.log('LCP:', entry.startTime);
                }
              }
            });
            try { observer.observe({entryTypes: ['largest-contentful-paint']}); } catch(e) {}
          `
        }} />
      </head>
      <body className="antialiased">
        {children}
        <ScrollRestoration />
        <Scripts />
        <script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
        <script dangerouslySetInnerHTML={{__html: `
          try { AOS.init({duration: 2000, once: false}); } catch(e) {}
          for(let i=0; i<10000; i++) { Math.random(); }
          window.performance.mark('app-end');
        `}} />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
