export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AppRole = "manager" | "member";
export type ExpenseCategory = "bazaar" | "utilities" | "rent" | "other";
export type PaymentMethod = "cash" | "bkash" | "nagad" | "bank" | "other";

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          avatar: string | null;
          role: AppRole;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          phone?: string | null;
          avatar?: string | null;
          role?: AppRole;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string | null;
          avatar?: string | null;
          role?: AppRole;
          created_at?: string;
        };
      };
      messes: {
        Row: {
          id: string;
          name: string;
          manager_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          manager_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          manager_id?: string;
          created_at?: string;
        };
      };
      members: {
        Row: {
          id: string;
          mess_id: string;
          user_id: string;
          joined_at: string;
        };
        Insert: {
          id?: string;
          mess_id: string;
          user_id: string;
          joined_at?: string;
        };
        Update: {
          id?: string;
          mess_id?: string;
          user_id?: string;
          joined_at?: string;
        };
      };
      meal_entries: {
        Row: {
          id: string;
          member_id: string;
          date: string;
          breakfast: number;
          lunch: number;
          dinner: number;
        };
        Insert: {
          id?: string;
          member_id: string;
          date: string;
          breakfast?: number;
          lunch?: number;
          dinner?: number;
        };
        Update: {
          id?: string;
          member_id?: string;
          date?: string;
          breakfast?: number;
          lunch?: number;
          dinner?: number;
        };
      };
      deposits: {
        Row: {
          id: string;
          member_id: string;
          amount: number;
          payment_method: PaymentMethod;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          member_id: string;
          amount: number;
          payment_method?: PaymentMethod;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          member_id?: string;
          amount?: number;
          payment_method?: PaymentMethod;
          note?: string | null;
          created_at?: string;
        };
      };
      expenses: {
        Row: {
          id: string;
          mess_id: string;
          category: ExpenseCategory;
          title: string;
          amount: number;
          created_by: string;
          expense_date: string;
        };
        Insert: {
          id?: string;
          mess_id: string;
          category: ExpenseCategory;
          title: string;
          amount: number;
          created_by: string;
          expense_date?: string;
        };
        Update: {
          id?: string;
          mess_id?: string;
          category?: ExpenseCategory;
          title?: string;
          amount?: number;
          created_by?: string;
          expense_date?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          message?: string;
          is_read?: boolean;
          created_at?: string;
        };
      };
      monthly_reports: {
        Row: {
          id: string;
          mess_id: string;
          month: number;
          year: number;
          total_meal: number;
          meal_rate: number;
          total_expense: number;
        };
        Insert: {
          id?: string;
          mess_id: string;
          month: number;
          year: number;
          total_meal?: number;
          meal_rate?: number;
          total_expense?: number;
        };
        Update: {
          id?: string;
          mess_id?: string;
          month?: number;
          year?: number;
          total_meal?: number;
          meal_rate?: number;
          total_expense?: number;
        };
      };
    };
    Views: Record<string, never>;
    Functions: {
      current_user_role: {
        Args: Record<string, never>;
        Returns: AppRole;
      };
      is_manager: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      manager_mess_id: {
        Args: Record<string, never>;
        Returns: string | null;
      };
      current_member_mess_id: {
        Args: Record<string, never>;
        Returns: string | null;
      };
      can_access_mess: {
        Args: { target_mess_id: string };
        Returns: boolean;
      };
      is_mess_manager: {
        Args: { target_mess_id: string };
        Returns: boolean;
      };
      can_access_member: {
        Args: { target_member_id: string };
        Returns: boolean;
      };
      can_manage_member: {
        Args: { target_member_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: AppRole;
      expense_category: ExpenseCategory;
      payment_method: PaymentMethod;
    };
    CompositeTypes: Record<string, never>;
  };
}
