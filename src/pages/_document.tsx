// pages/_document.js

import { Html, Head, Main, NextScript } from 'next/document';
import theme from '../theme';

export default function Document() {
    return (
        <Html>
            <Head>
                <meta name="theme-color" content={theme.palette.primary.main} />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
                <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap" />
                <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    )
}