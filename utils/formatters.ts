export const formatSeconds = (seconds: number | null | undefined): string => {
    if (isNaN(seconds as number) || seconds === null || seconds === undefined) {
        seconds = 0;
    }
    if (seconds < 60) return `${Math.round(seconds)} sec`;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    let result = '';
    if (hours > 0) result += `${hours}h `;
    if (minutes > 0) result += `${minutes}m`;
    return result.trim() || '0m';
};
