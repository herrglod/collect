import { redirect } from 'next/navigation';
import { getServerSession } from '../../lib/auth-server';
import { query } from '../../lib/db';
import PartnerInventoryTable from '../components/PartnerInventoryTable';

type InventoryRow = {
  ownership_id: number;
  archive_number: string;
  name: string;
  featured_image_url: string | null;
  edition_number: string | null;
  delivered_at: string | null;
  status: string;
};

export default async function PartnerInventoryPage() {
  const session = await getServerSession();
  if (!session) redirect('/login');
  if (!session.contactId) {
    return (
      <div className="empty-state">
        This account is not linked to a contact record. Please reach out to the GLOD team.
      </div>
    );
  }

  const rows = await query<InventoryRow>(
    `SELECT o.id AS ownership_id, o.archive_number, a.name, a.featured_image_url,
            o.edition_number, o.delivered_at, o.status
     FROM public.ownerships o
     JOIN public.artworks a ON a.archive_number = o.archive_number
     WHERE o.contact_id = $1 AND o.transferred_at IS NULL
     ORDER BY o.delivered_at DESC NULLS LAST, o.acquired_at DESC`,
    [session.contactId]
  );

  const active = rows.filter((r) => r.status !== 'sold');
  const sold = rows.filter((r) => r.status === 'sold');

  return (
    <>
      <div className="eyebrow">Gallery Partner</div>
      <h1 className="title" style={{ fontSize: 32 }}>
        Inventory
      </h1>
      <p className="subtitle" style={{ maxWidth: 600 }}>
        These are the artworks currently at your gallery on commission. Update the status of each
        piece as it changes — moving a work to "Sold" will list it below, so the GLOD team knows
        what needs to be settled.
      </p>

      <PartnerInventoryTable items={active} />

      {sold.length > 0 && (
        <>
          <h2 className="section-title">Already Sold</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Archive No.</th>
                <th>Artwork</th>
                <th>Edition</th>
              </tr>
            </thead>
            <tbody>
              {sold.map((r) => (
                <tr key={r.ownership_id}>
                  <td>{r.archive_number}</td>
                  <td>{r.name}</td>
                  <td>{r.edition_number || 'Unique'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </>
  );
}
