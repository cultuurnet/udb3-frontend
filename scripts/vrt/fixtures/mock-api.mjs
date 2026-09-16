// Never resolves (RFC 2606); an @id is only ever split for its last segment.
export const MOCK_API_ORIGIN = 'https://vrt-mock-api.invalid';

export const idOf = ({ '@id': id }) => id.split('/').at(-1);

export const pagedCollection = (member, itemsPerPage = member.length) => ({
  '@context': 'http://www.w3.org/ns/hydra/context.jsonld',
  '@type': 'PagedCollection',
  itemsPerPage,
  totalItems: member.length,
  member,
});
