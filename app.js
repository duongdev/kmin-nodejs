const express = require("express");
const hbs = require("hbs");
const { default: axios } = require("axios");

const PORT = process.env.PORT || 4000;

const app = express();
app.set("view engine", "hbs");

// Partial: https://handlebarsjs.com/guide/partials.html
hbs.registerPartials(__dirname + "/views", function (err) {});

// https://handlebarsjs.com/guide/block-helpers.html#simple-iterators
// https://handlebarsjs.com/guide/builtin-helpers.html
hbs.registerHelper("list", (context, options) => {
  let ret = "<ul>";

  const entries = Object.entries(context);

  entries.forEach(([key, value]) => {
    ret = ret + "<li>" + options.fn({ key, value }) + "</li>";
  });

  return ret + "</ul>";
});

app.get("/", (req, res) => {
  res.render("template", {
    title: "Home",
  });
});

app.get("/covid19", (req, res) => {
  // https://api.covid19api.com/countries
  const countrySlug = req.query.country;

  // Destructor
  //
  axios
    .get("https://api.covid19api.com/countries")
    .then(({ data: countries }) => {
      axios
        .get("https://api.covid19api.com/summary")
        .then(({ data: { Countries } }) => {
          const currentCountry = Countries.find(
            (item) => item.Slug === countrySlug
          );

          if (currentCountry) delete currentCountry.Premium;

          console.log(currentCountry);

          res.render("covid-19", {
            title: currentCountry
              ? `Covid-19 in ${currentCountry.Country}`
              : `Covid-19`,
            countries,
            countryStats: currentCountry,
          });
        });
    });

  // https://api.covid19api.com/summary
});

const server = app.listen(PORT, () => {
  const port = server.address().port;

  console.log(`Server is running on port http://0.0.0.0:${port}`);
});
