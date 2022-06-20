export interface Db {
  getById(id: string): Promise<any>
  setById(id: string, data: any): Promise<any>;
}