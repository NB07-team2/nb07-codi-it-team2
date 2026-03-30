export type GradeResponse = {
     id: string;
     name: string;
     rate: number;
     minAmount: number;
}
export type UserResponse = {
  id: string;
  name: string;
  email: string;
  type: string;
  points: number;
  createdAt: Date;
  updatedAt: Date;
  grade: GradeResponse;
  image: string;
};