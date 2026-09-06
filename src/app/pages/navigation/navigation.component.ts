import { Component } from '@angular/core';

// Интерфейс для комнаты на плане
interface Room {
  id: string;        // Уникальный идентификатор
  name: string;      // Название комнаты
  x: number;         // Координата X на SVG
  y: number;         // Координата Y на SVG
  width: number;     // Ширина
  height: number;    // Высота
}

// Интерфейс для точки интереса (POI)
interface PointOfInterest {
  id: string;
  name: string;
  x: number;         // Координата X
  y: number;         // Координата Y
  icon: string;      // Эмодзи иконка
}

@Component({
  selector: 'app-navigation',
  standalone: true,
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.css'
})
export class NavigationComponent {

  // ======= ДАННЫЕ ПЛАНА ПОМЕЩЕНИЯ =======

  // Список комнат на плане
  rooms: Room[] = [
    { id: 'room1', name: 'Приёмная', x: 50, y: 50, width: 150, height: 120 },
    { id: 'room2', name: 'Кабинет 1', x: 220, y: 50, width: 130, height: 120 },
    { id: 'room3', name: 'Кабинет 2', x: 370, y: 50, width: 130, height: 120 },
    { id: 'room4', name: 'Конференц-зал', x: 50, y: 200, width: 200, height: 130 },
    { id: 'room5', name: 'Кухня', x: 280, y: 200, width: 120, height: 130 },
    { id: 'room6', name: 'Санузел', x: 430, y: 200, width: 70, height: 130 },
  ];

  // Точки интереса на плане
  points: PointOfInterest[] = [
    { id: 'p1', name: 'Автомат с кофе', x: 320, y: 250, icon: '☕' },
    { id: 'p2', name: 'Принтер', x: 140, y: 250, icon: '🖨️' },
    { id: 'p3', name: 'Выход', x: 460, y: 300, icon: '🚪' },
  ];

  // ======= СОСТОЯНИЕ НАВИГАЦИИ =======

  // Выбранная комната (при клике)
  selectedRoom: Room | null = null;

  // Начальная точка маршрута
  startPoint: { x: number; y: number; name: string } | null = null;

  // Конечная точка маршрута
  endPoint: { x: number; y: number; name: string } | null = null;

  // Режим: 'select' — выбор комнаты, 'route' — построение маршрута
  mode: 'select' | 'route' = 'select';

  // ==== МЕТОДЫ =======

  // Клик по комнате
  onRoomClick(room: Room): void {
    if (this.mode === 'select') {
      // В режиме выбора — просто выделяем комнату
      this.selectedRoom = room;
    } else {
      // В режиме маршрута — устанавливаем начальную или конечную точку
      this.setRoutePoint(room);
    }
  }

  // Установка точки маршрута (начальная/конечная)
  setRoutePoint(room: Room): void {
    // Центр комнаты как точка маршрута
    const point = {
      x: room.x + room.width / 2,
      y: room.y + room.height / 2,
      name: room.name
    };

    if (!this.startPoint) {
      // Если начальная точка не задана — ставим
      this.startPoint = point;
    } else if (!this.endPoint) {
      // Если конечная не задана — ставим
      this.endPoint = point;
    } else {
      // Обе точки заданы — сбрасываем и начинаем заново
      this.startPoint = point;
      this.endPoint = null;
    }
  }

  // Переключение режима
  toggleMode(): void {
    this.mode = this.mode === 'select' ? 'route' : 'select';
    this.resetRoute();
  }

  // Сброс маршрута
  resetRoute(): void {
    this.startPoint = null;
    this.endPoint = null;
  }

  // Проверка, является ли комната начальной точкой маршрута
  isStartRoom(room: Room): boolean {
    return this.startPoint?.name === room.name;
  }

  // Проверка, является ли комната конечной точкой маршрута
  isEndRoom(room: Room): boolean {
    return this.endPoint?.name === room.name;
  }
}
