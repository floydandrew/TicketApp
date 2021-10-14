import { Overlay } from '@angular/cdk/overlay';
import { Component, OnDestroy, OnInit, Renderer2, ViewContainerRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TicketListComponent } from '../list/list.component';
import { TicketService } from '../ticket.service';
import { Ticket } from '../types/ticket';
import { User } from '../types/user';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
})
export class TicketDetailComponent implements OnInit, OnDestroy {

  ticket: Ticket;
  tickets: Ticket[];

  users: User[];
  ticketForm: FormGroup;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  
  constructor(
    private _activatedRoute: ActivatedRoute,
    private _formBuilder: FormBuilder,
    private _fuseConfirmationService: FuseConfirmationService,
    private _renderer2: Renderer2,
    private _router: Router,
    private _ticketListComponent: TicketListComponent,
    private _ticketService: TicketService,
    private _overlay: Overlay,
    private _viewContainerRef: ViewContainerRef
  ) { }

  ngOnInit() {
    // Open the drawer
    this._ticketListComponent.matDrawer.open();

    // Create the ticket form
    this.ticketForm = this._formBuilder.group({
      userId   : [''],
      id       : [''],
      title    : [''],
      completed: [false],
  });

  // Get the ticket
  this._ticketService.onTicketChanged
  .pipe(takeUntil(this._unsubscribeAll))
  .subscribe((ticket: Ticket) => {
     this._ticketListComponent.matDrawer.open();

     this.ticket = ticket;
     this.ticketForm.patchValue(ticket, {emitEvent: false});
  });


  }

    /**
     * On destroy
     */
     ngOnDestroy(): void
     {
         // Unsubscribe from all subscriptions
         this._unsubscribeAll.next();
         this._unsubscribeAll.complete();
  
         this.closeDrawer();
     }

       // -----------------------------------------------------------------------------------------------------
   // @ Public methods
   // -----------------------------------------------------------------------------------------------------

   /**
    * Close the drawer
    */
   closeDrawer(): Promise<MatDrawerToggleResult>
   {
       return this._ticketListComponent.matDrawer.close();
   }

   /**
     * Update the ticket
     */
  updateTicket(): void
  {
      // Get the contact object
      this.ticket = Object.assign({}, this.ticketForm.value);

      // Update the contact on the server
      if(this.ticket.id == 0)
      {
          this._ticketService.create(this.ticket);
          this._ticketService.getTicket(this.ticket);
          this._ticketService.getTickets();
      }
      else 
      {
          this._ticketService.update(this.ticket);
          this._ticketService.getTickets();

      }
   }

   toggleCompleted() {

   }
   
    /**
     * Delete the contact
     */
     deleteTicket(): void
     {
         // Open the confirmation dialog
         const confirmation = this._fuseConfirmationService.open({
             title  : 'Delete ticket',
             message: 'Are you sure you want to delete this ticket? This action cannot be undone!',
             actions: {
                 confirm: {
                     label: 'Delete'
                 }
             }
         });
 
         // Subscribe to the confirmation dialog closed action
         confirmation.afterClosed().subscribe((result) => {
 
             // If the confirm button pressed...
             if ( result === 'confirmed' )
             {
                 // Get the current contact's id
                 const id = this.ticket.id;
                 this._ticketService.delete(this.ticket);
 
    
             }
         });
 
     }

}
