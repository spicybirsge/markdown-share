import { Inter } from "next/font/google";
import {Provider} from "@/providers/provider"
const inter = Inter({ subsets: ["latin"] });
;
export const metadata = {
  title: 'New / Markdown Share',
  description: 'Create a new share - Markdown Share',
  keywords: ['markdown share', 'markdown', 'share', 'new share', 'new markdown', 'coding', 'new readme'],
  icons: {
    icon: '/assets/media/logo.png',
   
  },
  openGraph: {
    title: 'New / Markdown Share',
    description: 'Create a new share - Markdown Share',
    site_name: 'Markdown share',
    images: [
      {
        url: '/assets/media/logo.png',
      },
    ],
  },

};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
