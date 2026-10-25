// Shared parsing for the extra event fields (public website + sold out + catalogue).
export type EventExtras = {
  archiveNo: string | null;
  timeText: string | null;
  showPublic: boolean;
  showCollectors: boolean;
  soldOut: boolean;
  catalogUrl: string | null;
};

export function parseEventExtras(body: any): { ok: true; value: EventExtras } | { ok: false; error: string } {
  const rawNo = typeof body?.archive_no === 'string' ? body.archive_no.trim().toUpperCase() : '';
  if (rawNo && !/^[A-Z][A-Z0-9]{2,11}$/.test(rawNo)) {
    return { ok: false, error: 'Archive number must be letters/digits only, e.g. H2601.' };
  }
  const timeText = typeof body?.time_text === 'string' && body.time_text.trim() ? body.time_text.trim().slice(0, 80) : null;
  const catalogUrl = typeof body?.catalog_url === 'string' && body.catalog_url.trim() ? body.catalog_url.trim() : null;
  if (catalogUrl && !/^https?:\/\//i.test(catalogUrl)) {
    return { ok: false, error: 'Catalogue URL must start with https://' };
  }
  const showPublic = body?.show_public === true;
  if (showPublic && !rawNo) {
    return { ok: false, error: 'An archive number is required to show an event on glod.art.' };
  }
  return {
    ok: true,
    value: {
      archiveNo: rawNo || null,
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
