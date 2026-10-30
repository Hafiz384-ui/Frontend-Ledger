
"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex flex-col items-center justify-center min-h-screen text-center px-4 font-sans bg-background text-foreground">
        <h2 className="text-2xl font-bold text-destructive mb-2">Critical Application Error</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          A critical error occurred. Please try refreshing the page.
        </p>
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          Try again
        </button>
      </body>
    </html>
  );
}

