import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ContactService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiBase}/api/messages`;

    sendMessage(messageData: any): Observable<any> {
        return this.http.post(this.apiUrl, messageData);
    }
}
