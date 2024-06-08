import { Inter } from "next/font/google";
import Provider from "@/providers/provider"
const inter = Inter({ subsets: ["latin"] });
;
export const metadata = {
  title: 'Home / Markdown Share',
  description: 'Alternative to codebins! Why share only code, when you can share markdown files with explanations along with code',
  keywords: ['markdown share', 'markdown', 'share', 'codebin', 'sourcebin', 'coding', 'blogging'],
  icons: {
    icon: '/assets/media/logo.png',
   
  },
  openGraph: {
    title: 'Markdown share',
    description: 'Alternative to codebins! Why share only code, when you can share markdown files with explanations along with code',
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
