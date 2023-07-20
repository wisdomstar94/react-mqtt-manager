import { IClientOptions, IClientPublishOptions, IClientSubscribeOptions, ISubscriptionGrant, MqttClient } from "mqtt";

export declare namespace IUseMqttManager {
  export interface Client {
    mqttFullUrl: string;
    clientOptions: IClientOptions;
    // subscribers: Subscriber[];
  }

  export interface Subscriber {
    topic: string;
    options: IClientSubscribeOptions;
    init?: (err: Error, granted: ISubscriptionGrant[]) => void;
    callback: (message: string) => void;
  }

  export interface Publisher {
    topic: string;
    message: string;
    options: IClientPublishOptions;
  }

  export interface ClientInfo {
    client: Client;
    mqttClient: MqttClient;
  }

  export interface Props {
    onCreatedClient?: (client: IUseMqttManager.Client) => void;
    onConnectedClient?: (client: IUseMqttManager.Client) => void;
    onDisconnectedClient?: (client: IUseMqttManager.Client) => void;
    onSubscribedTopicInfo?: (subscriber: IUseMqttManager.Subscriber | undefined) => void;
    onUnsubscribedTopicInfo?: (subscriber: IUseMqttManager.Subscriber | undefined) => void;
  }
}