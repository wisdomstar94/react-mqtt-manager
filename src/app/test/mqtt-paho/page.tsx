"use client"
import { useMqttPahoManager } from "@/hooks/use-mqtt-paho-manager/use-mqtt-paho-manager.hook";

const url = process.env.NEXT_PUBLIC_MQTT_URL ?? '';
const port = process.env.NEXT_PUBLIC_MQTT_PORT ?? '';
const mqttUrl = url + ':' + port;
const username = process.env.NEXT_PUBLIC_MQTT_USERNAME ?? '';
const password = process.env.NEXT_PUBLIC_MQTT_PASSWORD ?? '';

export default function Page() {
  const mqttPahoManager = useMqttPahoManager();

  return (
    <>
      <div>
        <button 
          className="px-6 py-2 text-black bg-slate-300 hover:bg-slate-400 cursor-pointer rounded-lg"
          onClick={() => {
            mqttPahoManager.connectMQTT({
              mqttUrl: url.replace('wss://', ''),
              port: Number(port),
              username,
              password,
              subscribers: [
                {
                  topic: 'test2',
                  callback(message) {
                    console.log('@@test2.message', message);
                  },
                }
              ],
            });
          }}>
          mqtt connect!
        </button>
      </div>
      <div>
        <button 
          className="px-6 py-2 text-black bg-slate-300 hover:bg-slate-400 cursor-pointer rounded-lg"
          onClick={() => {
            mqttPahoManager.publishes(url.replace('wss://', ''), [
              {
                topic: 'test2',
                message: '브라우저에서 보내는 데이터입니다~',
              },
            ]);
          }}>
          메시지 발행하기
        </button>
      </div>
      <div>
        <button 
          className="px-6 py-2 text-black bg-slate-300 hover:bg-slate-400 cursor-pointer rounded-lg"
          onClick={() => {
            mqttPahoManager.subscribes(url.replace('wss://', ''), [
              { 
                topic: 'test3', 
                callback: (message) => {
                  console.log('@test3.message', message);
                },
              },
            ]);
          }}>
          test3 구독하기
        </button>
      </div>
    </>
  );
}
