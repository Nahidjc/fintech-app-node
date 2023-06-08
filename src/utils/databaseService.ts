import { Model, FilterQuery, UpdateQuery, Document } from 'mongoose';

export const updateOne = <T extends Document>(
  model: Model<T>,
  filter: FilterQuery<T>,
  data: UpdateQuery<T>,
  options: { new?: boolean } = { new: true }
): Promise<T | null> => {
  return new Promise((resolve, reject) => {
    model.findOneAndUpdate(filter, data, options, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};


export const createData = (model: any, data: object): Promise<any> => new Promise((resolve, reject) => {
    model.create(data, (error: any, result: any) => {
      if (error) reject(error);
      else resolve(result);
    });
  });
  
 export const findOne = (model: any, filter: any, options: any = {}): Promise<any> => new Promise((resolve, reject) => {
    model.findOne(filter, options, (error: any, result: any) => {
      if (error) reject(error);
      else resolve(result);
    });
  });
  