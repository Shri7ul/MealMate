export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AppRole = "manager" | "member";
export type ExpenseCategory =
  | "bazaar"
  | "gas"
  | "electricity"
  | "internet"
  | "rent"
  | "utilities"
  | "other";
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
        Relationships: [];
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
        Relationships: [
          {
            foreignKeyName: "messes_manager_id_fkey";
            columns: ["manager_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
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
        Relationships: [
          {
            foreignKeyName: "members_mess_id_fkey";
            columns: ["mess_id"];
            isOneToOne: false;
            referencedRelation: "messes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "members_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
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
        Relationships: [
          {
            foreignKeyName: "meal_entries_member_id_fkey";
            columns: ["member_id"];
            isOneToOne: false;
            referencedRelation: "members";
            referencedColumns: ["id"];
          }
        ];
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
        Relationships: [
          {
            foreignKeyName: "deposits_member_id_fkey";
            columns: ["member_id"];
            isOneToOne: false;
            referencedRelation: "members";
            referencedColumns: ["id"];
          }
        ];
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
          note: string | null;
        };
        Insert: {
          id?: string;
          mess_id: string;
          category: ExpenseCategory;
          title: string;
          amount: number;
          created_by: string;
          expense_date?: string;
          note?: string | null;
        };
        Update: {
          id?: string;
          mess_id?: string;
          category?: ExpenseCategory;
          title?: string;
          amount?: number;
          created_by?: string;
          expense_date?: string;
          note?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "expenses_mess_id_fkey";
            columns: ["mess_id"];
            isOneToOne: false;
            referencedRelation: "messes";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "expenses_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
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
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
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
        Relationships: [
          {
            foreignKeyName: "monthly_reports_mess_id_fkey";
            columns: ["mess_id"];
            isOneToOne: false;
            referencedRelation: "messes";
            referencedColumns: ["id"];
          }
        ];
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
