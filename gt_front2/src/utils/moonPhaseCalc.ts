// Learned from: https://mathematica.site/web-mag/calendar/c-22/#i-4
// 高精度計算サイトと比べると、誤差がいくらかある
// 2030-3-3: +0.1
// 2024-4-17: +0.4
// 2024-1-10: +0.8
// 2023-1-10: +0.5
// 2022-1-10: +0.3
export const getMoonPhase = (dateArg: Date): number => {
    const ONE_LUNAR_MONTH = 29.53059;

    const year = dateArg.getFullYear();
    const date = new Date(year, dateArg.getMonth(), dateArg.getDate());
    const date0101 = new Date(year, 0, 1);
    const daysInTheYear = (date.valueOf() - date0101.valueOf()) / 1000 / 60 / 60 / 24 + 1;

    const yearMinus = year - 1;
    const gregorianDate0100 = yearMinus * 365 + Math.trunc(yearMinus / 4) - Math.trunc(yearMinus / 100) + Math.trunc(yearMinus / 400);
    const gregorianDate = gregorianDate0100 + daysInTheYear;

    const moonPhase = (((gregorianDate - 10.7) / ONE_LUNAR_MONTH) % 1) * ONE_LUNAR_MONTH;
    return Math.round(moonPhase * 10) / 10;
};
