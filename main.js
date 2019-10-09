const id = x => x;
const defaultTransform = x => x.value || x;
const defaultCombine = xs => xs.join("");
const doNotCombine = x => x;
const reverseAndCombine = xs => xs.reverse().join("");
const wrapValue = value => ({ value });

const mkTag = (
  transform = defaultTransform,
  combine = defaultCombine,
  wrapLiteral = id
) => (strings, ...tokens) => {
  const mapped = strings
    .map((s, i) => {
      const lit = wrapLiteral(s);

      if (tokens[i]) {
        const tok = transform(tokens[i]);
        return [lit, tok];
      } else {
        return [lit];
      }
    })
    .reduce((a, b) => [...a, ...b], []);

  return combine(mapped);
};

const mkRenderer = tag => (template, context) => {
  const r = /\$\{/g;
  const t = template.replace(r, "${this.");
  return new Function("tag", `return tag\`${t}\``).call(context, tag);
};

const transform = x => {
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

const renderValueOrIdentity = mkRenderer(mkTag());
const transformValueAndRender = mkRenderer(mkTag(transform));
const transformValueDoNotCombine = mkRenderer(mkTag(transform, doNotCombine));
const transformValueReverseAndRender = mkRenderer(
  mkTag(transform, reverseAndCombine)
);
const uniformDescription = mkRenderer(mkTag(id, doNotCombine, wrapValue));

const template = "${person} is ${age} years old and lives in ${city}.";

const simpleContext = { person: "Mr Popo", age: 64, city: "Brighton" };

const complexContext = {
  person: { value: "Mr Popo", transform: "uppercase" },
  city: { value: "Brighton", transform: "reverse" },
  age: { value: 64, transform: "double" }
};

console.log(renderValueOrIdentity(template, complexContext));
console.log(renderValueOrIdentity(template, simpleContext));
console.log(transformValueAndRender(template, complexContext));
console.log(transformValueDoNotCombine(template, complexContext));
console.log(transformValueReverseAndRender(template, complexContext));
console.log(uniformDescription(template, complexContext));
