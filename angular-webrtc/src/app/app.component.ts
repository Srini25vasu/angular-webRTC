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
    this.signallingService.getMessages().subscribe((payload) => this._handleMessage(payload));
  }

  public async makeCall(): Promise<void> {
    await this.callService.makeCall(this.remoteVideo);
  }

  private async _handleMessage(data: any): Promise<void> {
    switch (data.type) {
      case 'offer':
        await this.callService.handleOffer(data.offer, this.remoteVideo);
        break;
      case 'answer':
        await this.callService.handleAnswer(data.answer);
        break;
      case 'candidate':
        await this.callService.handleCandidate(data.candidate);
        break;
      default:
        break;
    }
  }

}
