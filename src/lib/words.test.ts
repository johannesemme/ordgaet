import { describe, expect, it } from "vitest";
import { parseDictionary, toImportableWord } from "./words";

describe("toImportableWord", () => {
  it("accepts a five-letter Danish word", () => {
    expect(toImportableWord("grønt")).toEqual({ word: "GRØNT", noRepeats: true });
  });

  it("strips hunspell affix flags", () => {
    expect(toImportableWord("grønt/24,10,49")).toEqual({ word: "GRØNT", noRepeats: true });
  });

  it("accepts a word with a repeated letter, but marks it unusable as an answer", () => {
    // TØRRE is a fine guess. It can never be the hidden word.
    expect(toImportableWord("tørre")).toEqual({ word: "TØRRE", noRepeats: false });
  });

  it("keeps Æ, Ø and Å", () => {
    for (const w of ["hævet", "grønt", "åbent"]) {
      expect(toImportableWord(w)?.word).toHaveLength(5);
    }
  });

  it("rejects proper nouns, which the source capitalises", () => {
    expect(toImportableWord("Anders")).toBeNull();
    expect(toImportableWord("Århus")).toBeNull();
  });

  it("rejects anything that is not exactly five letters", () => {
    expect(toImportableWord("hus")).toBeNull();
    expect(toImportableWord("bogstav")).toBeNull();
  });

  it("rejects non-Danish characters", () => {
    expect(toImportableWord("cañon")).toBeNull();
    expect(toImportableWord("-årig")).toBeNull();
    expect(toImportableWord("d'arc")).toBeNull();
  });

  it("rejects blank lines", () => {
    expect(toImportableWord("")).toBeNull();
    expect(toImportableWord("   ")).toBeNull();
  });
});

describe("parseDictionary", () => {
  const file = [
    "178047 # Produced By Stavekontrolden.dk",
    "grønt/2",
    "tørre",
    "Anders",
    "hus",
    "grønt",
    "",
  ].join("\n");

  it("keeps only the usable words", () => {
    expect(parseDictionary(file).map((w) => w.word)).toEqual(["GRØNT", "TØRRE"]);
  });

  it("de-duplicates", () => {
    expect(parseDictionary(file).filter((w) => w.word === "GRØNT")).toHaveLength(1);
  });

  it("ignores the count on the first line", () => {
    expect(parseDictionary(file).map((w) => w.word)).not.toContain("178047");
  });
});
