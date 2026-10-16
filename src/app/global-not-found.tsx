import '@/app/(site)/globals.css';
import SiteDocument from '@/components/layout/SiteDocument';
import NotFound from '@/app/(site)/not-found';

export default function GlobalNotFound() {
  return (
    <SiteDocument>
      <NotFound />
    </SiteDocument>
  );
}
