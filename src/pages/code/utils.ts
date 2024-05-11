import md5 from 'blueimp-md5';
import { sha1 } from 'js-sha1';

export const calculate = (mainPassword: string, rememberName: string) => {
    const joint = mainPassword + rememberName;
    const value = md5(joint + sha1(joint)).substring(0, 16);
    return [
        value.substring(0, 4).toUpperCase(),
        value.substring(4, 8),
        value.substring(8, 12).toUpperCase(),
        value.substring(12, 16),
    ].join('-');
};
