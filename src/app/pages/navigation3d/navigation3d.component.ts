﻿// === ПОДКЛЮЧЕНИЕ БИБЛИОТЕК ===
import { Component, ElementRef, OnInit, OnDestroy, HostListener, Inject, PLATFORM_ID, NgZone } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as THREE from 'three'; // Three.js — библиотека для 3D
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'; // Управление мышью

// === ИНТЕРФЕЙС КОМНАТЫ ===
// Описывает одну комнату в здании
interface Room {
  id: string;         // Уникальный ID (например, 'entrance')
  name: string;       // Название для отображения
  floor: number;      // Этаж (1 или 2)
  x: number;          // Центр комнаты по оси X
  y: number;          // Низ комнаты по Y (0 для 1 этажа, 3.5 для 2)
  z: number;          // Центр комнаты по оси Z
  width: number;      // Ширина комнаты (по X)
  height: number;     // Высота комнаты (по Y)
  depth: number;      // Глубина комнаты (по Z)
  color: number;      // Цвет комнаты в HEX (0xRRGGBB)
}

@Component({
  selector: 'app-navigation3d',
  standalone: true,
  templateUrl: './navigation3d.component.html',
  styleUrl: './navigation3d.component.css'
})
export class Navigation3dComponent implements OnInit, OnDestroy {

  // === THREE.JS ОБЪЕКТЫ ===
  private scene: THREE.Scene = null!;                    // Сцена — контейнер для всех 3D-объектов
  private camera: THREE.PerspectiveCamera = null!;        // Камера — перспективная проекция
  private renderer: THREE.WebGLRenderer = null!;          // Рендерер — рисует на canvas
  private person: THREE.Group = null!;                   // Человек — группа (тело + голов + ноги)
  private controls: OrbitControls = null!;                // Управление мышью (вращение/зум)
  private animationId: number = 0;                        // ID анимации для остановки
  private roomMeshes: Map<string, THREE.Mesh> = new Map(); // Хранение всех комнат

  // === СОСТОЯНИЕ МАРШРУТА ===
  private routePoints: THREE.Vector3[] = [];  // Точки маршрута (XYZ координаты)
  private currentPointIndex = 0;              // Текущая точка маршрута
  private progress = 0;                       // Прогресс между точками (0..1)
  private speed = 0.008;                      // Скорость движения человека

  // === ВЫБРАННЫЕ КОМНАТЫ ===
  startRoom: Room | null = null;  // Точка А (старт)
  endRoom: Room | null = null;    // Точка Б (финиш)
  rooms: Room[] = [];             // Все комнаты здания

  // Флаг: находимся ли мы в браузере
  private isBrowser: boolean;

  // === КОНСТРУКТОР ===
  // Принимает ссылку на DOM-элемент для вставки canvas
  constructor(
    private el: ElementRef,
    @Inject(PLATFORM_ID) platformId: Object,
    private ngZone: NgZone
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  // === ИНИЦИАЛИЗАЦИЯ КОМПОНЕНТА ===
  // Вызывается при создании — запускает всю сцену
  ngOnInit(): void {
    // Three.js работает только в браузере, не на сервере (SSR)
    if (!this.isBrowser) return;

    this.initScene();     // 1. Создаём сцену, камеру, свет
    this.initRooms();     // 2. Загружаем данные о комнатах
    this.createBuilding();// 3. Строим здание в 3D
    this.createPerson();  // 4. Создаём человека
    this.animate();       // 5. Запускаем анимацию
  }

  // === ОЧИСТКА РЕСУРСОВ ===
  // Вызывается при уничтожении компонента
  ngOnDestroy(): void {
    if (!this.isBrowser) return;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  // === ОБРАБОТКА РЕСАЙЗА ОКНА ===
  // Обновляет размер canvas при изменении окна браузера
  @HostListener('window:resize')
  onResize(): void {
    if (!this.isBrowser) return;
    const container = this.el.nativeElement.querySelector('#canvas-container');
    if (!container) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    this.camera.aspect = width / height;           // Обновляем соотношение сторон
    this.camera.updateProjectionMatrix();           // Применяем изменения
    this.renderer.setSize(width, height);           // Меняем размер канваса
  }

  // === СОЗДАНИЕ СЦЕНЫ ===
  // Создаёт сцену, камеру, рендерер и освещение
  private initScene(): void {
    const container = this.el.nativeElement.querySelector('#canvas-container');
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // Сцена — контейнер для всех объектов
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a2e); // Тёмно-синий фон

    // Камера — перспективная проекция
    this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    this.camera.position.set(20, 16, 20);  // Позиция камеры (сверху-сбоку)
    this.camera.lookAt(0, 5, 0);           // Смотрим на центр здания

    // Рендерер — рисует сцену на canvas
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.shadowMap.enabled = true; // Включаем тени
    container.appendChild(this.renderer.domElement);

    // Рассеянный свет (равномерное освещение)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    // Направленный свет (создаёт тени)
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
    dirLight.position.set(15, 25, 15);
    dirLight.castShadow = true;
    this.scene.add(dirLight);

    // Управление мышью (вращение, зум, панорамирование)
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;     // Плавное затухание
    this.controls.dampingFactor = 0.05;     // Сила затухания
    this.controls.minDistance = 5;         // Мин. дистанция камеры
    this.controls.maxDistance = 50;        // Макс. дистанция камеры
  }

  // === ЗАГРУЗКА ДАННЫХ О КОМНАТАХ ===
  // Создаёт массив всех комнат здания
  private initRooms(): void {
    this.rooms = [
      // ПЕРВЫЙ ЭТАЖ (y = 0 — пол первого этажа)
      { id: 'entrance', name: 'Вход', floor: 1, x: 8, y: 0, z: 6, width: 4, height: 3, depth: 3, color: 0x4CAF50 },
      { id: 'hall1', name: 'Холл 1 этаж', floor: 1, x: 4, y: 0, z: 2, width: 6, height: 3, depth: 8, color: 0x2196F3 },
      { id: 'kitchen', name: 'Кухня', floor: 1, x: -4, y: 0, z: 4, width: 5, height: 3, depth: 5, color: 0xFF9800 },
      { id: 'bathroom', name: 'Санузел', floor: 1, x: -5, y: 0, z: -3, width: 3, height: 3, depth: 3, color: 0x9C27B0 },
      { id: 'stairs1', name: 'Лестница (низ)', floor: 1, x: -2, y: 0, z: -4, width: 3, height: 3, depth: 3, color: 0x795548 },

      // ВТОРОЙ ЭТАЖ (y = 3.5 — пол второго этажа)
      { id: 'hall2', name: 'Холл 2 этаж', floor: 2, x: 4, y: 3.5, z: 2, width: 6, height: 3, depth: 8, color: 0x03A9F4 },
      { id: 'office1', name: 'Кабинет 101', floor: 2, x: 8, y: 3.5, z: 6, width: 4, height: 3, depth: 3, color: 0xE91E63 },
      { id: 'office2', name: 'Кабинет 102', floor: 2, x: -4, y: 3.5, z: 4, width: 5, height: 3, depth: 5, color: 0x00BCD4 },
      { id: 'conference', name: 'Конференц-зал', floor: 2, x: -3, y: 3.5, z: -3, width: 6, height: 3, depth: 6, color: 0xCDDC39 },
      { id: 'stairs2', name: 'Лестница (верх)', floor: 2, x: -2, y: 3.5, z: -4, width: 3, height: 3, depth: 3, color: 0x795548 },
    ];
  }

  // === ПОСТРОЕНИЕ ЗДАНИЯ ===
  // Создаёт все комнаты и лестницу
  private createBuilding(): void {
    for (const room of this.rooms) {
      this.createRoom(room);
    }
    this.createStairs();
  }

  // === СОЗДАНИЕ ОДНОЙ КОМНАТЫ ===
  // Создаёт комнату как полупрозрачный куб с рамкой
  private createRoom(room: Room): void {
    const geometry = new THREE.BoxGeometry(room.width, room.height, room.depth);

    // Полупрозрачный материал (opacity: 0.7 — видно сквозь стены)
    const material = new THREE.MeshLambertMaterial({ color: room.color, transparent: true, opacity: 0.7 });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(room.x, room.y + room.height / 2, room.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);

    // Сохраняем меш для подсветки при выборе
    this.roomMeshes.set(room.id, mesh);

    // Рамка комнаты (контур)
    const edges = new THREE.EdgesGeometry(geometry);
    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x333333 }));
    line.position.copy(mesh.position);
    this.scene.add(line);
  }

  // === СОЗДАНИЕ ЛЕСТНИЦЫ ===
  // Создаёт 8 ступенек от 1 этажа ко 2-му
  private createStairs(): void {
    const stairMat = new THREE.MeshLambertMaterial({ color: 0x8D6E63 });
    for (let i = 0; i < 8; i++) {
      const step = new THREE.Mesh(new THREE.BoxGeometry(2, 0.2, 0.6), stairMat);
      // Каждая ступенька выше (y) и глубже (z)
      step.position.set(-2, 0.3 + i * 0.4, -4 + i * 0.5);
      step.castShadow = true;
      this.scene.add(step);
    }
  }

  // === СОЗДАНИЕ ЧЕЛОВЕКА ===
  // Создаёт фигуру из геометрических примитивов (Group)
  private createPerson(): void {
    this.person = new THREE.Group();

    // Тело — цилиндр (радиус 0.25, высота 1.0)
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.25, 1.0, 8),
      new THREE.MeshLambertMaterial({ color: 0xFF5722 }) // Оранжевый
    );
    body.position.y = 0.5; // Ноги на полу, центр на 0.5
    body.castShadow = true;
    this.person.add(body);

    // Голова — сфера (радиус 0.2)
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 16, 16),
      new THREE.MeshLambertMaterial({ color: 0xFFCCBC }) // Бежевый
    );
    head.position.y = 1.2; // Над телом
    head.castShadow = true;
    this.person.add(head);

    this.scene.add(this.person);
  }

  // === ВЫБОР КОМНАТЫ ===
  // Логика: 1 клик = старт, 2 клик = финиш + маршрут, 3 клик = сброс
  selectRoom(room: Room): void {
    if (!this.startRoom) {
      this.startRoom = room;
      this.updateRoomHighlight();
    } else if (!this.endRoom) {
      this.endRoom = room;
      this.calculateRoute();
      this.updateRoomHighlight();
    } else {
      this.startRoom = room;
      this.endRoom = null;
      this.routePoints = [];
      this.updateRoomHighlight();
    }
  }

  // === РАСЧЁТ МАРШРУТА ===
  // Если этажи одинаковые — прямой путь, если разные — через лестницу
  private calculateRoute(): void {
    if (!this.startRoom || !this.endRoom) return;

    // Центры комнат + 0.5 по Y (человек идёт на уровне пола)
    const start = new THREE.Vector3(this.startRoom.x, this.startRoom.y + 0.5, this.startRoom.z);
    const end = new THREE.Vector3(this.endRoom.x, this.endRoom.y + 0.5, this.endRoom.z);

    if (this.startRoom.floor !== this.endRoom.floor) {
      // Разные этажи — лестница
      const stairsBottom = new THREE.Vector3(-2, 0.5, -4);
      const stairsTop = new THREE.Vector3(-2, 3.8, -1);
      if (this.startRoom.floor === 1) {
        this.routePoints = [start, stairsBottom, stairsTop, end];
      } else {
        this.routePoints = [start, stairsTop, stairsBottom, end];
      }
    } else {
      // Один этаж — прямо
      this.routePoints = [start, end];
    }

    this.currentPointIndex = 0;
    this.progress = 0;
    this.person.position.copy(this.routePoints[0]);
  }

  // === СБРОС МАРШРУТА ===
  // Очищает выбор комнат и сбрасывает анимацию
  resetRoute(): void {
    this.updateRoomHighlight();
    this.startRoom = null;
    this.endRoom = null;
    this.routePoints = [];
    this.currentPointIndex = 0;
    this.progress = 0;
  }

  // === ПОДСВЕТКА КОМНАТ ===
  // Зелёный = старт, красный = финиш
  private updateRoomHighlight(): void {
    for (const [id, mesh] of this.roomMeshes) {
      const mat = mesh.material as THREE.MeshLambertMaterial;
      if (this.startRoom?.id === id) {
        mat.emissive.setHex(0x00ff00);
        mat.emissiveIntensity = 0.5;
      } else if (this.endRoom?.id === id) {
        mat.emissive.setHex(0xff0000);
        mat.emissiveIntensity = 0.5;
      } else {
        mat.emissive.setHex(0x000000);
        mat.emissiveIntensity = 0;
      }
    }
  }

  // === ГЛАВНЫЙ ЦИКЛ АНИМАЦИИ ===
  // Вызывается 60 раз в секунду
  private animate(): void {
    this.animationId = requestAnimationFrame(() => this.animate());

    // Движение человека по маршруту
    if (this.routePoints.length > 1 && this.currentPointIndex < this.routePoints.length - 1) {
      this.progress += this.speed;
      if (this.progress >= 1) {
        this.progress = 0;
        this.currentPointIndex++;
      }
      // Плавная интерполяция позиции
      const current = this.routePoints[this.currentPointIndex];
      const next = this.routePoints[this.currentPointIndex + 1];
      this.person.position.lerpVectors(current, next, this.progress);
      // Поворот в направлении движения
      const direction = new THREE.Vector3().subVectors(next, current).normalize();
      if (direction.length() > 0) {
        this.person.rotation.y = Math.atan2(direction.x, direction.z);
      }
    }
    // Покачивание при ходьбе
    if (this.currentPointIndex < this.routePoints.length - 1) {
      this.person.position.y += Math.sin(this.progress * Math.PI * 8) * 0.015;
    }
    // Обновление и рендер
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}