export interface Claim {
  id: string;
  name: string;
  roll: string;
  email: string;
  created_at: string;
}

export interface Secret {
  hash: string;
}

export enum AppState {
  LOCKED = 'LOCKED',
  UNLOCKED = 'UNLOCKED',
  SUCCESS = 'SUCCESS',
  EXHAUSTED = 'EXHAUSTED',
  ERROR = 'ERROR'
}

export interface FormData {
  name: string;
  roll: string;
  email: string;
}
