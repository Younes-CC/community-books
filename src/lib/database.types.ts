export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Table<Row, Required extends keyof Row, Rel extends unknown[] = []> = {
  Row: Row;
  Insert: Pick<Row, Required> & Partial<Omit<Row, Required>>;
  Update: Partial<Row>;
  Relationships: Rel;
};

type FK<Name extends string, Col extends string, Ref extends string, RefCol extends string> = {
  foreignKeyName: Name;
  columns: [Col];
  isOneToOne: false;
  referencedRelation: Ref;
  referencedColumns: [RefCol];
};

export type AdminRow = {
  code: string | null;
  created_at: string;
  display_name: string | null;
  email: string | null;
  role: string;
  user_id: string;
};

export type BookRow = {
  created_at: string;
  description: string;
  height_mm: number | null;
  id: string;
  image_path: string | null;
  is_active: boolean;
  levels: string[];
  reading_length: string | null;
  slug: string;
  stock_available: number;
  stock_total: number;
  thickness_mm: number | null;
  title: string;
  topics: string[];
  updated_at: string;
  weight_g: number | null;
  width_mm: number | null;
};

export type OrderRow = {
  address_norm: string | null;
  assigned_to: string | null;
  book_id: string | null;
  book_title_snapshot: string | null;
  cancelled_at: string | null;
  city: string | null;
  completed_at: string | null;
  country: string | null;
  created_at: string;
  email: string;
  email_norm: string | null;
  first_name: string;
  fulfillment_type: string;
  house_number: string | null;
  id: string;
  internal_due_at: string | null;
  last_name: string;
  mail_sent_at: string | null;
  notes: string | null;
  order_number: string;
  order_status: string;
  paid_at: string | null;
  parcel_class_override: string | null;
  payment_status: string;
  pickup_appointment_at: string | null;
  pickup_deadline_at: string | null;
  postal_code: string | null;
  qr_deadline_at: string | null;
  qr_received_at: string | null;
  reservation_expires_at: string | null;
  shipped_at: string | null;
  shipping_price: number;
  social_username: string | null;
  stock_returned: boolean;
  street: string | null;
  total: number;
  updated_at: string;
};

export type OrderItemRow = {
  book_id: string;
  created_at: string;
  id: string;
  order_id: string;
  title_snapshot: string;
};

export type OrderHistoryRow = {
  actor: string | null;
  actor_name: string | null;
  created_at: string;
  event: string;
  from_status: string | null;
  id: number;
  note: string | null;
  order_id: string;
  source: string;
  to_status: string | null;
};

export type SettingsRow = {
  auto_cancel_unprocessed_enabled: boolean;
  auto_cancel_unprocessed_hours: number;
  default_parcel_class: string;
  hermes_email_body: string;
  hermes_email_subject: string;
  hermes_instructions: string;
  hermes_s_max_cm: number;
  hermes_sender_street: string | null;
  hermes_sender_zip_city: string | null;
  id: boolean;
  internal_processing_hours: number;
  max_books_per_person: number;
  packaging_padding_cm: number;
  payment_url: string | null;
  pickup_address: string | null;
  pickup_deadline_days: number;
  pickup_email_body: string;
  pickup_email_subject: string;
  pickup_instructions: string | null;
  pickup_public_location: string;
  processing_time_text: string;
  project_email: string | null;
  qr_deadline_hours: number;
  reservation_duration_hours: number;
  sender_name: string | null;
  shipping_price: number;
  updated_at: string;
};

type OrderFn<Args> = {
  Args: Args;
  Returns: OrderRow;
  SetofOptions: { from: "*"; to: "orders"; isOneToOne: true; isSetofReturn: false };
};

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.17";
  };
  public: {
    Tables: {
      admins: Table<AdminRow, "user_id">;
      audit_log: Table<
        {
          action: string;
          actor: string | null;
          created_at: string;
          id: number;
          meta: Json | null;
          order_id: string | null;
        },
        "action"
      >;
      books: Table<BookRow, "slug" | "title">;
      order_items: Table<
        OrderItemRow,
        "book_id" | "order_id" | "title_snapshot",
        [
          FK<"order_items_book_id_fkey", "book_id", "books", "id">,
          FK<"order_items_order_id_fkey", "order_id", "orders", "id">,
        ]
      >;
      order_status_history: Table<
        OrderHistoryRow,
        "order_id",
        [FK<"order_status_history_order_id_fkey", "order_id", "orders", "id">]
      >;
      orders: Table<
        OrderRow,
        "email" | "first_name" | "fulfillment_type" | "last_name" | "order_number",
        [FK<"orders_assigned_to_fkey", "assigned_to", "admins", "user_id">]
      >;
      settings: Table<SettingsRow, never>;
    };
    Views: { [_ in never]: never };
    Functions: {
      admin_assign_order: OrderFn<{ p_admin: string | null; p_order_id: string }>;
      admin_cancel_order: OrderFn<{ p_note?: string; p_order_id: string }>;
      admin_extend_deadline: OrderFn<{ p_order_id: string }>;
      admin_mark_mail_sent: OrderFn<{ p_order_id: string }>;
      admin_prepare_order_delete: { Args: { p_order_id: string }; Returns: string };
      admin_transition_order: OrderFn<{ p_order_id: string; p_to: string }>;
      admin_update_order_details: {
        Args: {
          p_notes: string | null;
          p_order_id: string;
          p_parcel_override: string | null;
          p_pickup_appointment: string | null;
          p_pickup_deadline: string | null;
        };
        Returns: undefined;
      };
      create_cart_reservation: {
        Args: {
          p_book_ids: string[];
          p_city: string;
          p_country: string;
          p_email: string;
          p_first_name: string;
          p_fulfillment_type: string;
          p_house_number: string;
          p_last_name: string;
          p_postal_code: string;
          p_social_username: string;
          p_street: string;
        };
        Returns: {
          out_order_id: string;
          out_order_number: string;
          out_order_status: string;
          out_titles: string[];
        }[];
      };
      get_public_settings: { Args: never; Returns: Json };
      is_admin: { Args: never; Returns: boolean };
      is_owner: { Args: never; Returns: boolean };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
