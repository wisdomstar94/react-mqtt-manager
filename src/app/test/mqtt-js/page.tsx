"use client"
import { useMqttManager } from "@/hooks/use-mqtt-manager/use-mqtt-manager.hook";
import { useEffect, useState } from "react";

const mqttProtocol = process.env.NEXT_PUBLIC_MQTT_PROTOCOL ?? '';
const mqttUrl = process.env.NEXT_PUBLIC_MQTT_URL ?? '';;
const mqttPort = Number(process.env.NEXT_PUBLIC_MQTT_PORT ?? '');
const mqttUsername = process.env.NEXT_PUBLIC_MQTT_USERNAME ?? '';
const mqttPassword = process.env.NEXT_PUBLIC_MQTT_PASSWORD ?? '';
const mqttFullUrl = `${mqttProtocol}://${mqttUrl}:${mqttPort}`;

export default function Page() {
  const [timestamp, setTimestamp] = useState<number>(0);
  const mqttManager = useMqttManager({
    onCreatedClient(client) {
      console.log('@timestamp', timestamp);
      console.log('@onCreatedClient.client', client);
      mqttManager.subscribe(mqttFullUrl, 'test2');
    },
    onConnectedClient(client) {
      console.log('@timestamp', timestamp);
      console.log('@onConnectedClient.client', client);
    },
    onDisconnectedClient(client) {
      console.log('@timestamp', timestamp);
      console.log('@onDisconnectedClient.client', client);
    },
    onSubscribedTopicInfo(subscriber) {
      console.log('@timestamp', timestamp);
      console.log('@onSubscribedTopicInfo.subscriber', subscriber);
    },
    onUnsubscribedTopicInfo(subscriber) {
      console.log('@timestamp', timestamp);
      console.log('@onUnsubscribedTopicInfo.subscriber', subscriber);
    },
  });

  mqttManager.saveSubscribeInfo(mqttFullUrl, {
    topic: 'test2',
    options: { qos: 2 },
    callback(topic, message) {
      console.log('@timestamp', timestamp);
      console.log('@topic', topic);
      console.log('@message', message);
    },
  });
  
  useEffect(() => {
    const interval = setInterval(() => {
      setTimestamp(new Date().getTime());
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      <div>
        <div className="w-full flex flex-wrap gap-2 relative">
          <div className="w-full flex flex-wrap">
            <button
              className="px-6 py-2 bg-slate-300 hover:bg-slate-500 rounded-lg cursor-pointer text-xs text-black"
              onClick={() => {
                mqttManager.mqttConnect({
                  mqttFullUrl,
                  clientOptions: {
                    protocol: 'mqtts',
                    protocolId: 'MQTT',
                    protocolVersion: 4,
                    username: mqttUsername,
                    password: mqttPassword,
                    port: mqttPort,
                    clientId: `mqttx_${new Date().getTime()}`,
                    clean: true,
                  },
                });
              }}>
              mqtt 연결하기
            </button>
            <button
              className="px-6 py-2 bg-slate-300 hover:bg-slate-500 rounded-lg cursor-pointer text-xs text-black"
              onClick={() => {
                mqttManager.mqttDisconnect(mqttFullUrl);
              }}>
              mqtt 연결끊기
            </button>
            <button
              className="px-6 py-2 bg-slate-300 hover:bg-slate-500 rounded-lg cursor-pointer text-xs text-black"
              onClick={() => {
                mqttManager.unsubscribe(mqttFullUrl, 'test2');
              }}>
              test2 구독 끊기
            </button>
            <button
              className="px-6 py-2 bg-slate-300 hover:bg-slate-500 rounded-lg cursor-pointer text-xs text-black"
              onClick={() => {
                mqttManager.publish(mqttFullUrl, {
                  topic: 'test2',
                  message: '브라우저에서 보내는 메시지..입니다.',
                  options: {
                    qos: 2,
                  },
                });
              }}>
              test2 발행하기
            </button>
            <button
              className="px-6 py-2 bg-slate-300 hover:bg-slate-500 rounded-lg cursor-pointer text-xs text-black"
              onClick={() => {
                mqttManager.subscribe(mqttFullUrl, 'test2');
              }}>
              test2 구독 하기
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
