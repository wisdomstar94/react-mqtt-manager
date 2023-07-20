# react-mqtt-manager
본 레포지토리는 mqtt 통신과 관련된 기능을 제공하는 리액트 훅 레포지토리 입니다.

<br />

# test
각 기능들 별로 별도의 테스트 페이지를 만들어 두었습니다. 본 프로젝트를 pull 받아 로컬에서 구동하시고 "http://localhost:3330" 에 접근하시면 각 테스트 페이지로 이동할 수 있는 버튼들이 표시됩니다.

<br />

# example code
예제 코드는 본 레포지토리의 src/app/test/* 경로를 참조해주세요.

<br />

# require key
본 레포지토리를 구동하기 위해 필요한 .env 내에 있어야 할 키-값 들은 다음과 같습니다. 
|key|value|
|---|---|
|NEXT_PUBLIC_MQTT_PROTOCOL|mqtt 통신 프로토콜|
|NEXT_PUBLIC_MQTT_URL|mqtt 통신 url|
|NEXT_PUBLIC_MQTT_PORT|mqtt 통신 포트번호|
|NEXT_PUBLIC_MQTT_USERNAME|mqtt 통신 username|
|NEXT_PUBLIC_MQTT_PASSWORD|mqtt 통신 password|
