export const doCopy = (text: string) => {
    return navigator.clipboard.writeText(text).catch(err => console.error(err));
};
