import './styles/main.css';
import { HomePage } from './pages/HomePage';
import { telegram } from './services/telegram';

// Инициализируем приложение
const app = document.getElementById('app');
if (!app) {
  throw new Error('Root element not found');
}

// Инициализируем Telegram Web App
telegram.init();

// Создаем и монтируем главную страницу
const homePage = new HomePage();
homePage.mount(app);
