import { api } from '../api/client';
import { telegram } from '../services/telegram';
import type { Account, Deal } from '../types/api';

// Определяем тип для Telegram Web App
interface TelegramWebAppWithConfirm extends TelegramWebApp {
  showConfirm: (message: string, callback: (confirmed: boolean) => void) => void;
  openTelegramLink: (url: string) => void;
}

export class AccountDetailsPage {
  private container: HTMLElement;
  private account: Account;
  private onBack: () => void;
  private isLoading: boolean = false;

  constructor(account: Account, onBack: () => void) {
    this.container = document.createElement('div');
    this.container.className = 'account-details-page';
    this.account = account;
    this.onBack = onBack;
    this.render();
  }

  private render(): void {
    // Создаем шапку с кнопкой назад
    const header = document.createElement('header');
    header.className = 'details-header';
    header.innerHTML = `
      <button class="back-button">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <h1>Детали аккаунта</h1>
    `;

    // Добавляем обработчик для кнопки назад
    const backButton = header.querySelector('.back-button');
    if (backButton) {
      backButton.addEventListener('click', () => {
        telegram.hapticImpact('light');
        this.onBack();
      });
    }

    // Создаем основной контент
    const content = document.createElement('div');
    content.className = 'details-content';
    content.innerHTML = `
      <div class="account-image">
        <img src="/images/placeholder.svg" alt="${this.account.game}" />
      </div>
      
      <div class="account-info">
        <div class="game-badge">${this.account.game}</div>
        <h2 class="account-title">${this.account.description}</h2>
        <div class="price-tag">${this.formatPrice(this.account.price)} ₽</div>
        
        <div class="account-description">
          ${this.account.description}
        </div>

        <div class="seller-info">
          <h3>Продавец</h3>
          <div class="seller-card">
            <div class="seller-name">User ${this.account.user_id}</div>
            <div class="seller-rating">
              <span class="star">⭐</span>
              0.0
            </div>
          </div>
        </div>

        <div class="action-buttons">
          <button class="primary-button buy-button">
            Купить сейчас
          </button>
          <button class="secondary-button chat-button">
            Написать продавцу
          </button>
        </div>
      </div>
    `;

    // Добавляем обработчики для кнопок
    const buyButton = content.querySelector('.buy-button');
    if (buyButton) {
      buyButton.addEventListener('click', () => this.handleBuy());
    }

    const chatButton = content.querySelector('.chat-button');
    if (chatButton) {
      chatButton.addEventListener('click', () => this.handleChat());
    }

    // Добавляем все элементы на страницу
    this.container.appendChild(header);
    this.container.appendChild(content);
  }

  private formatPrice(price: number): string {
    return price.toLocaleString('ru-RU');
  }

  private async handleBuy(): Promise<void> {
    if (this.isLoading) return;

    telegram.hapticImpact('medium');
    
    // Показываем подтверждение
    // @ts-ignore - игнорируем ошибку типов для window.Telegram
    const tg = window.Telegram.WebApp as TelegramWebAppWithConfirm;
    tg.showConfirm(
      `Вы действительно хотите купить аккаунт "${this.account.description}" за ${this.formatPrice(this.account.price)} ₽?`,
      async (confirmed: boolean) => {
        if (confirmed) {
          this.isLoading = true;
          try {
            const response = await api.createDeal({
              account_id: this.account.id
            });

            if (response.status === 'success' && response.data) {
              telegram.hapticNotification('success');
              this.showSuccess('Заявка на покупку создана!');
              // TODO: Перейти на страницу сделки
            } else {
              throw new Error(response.error || 'Failed to create deal');
            }
          } catch (error) {
            console.error('Failed to create deal:', error);
            telegram.hapticNotification('error');
            this.showError('Не удалось создать заявку на покупку');
          } finally {
            this.isLoading = false;
          }
        }
      }
    );
  }

  private handleChat(): void {
    telegram.hapticImpact('light');
    // @ts-ignore - игнорируем ошибку типов для window.Telegram
    const tg = window.Telegram.WebApp as TelegramWebAppWithConfirm;
    tg.openTelegramLink(`https://t.me/user${this.account.user_id}`);
  }

  private showError(message: string): void {
    const error = document.createElement('div');
    error.className = 'error-message';
    error.textContent = message;
    this.container.appendChild(error);

    setTimeout(() => {
      error.remove();
    }, 3000);
  }

  private showSuccess(message: string): void {
    const success = document.createElement('div');
    success.className = 'success-message';
    success.textContent = message;
    this.container.appendChild(success);

    setTimeout(() => {
      success.remove();
    }, 3000);
  }

  public mount(parent: HTMLElement): void {
    parent.appendChild(this.container);
  }

  public unmount(): void {
    this.container.remove();
  }
} 