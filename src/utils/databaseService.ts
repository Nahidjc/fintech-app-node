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
  