import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "@/lib/theme";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "PrepZo — AI Quiz Generation from PDFs" },
      { name: "description", content: "Turn any PDF into a timed mock test for JEE, NEET, or CBSE Boards in seconds." },
      { name: "author", content: "QuizForge" },
      { property: "og:title", content: "PrepZo — AI Quiz Generation from PDFs" },
      { property: "og:description", content: "Turn any PDF into a timed mock test for JEE, NEET, or CBSE Boards in seconds." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "PrepZo — AI Quiz Generation from PDFs" },
      { name: "twitter:description", content: "Turn any PDF into a timed mock test for JEE, NEET, or CBSE Boards in seconds." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/RmoGBLdFpSS5CeNOX8dR48sAk083/social-images/social-1779617748380-1000032816.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/RmoGBLdFpSS5CeNOX8dR48sAk083/social-images/social-1779617748380-1000032816.webp" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "icon",
        type: "image/svg+xml",
        href:
          "data:image/svg+xml;utf8," +
          encodeURIComponent(
            `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><defs><linearGradient id='b' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stop-color='%232A2A2D'/><stop offset='45%' stop-color='%230E0E10'/><stop offset='100%' stop-color='%23000000'/></linearGradient><linearGradient id='m' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stop-color='%23ffffff'/><stop offset='35%' stop-color='%23E6E8EC'/><stop offset='65%' stop-color='%23A8AEB8'/><stop offset='100%' stop-color='%23F4F5F7'/></linearGradient></defs><rect x='2' y='2' width='36' height='36' rx='10' fill='url(%23b)'/><path d='M13.5 29V11.4h8.1c3.55 0 5.95 2.25 5.95 5.6 0 3.35-2.4 5.6-5.95 5.6H17.6V29h-4.1zm4.1-9.55h3.45c1.55 0 2.55-.85 2.55-2.45s-1-2.45-2.55-2.45H17.6v4.9z' fill='url(%23m)'/><circle cx='28.5' cy='11' r='2.6' fill='%23ffffff'/></svg>`
          ),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Outlet />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
