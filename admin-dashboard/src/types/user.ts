/**
 * PesaText - Admin Dashboard
 * 
 * File: types/user.ts
 * Description: TypeScript interface defining User entity structure
 * Author: Floyce
 * Created: 2026-06-03
 * Last Modified: 2026-06-03
 */

export interface User {
  id: number;
  phone: string;
  name: string;
  stellar_address: string;
  created_at: string;
  balance_stroops: string; // Soroban balance representation
  status: 'Active' | 'Inactive' | 'Overdue';
}
