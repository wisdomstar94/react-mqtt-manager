import { useCallback, useRef } from "react";
import { IUseMqttManager } from "./use-mqtt-manager.interface";
import { connect } from "mqtt";

const separateChar = `@@@`;

export function useMqttManager(props?: IUseMqttManager.Props) {
  const {
    onCreatedClient,
    onConnectedClient,
    onDisconnectedClient,
    onSubscribedTopicInfo,
    onUnsubscribedTopicInfo,
  } = props ?? {};
  const savedClientInfos = useRef<Map<string, IUseMqttManager.ClientInfo>>(new Map()); // `${mqttFullUrl}`
  const savedSubscribers = useRef<Map<string, IUseMqttManager.Subscriber>>(new Map()); // `${mqttFullUrl}${separateChar}${topic}`

  const isExistClient = useCallback((mqttFullUrl: string) => {
    return savedClientInfos.current.has(mqttFullUrl);
  }, []);

  const mqttDisconnect = useCallback((mqttFullUrl: string) => {
    const clientInfo = savedClientInfos.current.get(mqttFullUrl);
    if (clientInfo !== undefined) {
      const deleteTargetSavedSubscribersKeys: string[] = [];
      for (const [key, subscriber] of Array.from(savedSubscribers.current.entries())) {
        const [thisMqttFullUrl, topic] = key.split(separateChar);
        // console.log('@thisMqttFullUrl', thisMqttFullUrl);
        // console.log('@topic', topic);
        if (thisMqttFullUrl !== mqttFullUrl) {
          continue;
        }
        clientInfo.mqttClient.unsubscribe(topic);
        // console.log('@...delete...', `${mqttFullUrl}.${topic}`);
        savedSubscribers.current.delete(`${mqttFullUrl}${separateChar}${topic}`);
        deleteTargetSavedSubscribersKeys.push(key);
      }
      deleteTargetSavedSubscribersKeys.forEach((key) => savedSubscribers.current.delete(key));

      clientInfo.mqttClient.end(true);
      if (typeof onDisconnectedClient === 'function') {
        onDisconnectedClient(clientInfo.client);
      }
      savedClientInfos.current.delete(mqttFullUrl);
    }
  }, [onDisconnectedClient]);

  const mqttConnect = useCallback((client: IUseMqttManager.Client) => {
    if (!savedClientInfos.current.has(client.mqttFullUrl)) {
      const _mqttClient = connect(client.mqttFullUrl, client.clientOptions);
      savedClientInfos.current.set(client.mqttFullUrl, { client, mqttClient: _mqttClient});
      if (typeof onCreatedClient === 'function') {
        onCreatedClient(client);
      }
      _mqttClient.on('connect', function() {
        if (typeof onConnectedClient === 'function') {
          onConnectedClient(client);
        }
      });
      _mqttClient.on('message', function(topic, payload) {
        const message = payload.toString();
        savedSubscribers.current.get(`${client.mqttFullUrl}${separateChar}${topic}`)?.callback(topic, message);
      });
      
    }
  }, [onConnectedClient, onCreatedClient]);

  const unsubscribe = useCallback((mqttFullUrl: string, topic: string) => {
    // savedSubscribers.current.delete(`${mqttFullUrl}${separateChar}${topic}`);
    const targetSubscriber = savedSubscribers.current.get(`${mqttFullUrl}${separateChar}${topic}`);
    const clientInfo = savedClientInfos.current.get(mqttFullUrl);
    if (clientInfo !== undefined) {
      clientInfo.mqttClient.unsubscribe(topic, undefined, () => {
        if (typeof onUnsubscribedTopicInfo === 'function') {
          onUnsubscribedTopicInfo(targetSubscriber);
        }
      });
    }
  }, [onUnsubscribedTopicInfo]);

  const publish = useCallback((mqttFullUrl: string, publisher: IUseMqttManager.Publisher) => {
    const clientInfo = savedClientInfos.current.get(mqttFullUrl);
    if (clientInfo === undefined) return;
    clientInfo.mqttClient.publish(publisher.topic, publisher.message, publisher.options);
  }, []);

  /**
   * 본 함수를 호출하기 전에 먼저 saveSubscribeInfo 함수를 호출하여 구독이 되었을 때의 설정 정보를 미리 셋팅해야 합니다.
   */
  const subscribe = useCallback((mqttFullUrl: string, topic: string) => {
    const savedSubscriber = savedSubscribers.current.get(`${mqttFullUrl}${separateChar}${topic}`);
    const clientInfo = savedClientInfos.current.get(mqttFullUrl);
    if (clientInfo === undefined) {
      console.error(`clientInfo 정보가 없습니다.`);
      return;
    }
    if (savedSubscriber === undefined) {
      console.error(`savedSubscriber 정보가 없습니다.`);
      return;
    }
    clientInfo.mqttClient.subscribe(savedSubscriber.topic, savedSubscriber.options, (err, granted) => {
      if (typeof onSubscribedTopicInfo === 'function') {
        onSubscribedTopicInfo(savedSubscriber);
      }
      if (savedSubscriber.init !== undefined) {
        savedSubscriber.init(err, granted);
      }
    });
  }, [onSubscribedTopicInfo]);

  /**
   * 이 함수는 subscribe 함수보다 먼저 호출되어야 합니다.
   */
  const saveSubscribeInfo = useCallback((mqttFullUrl: string, subscriber: IUseMqttManager.Subscriber) => {
    savedSubscribers.current.set(`${mqttFullUrl}${separateChar}${subscriber.topic}`, subscriber);
  }, []);

  const mqttDisconnectAll = useCallback(() => {
    const entries = Array.from(savedClientInfos.current.entries());

    for (const [key, value] of entries) {
      const clientInfo = value;
      if (clientInfo !== undefined) {
        const deleteTargetSavedSubscribersKeys: string[] = [];
        for (const [key, subscriber] of Array.from(savedSubscribers.current.entries())) {
          const [thisMqttFullUrl, topic] = key.split(separateChar);
          console.log('@thisMqttFullUrl', thisMqttFullUrl);
          console.log('@topic', topic);
          if (thisMqttFullUrl !== key) {
            continue;
          }
          clientInfo.mqttClient.unsubscribe(topic);
          console.log('@...delete...', `${key}.${topic}`);
          savedSubscribers.current.delete(`${key}${separateChar}${topic}`);
          deleteTargetSavedSubscribersKeys.push(key);
        }
        deleteTargetSavedSubscribersKeys.forEach((key) => savedSubscribers.current.delete(key));

        clientInfo.mqttClient.end(true);
        if (typeof onDisconnectedClient === 'function') {
          onDisconnectedClient(clientInfo.client);
        }
        savedClientInfos.current.delete(key);
      }
    }
  }, [onDisconnectedClient]);

  return {
    mqttDisconnect,
    mqttDisconnectAll,
    mqttConnect,
    unsubscribe,
    subscribe,
    saveSubscribeInfo,
    publish,
    isExistClient,
  };
}