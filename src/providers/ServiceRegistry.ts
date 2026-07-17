import type { DataProvider } from './DataProvider';
import { mockProvider } from './MockProvider';

export class ServiceRegistry {
  private static instance: ServiceRegistry;
  private provider: DataProvider;

  private constructor(provider: DataProvider) {
    this.provider = provider;
  }

  static getInstance(): ServiceRegistry {
    if (!ServiceRegistry.instance) {
      ServiceRegistry.instance = new ServiceRegistry(mockProvider);
    }
    return ServiceRegistry.instance;
  }

  getProvider(): DataProvider {
    return this.provider;
  }

  setProvider(provider: DataProvider): void {
    this.provider = provider;
  }

  static get auth() { return ServiceRegistry.getInstance().getProvider().auth; }
  static get students() { return ServiceRegistry.getInstance().getProvider().students; }
  static get profiles() { return ServiceRegistry.getInstance().getProvider().profiles; }
  static get birthdays() { return ServiceRegistry.getInstance().getProvider().birthdays; }
  static get resources() { return ServiceRegistry.getInstance().getProvider().resources; }
  static get receipts() { return ServiceRegistry.getInstance().getProvider().receipts; }
  static get announcements() { return ServiceRegistry.getInstance().getProvider().announcements; }
  static get courses() { return ServiceRegistry.getInstance().getProvider().courses; }
  static get notifications() { return ServiceRegistry.getInstance().getProvider().notifications; }
  static get activity() { return ServiceRegistry.getInstance().getProvider().activity; }
  static get analytics() { return ServiceRegistry.getInstance().getProvider().analytics; }
  static get suggestions() { return ServiceRegistry.getInstance().getProvider().suggestions; }
}

export function useProvider() {
  return ServiceRegistry.getInstance().getProvider();
}
