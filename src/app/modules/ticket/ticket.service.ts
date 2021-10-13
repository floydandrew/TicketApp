import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Ticket } from './types/ticket';
import { User } from './types/user';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
baseUrl = environment.apiUrl;

ticket: Ticket;
onTicketschanged: BehaviorSubject<any>;
onTicketChanged: BehaviorSubject<any>;

onUsersChanged: BehaviorSubject<any>;

constructor(private _httpClient: HttpClient) { 
  this.onTicketschanged = new BehaviorSubject({});
  this.onTicketschanged = new BehaviorSubject({});
  this.onUsersChanged = new BehaviorSubject({});
}

getTickets() {
  this._httpClient.get<Ticket[]>(this.baseUrl + 'todos')
  .subscribe((result: Ticket[]) => {
    const randomTen = this.shuffle(result).slice(0,10);
    this.onTicketschanged.next(randomTen);
  })
}

getUsers() {
  this._httpClient.get<User[]>(this.baseUrl + 'users')
  .subscribe((result: any) => {
    this.onUsersChanged.next(result);
  })
}


getTicket(ticket: Ticket) {
  this.onTicketChanged.next(ticket);
}


/**
     * Search contacts with given query
     *
     * @param query
     */

// I have to change this code to just filter the list
 searchContacts(query: string): Observable<Ticket[]>
 {

  let params = new HttpParams();
        params = params.append('name', query);
        
    return this._httpClient.get<Ticket[]>(this.baseUrl, {params})
    .pipe(
        tap((contractors) => {
            this.onTicketschanged.next(contractors);
        })
    );
 }

 newTicket(id: number) {
   this.ticket = {
     id: id,
     userId: 0,
     title: '',
     completed: false
   }
 }

 create(ticket: Ticket) {
   
 }

 update(ticket: Ticket) {

 }

 delete(ticket: Ticket) {
   
 }
 
 shuffle(array) {
   let currentIndex = array.length, randomIndex;

   while(currentIndex != 0) {
     randomIndex = Math.floor(Math.random() * currentIndex)
     currentIndex--;

     [array[currentIndex], array[randomIndex]] = 
     [array[randomIndex], array[currentIndex]]
   }

   return array;
 }


}
