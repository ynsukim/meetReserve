export interface Reservation {
  id: string;
  year: number;  // 연도를 숫자로 저장 (예: 2024)
  month: number; // 월을 숫자로 저장 (1-12)
  day: number;   // 일을 숫자로 저장 (1-31)
  hour: number;
  minute: number;
  duration: number;
  name: string;
  date: Date;
} 