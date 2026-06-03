export interface Transaction {
  id: number;
  user_phone: string;
  tx_type: 'Register' | 'Deposit' | 'Loan' | 'Repay';
  amount_stroops: string;
  status: 'Success' | 'Pending' | 'Failed';
  reference_code: string;
  created_at: string;
}
