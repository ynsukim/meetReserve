interface BusTime {
  time: string;
}

interface BusSchedule {
  weekday: BusTime[];  // Monday-Thursday
  friday: BusTime[];   // Friday
  dday: BusTime[];     // D-Day
}

interface BusRoute {
  destination: string;
  route: string;
  platform: string;
  schedule: BusSchedule;
}

export const busRoutes: BusRoute[] = [
  {
    destination: "양재역",
    route: "양재역(출구9)",
    platform: "1번 승차장 → 양재역❾",
    schedule: {
      weekday: [
        { time: "-" },
        { time: "-" },
        { time: "-" },
        { time: "-" },
        { time: "-" },
        { time: "17:00" },
        { time: "17:15" },
        { time: "17:20" },
        { time: "17:30" },
        { time: "17:40" },
        { time: "17:50" },
        { time: "18:00" },
        { time: "18:15" },
        { time: "18:20" },
        { time: "18:30" },
        { time: "18:40" },
        { time: "18:50" },
        { time: "19:00" },
        { time: "19:15" },
        { time: "19:20" },
        { time: "19:30" },
        { time: "19:40" },
        { time: "" }
      ],
      friday: [
        { time: "16:10" },
        { time: "16:30" },
        { time: "16:50" },
        { time: "17:00" },
        { time: "17:15" },
        { time: "17:20" },
        { time: "17:30" },
        { time: "17:40" },
        { time: "17:50" },
        { time: "18:00" },
        { time: "18:15" },
        { time: "18:20" },
        { time: "18:30" },
        { time: "18:40" },
        { time: "18:50" },
        { time: "19:00" },
        { time: "19:20" },
        { time: "19:30" },
        { time: "19:40" }
      ],
      dday: [
        { time: "16:10" },
        { time: "16:30" },
        { time: "16:50" },
        { time: "17:00" },
        { time: "17:20" },
        { time: "17:30" },
        { time: "17:40" },
        { time: "17:50" },
        { time: "18:00" },
        { time: "18:15" },
        { time: "18:20" },
        { time: "18:30" },
        { time: "18:40" },
        { time: "18:50" },
        { time: "19:00" },
        { time: "19:15" },
        { time: "19:30" },
        { time: "19:40" },
        { time: "19:50" }
      ]
    }
  },
  {
    destination: "강남역",
    route: "양재역(출구3)→강남역(출구8)",
    platform: "1번 승차장 → 양재역❸ → 강남역❽",
    schedule: {
      weekday: [
        { time: "20:00" },
        { time: "20:20" },
        { time: "20:30" },
        { time: "20:40" },
        { time: "20:50" },
        { time: "21:00" },
        { time: "21:20" },
        { time: "21:40" },
        { time: "22:00" },
        { time: "22:10" }
      ],
      friday: [
        { time: "20:00" },
        { time: "20:20" },
        { time: "20:30" },
        { time: "20:40" },
        { time: "20:50" },
        { time: "21:00" }
      ],
      dday: [
        { time: "20:00" },
        { time: "20:20" },
        { time: "20:40" },
        { time: "21:00" }
      ]
    }
  },
  {
    destination: "양재시민의숲",
    route: "양재시민의숲(출구2)",
    platform: "5번 승차장 → 양재시민의숲❷",
    schedule: {
      weekday: [
        { time: "17:30" },
        { time: "18:00" }
      ],
      friday: [
        { time: "17:30" },
        { time: "18:00" }
      ],
      dday: [
        { time: "17:30" },
        { time: "18:00" }
      ]
    }
  },
  {
    destination: "선바위역",
    route: "선바위역(출구2)",
    platform: "4번 승차장 → 선바위역❷",
    schedule: {
      weekday: [
        { time: "17:00" },
        { time: "17:30" },
        { time: "17:50" },
        { time: "18:00" },
        { time: "18:30" },
        { time: "18:50" },
        { time: "19:00" },
        { time: "19:20" },
        { time: "19:30" },
        { time: "19:40" },
        { time: "19:50" },
        { time: "20:00" },
        { time: "20:20" },
        { time: "20:40" },
        { time: "21:00" }
      ],
      friday: [
        { time: "16:10" },
        { time: "16:30" },
        { time: "16:50" },
        { time: "17:00" },
        { time: "17:30" },
        { time: "17:30" },
        { time: "18:00" },
        { time: "18:30" },
        { time: "18:50" },
        { time: "19:00" },
        { time: "19:30" },
        { time: "19:40" },
        { time: "19:50" },
        { time: "20:00" },
        { time: "20:20" },
        { time: "20:40" },
        { time: "21:00" }
      ],
      dday: [
        { time: "17:20" },
        { time: "17:40" },
        { time: "18:20" },
        { time: "18:40" },
        { time: "19:20" },
        { time: "19:40" },
        { time: "19:50" },
        { time: "20:00" },
        { time: "20:30" },
        { time: "21:00" }
      ]
    }
  },
  {
    destination: "사당",
    route: "사당역(중앙차로버스정류장)",
    platform: "4번 승차장 → 사당역(중앙차로버스정류장)",
    schedule: {
      weekday: [
        { time: "16:20" },
        { time: "16:40" },
        { time: "17:20" },
        { time: "17:40" },
        { time: "18:20" },
        { time: "18:40" },
        { time: "19:40" }
      ],
      friday: [
        { time: "16:20" },
        { time: "16:40" },
        { time: "17:20" },
        { time: "17:40" },
        { time: "18:20" },
        { time: "18:40" }
      ],
      dday: [
        { time: "16:20" },
        { time: "16:40" },
        { time: "17:20" },
        { time: "17:40" },
        { time: "18:20" },
        { time: "18:40" }
      ]
    }
  }
];

export default busRoutes; 