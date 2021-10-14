import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { user } from 'app/mock-api/common/user/data';
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
users: User[];

nextId : BehaviorSubject<any>;
onTicketsChanged: BehaviorSubject<any>;
onTicketChanged: BehaviorSubject<any>;

onUsersChanged: BehaviorSubject<any>;

constructor(private _httpClient: HttpClient) { 
  this.onTicketsChanged = new BehaviorSubject({});
  this.onTicketChanged = new BehaviorSubject({});
  this.onUsersChanged = new BehaviorSubject({});
}

/**
     * Setter & getter for access localStorage
     */
 set storedTickets(tickets: Ticket[])
 {
     localStorage.setItem('tickets', JSON.stringify(tickets));
 }

 get storedTickets(): Ticket[]
 {
     if(localStorage.getItem('tickets')){
       return JSON.parse(localStorage.getItem('tickets'))
     }
     return []
 }

getTickets() {
  if(this.storedTickets.length == 0) {
    this._httpClient.get<Ticket[]>(this.baseUrl + 'todos')
    .subscribe((result: Ticket[]) => {
    const randomTen = this.shuffle(result).slice(0,10).map(
      (t) => {
        return {...t,user: this.users.find((u)=> u.id === t.userId)}
      }
    );
    this.storedTickets = randomTen;
    this.onTicketsChanged.next(randomTen);
  })
  } 
  else
  {
    
    const storedTickets = this.storedTickets;
    this.onTicketsChanged.next(storedTickets);
  }

}

getUsers() {
  this._httpClient.get<User[]>(this.baseUrl + 'users')
  .subscribe((result: any) => {
    this.users = result;
    this.onUsersChanged.next(result);
  })
}


setTicket(ticket: Ticket) {
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
            this.onTicketsChanged.next(contractors);
        })
    );
 }

 newTicket() {
   this.ticket = {
     id: 0,
     userId: 0,
     title: '',
     completed: false,
     index: 0,
   }

   console.log(this.ticket);
   this.onTicketChanged.next(this.ticket);
 }

 create(ticket: Ticket) {
   
 }

 update(ticket: Ticket) {

 }

 delete(tickets: Ticket[]) {
   this.onTicketsChanged.next(tickets);
   localStorage.clear;
   this.storedTickets = tickets;
   
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
