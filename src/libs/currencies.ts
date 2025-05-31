export interface Currency {
    code: string;
    name: string;
    symbol: string;
}

export const currencies: Currency[] = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
    { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
    { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
    { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
    { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
    { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
    { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
    { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
    { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
    { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
    { code: 'PHP', name: 'Philippine Peso', symbol: '₱' },
    { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč' },
    { code: 'PLN', name: 'Polish Zloty', symbol: 'zł' },
    { code: 'THB', name: 'Thai Baht', symbol: '฿' },
    { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
    { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft' },
    { code: 'ILS', name: 'Israeli New Shekel', symbol: '₪' },
    { code: 'DKK', name: 'Danish Krone', symbol: 'kr.' },
    { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
    { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
    { code: 'LKR', name: 'Sri Lankan Rupee', symbol: 'Rs'},
];

export function getCurrencySymbol(currencyCode: string): string {
    const currency = currencies.find(c => c.code === currencyCode);
    return currency ? currency.symbol : '$'; // Default to '$' if not found or if code is empty
}