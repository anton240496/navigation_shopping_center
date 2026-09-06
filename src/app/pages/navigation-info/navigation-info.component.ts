import { Component } from '@angular/core';

// Интерфейс для слайдов карусели
interface Slide {
  icon: string;
  title: string;
  description: string;
}

// Интерфейс для аккордеона
interface AccordionItem {
  title: string;
  content: string;
  isOpen: boolean;
}

// Интерфейс для модального окна
interface ModalBlock {
  id: string;
  title: string;
  content: string;
}

@Component({
  selector: 'app-navigation-info',
  standalone: true,
  templateUrl: './navigation-info.component.html',
  styleUrl: './navigation-info.component.css'
})
export class NavigationInfoComponent {

  // === ДАННЫЕ ДЛЯ КАРУСЕЛИ ===
  slides: Slide[] = [
    {
      icon: '🗺️',
      title: 'Интерактивная карта',
      description: '3D-план каждого этажа с отображением всех магазинов, кафе и сервисов'
    },
    {
      icon: '📍',
      title: 'Точная навигация',
      description: 'Определение вашего местоположения с точностью до 1 метра'
    },
    {
      icon: '🚶',
      title: 'Пошаговые маршруты',
      description: 'Построение оптимального пути до любой точки ТЦ'
    },
    {
      icon: '🅿️',
      title: 'Умная парковка',
      description: 'Направление к ближайшему свободному парковочному месту'
    },
    {
      icon: '📱',
      title: 'Мобильное приложение',
      description: 'Доступ к навигации прямо со смартфона'
    }
  ];

  currentSlideIndex = 0;

  // === ДАННЫЕ ДЛЯ АККОРДЕОНА ===
  accordionItems: AccordionItem[] = [
    {
      title: 'Как работает навигация в помещении?',
      content: 'Система использует BLE-маяки и Wi-Fi для определения вашего местоположения. Данные обрабатываются в реальном времени и отображаются на интерактивной карте.',
      isOpen: false
    },
    {
      title: 'Нужен ли интернет для работы?',
      content: 'Базовая навигация работает в офлайн-режиме. Для загрузки обновлений карт и акций рекомендуется подключение к Wi-Fi ТЦ.',
      isOpen: false
    },
    {
      title: 'Какая точность определения?',
      content: 'Точность позиционирования составляет 1-3 метра в зависимости от плотности установки маяков.',
      isOpen: false
    },
    {
      title: 'Можно ли забронировать парковку?',
      content: 'Да, через приложение можно заранее забронировать парковочное место и построить маршрут от него до нужного магазина.',
      isOpen: false
    }
  ];

  // === ДАННЫЕ ДЛЯ МОДАЛЬНЫХ ОКОН ===
  modalBlocks: ModalBlock[] = [
    {
      id: 'features',
      title: 'Возможности системы',
      content: `• Интерактивная 3D-карта всех этажей
• Голосовое сопровождение по маршруту
• Поиск магазинов по категориям
• Информация об акциях и скидках
• Бронирование переговорных комнат
• Трекинг персонала и оборудования
• Аналитика посещаемости
• Интеграция с программой лояльности`
    },
    {
      id: 'zones',
      title: 'Зоны ТЦ',
      content: `• 1 этаж: Продуктовые магазины, аптеки, банкоматы
• 2 этаж: Одежда, обувь, аксессуары
• 3 этаж: Кафе, рестораны, фуд-корт
• 4 этаж: Кинотеатр, развлечения, детская зона
• Парковка: 3 уровня, 2000+ мест`
    },
    {
      id: 'how-it-works',
      title: 'Как это работает',
      content: `1. Откройте приложение или инфомат в ТЦ
2. Выберите пункт назначения на карте
3. Следуйте пошаговым инструкциям
4. Получайте уведомления об акциях по пути
5. При необходимости измените маршрут в реальном времени`
    }
  ];

  // Открытое модальное окно
  openModalId: string | null = null;

  // === МЕТОДЫ ДЛЯ КАРУСЕЛИ ===
  nextSlide(): void {
    this.currentSlideIndex = (this.currentSlideIndex + 1) % this.slides.length;
  }

  prevSlide(): void {
    this.currentSlideIndex = this.currentSlideIndex === 0
      ? this.slides.length - 1
      : this.currentSlideIndex - 1;
  }

  goToSlide(index: number): void {
    this.currentSlideIndex = index;
  }

  // === МЕТОД ДЛЯ АККОРДЕОНА ===
  toggleAccordion(index: number): void {
    this.accordionItems[index].isOpen = !this.accordionItems[index].isOpen;
  }

  // === МЕТОДЫ ДЛЯ МОДАЛЬНЫХ ОКОН ===
  // Открытие модального окна
  openModal(id: string): void {
    this.openModalId = id;
  }

  // Закрытие модального окна
  closeModal(): void {
    this.openModalId = null;
  }
}
