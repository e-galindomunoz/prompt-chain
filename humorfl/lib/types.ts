export interface HumorFlavor {
  id: number
  created_datetime_utc: string
  description: string | null
  slug: string
}

export interface HumorFlavorStep {
  id: number
  created_datetime_utc?: string
  humor_flavor_id: number
  llm_temperature: number | null
  order_by: number
  llm_input_type_id: number
  llm_output_type_id: number
  llm_model_id: number
  humor_flavor_step_type_id: number
  llm_system_prompt: string | null
  llm_user_prompt: string | null
  description: string | null
}

export interface Profile {
  id: string
  email: string | null
  first_name: string | null
  last_name: string | null
  is_superadmin: boolean
  is_matrix_admin: boolean
}

export interface Caption {
  id: string
  content: string | null
  humor_flavor_id: number | null
  image_id: string
  caption_request_id: number | null
  is_public: boolean
  is_featured: boolean
  like_count: number
  created_datetime_utc: string
}

export interface CrackdImage {
  id: string
  url: string | null
  is_common_use: boolean | null
  is_public: boolean | null
  additional_context: string | null
  image_description: string | null
}
