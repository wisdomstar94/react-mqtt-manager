import { useCallback, useEffect, useRef, useState } from "react";
import { IUseMqttPahoManager } from "./use-mqtt-paho-manager.interface";
declare const Paho: any;

export function useMqttPahoManager() {
  const clientItems = useRef<IUseMqttPahoManager.ClientItems>(new Map());
  const [connectSuccessClientItem, setConnectSuccessClientItem] = useState<IUseMqttPahoManager.ClientItem>();

  const connectMQTT = useCallback((options: IUseMqttPahoManager.ConnectMQTTOptions) => {
    if (clientItems.current.has(options.mqttUrl)) {
      console.error(`이미 ${options.mqttUrl} connect 시도 된 상태입니다.`);
      return;
    }

    const client = new Paho.Client(options.mqttUrl, options.port, "");
    // const client = connect(options.mqttUrl, options.clientOptions);
    // const client = paho
    const clientItem: IUseMqttPahoManager.ClientItem = {
      mqttUrl: options.mqttUrl,
      client,
      subscribers: options.subscribers ?? [],
    };
    clientItems.current.set(options.mqttUrl, clientItem);

    client.connect({
      onSuccess: () => {
        setConnectSuccessClientItem(clientItem);
        options.subscribers?.forEach((subscriber) => {
          // client.subscribe(subscriber.topic, subscriber.options, subscriber.listener);
          client.subscribe(subscriber.topic);
        });
      },
      userName: options.username,
      password: options.password,
      useSSL: true,
      cleanSession : true,
    });

    client.onConnectionLost = () => {
      options.subscribers?.forEach((subscriber) => {
        client.unsubscribe(subscriber.topic);
      });
      clientItems.current.delete(options.mqttUrl);
    };

    client.onMessageArrived = (obj: any) => {
      const message: string = obj.payloadString;
      // console.log('@obj', obj);
      const topic: string = obj.topic;
      clientItems.current.forEach(clientItem => {
        const subscriber = clientItem.subscribers.find(x => x.topic === topic);
        if (subscriber !== undefined) {
          subscriber.callback(message);
        }
      });
    };
  }, []);

  const disconnectMQTT = useCallback((mqttUrl: string) => {
    const clientItem = clientItems.current.get(mqttUrl);
    if (clientItem === undefined) return;
    for (const subscriber of clientItem.subscribers) {
      clientItem.client.unsubscribe(subscriber.topic);
    }
  }, []);

  const subscribes = useCallback((mqttUrl: string, subscribers: IUseMqttPahoManager.Subscriber[]) => {
    const clientItem = clientItems.current.get(mqttUrl);
    if (clientItem === undefined) return;
    for (const subscriber of subscribers) {
      if (clientItem.subscribers.map(x => JSON.stringify(x.topic)).includes(JSON.stringify(subscriber.topic))) {
        continue;
      }
      // console.log('@subscribe...', subscriber.topic);
      clientItem.client.subscribe(subscriber.topic);
      clientItem.subscribers.push(subscriber);
    }
  }, []);

  const publishes = useCallback((mqttUrl: string, publishers: IUseMqttPahoManager.Publisher[]) => {
    const clientItem = clientItems.current.get(mqttUrl);
    if (clientItem === undefined) return;
    publishers.forEach((publisher) => {
      const message = new Paho.Message(publisher.message);
      message.destinationName = publisher.topic;
      message.qos = 2;
      // message.retained = false;
      clientItem.client.send(message);
      // console.log('send..publisher.topic', message);
    });
  }, []);

  useEffect(() => {
    const _clientItems = clientItems.current;
    _clientItems.forEach((clientItem, mqttUrl) => {
      clientItem.subscribers.forEach((subscriber) => {
        clientItem.client.subscribe(subscriber.topic);
      });
    });
    return () => {
      _clientItems.forEach((clientItem, mqttUrl) => {
        clientItem.subscribers.forEach((subscriber) => {
          clientItem.client.unsubscribe(subscriber.topic);
        });
        clientItem.client.end(true);
      });
    };
  }, []);

  return {
    connectMQTT,
    disconnectMQTT,
    subscribes,
    publishes,
    connectSuccessClientItem,
  };
}