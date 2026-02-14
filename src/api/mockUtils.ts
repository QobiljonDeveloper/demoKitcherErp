export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function paginate<T>(data: T[], page: number = 1, limit: number = 10) {
    const start = (page - 1) * limit;
    const end = start + limit;
    const items = data.slice(start, end);
    const total = data.length;
    const totalPages = Math.ceil(total / limit);

    return {
        success: true,
        data: items,
        total,
        page,
        limit,
        totalPages,
    };
}

export function success<T>(data: T) {
    return {
        success: true,
        data,
    };
}
