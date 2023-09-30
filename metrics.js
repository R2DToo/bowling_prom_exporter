const { Gauge } = require("prom-client");

exports.scratch_score_game = new Gauge({
  name: "scratch_score_game",
  help: "Scratch score per game",
  labelNames: ["name", "week", "year", "game"],
});

exports.scratch_score_total = new Gauge({
  name: "scratch_score_total",
  help: "Scratch score for all 3 games",
  labelNames: ["name", "week", "year"],
});

exports.handicap_total = new Gauge({
  name: "handicap_total",
  help: "Handicap for all 3 games",
  labelNames: ["name", "week", "year"],
});

exports.final_score_total = new Gauge({
  name: "final_score_total",
  help: "The final score for all 3 games. Scratch Score + Handicap",
  labelNames: ["name", "week", "year"],
});
