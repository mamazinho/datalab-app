export interface IMessage {
  role: string;
  content: string;
  timestamp: string;
}

export interface IRetrieveChat {
  id: number;
  user_id: number;
  title: string;
  input_tokens: number;
  output_tokens: number;
  number_of_requests: number;
  created_at: Date;
  updated_at: Date;
}

export interface ICreateChat {
  title: string;
}