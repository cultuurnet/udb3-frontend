import NextDocument from 'next/document';
import { ServerStyleSheet } from 'styled-components';

class Document extends NextDocument {
  static async getInitialProps(ctx) {
    const sheet = new ServerStyleSheet();
    const originalRenderPage = ctx.renderPage;

    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: (App) => (props) =>
            // @ts-expect-error ts-migrate(2749) FIXME: 'App' refers to a value, but is being used as a ty... Remove this comment to see the full error message
            sheet.collectStyles(<App {...props} />),
        });

      const initialProps = await NextDocument.getInitialProps(ctx);
      return {
        ...initialProps,
        styles: (
          <>
            {initialProps.styles}
            {sheet.getStyleElement()}
          </>
        ),
      };
    } finally {
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'sheet'.
      sheet.seal();
    }
  }
}

export default Document;
