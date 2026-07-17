export type ServiceProvider = 'mock' | 'supabase';

let _provider: ServiceProvider = 'mock';

export function useSupabase(): void {
  _provider = 'supabase';
}

export function useMock(): void {
  _provider = 'mock';
}

export function isSupabase(): boolean {
  return _provider === 'supabase';
}

export function getProvider(): ServiceProvider {
  return _provider;
}
