import { ElementRef, Injectable } from '@angular/core';
import { SignallingService } from './signalling.service';

@Injectable({
  providedIn: 'root'
})
export class CallService {

  configuration: RTCConfiguration = {
    iceServers: [
      {
        urls: [
          'stun:stun1.l.google.com:19302',
          'stun:stun2.l.google.com:19302',
        ]
      }
    ],
    iceCandidatePoolSize: 10
  };

  connection: RTCPeerConnection;
  constructor(private signallingService: SignallingService) {

  }

  private async _initConnection(remoteVideo: ElementRef): Promise<void> {
    console.log('Entering _initConnection');
    this.connection = new RTCPeerConnection(this.configuration);
    await this._getStreams(remoteVideo);
    this._registerConnectionListeners();
    console.log('Exiting _initConnection');
  }

  public async makeCall(remoteVideo: ElementRef): Promise<void> {
    console.log('Entering makeCall');
    await this._initConnection(remoteVideo);
    const offer = await this.connection.createOffer();
    console.log('Entering makeCall, offer:' + JSON.stringify(offer));
    await this.connection.setLocalDescription(offer);
    this.signallingService.sendMessage({ type: 'offer', offer });
    console.log('Exiting makeCall');
  }

  public async handleOffer(
    offer: RTCSessionDescription,
    remoteVideo: ElementRef
  ): Promise<void> {
    console.log('Entering handleOffer');
    await this._initConnection(remoteVideo);
    await this.connection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await this.connection.createAnswer();
    console.log('Entering handleOffer, answer:' + JSON.stringify(answer));
    await this.connection.setLocalDescription(answer);
    this.signallingService.sendMessage({ type: 'answer', answer });
    console.log('Exiting handleOffer');

  }

  public async handleAnswer(answer: RTCSessionDescription): Promise<void> {
    console.log('Entering handleAnswer');
    //if (answer) {
      //if (this.connection.remoteDescription) {
        await this.connection.setRemoteDescription(
          new RTCSessionDescription(answer));
      //}
   // }
    console.log('Exiting handleAnswer');
  }

  public async handleCandidate(candidate: RTCIceCandidate): Promise<void> {
    console.log('Entering handleCandidate');
   // if (candidate) {
     // if (this.connection.remoteDescription) {
        await this.connection.addIceCandidate(new RTCIceCandidate(candidate));
     // }
    //}
    console.log('Exiting handleCandidate');
  }

  private _registerConnectionListeners(): void {
    this.connection.onicegatheringstatechange = (ev: Event) => {
      console.log(`ICE gathering state changed: ${this.connection.iceGatheringState}`);
    };
    this.connection.onconnectionstatechange = () => {
      console.log(
        `Connection state change: ${this.connection.connectionState}`
      );
    };
    this.connection.onsignalingstatechange = () => {
      console.log(`Signaling state change: ${this.connection.signalingState}`);
    };
    this.connection.oniceconnectionstatechange = () => {
      console.log(
        `ICE connection state change: ${this.connection.iceConnectionState}`
      );
    };
    this.connection.onicecandidate = (event) => {
      if (event.candidate) {
        const payload = {
          type: 'candidate',
          candidate: event.candidate.toJSON(),
        };
        console.log('Entering _registerConnectionListeners, payload:' + JSON.stringify(payload));
        this.signallingService.sendMessage(payload);
      }
    };
  }

  private async _getStreams(remoteVideo: ElementRef): Promise<void> {
    console.log('Entering _getStreams');
    const stream = await navigator.mediaDevices.getUserMedia(
      {
        video: true,
        audio: false
      }
    );
    console.log('Stream obtained');
    const remoteStrem = new MediaStream();
    remoteVideo.nativeElement.srcObject = remoteStrem;

    this.connection.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        track.stop();
        remoteStrem.addTrack(track);
      });
    };

    stream.getTracks().forEach((track) => {
      this.connection.addTrack(track, stream);
    });
    console.log('Exiting _getStreams');
  }

}
