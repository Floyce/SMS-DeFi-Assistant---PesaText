/**
 * PesaText - Admin Dashboard
 * 
 * File: utils/formatters.ts
 * Description: Helper utility functions for formatting currencies, phones, dates, and addresses
 * Author: Floyce
 * Created: 2026-06-03
 * Last Modified: 2026-06-03
 */

// 5. Types and constants
import { XLM_TO_KES_RATE, STROOPS_PER_XLM } from './constants';

export const formatXlm = (stroops: string | number): string => {
  const amount = Number(stroops) / STROOPS_PER_XLM;
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 7
  }).format(amount);
};

export const formatXlmRaw = (stroops: string | number): number => {
  return Number(stroops) / STROOPS_PER_XLM;
};

export const formatKes = (xlmAmount: number | string): string => {
  const amount = Number(xlmAmount) * XLM_TO_KES_RATE;
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatKesFromStroops = (stroops: string | number): string => {
  const xlm = Number(stroops) / STROOPS_PER_XLM;
  return formatKes(xlm);
};

export const formatPhone = (phone: string): string => {
  // Simple format for +254 712 345678 or +254712345678
  if (!phone) return '';
  const clean = phone.replace(/\s+/g, '');
  if (clean.startsWith('+254') && clean.length === 13) {
    return `${clean.slice(0, 4)} ${clean.slice(4, 7)} ${clean.slice(7)}`;
  }
  return phone;
};

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  } catch {
    return dateStr;
  }
};

export const truncateAddress = (address: string, chars = 6): string => {
  if (!address) return '';
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};
