import { redirect } from 'next/navigation';
import { getServerSession } from '../../../lib/auth-server';
import { query } from '../../../lib/db';
import PartnerAvailableTable from '../../components/PartnerAvailableTable';

type ForSaleArtwork = {
  archive_number: string;
  name: string;
  year: number | null;
  medium: string | null;
  size: string | null;
  featured_image_url: string | null;
  price_partner: number | null;
  category: string;
  edition_type: 'unique' | 'limited_edition';
  slug: string | null;
};

export default async function PartnerAvailablePage() {
  const session = await getServerSession();
  if (!session) redirect('/login');

  const artworks = await query<ForSaleArtwork>(
    `SELECT archive_number, name, year, medium, size, featured_image_url, price_partner, category, edition_type, slug
     FROM public.artworks
     WHERE for_sale = true AND for_sale_audience IN ('gallery', 'both')
     ORDER BY updated_at DESC`
  );

  return (
    <>
      <div className="eyebrow">Gallery Partner</div>
      <h1 className="title" style={{ fontSize: 32 }}>
        Available Works
      </h1>
      <p className="subtitle">Browse pieces currently available for your gallery.</p>

      <PartnerAvailableTable artworks={artworks} />
    </>
  );
}
