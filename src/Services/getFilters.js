export async function getFilters(filters, userId) {
    filters.parms = filters.parms || {};
    filters.parms.user_id = filters.parms.user_id || {};

    if (filters.parms.user_id?.value !== userId) {
        filters.parms.user_id.value = userId;
        filters.parms.user_id.type = "equal";
    }
    return parseFilters(filters.parms);
}

function parseFilters(filters) {
    return Object.entries(filters).map(([field, { value, type }]) => ({
        field,
        value,
        type,
    }));
}
