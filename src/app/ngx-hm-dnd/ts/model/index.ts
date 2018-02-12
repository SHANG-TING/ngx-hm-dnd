export interface IComplete {
  from: ICompleteInfo;
  to?: ICompleteInfo;
}

export interface ICompleteInfo {
  data: any[];
  selectedIndex: number;
}
