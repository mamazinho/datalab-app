const numberFormatter = new Intl.NumberFormat('pt-BR');

export const formatNumber = (value: number): string => numberFormatter.format(value);
