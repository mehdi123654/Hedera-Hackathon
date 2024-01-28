import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LedgerId } from '@hashgraph/sdk';
import {
  HashConnect,
  HashConnectConnectionState,
  SessionData,
} from 'hashconnect';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'my-app';
  appMetadata = {
    name: 'my-app',
    description: '<Your dapp description>',
    icons: ['../assets/images/kendrick.JPG'],
    url: 'localhost',
  };
  hashconnect!: HashConnect;
  state: HashConnectConnectionState = HashConnectConnectionState.Disconnected;
  pairingData!: SessionData ;

  async ngOnInit() {
    this.hashconnect = new HashConnect(
      LedgerId.TESTNET,
      '704f424badffaf6a62cd6e1c42c094dd',
      this.appMetadata,
      true
    );
    // Register events
    this.setUpHashConnectEvents();

    await this.hashconnect.init();
  }

  setUpHashConnectEvents() {
    this.hashconnect.pairingEvent.on((newPairing) => {
      this.pairingData = newPairing;
    });

    this.hashconnect.disconnectionEvent.on((data) => {
      //this.pairingData = null;
    });

    this.hashconnect.connectionStatusChangeEvent.on((connectionStatus) => {
      this.state = connectionStatus;
    });
  }
}
