import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ContactsComponent } from './pages/contacts/contacts.component';
import { NavigationComponent } from './pages/navigation/navigation.component';
import { Navigation3dComponent } from './pages/navigation3d/navigation3d.component';
import { NavigationInfoComponent } from './pages/navigation-info/navigation-info.component';
import { RentalCalculatorComponent } from './pages/rental-calculator/rental-calculator.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'contacts', component: ContactsComponent },
  { path: 'navigation', component: NavigationComponent },
  { path: '3d', component: Navigation3dComponent },
  { path: 'info', component: NavigationInfoComponent },
  { path: 'calculator', component: RentalCalculatorComponent },
  { path: '**', redirectTo: '' }
];
