var util = require('util');

export const handler = async (event: any = {}): Promise<any> => {
  console.log(
    'Reading options from event:\n',
    util.inspect(event, { depth: 5 }),
  );
  console.log(event);
  console.log('handled');
  return true;
};
