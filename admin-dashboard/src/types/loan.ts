export interface Loan {
  id: number;
  user_phone: string;
  principal_stroops: string;
  interest_stroops: string;
  status: 'Active' | 'Repaid' | 'Overdue';
  issued_at: string;
  due_at: string;
}
