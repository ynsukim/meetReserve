export interface ShuttleStop {
  name: string;
}

export interface ShuttleDepartureTime {
  weekday: string;
  friday: string;
}

  export interface ShuttleRoute {
  no: number;
  name: string;
  stops: ShuttleStop[];
  departureTimes: ShuttleDepartureTime[];
  waitingArea: string;
}

const shuttleRoutes: ShuttleRoute[] = [
  {
    no: 1,
    name: "영통(인계동)",
    stops: [
      { name: "황골마을 육교앞" },
      { name: "황골 육교 앞" },
      { name: "노티나팜골 육교/ 모닝타운 앞" },
      { name: "신나무실 육교" },
      { name: "백석골 입구지" },
      { name: "망포역 사거리" },
      { name: "매탄권선역 4번출구" },
      { name: "아이스크림세상 앞" },
      { name: "뉴코아아울렛 앞" }
    ],
    departureTimes: [
      { weekday: "-", friday: "16:00" },
      { weekday: "17:10", friday: "17:10" },
      { weekday: "18:10", friday: "18:10" },
      { weekday: "19:10", friday: "19:10" },
      { weekday: "20:10", friday: "-" }
    ],
    waitingArea: "1번 승차장"
  },
  {
    no: 2,
    name: "신봉/매탄동",
    stops: [
      { name: "삼성전거리 버스정류장" },
      { name: "한국아파트 1차 (현대기아정비소)" },
      { name: "한국아파트 2차 (신남중학교 앞)" },
      { name: "동남빌라 월드보도 앞" },
      { name: "매탄주공 4단지 아파트 (국민은행 맞은편)" },
      { name: "매탄자건거 부근 자유중앙병 버스정류장" },
      { name: "매탄동 우산 취보 정문 맞은편" },
      { name: "영통역 환승역" },
      { name: "래미안 영통 더크로스 2단지 (우만동쪽)" },
      { name: "영통 아이파크캐슬 1단지 101동 사거리 월드보도" }
    ],
    departureTimes: [
      { weekday: "-", friday: "16:00" },
      { weekday: "17:10", friday: "17:10" },
      { weekday: "18:10", friday: "18:10" },
      { weekday: "19:10", friday: "19:10" },
      { weekday: "20:10", friday: "-" }
    ],
    waitingArea: "4번 승차장"
  },
  {
    no: 3,
    name: "광교",
    stops: [
      { name: "서수원 IC 정류장" },
      { name: "광교월드하우스 LH메디로 버스정류장" },
      { name: "광교중앙역 2번출구" },
      { name: "쓰리아일랜드" },
      { name: "광교센트럴돔 아파트 GATE1" },
      { name: "광교더샵스퀘어(원천역, 중앙상가) 버스정류장" },
      { name: "광교자이더프레스티지 4209동 앞 버스정류장" },
      { name: "광교수자인홈 후문씨앗마트(이삿짐센터)" }
    ],
    departureTimes: [
      { weekday: "-", friday: "16:00" },
      { weekday: "17:10", friday: "17:10" },
      { weekday: "18:10", friday: "18:10" },
      { weekday: "19:10", friday: "19:10" },
      { weekday: "20:10", friday: "-" }
    ],
    waitingArea: "2번 승차장"
  },
  {
    no: 4,
    name: "수원 장안",
    stops: [
      { name: "의왕 플레이트 광역버스정류장" },
      { name: "수원청년 임스타티트 몰" },
      { name: "수원SK스카이뷰 아파트 (다솜초교)" },
      { name: "정자초교 버스정류장" },
      { name: "하나로병원 앞" },
      { name: "화서역" },
      { name: "수원역 4번 출구" },
      { name: "매교역 2번 출구" }
    ],
    departureTimes: [
      { weekday: "17:40", friday: "17:40" },
      { weekday: "18:40", friday: "18:40" },
      { weekday: "19:40", friday: "-" }
    ],
    waitingArea: "7번 승차장"
  },
  {
    no: 5,
    name: "신영통(서천,망포)",
    stops: [
      { name: "동천역 환승정류장" },
      { name: "청명역 5번출구" },
      { name: "영통역 5번출구" },
      { name: "서천마을3단지 버스정류장 (서천2지하이마트)" },
      { name: "서천마을 2단지 버스정류장 (202동 앞)" },
      { name: "신영통 현대타운 버스정류장" },
      { name: "망포중학교 버스정류장 정문 부석정문" },
      { name: "망포 그대가건물 뒤마트 202동 앞" },
      { name: "망포역" }
    ],
    departureTimes: [
      { weekday: "-", friday: "16:40" },
      { weekday: "17:40", friday: "17:40" },
      { weekday: "18:40", friday: "18:40" },
      { weekday: "19:40", friday: "19:40" },
      { weekday: "20:40", friday: "-" }
    ],
    waitingArea: "8번 승차장"
  },
  {
    no: 6,
    name: "율목(신갈)",
    stops: [
      { name: "신갈 2지하 정류장" },
      { name: "롯데 시네마 123타워 앞" },
      { name: "롯데 중앙교 버스정류장" },
      { name: "롯데 마트 건너편" },
      { name: "경과 사거리(수원명인고교)" },
      { name: "수원 국민연금 현대아이파크" }
    ],
    departureTimes: [
      { weekday: "18:10", friday: "18:10" }
    ],
    waitingArea: "AB타워\n로비 앞"
  },
  {
    no: 7,
    name: "수지(죽전)",
    stops: [
      { name: "성복 일스테이트 3차" },
      { name: "성복마을6단지앞 6차" },
      { name: "성복마을6단지앞 2차" },
      { name: "신봉마을 광교버스터미널" },
      { name: "광교신도시 롯워커마트" },
      { name: "성복1동 주민센터" },
      { name: "수지행 공사 버스정류장 (선현동 월희케슬)" },
      { name: "신봉마을8단지앞 (이마트24나)" },
      { name: "토월초등학교" },
      { name: "우지구청 건너 (우리은행)" }
    ],
    departureTimes: [
      { weekday: "17:10", friday: "17:10" },
      { weekday: "18:10", friday: "18:10" },
      { weekday: "19:10", friday: "19:10" },
      { weekday: "20:10", friday: "-" }
    ],
    waitingArea: "AB타워\n로비 앞"
  },
  {
    no: 8,
    name: "동탄(병점,효성)",
    stops: [
      { name: "동천역 환승정류장" },
      { name: "죽전 2지하 정류장" },
      { name: "동탄이마트 건너편" },
      { name: "메리스코트 버스정류장" },
      { name: "석우동 (반석마을 육교앞)" },
      { name: "동탄 메타폴리스" },
      { name: "다은마을 버스정류장" },
      { name: "새천년마을 버스정류장(우체국)" },
      { name: "나루마을 버스정류장(우체국)" },
      { name: "동동탄중학교사거리 버스정류장" },
      { name: "병점역 1번출구 버스정류장" },
      { name: "우신시장 정문앞 버스정류장" }
    ],
    departureTimes: [
      { weekday: "-", friday: "16:00" },
      { weekday: "17:10", friday: "17:10" },
      { weekday: "18:10", friday: "18:10" },
      { weekday: "19:10", friday: "19:10" },
      { weekday: "20:10", friday: "-" }
    ],
    waitingArea: "5번 승차장"
  },
  {
    no: 9,
    name: "동탄2",
    stops: [
      { name: "동천역 환승정류장" },
      { name: "우남퍼스트빌 버스정류장" },
      { name: "금성베스트빌IX 버스정류장" },
      { name: "부동초교 버스정류장" },
      { name: "KCC스위첸 버스정류장" },
      { name: "대우푸르지오 앞오른편 버스정류장" },
      { name: "호반베르디움 버스정류장" },
      { name: "대림한숲타운 버스정류장" },
      { name: "한화협력업체 버스정류장" },
      { name: "더샵센트럴시티(한국영양원) 버스정류장" }
    ],
    departureTimes: [
      { weekday: "17:40", friday: "17:40" },
      { weekday: "18:40", friday: "18:40" }
    ],
    waitingArea: "AB타워\n로비 앞"
  },
  {
    no: 10,
    name: "광역 1\n(영통/망포)",
    stops: [
      { name: "황골 육교 앞" },
      { name: "영통역" },
      { name: "망포역" }
    ],
    departureTimes: [
      { weekday: "21:10", friday: "20:10" }
    ],
    waitingArea: "1번 승차장"
  },
  {
    no: 11,
    name: "광역 2\n(광교/인계)",
    stops: [
      { name: "광교중앙역" },
      { name: "수원시청역" },
      { name: "수원역" }
    ],
    departureTimes: [
      { weekday: "21:10", friday: "20:10" }
    ],
    waitingArea: "2번 승차장"
  },
  {
    no: 12,
    name: "광역 3\n(동탄1/2)",
    stops: [
      { name: "동탄 메타폴리스" },
      { name: "동탄역(SRT)" }
    ],
    departureTimes: [
      { weekday: "21:10", friday: "20:10" }
    ],
    waitingArea: "4번 승차장"
  },
  {
    no: 13,
    name: "광역 4\n(수지/기흥)",
    stops: [
      { name: "동천2지하정류장" },
      { name: "죽전2지하정류장" },
      { name: "기흥역" }
    ],
    departureTimes: [
      { weekday: "21:10", friday: "20:10" }
    ],
    waitingArea: "5번 승차장"
  }
];

export default shuttleRoutes; 