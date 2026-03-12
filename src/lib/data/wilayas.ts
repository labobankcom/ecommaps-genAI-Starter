// ═══════════════════════════════════════════════════════════════
// 58 Algerian Wilayas (Code + Name in Arabic)
// ═══════════════════════════════════════════════════════════════

export interface Wilaya {
    code: string;
    name: string;
    shippingCost: number; // Base shipping cost in DZD
}

export const ALGERIAN_WILAYAS: Wilaya[] = [
    { code: "01", name: "أدرار", shippingCost: 700 },
    { code: "02", name: "الشلف", shippingCost: 500 },
    { code: "03", name: "الأغواط", shippingCost: 600 },
    { code: "04", name: "أم البواقي", shippingCost: 550 },
    { code: "05", name: "باتنة", shippingCost: 500 },
    { code: "06", name: "بجاية", shippingCost: 500 },
    { code: "07", name: "بسكرة", shippingCost: 550 },
    { code: "08", name: "بشار", shippingCost: 700 },
    { code: "09", name: "البليدة", shippingCost: 400 },
    { code: "10", name: "البويرة", shippingCost: 450 },
    { code: "11", name: "تمنراست", shippingCost: 800 },
    { code: "12", name: "تبسة", shippingCost: 550 },
    { code: "13", name: "تلمسان", shippingCost: 500 },
    { code: "14", name: "تيارت", shippingCost: 500 },
    { code: "15", name: "تيزي وزو", shippingCost: 450 },
    { code: "16", name: "الجزائر", shippingCost: 350 },
    { code: "17", name: "الجلفة", shippingCost: 550 },
    { code: "18", name: "جيجل", shippingCost: 500 },
    { code: "19", name: "سطيف", shippingCost: 450 },
    { code: "20", name: "سعيدة", shippingCost: 550 },
    { code: "21", name: "سكيكدة", shippingCost: 500 },
    { code: "22", name: "سيدي بلعباس", shippingCost: 500 },
    { code: "23", name: "عنابة", shippingCost: 450 },
    { code: "24", name: "قالمة", shippingCost: 500 },
    { code: "25", name: "قسنطينة", shippingCost: 400 },
    { code: "26", name: "المدية", shippingCost: 450 },
    { code: "27", name: "مستغانم", shippingCost: 450 },
    { code: "28", name: "المسيلة", shippingCost: 500 },
    { code: "29", name: "معسكر", shippingCost: 500 },
    { code: "30", name: "ورقلة", shippingCost: 600 },
    { code: "31", name: "وهران", shippingCost: 400 },
    { code: "32", name: "البيض", shippingCost: 650 },
    { code: "33", name: "إليزي", shippingCost: 800 },
    { code: "34", name: "برج بوعريريج", shippingCost: 500 },
    { code: "35", name: "بومرداس", shippingCost: 400 },
    { code: "36", name: "الطارف", shippingCost: 500 },
    { code: "37", name: "تندوف", shippingCost: 850 },
    { code: "38", name: "تيسمسيلت", shippingCost: 550 },
    { code: "39", name: "الوادي", shippingCost: 600 },
    { code: "40", name: "خنشلة", shippingCost: 550 },
    { code: "41", name: "سوق أهراس", shippingCost: 500 },
    { code: "42", name: "تيبازة", shippingCost: 400 },
    { code: "43", name: "ميلة", shippingCost: 500 },
    { code: "44", name: "عين الدفلى", shippingCost: 450 },
    { code: "45", name: "النعامة", shippingCost: 650 },
    { code: "46", name: "عين تموشنت", shippingCost: 500 },
    { code: "47", name: "غرداية", shippingCost: 600 },
    { code: "48", name: "غليزان", shippingCost: 500 },
    // New Wilayas (2019)
    { code: "49", name: "تيميمون", shippingCost: 750 },
    { code: "50", name: "برج باجي مختار", shippingCost: 800 },
    { code: "51", name: "أولاد جلال", shippingCost: 600 },
    { code: "52", name: "بني عباس", shippingCost: 750 },
    { code: "53", name: "عين صالح", shippingCost: 800 },
    { code: "54", name: "عين قزام", shippingCost: 850 },
    { code: "55", name: "تقرت", shippingCost: 600 },
    { code: "56", name: "جانت", shippingCost: 850 },
    { code: "57", name: "المغير", shippingCost: 600 },
    { code: "58", name: "المنيعة", shippingCost: 650 },

];

// Helper to get wilaya by code
export const getWilayaByCode = (code: string): Wilaya | undefined => {
    return ALGERIAN_WILAYAS.find(w => w.code === code);
};

// Helper to get shipping cost for a wilaya
export const getWilayaShippingCost = (code: string): number => {
    const wilaya = getWilayaByCode(code);
    return wilaya?.shippingCost ?? 500;
};
