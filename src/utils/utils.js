export const getDate = dateStr => {
    if (!dateStr) return ""
    const date = new Date(dateStr);
    const humanReadable = new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
    }).format(date);
    return humanReadable;
}