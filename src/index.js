import chart from "asciichart";
import { table as t } from "table";


// `chart` type is incorrect, so:
let c = /** @type {any} */ (chart);


function unitsLabel(units) {
  return (units && units.toLowerCase() !== "unitless") ? ` [${units}]` : "";
}


const COLORS = [
  c.default,
  c.red,
  c.green,
  c.blue,
  c.magenta,
  c.cyan,
  c.darkgrey
];


export function plot(results, primitives) {
  if (!Array.isArray(primitives)) {
    primitives = [primitives];
  }

  let items = primitives.map(p => ({
    name: p.name + unitsLabel(p.units),
    series: results.series(p)
  }));

  let expandedItems = [];

  for (let item of items) {
    let value = item.series[0];
    if (typeof value === "number") {
      expandedItems.push(item);
    } else if (Array.isArray(value)) {
      // pass - can't graph arrays
    } else if (typeof value === "object") {
      let keys = Object.keys(value).sort();
      for (let key of keys) {
        expandedItems.push({
          name: `${item.name} {${key}}`,
          series: item.series.map(x => x[key])
        });
      }
    }
  }

  if (expandedItems.length > 0) {
    console.log(c.plot(expandedItems.map(x => x.series), {
      height: 20,
      colors: COLORS
    }));

    if (expandedItems.length > 1) {
      console.log("\nLegend:   " + expandedItems.map((x, i) => COLORS[i % COLORS.length] + x.name).join("   "));
    }
    console.log(COLORS[0]); // clear any coloring
  } else {
    console.log("\n\nNothing to plot\n\n");
  }
}


export function table(results, primitives) {
  if (!Array.isArray(primitives)) {
    primitives = [primitives];
  }

  let data = results.table(primitives);

  let items = [];
  items.push([`Time [${results.timeUnits}]`].concat(...primitives.map(x => {
    let name = x.name;
    if (!Array.isArray(data[0][name]) && typeof data[0][name] === "object") {
      let keys = Object.keys(data[0][name]).sort();

      return keys.map(key => `${name}${unitsLabel(x.units)} {${key}}`);
    } else {
      return name + unitsLabel(x.units);
    }
  })));

  function miniFormat(value) {
    return typeof value === "number" ? value.toFixed(2) : value;
  }

  for (let row of data) {
    items.push([row._time].concat(...primitives.map(x => {
      let value = row[x.name];

      if (Array.isArray(value)) {
        return value.join(", ");
      } else if (typeof value === "object") {

        let keys = Object.keys(value).sort();

        return keys.map(key => miniFormat(value[key]));
      }

      return miniFormat(value);
    })));
  }

  console.log(t(items, {
    drawHorizontalLine: (lineIndex, rowCount) => lineIndex === 0 || lineIndex === 1 || lineIndex === rowCount,
    columns: items[0].map(_p => ({ alignment: "right" }))
  }));
}
