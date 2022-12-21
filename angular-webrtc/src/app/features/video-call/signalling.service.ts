import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class SignallingService {

  constructor(private socket: Socket) {

  }

  getMessages(): Observable<any> {
    console.log('Entering getMessages');
    return this.socket.fromEvent('message');
  }

  sendMessage(payload: any): void {
    console.log('Entering sendMessage');
    this.socket.emit('send-message', payload);
    console.log('Exiting sendMessage');
  }
}
