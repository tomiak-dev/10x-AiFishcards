export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  graphql_public: {
    Tables: Record<never, never>;
    Views: Record<never, never>;
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
  public: {
    Tables: {
      ai_generation_metrics: {
        Row: {
          accepted_flashcards_count: number | null;
          created_at: string;
          edited_flashcards_count: number | null;
          id: number;
          proposed_flashcards_count: number;
          user_id: string;
        };
        Insert: {
          accepted_flashcards_count?: number | null;
          created_at?: string;
          edited_flashcards_count?: number | null;
          id?: number;
          proposed_flashcards_count: number;
          user_id: string;
        };
        Update: {
          accepted_flashcards_count?: number | null;
          created_at?: string;
          edited_flashcards_count?: number | null;
          id?: number;
          proposed_flashcards_count?: number;
          user_id?: string;
        };
        Relationships: [];
      };
      decks: {
        Row: {
          created_at: string;
          id: string;
          last_reviewed_at: string | null;
          name: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          last_reviewed_at?: string | null;
          name: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          last_reviewed_at?: string | null;
          name?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      flashcard_srs_data: {
        Row: {
          due_date: string;
          efactor: number;
          flashcard_id: string;
          interval: number;
          repetition: number;
          srs_algorithm_id: number;
        };
        Insert: {
          due_date?: string;
          efactor?: number;
          flashcard_id: string;
          interval?: number;
          repetition?: number;
          srs_algorithm_id?: number;
        };
        Update: {
          due_date?: string;
          efactor?: number;
          flashcard_id?: string;
          interval?: number;
          repetition?: number;
          srs_algorithm_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "flashcard_srs_data_flashcard_id_fkey";
            columns: ["flashcard_id"];
            isOneToOne: true;
            referencedRelation: "flashcards";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "flashcard_srs_data_flashcard_id_fkey";
            columns: ["flashcard_id"];
            isOneToOne: true;
            referencedRelation: "flashcards_with_srs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "flashcard_srs_data_srs_algorithm_id_fkey";
            columns: ["srs_algorithm_id"];
            isOneToOne: false;
            referencedRelation: "srs_algorithms";
            referencedColumns: ["id"];
          },
        ];
      };
      flashcards: {
        Row: {
          back: string;
          changed_at: string | null;
          created_at: string;
          creation_source: Database["public"]["Enums"]["creation_source_enum"];
          deck_id: string;
          front: string;
          id: string;
        };
        Insert: {
          back: string;
          changed_at?: string | null;
          created_at?: string;
          creation_source?: Database["public"]["Enums"]["creation_source_enum"];
          deck_id: string;
          front: string;
          id?: string;
        };
        Update: {
          back?: string;
          changed_at?: string | null;
          created_at?: string;
          creation_source?: Database["public"]["Enums"]["creation_source_enum"];
          deck_id?: string;
          front?: string;
          id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "flashcards_deck_id_fkey";
            columns: ["deck_id"];
            isOneToOne: false;
            referencedRelation: "decks";
            referencedColumns: ["id"];
          },
        ];
      };
      srs_algorithms: {
        Row: {
          id: number;
          name: string;
        };
        Insert: {
          id?: number;
          name: string;
        };
        Update: {
          id?: number;
          name?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      flashcards_with_srs: {
        Row: {
          back: string | null;
          created_at: string | null;
          creation_source: Database["public"]["Enums"]["creation_source_enum"] | null;
          deck_id: string | null;
          due_date: string | null;
          efactor: number | null;
          front: string | null;
          id: string | null;
          interval: number | null;
          repetition: number | null;
          user_id: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "flashcards_deck_id_fkey";
            columns: ["deck_id"];
            isOneToOne: false;
            referencedRelation: "decks";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Functions: {
      update_srs_data_on_review: {
        Args: {
          p_flashcard_id: string;
          p_quality: Database["public"]["Enums"]["review_quality_enum"];
        };
        Returns: undefined;
      };
    };
    Enums: {
      creation_source_enum: "manual" | "ai_generated" | "ai_generated_edited";
      review_quality_enum: "again" | "good" | "easy";
    };
    CompositeTypes: Record<never, never>;
  };
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      creation_source_enum: ["manual", "ai_generated", "ai_generated_edited"],
      review_quality_enum: ["again", "good", "easy"],
    },
  },
} as const;
