

export declare namespace IUseMqttPahoManager {
  export interface ConnectMQTTOptions {
    mqttUrl: string; 
    port: number;
    username: string;
    password: string;
    subscribers?: Subscriber[];
  }

  export interface Subscriber {
    topic: string | string[];
    // listener: (err: Error, granted: ISubscriptionGrant[]) => void;
    callback: (message: string) => void;
  }

  export interface Publisher {
    topic: string;
    message: string;
  }

  export interface ClientItem {
    mqttUrl: string;
    client: any;
    subscribers: Subscriber[];
  }

  export type ClientItems = Map<string, ClientItem>;

  export interface Props {
    
  }
}