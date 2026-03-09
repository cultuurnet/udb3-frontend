import getConfig from 'next/config';
import Script from 'next/script';

declare global {
  interface Window {
    zE?: (...args: unknown[]) => void;
  }
}

const ZendeskWidget = () => {
  const { publicRuntimeConfig } = getConfig();
  const zendeskWidgetUrl = publicRuntimeConfig.zendeskWidgetUrl;
  return (
    <Script
      id="ze-snippet"
      src={zendeskWidgetUrl}
      strategy="afterInteractive"
      onLoad={() => {
        window.zE?.('webWidget', 'hide');
        window.zE?.('webWidget', 'setLocale', 'nl');
        window.zE?.('webWidget:on', 'close', () => {
          window.zE?.('webWidget', 'hide');
        });
      }}
    />
  );
};

export function showZendeskWidget() {
  window.zE?.('webWidget', 'show');
}

export function openZendeskWidget() {
  window.zE?.('webWidget', 'open');
}

export { ZendeskWidget };
