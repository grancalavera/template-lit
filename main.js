const defaultTransform = x => x.value || x;
const defaultCombine = xs => xs.join("");
const doNotCombine = x => x;

const mapTemplate = (transform = defaultTransform, combine = defaultCombine) => (
  strings,
  ...expressions
) =>
  combine(
    strings.flatMap((s, i) => [s, expressions[i] ? transform(expressions[i]) : ""])
  );

const renderTemplate = tag => (template, context) => {
  const r = /\$\{/g;
  const t = template.replace(r, "${this.");
  const render = new Function("tag", `return tag\`${t}\``);
  return render.call(context, tag);
};

const applyTransform = x => {
  switch (x.transform) {
    case "uppercase":
      return x.value.toUpperCase();
    case "reverse":
      return x.value
        .split("")
        .reverse()
        .join("");
    case "double":
      return x.value * 2;
    default:
      return x.value;
  }
};

const renderValueOrIdentity = renderTemplate(mapTemplate());
const transformValueAndRender = renderTemplate(mapTemplate(applyTransform));
const transformValueDoNotCombine = renderTemplate(
  mapTemplate(applyTransform, doNotCombine)
);
const transformValueReverseAndRender = renderTemplate(
  mapTemplate(applyTransform, xs => xs.reverse().join(""))
);

const template = "${person} is ${age} years old and lives in ${city}.";

const context = {
  person: { value: "Mr Popo", transform: "uppercase" },
  city: { value: "Brighton", transform: "reverse" },
  age: { value: 64, transform: "double" }
};

console.log(renderValueOrIdentity(template, context));
console.log(
  renderValueOrIdentity(template, { person: "Mr Popo", age: 64, city: "Brighton" })
);
console.log(transformValueAndRender(template, context));
console.log(transformValueDoNotCombine(template, context));
console.log(transformValueReverseAndRender(template, context));
