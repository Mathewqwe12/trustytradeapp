import type { Account as ApiAccount } from '../types/api';

// Интерфейс для отображения карточки аккаунта
export interface DisplayAccount {
  id: number;
  game: string;
  title: string;
  price: number;
  imageUrl: string;
  seller: {
    id: number;
    name: string;
    rating: number;
  };
}

// Функция для преобразования API аккаунта в отображаемый формат
export function convertApiAccount(apiAccount: ApiAccount): DisplayAccount {
  return {
    id: apiAccount.id,
    game: apiAccount.game,
    title: apiAccount.description || `${apiAccount.game} Account`,
    price: apiAccount.price,
    imageUrl: '/placeholder.png',
    seller: {
      id: apiAccount.user_id,
      name: `User ${apiAccount.user_id}`,
      rating: 0
    }
  };
}

export class AccountCard {
  private container: HTMLElement;
  private account: DisplayAccount;
  private onClick?: (account: DisplayAccount) => void;

  constructor(account: DisplayAccount, onClick?: (account: DisplayAccount) => void) {
    this.container = document.createElement('div');
    this.container.className = 'account-card';
    this.account = account;
    this.onClick = onClick;
    this.render();
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="card-image">
        <img src="${this.account.imageUrl}" alt="${this.account.title}" />
      </div>
      <div class="card-content">
        <div class="game-badge">${this.account.game}</div>
        <h3 class="card-title">${this.account.title}</h3>
        <div class="card-footer">
          <div class="price">${this.formatPrice(this.account.price)} ₽</div>
          <div class="seller">
            <span class="seller-name">${this.account.seller.name}</span>
            <span class="seller-rating">
              <span class="star">⭐</span>
              ${this.account.seller.rating.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    `;

    if (this.onClick) {
      this.container.addEventListener('click', () => this.onClick?.(this.account));
    }
  }

  private formatPrice(price: number): string {
    return price.toLocaleString('ru-RU');
  }

  public mount(parent: HTMLElement): void {
    parent.appendChild(this.container);
  }

  public unmount(): void {
    this.container.remove();
  }
} 