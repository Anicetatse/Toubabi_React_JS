import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Preloader } from "@/components/Preloader";

export const metadata: Metadata = {
  title: "Toubabi - Plateforme Immobilière en Côte d'Ivoire",
  description: "Trouvez votre bien immobilier idéal en Côte d'Ivoire. Achat, vente, location de terrains, maisons, appartements et locaux commerciaux.",
  keywords: "toubabi,civ,immobilier,côte d'ivoire,terrain,maison,appartement,achat,vente,location",
  authors: [{ name: "toubabi Team" }],
  robots: "INDEX,FOLLOW",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link href="https://fonts.cdnfonts.com/css/arkhip" rel="stylesheet" />
        <link rel="stylesheet" href="/assets/css/colors.css" />
        <link rel="stylesheet" href="/assets/css/styles.css" />
        <link rel="icon" type="image/png" sizes="32x32" href="/assets/images/favicon/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/assets/images/favicon/favicon-16x16.png" />
        {/* Mapbox GL JS CSS - Version 2.5.1 comme le PHP */}
        <link href="https://api.mapbox.com/mapbox-gl-js/v2.5.1/mapbox-gl.css" rel="stylesheet" />
        {/* Mapbox GL JS Script */}
        <script src="https://api.mapbox.com/mapbox-gl-js/v2.5.1/mapbox-gl.js" async></script>
      </head>
      <body className="blue-skin">
        {/* Preloader */}
        <div id="preloader">
          <div className="preloader">
            <span></span>
            <span></span>
          </div>
        </div>
        
        <div id="main-wrapper">
          <Preloader />
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
