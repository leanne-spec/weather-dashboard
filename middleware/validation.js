exports.validateCity = (req, res, next) => {
  const { city } = req.params;
  
  if (!city || city.trim() === '') {
    return res.status(400).json({ error: 'City name is required' });
  }
  
  if (city.length > 100) {
    return res.status(400).json({ error: 'City name too long' });
  }
  
  next();
};
