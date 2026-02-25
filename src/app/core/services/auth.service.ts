import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiBase}/api/auth`;

    private userSubject = new BehaviorSubject<any>(this.getUserFromStorage());
    currentUser$ = this.userSubject.asObservable();

    private getUserFromStorage() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }

    register(userData: any, profilePicture?: File): Observable<any> {
        const formData = new FormData();
        formData.append('firstName', userData.firstName);
        formData.append('lastName', userData.lastName);
        formData.append('email', userData.email);
        formData.append('password', userData.password);
        if (profilePicture) {
            formData.append('profilePicture', profilePicture);
        }
        return this.http.post(`${this.apiUrl}/register`, formData);
    }

    updateProfile(userData: any, profilePicture?: File): Observable<any> {
        const formData = new FormData();
        formData.append('firstName', userData.firstName);
        formData.append('lastName', userData.lastName);
        formData.append('email', userData.email);
        if (profilePicture) {
            formData.append('profilePicture', profilePicture);
        }

        const token = localStorage.getItem('token');
        return this.http.put(`${this.apiUrl}/profile`, formData, {
            headers: { 'Authorization': `Bearer ${token}` }
        }).pipe(
            tap((response: any) => {
                if (response.user) {
                    localStorage.setItem('user', JSON.stringify(response.user));
                    this.userSubject.next(response.user);
                }
            })
        );
    }

    updatePassword(passwords: any): Observable<any> {
        const token = localStorage.getItem('token');
        return this.http.put(`${this.apiUrl}/password`, passwords, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
    }

    login(credentials: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
            tap((response: any) => {
                if (response.token) {
                    localStorage.setItem('token', response.token);
                    localStorage.setItem('user', JSON.stringify(response.user));
                    this.userSubject.next(response.user);
                }
            })
        );
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.userSubject.next(null);
    }

    isLoggedIn(): boolean {
        return !!localStorage.getItem('token');
    }

    getUser() {
        return this.userSubject.value;
    }
}
