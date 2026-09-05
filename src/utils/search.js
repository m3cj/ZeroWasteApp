/**
 * Filters and sorts generators across community, category, search query, and sorting options.
 * @param {Array} generators
 * @param {Object} options
 * @param {string} options.query - search query
 * @param {string} options.communityId - optional community filter
 * @param {string} options.category - category filter ('all' | 'family' | 'business' | 'public')
 * @param {string} options.sortBy - sort mode ('name_asc' | 'name_desc' | 'address_asc' | 'dues_desc')
 * @returns {Array}
 */
export const filterAndSortGenerators = (
  generators = [],
  { query = '', communityId = 'all', category = 'all', sortBy = 'name_asc' } = {}
) => {
  let list = [...generators];

  // 1. Community filter
  if (communityId && communityId !== 'all') {
    list = list.filter((g) => g.communityId === communityId);
  }

  // 2. Category filter (family, business, public)
  if (category && category !== 'all') {
    list = list.filter((g) => g.category === category);
  }

  // 3. Search query filter
  const cleanQuery = query.trim().toLowerCase();
  if (cleanQuery) {
    list = list.filter((g) => {
      const haystacks = [
        g.ownerName || '',
        g.phone || '',
        g.address || '',
        g.addressLine || '',
        g.area || '',
        g.pincode || '',
        g.communityName || '',
        g.id || '',
      ].map((s) => s.toLowerCase());

      return haystacks.some((field) => field.includes(cleanQuery));
    });
  }

  // 4. Sort
  list.sort((a, b) => {
    if (sortBy === 'name_asc') {
      return (a.ownerName || '').localeCompare(b.ownerName || '');
    }
    if (sortBy === 'name_desc') {
      return (b.ownerName || '').localeCompare(a.ownerName || '');
    }
    if (sortBy === 'address_asc') {
      return (a.address || '').localeCompare(b.address || '');
    }
    if (sortBy === 'dues_desc') {
      return Number(b.outstandingDues || 0) - Number(a.outstandingDues || 0);
    }
    return 0;
  });

  return list;
};

export const filterGenerators = (generators = [], query = '', categoryFilter = 'all') => {
  return filterAndSortGenerators(generators, { query, category: categoryFilter });
};
