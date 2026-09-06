import { TestBed } from '@angular/core/testing';
import { RentalCalculatorComponent } from './rental-calculator.component';

describe('RentalCalculatorComponent', () => {
  let component: RentalCalculatorComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RentalCalculatorComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(RentalCalculatorComponent);
    component = fixture.componentInstance;
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should start with one row', () => {
    expect(component.rows.length).toBe(1);
  });

  it('should add a row', () => {
    const before = component.rows.length;
    component.addRow();
    expect(component.rows.length).toBe(before + 1);
  });

  it('should not remove the last row', () => {
    component.removeRow(component.rows[0].id);
    expect(component.rows.length).toBe(1);
  });

  it('should return price for floor', () => {
    expect(component.getPriceForFloor(1)).toBe(1500);
    expect(component.getPriceForFloor(2)).toBe(1200);
  });

  it('should calculate row total', () => {
    component.rows[0].floor = 1;
    component.rows[0].premisesCount = 2;
    component.rows[0].areaPerPremise = 50;
    const expected = 2 * 50 * 1500; // 150 000
    expect(component.getRowTotal(component.rows[0])).toBe(expected);
  });

  it('should calculate totals for multiple rows', () => {
    component.rows = [
      { id: 1, floor: 1, premisesCount: 2, areaPerPremise: 50 }, // 2×50×1500 = 150 000
      { id: 2, floor: 2, premisesCount: 1, areaPerPremise: 30 }, // 1×30×1200 = 36 000
    ];
    expect(component.totalPremises).toBe(3);
    expect(component.totalArea).toBe(130);
    expect(component.grandTotal).toBe(186000);
  });

  it('should format numbers with spaces', () => {
    expect(component.formatNumber(186000)).toBe('186 000');
  });
});