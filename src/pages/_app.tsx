import type { AppProps } from 'next/app'
import theme from '../theme';
import { store } from '../store';
import { Provider } from 'react-redux';

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Head from 'next/head';
import Script from 'next/script';
import { GA_MEASUREMENT_ID, pageview } from '@/funcs/gtag';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

function MyApp({ Component, ...rest }: AppProps) {
  const router = useRouter();
  const title = "Calculadora de Salário - eQuantic Tech";
  const desc = "Cálculo de Salário para Contratos com/sem termo, Recibos Verdes ou Fatura como Empresa Unipessoal";
  const url = "https://salary-calculator.equantic.tech";
  const img = `${url}/logo.png`;

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      pageview(url);
    };

    router.events.on("routeChangeComplete", handleRouteChange);

    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);
  
  return (
    <>
      <Script strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} />
      <Script
        id='google-analytics'
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            page_path: window.location.pathname,
          });
        `,
        }}
      />
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <Head>
            <title>{title}</title>
            <meta name="title" content={title} />
            <meta name="description" content={desc} />

            <meta name="viewport" content="initial-scale=1, width=device-width" />

            <meta property="og:url" content={url} />
            <meta property="og:type" content="website" />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={desc} />
            <meta property="og:image" content={img} />

            <meta name="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={url} />
            <meta property="twitter:title" content={title} />
            <meta property="twitter:description" content={desc} />
            <meta property="twitter:image" content={img} />
          </Head>
          <main>
            <CssBaseline />
            <Component />
          </main>
        </ThemeProvider>
      </Provider>
    </>
  );
}

export default MyApp;