import { api } from '../api/client';
import { telegram } from '../services/telegram';
import { AccountCard, DisplayAccount, convertApiAccount } from '../components/AccountCard';
import { AccountDetailsPage } from './AccountDetailsPage';
import type { Account, PaginatedResponse } from '../types/api';

// Определяем тип для ответа API
interface AccountsResponse {
  accounts: Account[];
  has_more: boolean;
}

export class HomePage {
  private container: HTMLElement;
  private accountsList: HTMLElement;
  private searchInput: HTMLInputElement;
  private accounts: Account[] = [];
  private isLoading: boolean = false;
  private hasMore: boolean = true;
  private currentPage: number = 1;
  private searchTimeout: number | null = null;
  private currentDetailsPage: AccountDetailsPage | null = null;

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'home-page';

    // Создаем заголовок
    const header = document.createElement('header');
    header.className = 'header';
    header.innerHTML = `
      <h1>Аккаунты</h1>
      <div class="search-container">
        <input type="text" placeholder="Поиск аккаунтов..." class="search-input" />
      </div>
    `;

    // Инициализируем поиск
    this.searchInput = header.querySelector('.search-input')!;
    this.searchInput.addEventListener('input', () => this.handleSearch());

    // Создаем список аккаунтов
    this.accountsList = document.createElement('div');
    this.accountsList.className = 'accounts-list';

    // Добавляем все элементы на страницу
    this.container.appendChild(header);
    this.container.appendChild(this.accountsList);

    // Инициализируем бесконечную прокрутку
    this.setupInfiniteScroll();

    // Загружаем первую страницу
    this.loadAccounts();
  }

  private async loadAccounts(search: string = ''): Promise<void> {
    if (this.isLoading || !this.hasMore) return;

    this.isLoading = true;
    this.showLoader();

    try {
      const response = await api.getAccounts({
        page: this.currentPage,
        search: search
      });

      if (response.status === 'success' && Array.isArray(response.data)) {
        const accounts = response.data;
        this.accounts = this.currentPage === 1 ? accounts : [...this.accounts, ...accounts];
        this.hasMore = accounts.length === 100; // Если получили максимальное количество записей, значит есть ещё
        this.currentPage++;
        this.updateAccountsList();
      } else {
        throw new Error(response.error || 'Failed to load accounts');
      }
    } catch (error) {
      console.error('Failed to load accounts:', error);
      this.showError('Не удалось загрузить аккаунты');
    } finally {
      this.isLoading = false;
      this.hideLoader();
    }
  }

  private handleSearch(): void {
    const query = this.searchInput.value.trim();
    
    // Отменяем предыдущий таймаут
    if (this.searchTimeout) {
      window.clearTimeout(this.searchTimeout);
    }

    // Устанавливаем новый таймаут
    this.searchTimeout = window.setTimeout(() => {
      this.currentPage = 1;
      this.hasMore = true;
      this.accounts = [];
      this.updateAccountsList();
      this.loadAccounts(query);
    }, 300);
  }

  private setupInfiniteScroll(): void {
    // Создаем сентинел для бесконечной прокрутки
    const sentinel = document.createElement('div');
    sentinel.className = 'scroll-sentinel';
    this.container.appendChild(sentinel);

    // Создаем наблюдатель
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadAccounts(this.searchInput.value.trim());
        }
      });
    });

    // Начинаем наблюдение
    observer.observe(sentinel);
  }

  private updateAccountsList(): void {
    // Очищаем список
    this.accountsList.innerHTML = '';

    if (!this.accounts || this.accounts.length === 0) {
      const emptyState = document.createElement('div');
      emptyState.className = 'empty-state';
      emptyState.innerHTML = `
        <div class="empty-icon">🔍</div>
        <h2>Ничего не найдено</h2>
        <p>Попробуйте изменить параметры поиска</p>
      `;
      this.accountsList.appendChild(emptyState);
      return;
    }

    // Добавляем карточки аккаунтов
    this.accounts.forEach(account => {
      const displayAccount = convertApiAccount(account);
      const card = new AccountCard(displayAccount, () => this.handleAccountClick(account));
      card.mount(this.accountsList);
    });
  }

  private handleAccountClick(account: Account): void {
    telegram.hapticImpact('light');
    
    // Создаем страницу деталей
    this.currentDetailsPage = new AccountDetailsPage(account, () => {
      this.currentDetailsPage?.unmount();
      this.currentDetailsPage = null;
      this.container.style.display = 'block';
    });

    // Скрываем главную страницу
    this.container.style.display = 'none';

    // Показываем страницу деталей
    this.currentDetailsPage.mount(document.body);
  }

  private showLoader(): void {
    const loader = document.createElement('div');
    loader.className = 'loader';
    loader.innerHTML = '<div class="spinner"></div>';
    this.container.appendChild(loader);
  }

  private hideLoader(): void {
    const loader = this.container.querySelector('.loader');
    if (loader) {
      loader.remove();
    }
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

  public mount(parent: HTMLElement): void {
    parent.appendChild(this.container);
  }

  public unmount(): void {
    this.container.remove();
  }
} 