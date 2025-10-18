import { ReactNode } from 'react';

export default function BackOfficeLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Playball&family=Poppins:wght@400;500;600&family=Open+Sans:wght@400;600&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, fontFamily: "'Open Sans', sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
