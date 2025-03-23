#!/usr/bin/env python
# -*- coding: utf-8 -*-

import json
import logging
import os
import datetime
from telegram import Update, WebAppInfo, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Updater, CommandHandler, CallbackContext, MessageHandler, Filters
from flask import Flask, request, jsonify
import threading
from config import BOT_TOKEN, WEBAPP_URL, HOST, PORT, SECRET_KEY

# Настройка логирования
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Инициализация Flask приложения
app = Flask(__name__)
app.config['SECRET_KEY'] = SECRET_KEY

# Хранилище данных пользователей (в реальном приложении лучше использовать базу данных)
user_data = {}

# Обработчики команд для бота
def start(update: Update, context: CallbackContext) -> None:
    """Обработка команды /start"""
    logger.info(f"Получена команда /start от пользователя {update.effective_user.id}")
    user = update.effective_user
    
    # Создаем кнопку для запуска мини-приложения
    keyboard = [
        [InlineKeyboardButton("Открыть мини-приложение", web_app=WebAppInfo(url=WEBAPP_URL))]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    logger.info(f"Отправляю ответ на команду /start пользователю {user.id} с URL: {WEBAPP_URL}")
    update.message.reply_text(
        f"Привет, {user.first_name}! Нажмите на кнопку ниже, чтобы открыть мини-приложение.",
        reply_markup=reply_markup
    )
    logger.info(f"Ответ на команду /start отправлен пользователю {user.id}")

def handle_message(update: Update, context: CallbackContext) -> None:
    """Обработка сообщений с данными от Web App"""
    logger.info(f"Получено сообщение от пользователя {update.effective_user.id}")
    if update.effective_message.web_app_data:
        # Получаем данные из мини-приложения
        data = json.loads(update.effective_message.web_app_data.data)
        user_id = update.effective_user.id
        
        # Сохраняем данные
        user_data[user_id] = data
        logger.info(f"Сохранены данные от пользователя {user_id}: {data}")
        
        # Отправляем подтверждение
        update.message.reply_text(f"Получены данные: {data}")
    else:
        logger.info(f"Получено обычное сообщение от пользователя {update.effective_user.id}")
        update.message.reply_text("Пожалуйста, используйте кнопку для запуска мини-приложения.")

def error_handler(update, context):
    """Обработчик ошибок"""
    logger.error(f"Update {update} caused error {context.error}", exc_info=context.error)

# API эндпоинты
@app.route('/api/user/<int:user_id>', methods=['GET'])
def get_user_data(user_id):
    """Получение данных пользователя по ID"""
    if user_id in user_data:
        return jsonify({"success": True, "data": user_data[user_id]})
    return jsonify({"success": False, "error": "User not found"})

@app.route('/api/user/<int:user_id>', methods=['POST'])
def save_user_data(user_id):
    """Сохранение данных пользователя"""
    try:
        data = request.json
        user_data[user_id] = data
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

# Vercel serverless handler
@app.route('/api/webhook', methods=['POST'])
def telegram_webhook():
    """Обработчик вебхуков от Telegram для Vercel"""
    if request.method == 'POST':
        update = Update.de_json(request.get_json(force=True), None)
        updater = get_updater()
        updater.dispatcher.process_update(update)
        return jsonify({"success": True})
    return jsonify({"success": False})

@app.route('/api/health', methods=['GET'])
def health_check():
    """Проверка работоспособности API"""
    return jsonify({
        "status": "ok",
        "version": "1.0.0",
        "timestamp": str(datetime.datetime.now())
    })

# Функция для получения экземпляра Updater
def get_updater():
    """Получение экземпляра Updater для обработки обновлений"""
    updater = Updater(BOT_TOKEN)
    dispatcher = updater.dispatcher
    
    # Регистрация обработчиков команд
    dispatcher.add_handler(CommandHandler("start", start))
    dispatcher.add_handler(MessageHandler(Filters.text | Filters.status_update.web_app_data, handle_message))
    
    # Регистрация обработчика ошибок
    dispatcher.add_error_handler(error_handler)
    
    return updater

def run_flask():
    """Запуск Flask сервера"""
    app.run(host=HOST, port=int(PORT) + 1, debug=False)

def main():
    """Основная функция для запуска бота"""
    # Инициализация бота
    logger.info(f"Инициализация бота с токеном: {BOT_TOKEN[:5]}...{BOT_TOKEN[-5:]}")
    updater = get_updater()
    
    # Запуск Flask в отдельном потоке
    flask_thread = threading.Thread(target=run_flask)
    flask_thread.daemon = True
    flask_thread.start()
    logger.info(f"Flask сервер запущен на {HOST}:{int(PORT) + 1}")
    
    # Запуск бота
    logger.info("Запуск бота в режиме polling")
    updater.start_polling()
    
    # Ожидание прерывания
    updater.idle()

# Для Vercel serverless functions
app.updater = get_updater()

# Дополнительные маршруты для Vercel
@app.route('/', methods=['GET'])
def index():
    return jsonify({"message": "Telegram Mini App API Backend"})

if __name__ == '__main__':
    logger.info("Запуск основной функции")
    main() 