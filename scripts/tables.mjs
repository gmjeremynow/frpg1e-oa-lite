/** Small lookup tables used on the sheet. */
// OA Table 32: Wu Jen Intelligence Adjustments [chance to know, minimum, maximum] (maximum "All" at 19+)
const T32 = [[9, 9, 35, 4, 6], [10, 12, 45, 5, 7], [13, 14, 55, 6, 9], [15, 16, 65, 7, 11], [17, 17, 75, 8, 14], [18, 18, 85, 9, 18], [19, 99, 95, 10, "All"]];
export const WUJEN_INT = int => { const r = T32.find(r => int >= r[0] && int <= r[1]); return r ? [r[2], r[3], r[4]] : null; };
