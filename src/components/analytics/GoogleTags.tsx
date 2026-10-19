import Script from 'next/script';
import { site } from '@/content/site';

/**
 * Google tags loader — GA4 (gtag.js) + Google Tag Manager.
 * Both load ONLY when their ID is set in site.analytics (privacy-safe).
 * Consent Mode v2 defaults everything to 'denied'; a head inline script
 * restores a saved 'all' choice before either tag runs, and the
 * ConsentBanner updates consent when the visitor chooses.
 */

const CONSENT_INLINE = `(function(){try{var v=localStorage.getItem('alok:consent');window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});if(v==='all'){gtag('consent','update',{ad_storage:'granted',ad_user_data:'granted',ad_personalization:'granted',analytics_storage:'granted'});window.__alokConsent='all';}else if(v==='essential'){window.__alokConsent='essential';}}catch(e){}})();`;

const GTM_INLINE = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${site.analytics.gtmId}');`;

export default function GoogleTags() {
  const { ga4Id, gtmId } = site.analytics;
  if (!ga4Id && !gtmId) return null;

  return (
    <>
      {/* Consent Mode v2 default (denied) + restore saved choice — must run before any tag */}
      <script dangerouslySetInnerHTML={{ __html: CONSENT_INLINE }} />
      {/* Google Tag Manager loader */}
      {gtmId ? <script dangerouslySetInnerHTML={{ __html: GTM_INLINE }} /> : null}
      {/* GA4 gtag.js */}
      {ga4Id ? (
        <>
          <Script async src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`} strategy="afterInteractive" />
          <Script id="ga4-config" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga4Id}',{send_page_view:true});`}
          </Script>
        </>
      ) : null}
    </>
  );
}
