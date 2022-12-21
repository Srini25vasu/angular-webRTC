import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CallService } from './features/video-call/call.service';
import { SignallingService } from './features/video-call/signalling.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'angular-webrtc';
  @ViewChild('remoteVideo') remoteVideo: ElementRef;

  constructor(private callService: CallService,
    private signallingService: SignallingService) {

  }

  ngOnInit(): void {
    //throw new Error('Method not implemented.');
    this.signallingService.getMessages().subscribe((payload) =>
    {
      console.log('Entering ngInit subscribe: payload: '+ JSON.stringify(payload));
      this._handleMessage(payload);
      console.log('Exiting ngInit subscribe');
    });
  }

  public async makeCall(): Promise<void> {
    await this.callService.makeCall(this.remoteVideo);
  }

  private async _handleMessage(data: any): Promise<void> {
    console.log('Entering _handleMessage data.type:'+JSON.stringify(data.type));
    switch (data.type) {
      case 'offer':
        console.log('Entering offer data.type:'+data.type);
        await this.callService.handleOffer(data.offer, this.remoteVideo);
        break;
      case 'answer':
        console.log('Entering answer data.type:'+data.type);
        await this.callService.handleAnswer(data.answer);
        break;
      case 'candidate':
        console.log('Entering candidate data.type:'+data.type);
        await this.callService.handleCandidate(data.candidate);
        break;
      default:
        break;
    }
  }

}
