import { Routes } from '@angular/router';
import {Profile} from './pages/profile/profile';
import {Home} from './pages/home/home';
import {Friends} from './pages/friends/friends';
import {Signin} from './pages/signin/signin';
import {Signup} from './pages/signup/signup';
export const routes: Routes = [
  { path: '', component: Home },
  { path: 'profile', component: Profile },
  { path: 'friends', component: Friends },
  { path: 'signin', component: Signin },
  { path: 'signup', component: Signup },
  { path: '**', redirectTo: '' }
];
