// Shared parsing for the extra event fields (public website + sold out + catalogue).
export type EventExtras = {
  archiveNo: string | null;
  address: string | null;
  descriptionDe: string | null;
  timeText: string | null;
  showPublic: boolean;
  showCollectors: boolean;
  soldOut: boolean;
  catalogUrl: string | null;
};

export type EventExtrasResult = { error: string | null; value: EventExtras | null };

export function parseEventExtras(body: any): EventExtrasResult {
  const rawNo = typeof body?.archive_no === 'string' ? body.archive_no.trim().toUpperCase() : '';
  if (rawNo && !/^[A-Z][A-Z0-9]{2,11}$/.test(rawNo)) {
    return { error: 'Archive number must be letters/digits only, e.g. H2601.', value: null };
  }
  const address = typeof body?.address === 'string' && body.address.trim() ? body.address.trim().slice(0, 300) : null;
  const descriptionDe =
    typeof body?.description_de === 'string' && body.description_de.trim() ? body.description_de.trim() : null;
  const timeText = typeof body?.time_text === 'string' && body.time_text.trim() ? body.time_text.trim().slice(0, 80) : null;
  const catalogUrl = typeof body?.catalog_url === 'string' && body.catalog_url.trim() ? body.catalog_url.trim() : null;
  if (catalogUrl && !/^https?:\/\//i.test(catalogUrl)) {
    return { error: 'Catalogue URL must start with https://', value: null };
  }
  const showPublic = body?.show_public === true;
  if (showPublic && !rawNo) {
    return { error: 'An archive number is required to show an event on glod.art.', value: null };
  }
  return {
    error: null,
    value: {
      archiveNo: rawNo || null,
      address,
      descriptionDe,
      timeText,
      showPublic,
      showCollectors: body?.show_collectors !== false,
      soldOut: body?.sold_out === true,
      catalogUrl,
    },
  };
}

export function isUniqueViolation(err: any): boolean {
  return err?.code === '23505';
}
