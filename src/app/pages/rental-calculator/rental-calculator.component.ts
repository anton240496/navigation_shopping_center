import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

// Строка калькулятора
interface RentalRow {
  id: number;
  floor: number;
  premisesCount: number;
  areaPerPremise: number;
}

@Component({
  selector: 'app-rental-calculator',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './rental-calculator.component.html',
  styleUrl: './rental-calculator.component.css'
})
export class RentalCalculatorComponent {

  // Цены за квадратный метр по этажам
  floorPrices = [
    { floor: 1, pricePerSqm: 1500 },
    { floor: 2, pricePerSqm: 1200 },
  ];

  // Строки калькулятора
  rows: RentalRow[] = [
    { id: 1, floor: 1, premisesCount: 1, areaPerPremise: 50 }
  ];

  nextId = 2;

  // Добавить строку
  addRow(): void {
    this.rows.push({
      id: this.nextId++,
      floor: 1,
      premisesCount: 1,
      areaPerPremise: 50
    });
  }

  // Удалить строку
  removeRow(id: number): void {
    if (this.rows.length > 1) {
      this.rows = this.rows.filter(r => r.id !== id);
    }
  }

  // Цена за квадрат для этажа
  getPriceForFloor(floor: number): number {
    const found = this.floorPrices.find(fp => fp.floor === floor);
    return found ? found.pricePerSqm : 0;
  }

  // Стоимость строки
  getRowTotal(row: RentalRow): number {
    const price = this.getPriceForFloor(row.floor);
    return row.premisesCount * row.areaPerPremise * price;
  }

  // Итого: количество помещений
  get totalPremises(): number {
    return this.rows.reduce((sum, row) => sum + row.premisesCount, 0);
  }

  // Итого: общая площадь
  get totalArea(): number {
    return this.rows.reduce((sum, row) => sum + (row.premisesCount * row.areaPerPremise), 0);
  }

  // Итого: общая сумма
  get grandTotal(): number {
    return this.rows.reduce((sum, row) => sum + this.getRowTotal(row), 0);
  }

  // Форматирование числа
  formatNumber(num: number): string {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }
}
