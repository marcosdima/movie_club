const checkStructure = (model, modelToCheck, omitKeys=[]) => {
  const keys1 = Object.keys(model);
  const keys2 = Object.keys(modelToCheck);

  const extraKeys = keys2.filter(key => !keys1.includes(key));
  const missingKeys = keys1.filter(key => !keys2.includes(key) && !omitKeys.includes(key));

  return { extraKeys, missingKeys };
};

module.exports = {checkStructure};