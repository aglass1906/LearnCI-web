export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    graphql_public: {
        Tables: {
            [_ in never]: never
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            graphql: {
                Args: {
                    operationName?: string
                    query?: string
                    variables?: Json
                    extensions?: Json
                }
                Returns: Json
            }
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
    public: {
        Tables: {
            coaching_check_ins: {
                Row: {
                    activity_ratings: Json
                    created_at: string | null
                    date: string
                    hours_milestone: number
                    id: string
                    next_cycle_plan: string
                    notes: string | null
                    progress_sentiment: string
                    user_id: string
                }
                Insert: {
                    activity_ratings?: Json
                    created_at?: string | null
                    date: string
                    hours_milestone: number
                    id: string
                    next_cycle_plan: string
                    notes?: string | null
                    progress_sentiment: string
                    user_id: string
                }
                Update: {
                    activity_ratings?: Json
                    created_at?: string | null
                    date?: string
                    hours_milestone?: number
                    id?: string
                    next_cycle_plan?: string
                    notes?: string | null
                    progress_sentiment?: string
                    user_id?: string
                }
                Relationships: []
            }
            daily_feedback: {
                Row: {
                    activity_type: string | null
                    created_at: string | null
                    date: string
                    id: string
                    note: string | null
                    rating: number
                    user_id: string
                }
                Insert: {
                    activity_type?: string | null
                    created_at?: string | null
                    date: string
                    id?: string
                    note?: string | null
                    rating: number
                    user_id: string
                }
                Update: {
                    activity_type?: string | null
                    created_at?: string | null
                    date?: string
                    id?: string
                    note?: string | null
                    rating: number
                    user_id: string
                }
                Relationships: []
            }
            favorites: {
                Row: {
                    author: string | null
                    consumption_url: string
                    created_at: string
                    id: string
                    image_url: string | null
                    title: string
                    type: string
                    user_id: string
                }
                Insert: {
                    author?: string | null
                    consumption_url: string
                    created_at?: string
                    id?: string
                    image_url?: string | null
                    title: string
                    type: string
                    user_id: string
                }
                Update: {
                    author?: string | null
                    consumption_url?: string
                    created_at?: string
                    id?: string
                    image_url?: string | null
                    title?: string
                    type?: string
                    user_id?: string
                }
                Relationships: []
            }
            profiles: {
                Row: {
                    avatar_url: string | null
                    created_at: string | null
                    current_language: string | null
                    current_level: string | null
                    id: string
                    mindset: string | null
                    roles: string[] | null
                    starting_hours: number | null
                    total_minutes: number | null
                    tts_voice_gender: string | null
                    updated_at: string | null
                    user_id: string | null
                    username: string | null
                }
                Insert: {
                    avatar_url?: string | null
                    created_at?: string | null
                    current_language?: string | null
                    current_level?: string | null
                    id: string
                    mindset?: string | null
                    roles?: string[] | null
                    starting_hours?: number | null
                    total_minutes?: number | null
                    tts_voice_gender?: string | null
                    updated_at?: string | null
                    user_id?: string | null
                    username?: string | null
                }
                Update: {
                    avatar_url?: string | null
                    created_at?: string | null
                    current_language?: string | null
                    current_level?: string | null
                    id?: string
                    mindset?: string | null
                    roles?: string[] | null
                    starting_hours?: number | null
                    total_minutes?: number | null
                    tts_voice_gender?: string | null
                    updated_at?: string | null
                    user_id?: string | null
                    username?: string | null
                }
                Relationships: []
            }
            user_roles: {
                Row: {
                    created_at: string
                    id: string
                    role: string
                    user_id: string
                }
                Insert: {
                    created_at?: string
                    id?: string
                    role: string
                    user_id: string
                }
                Update: {
                    created_at?: string
                    id?: string
                    role?: string
                    user_id?: string
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
    PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
            Row: infer R
        }
    ? R
    : never
    : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
            Row: infer R
        }
    ? R
    : never
    : never

export type TablesInsert<
    PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Insert: infer I
    }
    ? I
    : never
    : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
    }
    ? I
    : never
    : never

export type TablesUpdate<
    PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Update: infer U
    }
    ? U
    : never
    : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
    }
    ? U
    : never
    : never

export type Enums<
    PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
    EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
    ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
    CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
        schema: keyof Database
    }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
    ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
