import { TestBed } from '@angular/core/testing';
import { ContactsComponent } from './contacts.component';

describe('ContactsComponent', () => {
  let component: ContactsComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactsComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(ContactsComponent);
    component = fixture.componentInstance;
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should have message prefilled by default', () => {
    expect(component.contactForm.get('message')?.value).toContain('Здравствуйте!');
  });

  it('should be invalid with empty required fields', () => {
    component.contactForm.patchValue({
      name: '',
      email: '',
      phone: '',
      message: '',
    });
    expect(component.contactForm.invalid).toBe(true);
  });

  it('should be valid with correct data', () => {
    component.contactForm.patchValue({
      name: 'Иван',
      email: 'ivan@mail.ru',
      phone: '+7(960)268-09-10',
      message: 'Здравствуйте! Хочу, оформить аренду помещения',
    });
    expect(component.contactForm.valid).toBe(true);
  });

  it('should reject name shorter than 2 characters', () => {
    component.contactForm.patchValue({ name: 'А' });
    expect(component.contactForm.get('name')?.errors?.['minlength']).toBeTruthy();
  });

  it('should reject invalid email', () => {
    component.contactForm.patchValue({ email: 'не-email' });
    expect(component.contactForm.get('email')?.errors?.['email']).toBeTruthy();
  });

  it('should reject phone not matching mask', () => {
    component.contactForm.patchValue({ phone: '12345' });
    expect(component.contactForm.get('phone')?.errors?.['pattern']).toBeTruthy();
  });

  it('should format phone with mask', () => {
    const event = { target: { value: '+7(960)268-09-10' } } as unknown as Event;
    component.onPhoneInput(event);
    expect(component.contactForm.get('phone')?.value).toBe('+7(960)268-09-10');
  });

  it('should show success when submitting valid form', () => {
    component.contactForm.patchValue({
      name: 'Иван',
      email: 'ivan@mail.ru',
      phone: '+7(960)268-09-10',
      message: 'Здравствуйте! Хочу, оформить аренду помещения',
    });
    component.onSubmit();
    expect(component.isSuccess).toBe(true);
  });
});