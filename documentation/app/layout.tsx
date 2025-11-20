import type { Metadata } from "next";
import { Banner, Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import { Footer, Layout, Navbar } from "nextra-theme-docs";
import "./globals.css";
import Image from "next/image";

export const metadata: Metadata = {
  title: "BetSwirl Documentation",
  description: "Explore BetSwirl's documentation",
};

const banner = (
  <Banner storageKey="affiliate-released">BetSwirl Affliate program is released 🎉</Banner>
);
const navbar = (
  <Navbar
    logo={
      <>
        <Image src="/logo.png" alt="BetSwirl" width={40} height={40} />
        <span style={{ marginLeft: ".4em", fontWeight: 800 }}>BetSwirl</span>
      </>
    }
    align="left"
    projectLink="https://github.com/BetSwirl/sdk"
    projectIcon={<Image src="/img/socials/github.svg" alt="github" width={24} height={24} />}
    chatLink="https://t.me/betswirl"
    chatIcon={<Image src="/img/socials/telegram.svg" alt="telegram" width={24} height={24} />}
  />
);
const footer = <Footer> {new Date().getFullYear()} ©BetSwirl.</Footer>;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      // Not required, but good for SEO
      lang="en"
      // Required to be set
      dir="ltr"
      // Suggested by `next-themes` package https://github.com/pacocoursey/next-themes#with-app
      suppressHydrationWarning
    >
      <Head
      // ... Your additional head options
      >
        {/* Your additional tags should be passed as `children` of `<Head>` element */}
      </Head>
      <body>
        <Layout
          banner={banner}
          navbar={navbar}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/BetSwirl/sdk/tree/main/documentation"
          footer={footer}
          sidebar={{
            defaultMenuCollapseLevel: 2,
            toggleButton: true,
            defaultOpen: true,
          }}
          // ... Your additional layout options
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}
