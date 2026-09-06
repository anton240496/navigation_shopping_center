import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './contacts.component.html',
  styleUrl: './contacts.component.css'
})
export class ContactsComponent {

  // Форма обратной связи
  contactForm: FormGroup;

  // Флаг отправки формы
  isSubmitted = false;

  // Флаг успешной отправки
  isSuccess = false;

  constructor(private fb: FormBuilder) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\+7\(\d{3}\)\d{3}-\d{2}-\d{2}$/)]],
      message: ['Здравствуйте! Хочу, оформить аренду помещения', [Validators.required, Validators.minLength(20)]]
    });
  }

  // Обработка ввода телефона (маска)
  // Формат: +7(XXX)XXX-XX-XX
  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');

    // Ограничиваем 11 цифрами (7 + 10)
    if (value.length > 11) value = value.slice(0, 11);

    let formatted = '+7';
    if (value.length > 1) {
      formatted += '(' + value.slice(1, 4);
    }
    if (value.length >= 4) {
      formatted += ')' + value.slice(4, 7);
    }
    if (value.length >= 7) {
      formatted += '-' + value.slice(7, 9);
    }
    if (value.length >= 9) {
      formatted += '-' + value.slice(9, 11);
    }

    this.contactForm.get('phone')?.setValue(formatted);
  }

  // Отправка формы
  onSubmit(): void {
    this.isSubmitted = true;
    this.isSuccess = false;

    if (this.contactForm.valid) {
      this.isSuccess = true;
      this.isSubmitted = false;
    }
  }

  // Проверка ошибки поля
  hasError(field: string): boolean {
    const control = this.contactForm.get(field);
    return this.isSubmitted && control ? control.invalid : false;
  }

  // Текст ошибки
  getErrorMessage(field: string): string {
    const control = this.contactForm.get(field);
    if (!control) return '';

    if (control.hasError('required')) return 'Заполните это поле';
    if (control.hasError('minlength')) {
      const len = control.getError('minlength').requiredLength;
      return `Минимум ${len} символов`;
    }
    if (control.hasError('email')) return 'Введите email в формате example@mail.ru';
    if (control.hasError('pattern')) return 'Формат: +7(XXX)XXX-XX-XX';
    return '';
  }
}

