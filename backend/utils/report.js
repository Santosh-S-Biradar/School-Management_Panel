const { Parser } = require('json2csv');

const toCsv = (data, fields) => {
  const parser = new Parser({ fields });
  return parser.parse(data);
};

module.exports = { toCsv };
