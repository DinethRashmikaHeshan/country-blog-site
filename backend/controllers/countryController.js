const countries = require('countries-list').countries;

const getCountries = (req, res) => {
    const { code } = req.query;

    if (code) {
        const country = countries[code.toUpperCase()];
        if (!country) {
            return res.status(404).json({ error: 'Country not found' });
        }
        res.json({
            name: country.name,
            capital: country.capital,
            currency: country.currency,
            flag: country.emoji
        });
    } else {
        const countryList = Object.entries(countries).map(([code, data]) => ({
            code,
            name: data.name,
            capital: data.capital,
            currency: data.currency,
            flag: data.emoji
        }));
        res.json(countryList);
    }
};

module.exports = { getCountries };