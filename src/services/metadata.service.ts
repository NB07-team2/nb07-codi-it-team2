import { findAllGrades } from '../repositories/grade.repository';

export const getAllGrades = async () => {
  return await findAllGrades();
};
