import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-nav-menu',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './nav-menu.component.html',
  styleUrl: './nav-menu.component.css'
})
export class NavMenuComponent {
  navLinks = [
    { path: '/', label: 'Главная' },
    { path: '/navigation', label: '2D карта' },
    { path: '/3d', label: '3D модель' },
    { path: '/info', label: 'О ТЦ' },
    { path: '/calculator', label: 'Калькулятор аренды' },
    { path: '/contacts', label: 'Контакты' }
  ];

  // Флаг: открыто ли бургер-меню (для мобильных)
  isMenuOpen = false;

  // Открыть/закрыть меню
  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  // Закрыть меню (после клика по ссылке)
  closeMenu(): void {
    this.isMenuOpen = false;
  }
}
