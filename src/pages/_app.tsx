import type { AppProps } from 'next/app'
import theme from '../theme';

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Head from 'next/head';

function MyApp({ Component, ...rest }: AppProps) {

  return (
    <ThemeProvider theme={theme}>
      <Head>
        <title>Salary Calculator</title>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <main>
        <CssBaseline />
        <Component />
      </main>
    </ThemeProvider>
  );
}

export default MyApp;