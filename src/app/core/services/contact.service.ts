import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ContactService {
    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:3000/api/messages';

    sendMessage(messageData: any): Observable<any> {
        return this.http.post(this.apiUrl, messageData);
    }
}
