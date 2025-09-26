// AuthModel.ts - Model for handling authentication state
export interface AuthState {
  isLoggedIn: boolean;
  isLoading: boolean;
}

export class AuthModel {
  private state: AuthState = {
    isLoggedIn: false,
    isLoading: false,
  };

  private listeners: Array<(state: AuthState) => void> = [];

  getState(): AuthState {
    return { ...this.state };
  }

  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getState()));
  }

  setLoading(isLoading: boolean): void {
    this.state.isLoading = isLoading;
    this.notifyListeners();
  }

  setLoggedIn(isLoggedIn: boolean): void {
    this.state.isLoggedIn = isLoggedIn;
    this.state.isLoading = false;
    this.notifyListeners();
  }

  reset(): void {
    this.state = {
      isLoggedIn: false,
      isLoading: false,
    };
    this.notifyListeners();
  }
}

// Singleton instance
export const authModel = new AuthModel();
