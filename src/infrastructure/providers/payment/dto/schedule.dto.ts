export class ScheduleDto {
  start?: Date;
  end?: Date;
  interval_unit!: "MONTH" | "WEEK" | "DAY";
  interval_delay!: number;
}
