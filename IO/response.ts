export const respond = (data: any, statusCode: number): any => {
    return {
        statusCode,
        body: JSON.stringify({ data }),
    };
};

