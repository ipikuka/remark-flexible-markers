import { REGEX } from "../src";

type Fixture = {
  input: string;
  expect: null | {
    classification: string | null;
    markedText: string | undefined;
  };
};

describe("remark-flexigraph regex tests", () => {
  it("REGEX_IN_BEGINNING matches or not", () => {
    const fixtures: Fixture[] = [
      {
        input: "==",
        expect: null,
      },
      {
        input: "===",
        expect: null,
      },
      {
        input: "= ==",
        expect: null,
      },
      {
        input: "==  =",
        expect: null,
      },
      {
        input: "=x =marked==",
        expect: null,
      },
      {
        input: "= x=marked==",
        expect: null,
      },
      {
        input: "=xy=marked==",
        expect: null,
      },
      {
        input: "=ab=marked",
        expect: null,
      },
      {
        input: "=a=marked=",
        expect: null,
      },
      //********************************* */
      {
        input: "====",
        expect: {
          classification: "",
          markedText: undefined,
        },
      },
      {
        input: "== ==",
        expect: {
          classification: "",
          markedText: undefined,
        },
      },
      {
        input: "==  ==",
        expect: {
          classification: "",
          markedText: undefined,
        },
      },
      {
        input: "==marked==",
        expect: {
          classification: "",
          markedText: "marked",
        },
      },
      {
        input: "== marked marked    ==",
        expect: {
          classification: "",
          markedText: "marked marked",
        },
      },
      {
        input: "=x===",
        expect: {
          classification: "x",
          markedText: undefined,
        },
      },
      {
        input: "=x= ==",
        expect: {
          classification: "x",
          markedText: undefined,
        },
      },
      {
        input: "=x=marked==",
        expect: {
          classification: "x",
          markedText: "marked",
        },
      },
      {
        input: "=x=   marked marked  ==",
        expect: {
          classification: "x",
          markedText: "marked marked",
        },
      },
    ];

    fixtures.forEach((fixture) => {
      // console.log(fixture.input);

      const match = fixture.input.match(REGEX);

      if (fixture.expect === null) {
        expect(match).toBeNull();
      } else {
        expect(match).not.toBeNull();
      }

      if (match) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [_, classification, markedText] = match;

        expect(classification).toBe(fixture.expect?.classification);
        expect(markedText).toBe(fixture.expect?.markedText);
      }
    });
  });
});
