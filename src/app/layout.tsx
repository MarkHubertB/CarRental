import type { Metadata } from "next";
import { Bebas_Neue, DM_Sans, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const siteUrl = "https://example.com";
const businessName = "My website";
const businessDescription =
  "My website offers car rental Bohol, van rental with driver, Panglao car hire, and private transport services in Dauis, Bohol, Philippines for airport transfers, island tours, and custom travel needs.";

const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const dmSerif = DM_Serif_Display({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-dm-serif",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    template: "%s | My website",
    default: "Car Rental Bohol | My website",
  },
  description: businessDescription,
  keywords: [
    "car rental Bohol",
    "Bohol car rental",
    "van rental with driver Bohol",
    "van rental with driver",
    "Panglao car hire",
    "Panglao car rental",
    "car rental Dauis",
    "Dauis car rental",
    "vehicle rental Philippines",
    "Bohol travel tours",
    "Bohol van rental",
    "airport car rental Bohol",
    "tourist car rental",
    "self-drive car rental",
    "van rental Philippines",
    "private driver Bohol",
    "Bohol transport service",
  ],
  openGraph: {
    title: "Car Rental Bohol | My website",
    description: businessDescription,
    url: siteUrl,
    siteName: businessName,
    locale: "en_PH",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "My website car rental service in Bohol",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    noimageindex: false,
    googleBot: {
      index: true,
      follow: true,
      nocache: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
};

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: businessName,
  description: businessDescription,
  url: siteUrl,
  areaServed: ["Dauis", "Panglao", "Tagbilaran City", "Bohol", "Philippines"],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Dauis",
    addressRegion: "Bohol",
    addressCountry: "PH",
  },
  serviceType: [
    "Car rental Bohol",
    "Van rental with driver",
    "Panglao car hire",
    "Private travel and tours",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessJsonLd).replace(
              /</g,
              "\\u003c",
            ),
          }}
        />
      </head>
      <body
        className={`${bebas.variable} ${dmSans.variable} ${dmSerif.variable} font-dm bg-dark text-amber-50 antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
