// Определяем тип для Telegram Web App
interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  close: () => void;
  MainButton: {
    text: string;
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
  };
  BackButton: {
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
  };
  onEvent: (eventType: string, callback: () => void) => void;
  offEvent: (eventType: string, callback: () => void) => void;
  sendData: (data: string) => void;
  enableClosingConfirmation: () => void;
  disableClosingConfirmation: () => void;
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
  backgroundColor: string;
  textColor: string;
  buttonColor: string;
  buttonTextColor: string;
  headerColor: string;
  initData: string;
  initDataUnsafe: {
    query_id: string;
    user: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code: string;
    };
    auth_date: number;
    hash: string;
  };
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  themeParams: {
    bg_color: string;
  };
}

declare global {
  interface Window {
    Telegram: {
      WebApp: TelegramWebApp;
    };
  }
}

class TelegramService {
  private static instance: TelegramService;
  private webApp: TelegramWebApp;

  private constructor() {
    this.webApp = window.Telegram.WebApp;
    this.init();
  }

  public static getInstance(): TelegramService {
    if (!TelegramService.instance) {
      TelegramService.instance = new TelegramService();
    }
    return TelegramService.instance;
  }

  private init(): void {
    // Сообщаем Telegram, что приложение готово
    this.webApp.ready();

    // Разворачиваем приложение на весь экран
    this.webApp.expand();
  }

  public hapticImpact(style: 'light' | 'medium' | 'heavy'): void {
    this.webApp.HapticFeedback.impactOccurred(style);
  }

  public hapticNotification(type: 'error' | 'success' | 'warning'): void {
    this.webApp.HapticFeedback.notificationOccurred(type);
  }

  public hapticSelection(): void {
    this.webApp.HapticFeedback.selectionChanged();
  }

  public showBackButton(callback: () => void): void {
    this.webApp.BackButton.show();
    this.webApp.BackButton.onClick(callback);
  }

  public hideBackButton(): void {
    this.webApp.BackButton.hide();
  }

  public showMainButton(text: string, callback: () => void): void {
    this.webApp.MainButton.text = text;
    this.webApp.MainButton.onClick(callback);
    this.webApp.MainButton.show();
  }

  public hideMainButton(): void {
    this.webApp.MainButton.hide();
  }

  public close(): void {
    this.webApp.close();
  }
}

// Экспортируем единственный экземпляр сервиса
export const telegram = TelegramService.getInstance(); 